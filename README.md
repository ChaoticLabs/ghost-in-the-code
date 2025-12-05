# Ghost in The Code 👻

[![Deploy to AWS](https://github.com/ChaoticLabs/ghost-in-the-code/actions/workflows/deploy.yml/badge.svg)](https://github.com/ChaoticLabs/ghost-in-the-code/actions/workflows/deploy.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.x-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

An interactive web game where kids help a friendly ghost "debug" haunted code to save the digital world. Each bug represents a coding concept (loops, conditions, logic puzzles) with spooky animations as rewards.

**Kiroween Hackathon Submission:** https://kiroween.devpost.com/

## 🎮 Quick Start

```bash
# Install and run
npm install
npm run dev
```

Visit `http://localhost:5173` to play!

## 🎯 What's Inside

- **14 Challenges** across loops, conditionals, and logic puzzles
- **8 Badges** to earn through mastery and achievements
- **Interactive Code Editor** with syntax highlighting and validation
- **Success Animations** with Framer Motion
- **Voice Integration** using AWS Polly (optional)
- **Progress Tracking** with LocalStorage persistence

## 🚀 Tech Stack

- **Frontend:** Vite + React + TypeScript
- **Infrastructure:** AWS CDK (S3, CloudFront, API Gateway, Lambda)
- **AI Services:** Amazon Polly for voice
- **Animation:** Framer Motion

## 📚 Documentation

All documentation is in the [`docs/`](docs/) folder:

- **[Getting Started](docs/getting-started.md)** - Setup and first run
- **[Architecture](docs/architecture.md)** - Tech stack and design decisions
- **[Features](docs/features/)** - Challenges, badges, voice, animations
- **[Development](docs/development/)** - Code style, testing, security
- **[Deployment](docs/deployment/)** - AWS setup and GitHub Actions
- **[Reference](docs/reference/)** - Browser compatibility, project structure

## 🎨 Features

### Challenge System
Challenges teach coding concepts through interactive debugging. Fix buggy code, earn points, and master programming fundamentals.

### Badge System
Earn badges for concept mastery, achievements, and special accomplishments. Track your progress and celebrate milestones.

### Voice Integration
The ghost speaks using AWS Polly! Enable voice narration in settings for an immersive experience.

### Success Animations
Magical Halloween-themed celebrations with CodeHeal, TerminalGlow, ParticleBurst, and GhostCelebrate animations.

## 🚢 Deployment

Deploy to AWS with CDK:

```bash
cd infrastructure
npm run deploy:full
```

See [AWS Setup Guide](docs/deployment/aws-setup.md) for details.

## 🧪 Testing

```bash
npm test                # Run tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage
```

## 🎯 Development Philosophy

This is a **hackathon project** focused on:
- Core functionality and user experience
- Clean, understandable code
- Speed of development
- Demonstrable features

See [Code Style Guide](docs/development/code-style.md) for guidelines.

## 🔒 Security

Multiple layers protect code execution:
- Whitelist-based sandbox
- Infinite loop protection
- Resource limits
- Constructor chain protection

See [Security Documentation](docs/development/security.md) for details.

## 📝 License

This is a hackathon project. Repository is public - keep credentials out of code.

## 🤝 Contributing

Follow TypeScript best practices, keep code clean and understandable, and check the [Code Style Guide](docs/development/code-style.md) before contributing.

---

**Happy Debugging! 👻✨**

Built with React, TypeScript, Vite, Framer Motion, and AWS CDK.
