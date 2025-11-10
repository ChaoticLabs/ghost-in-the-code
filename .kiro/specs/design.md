# Ghost in The Code - Design Document

## Overview

Ghost in The Code is a single-page web application built with React and Vite, deployed to AWS using CDK. The game presents coding challenges through an interactive interface where players debug code fragments to progress through levels. The architecture emphasizes simplicity and rapid development suitable for a hackathon project while maintaining clean separation of concerns.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                            Browser                                   │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │              React Application (Vite)                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐         │ │
│  │  │ Game Engine  │  │  UI Layer    │  │  Animation  │         │ │
│  │  │   (State)    │◄─┤  Components  │◄─┤   System    │         │ │
│  │  └──────┬───────┘  └──────────────┘  └─────────────┘         │ │
│  │         │                                                      │ │
│  │  ┌──────▼───────────────────────────────────────────────────┐ │ │
│  │  │              AI/Voice Service Client                     │ │ │
│  │  │  • Dynamic hint generation                               │ │ │
│  │  │  • Personalized feedback                                 │ │ │
│  │  │  │  • Ghost voice narration                               │ │ │
│  │  └──┬───────────────────────────────────────────────────────┘ │ │
│  │     │                                                          │ │
│  │  ┌──▼───────────────────────────────────────────────────────┐ │ │
│  │  │     Local Storage (Progress + Preferences)               │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      AWS Infrastructure                              │
│  ┌────────────┐      ┌──────────────┐      ┌────────────┐          │
│  │ CloudFront │─────►│  S3 Bucket   │      │   CDK      │          │
│  │    (CDN)   │      │ (Static Host)│      │   Stack    │          │
│  └────────────┘      └──────────────┘      └────────────┘          │
│                                                                      │
│  ┌────────────┐      ┌──────────────┐      ┌────────────┐          │
│  │    API     │─────►│   Lambda     │─────►│  Bedrock   │          │
│  │  Gateway   │      │  Functions   │      │  (Claude)  │          │
│  └────────────┘      └──────┬───────┘      └────────────┘          │
│                             │                                        │
│                             │              ┌────────────┐           │
│                             └─────────────►│   Polly    │           │
│                                            │  (Voice)   │           │
│                                            └────────────┘           │
└─────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: CSS Modules with animations
- **State Management**: React Context API + useReducer
- **Infrastructure**: AWS CDK (TypeScript)
- **Hosting**: S3 + CloudFront
- **Animation**: CSS animations + Framer Motion for complex interactions
- **AI Services**: Amazon Bedrock (Claude/Titan models for dynamic content)
- **Voice Services**: Amazon Polly (text-to-speech for ghost character)
- **API**: API Gateway + Lambda for AI/voice endpoints

### Design Principles

1. **Hybrid Architecture**: Core game logic runs client-side, AI/voice features via serverless APIs
2. **Static Deployment**: Built as static assets with API endpoints for enhanced features
3. **Progressive Enhancement**: Core gameplay works without AI; enhanced features add value
4. **Mobile-First Responsive**: Designed for tablets and desktops (768px+)
5. **Hackathon-Ready**: Focus on demonstrable features over production polish

### AI and Voice Integration Strategy

#### Amazon Bedrock Use Cases

**1. Dynamic Hint Generation**
- Generate personalized hints based on player's specific mistakes
- Adapt hint complexity to player's progress and age level
- Create contextual explanations for coding concepts

**2. Personalized Feedback**
- Provide encouraging feedback tailored to player's attempt
- Generate age-appropriate explanations of why a solution works or doesn't
- Create custom challenge variations for repeated practice

**3. Educator Insights**
- Analyze player patterns to generate learning insights
- Summarize progress reports in natural language
- Suggest next steps for skill development

**Implementation Approach:**
```typescript
// Example: Dynamic hint generation
const generateHint = async (challenge: Challenge, playerAttempt: string, hintLevel: number) => {
  const prompt = `You are a friendly ghost helping a child learn coding.
  Challenge: ${challenge.description}
  Their attempt: ${playerAttempt}
  Hint level: ${hintLevel}/3
  
  Provide a ${hintLevel === 1 ? 'gentle nudge' : hintLevel === 2 ? 'clearer hint' : 'specific guidance'} 
  in simple, encouraging language.`;
  
  // Call Bedrock via Lambda
  const response = await fetch('/api/generate-hint', {
    method: 'POST',
    body: JSON.stringify({ prompt, challenge: challenge.id })
  });
  
  return response.json();
};
```

