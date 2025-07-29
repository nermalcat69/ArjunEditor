# Deployment Guide

This guide covers how to deploy and publish the `dev-md-editor` package.

## 📦 Publishing to NPM

### Prerequisites

1. **NPM Account**: Create an account at [npmjs.com](https://npmjs.com)
2. **Login to NPM**: `npm login` or `pnpm login`
3. **2FA Setup**: Enable two-factor authentication for security

### Pre-publish Checklist

- [ ] All tests pass
- [ ] TypeScript compilation successful
- [ ] Version updated in `package.json`
- [ ] `CHANGELOG.md` updated
- [ ] Documentation up to date
- [ ] Example files tested

### Publishing Steps

1. **Build the package**
   ```bash
   pnpm build
   ```

2. **Verify build output**
   ```bash
   ls -la dist/
   # Should contain .js, .mjs, .d.ts files
   ```

3. **Test the package locally** (optional)
   ```bash
   pnpm pack
   # Creates a .tgz file for local testing
   ```

4. **Publish to NPM**
   ```bash
   pnpm publish
   # Or for first-time publish
   pnpm publish --access public
   ```

### Version Management

Follow [Semantic Versioning](https://semver.org/):

- **Patch** (1.0.1): Bug fixes
- **Minor** (1.1.0): New features, backward compatible
- **Major** (2.0.0): Breaking changes

```bash
# Update version
npm version patch|minor|major

# Or manually edit package.json
```

## 🚀 GitHub Releases

### Creating a Release

1. **Tag the release**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Create GitHub Release**
   - Go to GitHub > Releases > New Release
   - Choose the tag
   - Add release notes from CHANGELOG.md
   - Attach any additional files

### Automated Releases (Future)

Consider setting up GitHub Actions for automated publishing:

```yaml
# .github/workflows/publish.yml
name: Publish Package

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build package
        run: pnpm build
      
      - name: Publish to NPM
        run: pnpm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 📋 Distribution Checklist

### Before Each Release

- [ ] Update version number
- [ ] Update CHANGELOG.md
- [ ] Test with sample projects
- [ ] Verify all framework adapters work
- [ ] Update documentation
- [ ] Build and test package

### After Release

- [ ] Create GitHub release
- [ ] Update examples/demos
- [ ] Announce on social media/communities
- [ ] Monitor for issues

## 🔍 Package Verification

After publishing, verify the package:

1. **Install in a test project**
   ```bash
   pnpm add dev-md-editor@latest
   ```

2. **Check exports**
   ```javascript
   import { mountMarkdownEditor } from 'dev-md-editor/nextjs';
   console.log(typeof mountMarkdownEditor); // should be 'function'
   ```

3. **Verify TypeScript types**
   ```typescript
   import type { EditorConfig } from 'dev-md-editor';
   ```

## 🌍 CDN Distribution

The package is automatically available via CDNs:

- **unpkg**: `https://unpkg.com/dev-md-editor@latest/dist/index.js`
- **jsDelivr**: `https://cdn.jsdelivr.net/npm/dev-md-editor@latest/dist/index.js`

## 📊 Monitoring

### Package Stats

- NPM download stats
- Bundle size analysis
- GitHub stars/forks
- Issue reports

### Tools

- [npm trends](https://npmtrends.com/dev-md-editor)
- [bundlephobia](https://bundlephobia.com/package/dev-md-editor)
- [npmstat](https://npm-stat.com/charts.html?package=dev-md-editor)

## 🐛 Hotfix Process

For critical bugs in production:

1. Create hotfix branch from main
2. Fix the issue
3. Update patch version
4. Test thoroughly
5. Publish immediately
6. Create GitHub release
7. Merge back to main

## 🔄 Rollback Strategy

If a release has issues:

1. **Deprecate the problematic version**
   ```bash
   npm deprecate dev-md-editor@1.0.1 "Please upgrade to 1.0.2"
   ```

2. **Publish a fixed version immediately**

3. **Consider unpublishing** (only within 72 hours)
   ```bash
   npm unpublish dev-md-editor@1.0.1
   ```

## 📞 Support

For publishing issues:

- NPM Support: [support@npmjs.com](mailto:support@npmjs.com)
- GitHub Issues: [Create an issue](https://github.com/nermalcat69/dev-md-editor/issues)
- Community: [GitHub Discussions](https://github.com/nermalcat69/dev-md-editor/discussions) 