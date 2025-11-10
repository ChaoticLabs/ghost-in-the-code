import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

interface HintRequest {
  challengeId?: string;
  playerAttempt?: string;
  hintLevel?: number;
  challengeDescription: string;
}

interface HintResponse {
  hint: string;
  challengeId?: string;
  hintLevel: number;
  source: string;
}

interface ErrorResponse {
  error: string;
  message?: string;
}

interface BedrockResponse {
  content: Array<{
    text: string;
  }>;
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
    const body: HintRequest = JSON.parse(event.body || '{}');
    const {
      challengeId,
      playerAttempt,
      hintLevel = 1,
      challengeDescription,
    } = body;

    if (!challengeDescription) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required field: challengeDescription',
        } as ErrorResponse),
      };
    }

    // Construct prompt for child-friendly hint generation
    const hintLevelText =
      hintLevel === 1
        ? 'gentle nudge'
        : hintLevel === 2
          ? 'clearer hint'
          : 'specific guidance';

    const prompt = `You are a friendly ghost helping a child (ages 8-12) learn coding. 
Challenge: ${challengeDescription}
${playerAttempt ? `Their attempt: ${playerAttempt}` : ''}
Hint level: ${hintLevel}/3

Provide a ${hintLevelText} in simple, encouraging language. Keep it under 50 words. 
Be supportive and fun, using ghost-themed language when appropriate (like "Boo-tiful thinking!" or "Let's haunt this bug together!").
Focus on helping them understand the concept, not just giving the answer.`;

    // Invoke Bedrock model
    const modelId =
      process.env.MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';

    const command = new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 150,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    const response = await client.send(command);
    const responseBody: BedrockResponse = JSON.parse(
      new TextDecoder().decode(response.body)
    );

    const hint = responseBody.content[0].text;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        hint,
        challengeId,
        hintLevel,
        source: 'ai',
      } as HintResponse),
    };
  } catch (error) {
    console.error('Error generating hint:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to generate hint',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ErrorResponse),
    };
  }
};