#### Amazon Polly Use Cases

**1. Ghost Character Voice**
- Text-to-speech for all ghost dialogue
- Consistent friendly voice across the game
- Makes the character feel more alive and engaging

**2. Challenge Instructions**
- Audio narration of challenge descriptions
- Helps younger players or those with reading difficulties
- Optional audio playback for all text content

**3. Celebration and Feedback**
- Voiced congratulations when challenges are completed
- Audio feedback for hints and tips
- Encouraging messages during gameplay

**Implementation Approach:**
```typescript
// Example: Ghost voice narration
const speakText = async (text: string, emotion: 'neutral' | 'excited' | 'encouraging') => {
  // Adjust speech parameters based on emotion
  const params = {
    text,
    voiceId: 'Joanna', // Kid-friendly voice
    engine: 'neural',
    rate: emotion === 'excited' ? 'fast' : 'medium'
  };
  
  // Call Polly via Lambda, returns audio URL
  const response = await fetch('/api/speak', {
    method: 'POST',
    body: JSON.stringify(params)
  });
  
  const { audioUrl } = await response.json();
  
  // Play audio in browser
  const audio = new Audio(audioUrl);
  audio.play();
};
```

#### Cost Optimization for Hackathon

- **Caching**: Cache common phrases and hints in S3
- **Rate Limiting**: Limit AI calls per session (e.g., 10 dynamic hints max)
- **Fallback**: Pre-written hints as fallback if API fails or quota exceeded
- **Voice Caching**: Pre-generate common ghost phrases, use Polly only for dynamic content

## Components and Interfaces

### Core Components

#### 1. Game Engine (`/src/engine/`)

**GameState Interface**
```typescript
interface GameState {
  currentLevel: number;
  currentChallenge: number;
  completedChallenges: Set<string>;
  hintsUsed: Map<string, number>;
  score: number;
  badges: Badge[];
  assessmentMetrics: AssessmentMetrics;
}

interface Badge {
  id: string;
  name: string;
  concept: 'loop' | 'conditional' | 'logic';
  earnedDate: string;
  description: string;
  iconUrl: string;
}

interface AssessmentMetrics {
  challengesCompleted: number;
  conceptMastery: Map<string, number>; // concept -> mastery percentage
  averageAttempts: number;
  totalHintsUsed: number;
  timeSpentMinutes: number;
  lastActivity: string;
}

interface Challenge {
  id: string;
  type: 'loop' | 'conditional' | 'logic';
  title: string;
  description: string;
  codeFragment: CodeFragment;
  solution: Solution;
  hints: string[];
  educationalContent: string;
}

interface CodeFragment {
  lines: CodeLine[];
  buggyLines: number[];
}

interface CodeLine {
  lineNumber: number;
  content: string;
  isEditable: boolean;
  isBuggy: boolean;
}
```

**GameEngine Class**
- Manages game state transitions
- Validates player solutions
- Handles challenge progression
- Persists state to localStorage

#### 2. UI Components (`/src/components/`)

**WelcomeScreen**
- Displays game title and ghost character
- Start button to begin gameplay
- Brief game instructions

**GameBoard**
- Main gameplay container
- Renders current challenge
- Displays progress indicator
- Houses code editor and ghost character

**CodeEditor**
- Interactive code display
- Editable lines for debugging
- Syntax highlighting (simple)
- Submit button for solutions

**GhostCharacter**
- Animated SVG or sprite-based character
- Different states: idle, happy, thinking, celebrating
- Speech bubble for hints and feedback

**HintPanel**
- Hint request button
- Display area for hint text
- Hint counter (X/3 used)

**ProgressTracker**
- Visual level map
- Completed/current/locked indicators
- Level selection for completed levels

**BadgeCollection**
- Display earned Ghost Debugger Badges
- Badge details (concept mastered, date earned)
- Print/download functionality
- Progress summary generation

**EducatorDashboard** (Scaffolded)
- Student metrics overview
- Concept mastery visualization
- Challenge completion statistics
- Data export functionality
- Note: Basic prototype for future development

**AnimationOverlay**
- Success animations layer
- Particle effects for bug fixes
- Glow effects on code healing

**VoiceController**
- Audio playback management
- Voice toggle (on/off)
- Volume control
- Queue management for sequential speech

**AIHintGenerator**
- Dynamic hint request interface
- Loading states during AI generation
- Fallback to static hints on error
- Hint history display

