# Project Structure

## Root Directory

```
ghost-in-the-code/
├── src/                    # Frontend source code
├── infrastructure/         # AWS CDK deployment
├── docs/                   # Documentation
├── public/                 # Static assets
├── aws-setup/             # AWS OIDC setup scripts
├── .github/               # GitHub Actions workflows
├── dist/                  # Build output (generated)
├── node_modules/          # Dependencies (generated)
├── package.json           # Project dependencies
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # Main project README
```

## Source Directory (`src/`)

```
src/
├── components/            # React components
│   ├── GameBoard.tsx      # Main game layout
│   ├── CodeEditor.tsx     # Interactive code editor
│   ├── GhostCharacter.tsx # Animated ghost helper
│   ├── BadgeCollection.tsx # Badge display
│   ├── ProgressTracker.tsx # Progress tracking
│   └── ...
├── engine/                # Game logic and state
│   ├── gameReducer.ts     # State management
│   ├── gameActions.ts     # Action creators
│   ├── useBadgeSystem.ts  # Badge earning logic
│   └── persistence.ts     # LocalStorage handling
├── data/                  # Game data
│   ├── challenges/        # Challenge JSON files
│   │   ├── loops.json
│   │   ├── conditionals.json
│   │   └── logic.json
│   ├── conceptExplanations/ # Concept explanation JSON
│   ├── badges.ts          # Badge definitions
│   └── challengeLoader.ts # Data loading utilities
├── animations/            # Success animations
│   └── SuccessAnimations.tsx
├── services/              # API services
│   └── pollyService.ts    # AWS Polly integration
├── utils/                 # Utility functions
│   ├── scoring.ts         # Score calculations
│   ├── validation.ts      # Code validation
│   └── sandbox.ts         # Code execution sandbox
├── assets/                # Images, fonts, etc.
├── App.tsx                # Main app component
├── App.css                # App-specific styles
├── main.tsx               # Entry point
└── index.css              # Global styles & utilities
```

## Infrastructure Directory (`infrastructure/`)

```
infrastructure/
├── lib/                   # CDK stack definitions
│   └── ghost-in-the-code-stack.ts
├── lambda/                # Lambda function code
│   └── polly/             # Text-to-speech function
│       ├── index.ts       # Lambda handler
│       └── package.json   # Lambda dependencies
├── bin/                   # CDK app entry point
│   └── infrastructure.ts
├── cdk.out/               # CDK synthesis output (generated)
├── dist/                  # Lambda build output (generated)
├── deploy.sh              # Deployment script (Linux/Mac)
├── deploy.ps1             # Deployment script (Windows)
├── package.json           # Infrastructure dependencies
├── tsconfig.json          # TypeScript configuration
└── cdk.json               # CDK configuration
```

## Documentation Directory (`docs/`)

```
docs/
├── README.md              # Documentation hub
├── getting-started.md     # Setup guide
├── architecture.md        # Tech stack overview
├── features/              # Feature documentation
│   ├── challenges.md
│   ├── badges.md
│   ├── voice.md
│   ├── animations.md
│   └── concept-explanations.md
├── development/           # Development guides
│   ├── code-style.md
│   ├── testing.md
│   └── security.md
├── deployment/            # Deployment guides
│   ├── aws-setup.md
│   └── github-actions.md
└── reference/             # Reference docs
    ├── browser-compat.md
    └── project-structure.md (this file)
```

## AWS Setup Directory (`aws-setup/`)

```
aws-setup/
├── github-actions-oidc-setup.md  # Detailed OIDC guide
├── setup-commands.sh             # Automated setup script
├── trust-policy.json             # IAM trust policy template
└── permissions-policy.json       # IAM permissions template
```

## Public Directory (`public/`)

```
public/
├── badges/                # Badge icon SVGs
└── favicon.ico            # Site favicon
```

## Configuration Files

### TypeScript Configuration
- `tsconfig.json` - Base TypeScript config
- `tsconfig.app.json` - App-specific config
- `tsconfig.node.json` - Node/build config
- `tsconfig.test.json` - Test config

### Build Configuration
- `vite.config.ts` - Vite build configuration
- `eslint.config.js` - ESLint rules

### Environment
- `.env` - Environment variables (not in git)
- `.env.example` - Environment template
- `.gitignore` - Git ignore rules

## Key Files

### Entry Points
- `src/main.tsx` - Frontend entry point
- `infrastructure/bin/infrastructure.ts` - CDK entry point
- `infrastructure/lambda/polly/index.ts` - Lambda entry point

### State Management
- `src/engine/gameReducer.ts` - Central state reducer
- `src/engine/gameActions.ts` - Action creators
- `src/engine/persistence.ts` - LocalStorage sync

### Data Files
- `src/data/challenges/*.json` - Challenge definitions
- `src/data/conceptExplanations/*.json` - Learning content
- `src/data/badges.ts` - Badge definitions

### Styling
- `src/index.css` - Global styles, CSS variables, utility classes
- `src/App.css` - App-specific styles
- Component-specific CSS modules (where needed)

## Build Outputs

### Frontend Build (`dist/`)
Generated by `npm run build`:
- `index.html` - Entry HTML
- `assets/` - Bundled JS, CSS, images

### Lambda Build (`infrastructure/dist/`)
Generated by CDK during deployment:
- Compiled TypeScript Lambda functions
- Bundled with dependencies

### CDK Synthesis (`infrastructure/cdk.out/`)
Generated by `cdk synth`:
- CloudFormation templates
- Asset manifests
- CDK metadata
