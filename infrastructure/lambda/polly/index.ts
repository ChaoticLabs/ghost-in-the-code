import {
  PollyClient,
  SynthesizeSpeechCommand,
  VoiceId,
} from '@aws-sdk/client-polly';
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { createHash } from 'crypto';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Readable } from 'stream';

const pollyClient = new PollyClient({
  region: process.env.AWS_REGION || 'us-east-1',
});
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

const AUDIO_BUCKET = process.env.AUDIO_BUCKET || '';
const VOICE_ID = (process.env.VOICE_ID || 'Justin') as VoiceId;

interface VoiceRequest {
  text: string;
  emotion?: 'neutral' | 'excited' | 'encouraging';
}

interface VoiceResponse {
  audioUrl: string;
  cached: boolean;
  text: string;
}

interface ErrorResponse {
  error: string;
  message?: string;
}

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
};

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const body: VoiceRequest = JSON.parse(event.body || '{}');
    const { text, emotion = 'neutral' } = body;

    if (!text) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required field: text',
        } as ErrorResponse),
      };
    }

    // Generate cache key based on text and emotion and voiceid
    const cacheKey = createHash('md5')
      .update(`${text}-${emotion}-${VOICE_ID}`)
      .digest('hex');
    const s3Key = `audio/${cacheKey}.mp3`;

    // Check if audio already exists in cache
    try {
      await s3Client.send(
        new HeadObjectCommand({
          Bucket: AUDIO_BUCKET,
          Key: s3Key,
        })
      );

      // Audio exists, return cached URL
      const audioUrl = `https://${AUDIO_BUCKET}.s3.amazonaws.com/${s3Key}`;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          audioUrl,
          cached: true,
          text,
        } as VoiceResponse),
      };
    } catch (error) {
      // Audio doesn't exist, generate it
    }

    // Adjust speech parameters based on emotion
    let rate = 'medium';
    let pitch = 'medium';

    if (emotion === 'excited') {
      rate = 'fast';
      pitch = '+10%';
    } else if (emotion === 'encouraging') {
      rate = 'medium';
      pitch = '+5%';
    }

    // Synthesize speech with Polly
    const pollyCommand = new SynthesizeSpeechCommand({
      Text: text,
      OutputFormat: 'mp3',
      VoiceId: VOICE_ID,
      Engine: 'neural',
      TextType: 'text',
    });

    const pollyResponse = await pollyClient.send(pollyCommand);

    // Convert audio stream to buffer
    const audioBuffer = await streamToBuffer(pollyResponse.AudioStream);

    // Save to S3 (public read via bucket policy)
    await s3Client.send(
      new PutObjectCommand({
        Bucket: AUDIO_BUCKET,
        Key: s3Key,
        Body: audioBuffer,
        ContentType: 'audio/mpeg',
        CacheControl: 'max-age=31536000', // Cache for 1 year
      })
    );

    const audioUrl = `https://${AUDIO_BUCKET}.s3.amazonaws.com/${s3Key}`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        audioUrl,
        cached: false,
        text,
      } as VoiceResponse),
    };
  } catch (error) {
    console.error('Error synthesizing speech:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to synthesize speech',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ErrorResponse),
    };
  }
};

// Helper function to convert stream to buffer
async function streamToBuffer(
  stream: Readable | ReadableStream | Blob | undefined
): Promise<Buffer> {
  if (!stream) {
    throw new Error('No audio stream received');
  }

  const chunks: Uint8Array[] = [];

  if (stream instanceof Readable) {
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
  } else if (stream instanceof ReadableStream) {
    const reader = stream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
  }

  return Buffer.concat(chunks);
}