**BadgeCollection**
- Display earned Ghost Debugger Badges
- Print-friendly badge view
- Progress summary generation
- Badge unlock animations

**EducatorDashboard** (Scaffolded)
- Metrics visualization placeholder
- Student progress overview
- Export functionality stub
- Future expansion framework

#### 3. Animation System (`/src/animations/`)

**AnimationController**
- Triggers animations based on game events
- Manages animation queues
- Coordinates multiple simultaneous effects

**Animation Types**
- `codeHeal`: Lines of code glow and repair
- `terminalGlow`: Pulsing glow effect on editor
- `ghostCelebrate`: Ghost character happy animation
- `particleBurst`: Sparkles/particles on success
- `levelComplete`: Screen transition effect

### Challenge Data Structure

Challenges are defined in JSON files (`/src/data/challenges/`):

```typescript
// challenges/loops.json
{
  "levelId": "loops-1",
  "challenges": [
    {
      "id": "loop-basic-1",
      "type": "loop",
      "title": "The Infinite Haunting",
      "description": "This loop never stops! Help the ghost fix it.",
      "codeFragment": {
        "lines": [
          { "lineNumber": 1, "content": "let count = 0;", "isEditable": false },
          { "lineNumber": 2, "content": "while (count < 10) {", "isEditable": true, "isBuggy": true },
          { "lineNumber": 3, "content": "  console.log('Boo!');", "isEditable": false },
          { "lineNumber": 4, "content": "}", "isEditable": false }
        ],
        "buggyLines": [2]
      },
      "solution": {
        "type": "line-replacement",
        "lineNumber": 2,
        "correctContent": "while (count < 10) {\n  count++;"
      },
      "hints": [
        "The loop needs to change something to eventually stop...",
        "What variable controls when the loop ends?",
        "Try adding 'count++' inside the loop!"
      ],
      "educationalContent": "Loops need a way to eventually stop. We use a counter variable and increment it each time through the loop."
    }
  ]
}
```

## Badge System Design

### Badge Types

**Concept Mastery Badges**
- Loop Master: Complete all loop challenges
- Conditional Champion: Complete all conditional challenges
- Logic Legend: Complete all logic puzzle challenges

**Achievement Badges**
- First Bug Fixed: Complete first challenge
- Hint-Free Hero: Complete 5 challenges without hints
- Speed Debugger: Complete challenge in under 2 minutes
- Persistent Ghost Helper: Complete 10 challenges total

### Badge Data Model

```typescript
interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  earnedDate?: Date;
  category: 'concept' | 'achievement' | 'special';
}

interface BadgeCertificate {
  playerName: string;
  badges: Badge[];
  totalChallenges: number;
  dateGenerated: Date;
  printableHtml: string;
}
```

### Print-Friendly Badge View

- A4/Letter size formatted HTML
- High-contrast black and white option
- QR code linking to player's progress (optional)
- Decorative ghost-themed border
- Space for educator signature

## Educator Dashboard Design (Scaffolded)

### Phase 1: Data Collection (Implemented)

Track metrics in localStorage:
- Challenges completed per concept type
- Average hints used
- Time spent per challenge
- Success rate on first attempt

### Phase 2: Dashboard UI (Scaffolded)

Basic dashboard structure with:
- Placeholder charts (static images or simple bars)
- Mock data display
- Export button (downloads JSON)
- "Coming Soon" indicators for advanced features

### Phase 3: Future Enhancements (Out of Scope)

- Multi-student tracking
- Class-level analytics
- Learning path recommendations
- Integration with LMS systems

```typescript
interface EducatorMetrics {
  studentId: string;
  studentName: string;
  metrics: {
    challengesCompleted: number;
    conceptMastery: {
      loops: number;      // 0-100 score
      conditionals: number;
      logic: number;
    };
    averageHintsUsed: number;
    averageAttempts: number;
    totalTimeSpent: number; // minutes
    badgesEarned: string[];
  };
  lastActive: Date;
}
```

## Data Models

### Game State Persistence

