# Documentation Standards

## Documentation Structure

All project documentation lives in the `docs/` folder with this structure:

```
docs/
├── README.md              # Documentation hub with navigation
├── getting-started.md     # Setup and first run
├── architecture.md        # Tech stack overview
├── features/              # Feature-specific docs
├── development/           # Development guides
├── deployment/            # Deployment guides
└── reference/             # Reference documentation
```

## Documentation Principles

### Dev-Friendly
- **Scannable** - Use clear headings, bullet points, and code blocks
- **Concise** - Get to the point quickly, no fluff
- **Practical** - Focus on actionable information over theory
- **Organized** - Related content grouped together

### Self-Documenting Code First
- Code should be clear through naming and structure
- Only add comments for complex logic that isn't obvious
- Avoid redundant comments that restate what code does
- See [Code Style Guide](docs/development/code-style.md) for details

### When to Create Documentation

**Create docs for:**
- New features (how they work, how to use them)
- Architecture decisions (why we chose X over Y)
- Setup and deployment processes
- Security considerations
- API integrations

**Don't create docs for:**
- Obvious code functionality (let code speak for itself)
- Temporary implementation details
- Things that change frequently (use code comments instead)

## Documentation Format

### File Naming
- Use kebab-case: `getting-started.md`, `code-style.md`
- Be descriptive: `aws-setup.md` not `setup.md`
- Group related docs in folders: `features/`, `deployment/`

### Structure
```markdown
# Title

## Overview
Brief description of what this doc covers.

## Key Section
Content with code examples.

### Subsection
More specific details.

## Examples
Practical examples with code blocks.

## Troubleshooting (if applicable)
Common issues and solutions.
```

### Code Blocks
Always specify language for syntax highlighting:

````markdown
```typescript
const example = 'code here';
```

```bash
npm install
```
````

### Links
- Use relative links within docs: `[Code Style](development/code-style.md)`
- Link to specific sections: `[Security](development/security.md#sandbox-security)`
- Keep links up to date when moving files

## Updating Documentation

### When Adding Features
1. Add feature doc to appropriate folder (`features/`, `deployment/`, etc.)
2. Update `docs/README.md` navigation
3. Link from main README if it's a major feature
4. Keep it concise - focus on what devs need to know

### When Changing Architecture
1. Update `docs/architecture.md`
2. Update related feature docs if affected
3. Add migration notes if breaking changes

### When Deprecating Features
1. Mark as deprecated in docs
2. Provide migration path
3. Remove docs when feature is fully removed

## Documentation Review

Before committing documentation:
- [ ] Is it scannable? (headings, bullets, code blocks)
- [ ] Is it concise? (no unnecessary fluff)
- [ ] Is it practical? (actionable information)
- [ ] Are code examples correct and tested?
- [ ] Are links working?
- [ ] Is it in the right location?

## Main README

The main `README.md` should be:
- **Brief overview** of the project
- **Quick start** instructions
- **Links to detailed docs** in `docs/` folder
- **Not a documentation dump** - keep it short

## Examples of Good Documentation

### Good: Concise and Practical
```markdown
# Voice Integration

## Quick Setup

1. Deploy infrastructure:
   ```bash
   cd infrastructure
   npm run deploy:full
   ```

2. Add API endpoint to `.env`
3. Restart dev server

See [Troubleshooting](#troubleshooting) if issues occur.
```

### Bad: Verbose and Theoretical
```markdown
# Voice Integration

Voice integration is a feature that allows the application to use
text-to-speech capabilities. This is accomplished through the use of
Amazon Polly, which is a service provided by AWS that converts text
into lifelike speech. The integration works by...
[continues for several paragraphs]
```

## Tools and Automation

- Use markdown linters to check formatting
- Keep a consistent style across all docs
- Use tables for comparison data
- Use code blocks for all commands and code
- Use callouts for important notes (> **Note:** ...)

## Maintenance

- Review docs quarterly for accuracy
- Update when features change
- Remove outdated information promptly
- Keep examples working and tested
