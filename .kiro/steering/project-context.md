# Ghost in The Code - Project Context

## Project Overview
An interactive web game where kids help a friendly ghost "debug" haunted code to save the digital world. Each bug represents a coding concept (loops, conditions, logic puzzles) with spooky animations as rewards.

## Technology Stack
- **Frontend**: Vite (for fast development and build)
- **Infrastructure**: AWS CDK (for deployment)
- **Language**: TypeScript (for all code where possible)
- **Lambda Functions**: TypeScript with Node.js 20.x runtime
- **Target Audience**: Kids learning coding concepts

## Development Philosophy
This is a **hackathon project** with the following priorities:
- Focus on core functionality and user experience
- Code should be clean and understandable, but doesn't need to be production-grade
- Prioritize speed of development and demonstrable features
- Repository will be public - keep credentials and sensitive data out of code
- It's okay to use simplified approaches and mock data where appropriate
- Documentation should be clear but concise

## Quality Standards
- Write code that works and demonstrates the concept well
- Tests should cover core functionality only - no need for exhaustive test coverage
- Error handling should be present but can be basic
- Performance optimization is secondary to getting features working
- Security basics (no hardcoded secrets, basic input validation) but not enterprise-level

## Implementation Preferences
- Keep architecture simple and straightforward
- **Always use TypeScript** - All code should be written in TypeScript where possible for type safety
- Use modern TypeScript patterns with strict mode enabled
- Leverage existing libraries and frameworks where helpful
- Focus on the interactive and visual elements that make the game engaging
- Animations and user feedback are important for the experience
- **No Docker** - Avoid Docker dependencies; use local bundling and native tooling instead

## TypeScript Guidelines
- Use TypeScript for all new code (frontend, backend, Lambda functions, CDK infrastructure)
- Enable strict mode in tsconfig.json
- Define proper interfaces and types for all data structures
- Use type guards for runtime type checking
- Avoid `any` type - use `unknown` or proper types instead
- Leverage TypeScript's type inference where appropriate
