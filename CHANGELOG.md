# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-15

### Added
- Initial release of dev-md-editor
- Support for Next.js (App Router and Pages Router)
- Support for SvelteKit with hooks integration
- Support for Astro with integration plugin
- Editor.js powered markdown editing interface
- Automatic markdown ↔ Editor.js conversion
- Frontmatter preservation
- Development-only mode (disabled in production)
- Smart file detection and creation
- Dynamic routing for `/[slug]/_edit` pattern
- API endpoints for saving and URL fetching
- Beautiful, responsive editor interface
- TypeScript support with full type definitions
- Zero-config setup for most use cases
- Auto-detection of framework (experimental)
- Comprehensive documentation and examples

### Features
- **Editor Blocks**: Headers, Paragraphs, Lists, Quotes, Code blocks, Links
- **File Support**: `.md` and `.mdx` files
- **Security**: Dev-only mode, file system isolation
- **Framework Integration**: Middleware, hooks, and integration patterns
- **Utilities**: File operations, content conversion, development helpers

### Technical Details
- Built with TypeScript for type safety
- Uses Editor.js for rich text editing
- Supports React components via CDN (no build step needed)
- Minimal dependencies, framework peer dependencies
- ESM and CommonJS support
- Tree-shakeable exports

## [Unreleased]

### Planned
- Image upload support
- Custom Editor.js tools configuration
- Batch file operations
- Content preview mode
- More file format support (.mdx, custom extensions)
- CLI tool for setup
- VS Code extension
- Real-time collaboration (experimental)

---

For migration guides and breaking changes, see our [Migration Guide](./MIGRATION.md).
For the complete API reference, see our [Documentation](./README.md). 