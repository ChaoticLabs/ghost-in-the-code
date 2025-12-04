# Getting Started

## Prerequisites
- Node.js 20.x or later
- npm or yarn
- AWS CLI (for deployment only)

## Local Development

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

## Environment Setup

### Voice Integration (Optional)

To enable AWS Polly voice features:

1. Deploy infrastructure:
   ```bash
   cd infrastructure
   npm run deploy:full
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env and add your API endpoint from deployment output
   ```

3. Restart dev server

See [Voice Integration](features/voice.md) for details.

## Project Structure

```
ghost-in-the-code/
├── src/
│   ├── components/          # React components
│   ├── engine/              # Game logic and state
│   ├── data/                # Challenge data and badges
│   ├── animations/          # Success animations
│   ├── services/            # API services
│   └── utils/               # Utility functions
├── infrastructure/          # AWS CDK deployment
├── docs/                    # Documentation
└── public/                  # Static assets
```

See [Project Structure](reference/project-structure.md) for detailed breakdown.

## Next Steps

- Read [Architecture Overview](architecture.md) to understand the tech stack
- Check [Code Style Guide](development/code-style.md) before contributing
- Review [Challenge System](features/challenges.md) to understand game mechanics