**LocalStorage Schema**
```typescript
interface SavedGameState {
  version: string; // "1.0.0"
  lastPlayed: string; // ISO timestamp
  playerName?: string; // Optional for badges
  progress: {
    completedChallenges: string[]; // Challenge IDs
    currentLevel: number;
    currentChallenge: number;
    totalScore: number;
  };
  statistics: {
    hintsUsed: Record<string, number>;
    attemptsPerChallenge: Record<string, number>;
    timeSpent: number; // seconds
    firstAttemptSuccess: Record<string, boolean>;
    challengeCompletionTimes: Record<string, number>; // seconds
  };
  badges: {
    earned: string[]; // Badge IDs
    earnedDates: Record<string, string>; // ISO timestamps
  };
  preferences: {
    voiceEnabled: boolean;
    volume: number; // 0-100
    fontSize: 'medium' | 'large' | 'xlarge';
    highContrastMode: boolean;
    reducedMotion: boolean;
  };
  educatorMetrics: {
    conceptMastery: {
      loops: number;
      conditionals: number;
      logic: number;
    };
    lastExported?: string; // ISO timestamp
  };
}
```

### Challenge Validation

**Solution Validation Logic**
- Simple string comparison for line replacements
- Pattern matching for multiple valid solutions
- Whitespace-insensitive comparison
- Case-sensitive for code accuracy

## Error Handling

### User-Facing Errors

1. **Invalid Solution Submission**
   - Display friendly message: "Not quite! The ghost is still confused. Try again!"
   - Shake animation on code editor
   - No penalty, unlimited attempts

2. **Challenge Load Failure**
   - Fallback to default challenge set
   - Display message: "Some challenges are hiding! Playing with available ones."

3. **Storage Errors**
   - Game continues without persistence
   - Warning message: "Progress won't be saved this session"

### Developer Errors

- Console logging for debugging
- Error boundaries for React component crashes
- Graceful degradation for missing assets

## Testing Strategy

### Core Functionality Tests

1. **Game Engine Tests**
   - Challenge validation logic
   - State transitions
   - Progress tracking
   - LocalStorage persistence

2. **Component Tests**
   - CodeEditor interaction
   - Hint system behavior
   - Progress tracker display
   - Ghost character state changes

3. **Integration Tests**
   - Complete challenge flow
   - Level progression
   - Animation triggers

### Manual Testing Checklist

- [ ] All challenge types playable
- [ ] Animations trigger correctly
- [ ] Progress persists across sessions
- [ ] Responsive on different screen sizes
- [ ] Works in major browsers
- [ ] Hint system provides useful guidance

## AWS Infrastructure Design

### CDK Stack Structure

```typescript
// lib/ghost-in-the-code-stack.ts
class GhostInTheCodeStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    // S3 Bucket for static hosting
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html', // SPA routing
      publicReadAccess: true,
      removalPolicy: RemovalPolicy.DESTROY, // Hackathon - easy cleanup
      autoDeleteObjects: true
    });

    // S3 Bucket for cached audio files
    const audioCacheBucket = new s3.Bucket(this, 'AudioCacheBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [{
        allowedOrigins: ['*'],
        allowedMethods: [s3.HttpMethods.GET],
        allowedHeaders: ['*']
      }]
    });

    // Lambda function for Bedrock AI hints
    const bedrockFunction = new lambda.Function(this, 'BedrockFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/bedrock'),
      timeout: Duration.seconds(30),
      environment: {
        MODEL_ID: 'anthropic.claude-3-haiku-20240307-v1:0' // Fast, cost-effective
      }
    });

    // Grant Bedrock permissions
    bedrockFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: ['*']
    }));

    // Lambda function for Polly voice
    const pollyFunction = new lambda.Function(this, 'PollyFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/polly'),
      timeout: Duration.seconds(10),
      environment: {
        AUDIO_BUCKET: audioCacheBucket.bucketName,
        VOICE_ID: 'Joanna'
      }
    });

    // Grant Polly and S3 permissions
    pollyFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ['polly:SynthesizeSpeech'],
      resources: ['*']
    }));
    audioCacheBucket.grantWrite(pollyFunction);

    // API Gateway
    const api = new apigateway.RestApi(this, 'GameApi', {
      restApiName: 'Ghost in the Code API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS
      }
    });

    // API endpoints
    const hints = api.root.addResource('hints');
    hints.addMethod('POST', new apigateway.LambdaIntegration(bedrockFunction));

    const voice = api.root.addResource('voice');
    voice.addMethod('POST', new apigateway.LambdaIntegration(pollyFunction));

    // CloudFront Distribution
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html', // SPA routing
          ttl: Duration.seconds(0)
        }
      ]
    });

    // Outputs
    new CfnOutput(this, 'DistributionDomain', {
      value: distribution.distributionDomainName
    });
    
    new CfnOutput(this, 'BucketName', {
      value: websiteBucket.bucketName
    });

    new CfnOutput(this, 'ApiEndpoint', {
      value: api.url
    });

    new CfnOutput(this, 'AudioBucketName', {
      value: audioCacheBucket.bucketName
    });
  }
}
```

