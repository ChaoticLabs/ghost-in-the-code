# Ghost in The Code 👻

An interactive web game where kids help a friendly ghost "debug" haunted code to save the digital world. Each bug represents a coding concept (loops, conditions, logic puzzles) with spooky animations as rewards.

## 🎮 Project Overview

**Target Audience:** Kids learning coding concepts  
**Technology Stack:**
- **Frontend:** Vite + React + TypeScript
- **Infrastructure:** AWS CDK (S3, CloudFront, API Gateway, Lambda)
- **AI Services:** Amazon Bedrock (Claude) for hints, Amazon Polly for voice
- **Animation:** Framer Motion

**Development Philosophy:** This is a hackathon project focused on core functionality and user experience. Code is clean and understandable but doesn't need to be production-grade.

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or later
- npm or yarn

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
ghost-in-the-code/
├── src/
│   ├── components/          # React components
│   │   ├── GameBoard.tsx    # Main game layout
│   │   ├── CodeEditor.tsx   # Interactive code editor
│   │   ├── GhostCharacter.tsx # Animated ghost helper
│   │   ├── BadgeCollection.tsx # Badge system
│   │   ├── ProgressTracker.tsx # Challenge progress
│   │   └── ...
│   ├── engine/              # Game logic and state management
│   │   ├── gameReducer.ts   # State management
│   │   ├── gameActions.ts   # Action creators
│   │   ├── useBadgeSystem.ts # Badge logic
│   │   └── persistence.ts   # LocalStorage handling
│   ├── data/                # Challenge data
│   │   ├── challenges/      # JSON challenge files
│   │   │   ├── loops.json
│   │   │   ├── conditionals.json
│   │   │   └── logic.json
│   │   ├── badges.ts        # Badge definitions
│   │   └── challengeLoader.ts
│   ├── animations/          # Success animations
│   │   └── SuccessAnimations.tsx
│   ├── index.css           # Global styles & utility classes
│   └── App.tsx             # Main app component
├── infrastructure/          # AWS CDK deployment
│   ├── lambda/             # Lambda functions
│   │   ├── bedrock/        # AI hints (TypeScript)
│   │   └── polly/          # Text-to-speech (TypeScript)
│   └── lib/                # CDK stack definitions
├── public/                 # Static assets
│   └── badges/            # Badge icon SVGs
└── README.md              # This file
```

## 🎯 Core Features

### 1. Challenge System
- **14 Challenges** across 3 concept types:
  - **Loops** (4 challenges): Learn repetition and iteration
  - **Conditionals** (5 challenges): Master decision-making
  - **Logic Puzzles** (5 challenges): Solve tricky problems

### 2. Interactive Code Editor
- Syntax-highlighted code display
- Editable buggy lines
- Real-time validation
- Visual feedback on success/failure

### 3. Badge System
- **8 Badges** to earn:
  - **Concept Mastery:** Loop Master, Conditional Champion, Logic Legend
  - **Achievement:** First Bug Fixed, Hint-Free Hero, Persistent Ghost Helper
  - **Special:** Perfect Start, Ghost Whisperer
- Unlock animations and certificate generation
- Progress tracking and statistics

### 4. Success Animations
Magical Halloween-themed celebrations using Framer Motion:
- **CodeHeal:** Green healing wave across fixed code
- **TerminalGlow:** Pulsing glow with corner emojis
- **ParticleBurst:** Curved, floating emoji particles across screen
- **GhostCelebrate:** Bouncing, rotating ghost character
- All animations respect `prefers-reduced-motion`

### 5. Educational Content
- Pre-challenge introductions for each concept type
- Post-challenge learning summaries
- Age-appropriate explanations
- Hint system with 3 levels per challenge

### 6. Progress Tracking
- Challenge completion tracking
- Concept mastery percentages
- Hint usage statistics
- Time spent tracking
- Progress summary with all stats

### 7. Persistence
- Game state saved to localStorage
- Resume from where you left off
- Player name persistence
- Badge and progress data

## 🎨 Design System

### Color Palette
```css
--color-primary: #A3FF00;      /* Lime green */
--color-secondary: #00D9FF;    /* Cyan */
--color-accent: #FF9500;       /* Orange */
--color-purple: #6B46C1;       /* Purple */
--color-dark-bg: #1A1F2E;      /* Dark blue */
--color-darker-bg: #2D1B4E;    /* Darker purple */
```

### Typography
- **Headers:** Jolly Lodger (spooky, playful)
- **Body:** Avenir (clean, readable)
- Responsive font sizing with `clamp()`

### Utility Classes
- `.icon-button` - Consistent icon buttons with hover effects
- `.modal-overlay` - Standard modal backdrop
- `.modal-container` - Modal content wrapper
- `.h1-style`, `.h2-style`, `.h3-style` - Heading styles for non-heading elements

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

Test coverage includes:
- Badge earning logic
- Challenge validation
- State management
- Data loading

## 🚢 Deployment

### AWS Infrastructure

The game can be deployed to AWS using CDK:

```bash
cd infrastructure

