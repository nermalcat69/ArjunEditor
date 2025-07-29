# Contributing to dev-md-editor

Thank you for your interest in contributing to dev-md-editor! We welcome contributions from everyone.

## 🚀 Quick Start

1. **Fork the repository**
   ```bash
   git clone https://github.com/nermalcat69/dev-md-editor.git
   cd dev-md-editor
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Build the project**
   ```bash
   pnpm build
   ```

4. **Run type checking**
   ```bash
   pnpm type-check
   ```

5. **Run linting**
   ```bash
   pnpm lint
   ```

## 📋 Development Workflow

### Project Structure

```
dev-md-editor/
├── src/
│   ├── types.ts              # TypeScript interfaces
│   ├── utils/               # Utility functions
│   ├── server/              # Server-side handlers
│   ├── adapters/            # Framework adapters
│   └── index.ts             # Main entry point
├── client/                  # React components
├── examples/                # Usage examples
└── dist/                    # Built files
```

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add TypeScript types for new features
   - Update documentation if needed

3. **Test your changes**
   ```bash
   pnpm build
   pnpm type-check
   pnpm lint
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

## 🧪 Testing

Currently, we're building out our testing infrastructure. For now, please:

1. **Build the project** to ensure TypeScript compilation
2. **Test manually** with a sample Next.js/SvelteKit/Astro project
3. **Check all framework adapters** work correctly

## 📝 Code Style

- **TypeScript**: All code should be properly typed
- **ESLint**: Follow the existing linting rules
- **Imports**: Use absolute imports from `src/`
- **Comments**: Add JSDoc comments for public APIs
- **Naming**: Use descriptive names for functions and variables

### Example Code Style

```typescript
/**
 * Converts markdown content to Editor.js format
 * @param markdown - The markdown string to convert
 * @returns Editor.js compatible data structure
 */
export function markdownToEditorJS(markdown: string): EditorData {
  // Implementation
}
```

## 🔧 Adding Framework Support

To add support for a new framework:

1. **Create adapter file**: `src/adapters/your-framework.ts`
2. **Implement required functions**:
   - `mountMarkdownEditor(config)`
   - Framework-specific route handlers
   - Middleware/integration helpers

3. **Add to main exports**: Update `src/index.ts`
4. **Create example**: Add to `examples/your-framework.ts`
5. **Update documentation**: Add section to README.md

## 🐛 Bug Reports

When reporting bugs, please include:

- **Framework and version** (Next.js 13.5, SvelteKit 1.0, etc.)
- **Package version** of dev-md-editor
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Error messages** or console output

## ✨ Feature Requests

For new features:

- **Check existing issues** to avoid duplicates
- **Describe the use case** and why it's needed
- **Provide examples** of how it would be used
- **Consider backward compatibility**

## 📦 Release Process

Releases are handled by maintainers:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create GitHub release
4. Publish to npm

## 🔍 Code Review

All contributions go through code review:

- **Keep PRs focused** on a single feature/fix
- **Write clear commit messages**
- **Respond to feedback** promptly
- **Update documentation** as needed

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🤝 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Discord**: [Join our community](https://discord.gg/your-invite) (coming soon)

## 🎯 Priority Areas

We're particularly looking for help with:

- **Testing infrastructure** and test coverage
- **Additional framework support** (Remix, Vue, etc.)
- **Performance optimizations**
- **Documentation improvements**
- **Editor.js plugin system integration**

Thank you for contributing! 🙏 