### Deployment Process

1. **Build**: `npm run build` (Vite builds to `/dist`)
2. **Synth**: `cdk synth` (Generate CloudFormation)
3. **Deploy**: `cdk deploy` (Deploy stack)
4. **Upload**: Sync `/dist` to S3 bucket
5. **Invalidate**: CloudFront cache invalidation

### Deployment Script

```bash
#!/bin/bash
# deploy.sh

echo "Building application..."
npm run build

echo "Deploying CDK stack..."
cd infrastructure
cdk deploy --require-approval never

echo "Uploading assets to S3..."
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name GhostInTheCodeStack \
  --query 'Stacks[0].Outputs[?OutputKey==`BucketName`].OutputValue' \
  --output text)

aws s3 sync ../dist s3://$BUCKET_NAME --delete

echo "Invalidating CloudFront cache..."
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name GhostInTheCodeStack \
  --query 'Stacks[0].Outputs[?OutputKey==`DistributionId`].OutputValue' \
  --output text)

aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"

echo "Deployment complete!"
```

## Visual Design Guidelines

### Color Palette (High Contrast & Accessible)

- **Primary**: Deep purple (#6B46C1) - Spooky but friendly
- **Secondary**: Bright cyan (#00D9FF) - Digital/tech feel
- **Accent**: Lime green (#A3FF00) - Success/healing
- **Background**: Dark blue-gray (#1A1F2E) - Night sky
- **Text**: Pure white (#FFFFFF) - Maximum contrast (7:1+ ratio)
- **Error**: Bright orange (#FF9500) - High visibility, colorblind-safe
- **Focus Indicators**: Yellow (#FFD700) - 3px outline, highly visible
- **Interactive Elements**: Minimum 44x44px touch targets

**Accessibility Features:**
- All color combinations meet WCAG AAA standards (7:1 contrast)
- Color is never the only indicator (icons + text + patterns)
- Colorblind-safe palette (tested for deuteranopia, protanopia, tritanopia)
- High contrast mode toggle option
- Reduced motion mode for animations

### Typography (Accessibility-Focused)

- **Headings**: OpenDyslexic or Lexend (dyslexia-friendly, clear letter shapes)
- **Code**: JetBrains Mono or Fira Code (excellent character differentiation)
- **Body**: Atkinson Hyperlegible or Inter (designed for low vision readers)
- **Base Size**: 18px minimum (adjustable to 20px, 24px)
- **Line Height**: 1.5 minimum for readability
- **Letter Spacing**: Slightly increased (0.02em) for clarity

### Animation Timing

- **Quick feedback**: 200ms (button hovers, clicks)
- **Success animations**: 1-2s (code healing, celebrations)
- **Transitions**: 300ms (screen changes)
- **Ghost idle**: 3s loop (breathing/floating animation)

## Performance Considerations

### Optimization Strategies

1. **Code Splitting**: Lazy load challenge data by level
2. **Asset Optimization**: Compress images, use SVG for ghost
3. **Animation Performance**: Use CSS transforms (GPU-accelerated)
4. **Bundle Size**: Keep under 500KB initial load
5. **Caching**: Aggressive CloudFront caching for assets

### Acceptable Limits (Hackathon Context)

- Initial load: < 5 seconds on 3G
- Interaction response: < 200ms
- Animation frame rate: 30fps minimum
- Bundle size: < 1MB total

## Future Enhancements (Out of Scope)

- Multiplayer/leaderboards
- User accounts and cloud save
- Additional challenge types (functions, arrays, objects)
- Sound effects and music
- Mobile app version
- Teacher dashboard for classroom use

## Development Workflow

1. **Setup**: Initialize Vite + React project
2. **Core Engine**: Build game state management
3. **UI Components**: Create basic layout and components
4. **Challenge System**: Implement validation and progression
5. **Animations**: Add visual feedback
6. **Polish**: Refine UX and fix bugs
7. **Infrastructure**: Set up CDK stack
8. **Deploy**: Build and deploy to AWS
9. **Test**: Manual testing across browsers
10. **Demo**: Prepare hackathon presentation