# Install dependencies
npm install

# Deploy everything (builds Vite app + deploys CDK)
npm run deploy:full

# Or use deployment scripts
# Windows:
.\deploy.ps1

# Linux/Mac:
chmod +x deploy.sh
./deploy.sh
```

**Infrastructure includes:**
- S3 bucket for static hosting
- CloudFront CDN for global delivery
- API Gateway for AI/voice services
- Lambda functions (TypeScript, auto-compiled):
  - Bedrock function for AI hints
  - Polly function for text-to-speech
- S3 bucket for audio caching

**No Docker required** - uses local bundling and esbuild for Lambda functions.

### Lambda Functions

Both Lambda functions are written in TypeScript and automatically compiled during deployment:

#### Bedrock Function (AI Hints)
- **Endpoint:** `POST /hints`
- Generates child-friendly hints using Claude
- Caching strategy for cost optimization

#### Polly Function (Text-to-Speech)
- **Endpoint:** `POST /voice`
- Synthesizes speech with emotion support
- Caches audio files in S3 (1-year TTL)

## 📊 Game Statistics

### Challenge Data
- **Total Challenges:** 14
- **Loops:** 4 challenges
- **Conditionals:** 5 challenges
- **Logic:** 5 challenges

### Badge System
- **Total Badges:** 8
- **Concept Mastery:** 3 badges
- **Achievement:** 3 badges
- **Special:** 2 badges

### Performance Metrics
- Concept mastery calculated based on:
  - Hints used (15 points penalty each)
  - Extra attempts (10 points penalty each)
  - Base score: 100 points per challenge

## 🎯 Key Implementation Details

### State Management
- React Context + useReducer for global state
- LocalStorage persistence with versioning
- Automatic save on state changes

### Challenge Loading
- JSON-based challenge data
- Validation on load
- Type-safe with TypeScript interfaces

### Animation System
- Framer Motion for smooth animations
- GPU-accelerated transforms
- Accessibility-first (reduced motion support)
- Curved particle paths for magical effect

### Responsive Design
- Mobile-first approach
- Breakpoints: 480px, 768px, 1024px, 1440px
- Touch-friendly (44px minimum targets)
- Flexible layouts with CSS Grid/Flexbox

## 🔧 Development Guidelines

### TypeScript
- Strict mode enabled
- Proper interfaces for all data structures
- Type guards for runtime checking
- Avoid `any` - use `unknown` or proper types

### Code Style
- Use utility classes from `index.css`
- Follow DRY principles
- Component-scoped CSS modules
- Consistent naming conventions

### Accessibility
- WCAG AAA contrast ratios
- Keyboard navigation support
- Focus indicators (3px yellow outline)
- Screen reader friendly
- Reduced motion support

## 🐛 Known Issues & Future Enhancements

### Current Limitations
- Badge icons use emoji placeholders (SVGs planned)
- No sound effects yet
- Print feature removed (download feature also removed)

### Planned Features
- Custom SVG badge icons
- Sound effects for animations
- Social sharing of badges
- More challenge types
- Multiplayer mode

## 📝 License

This is a hackathon project. Repository is public - keep credentials and sensitive data out of code.

## 🤝 Contributing

This is a hackathon project focused on rapid development. Code should:
- Work and demonstrate the concept well
- Be clean and understandable
- Follow TypeScript best practices
- Include basic error handling
- Have clear but concise documentation

## 🎉 Acknowledgments

Built with:
- React + TypeScript + Vite
- Framer Motion for animations
- AWS CDK for infrastructure
- Amazon Bedrock (Claude) for AI
- Amazon Polly for voice synthesis

---

**Happy Debugging! 👻✨**
