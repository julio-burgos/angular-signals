# CI/CD Pipeline Documentation

This document explains the GitHub Actions CI/CD pipeline for the angular-signals library.

## Pipeline Overview

The pipeline consists of 5 main jobs:

1. **Build** - Compiles the library on multiple Node versions
2. **Test** - Runs the test suite
3. **Lint** - Checks code formatting
4. **Publish to NPM** - Publishes to npm registry (on release)
5. **Publish to GPR** - Publishes to GitHub Package Registry (on release)

## Workflow Triggers

### On Push
```yaml
push:
  branches:
    - main
    - develop
```
- Runs build, test, and lint jobs
- Validates all changes
- Does NOT publish

### On Pull Request
```yaml
pull_request:
  branches:
    - main
    - develop
```
- Runs build, test, and lint jobs
- Validates PR before merging
- Does NOT publish

### On Release
```yaml
release:
  types: [created]
```
- Runs ALL jobs including publish
- Automatically publishes to npm and GPR
- Only triggers on GitHub releases

## Jobs in Detail

### 1. Build Job

**Runs on:** Node 18.x and 20.x

**Steps:**
1. Checkout code
2. Setup Node.js with caching
3. Install dependencies (`npm ci`)
4. Build library (`npm run build -- angular-signals`)
5. Upload build artifacts

**Artifacts:** Stored for 1 day for use in other jobs

### 2. Test Job

**Runs on:** Node 18.x and 20.x
**Depends on:** Build job

**Steps:**
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Run tests (`npm test`)
5. Generate coverage report
6. Upload coverage to Codecov (Node 20.x only)

### 3. Lint Job

**Runs on:** Node 20.x

**Steps:**
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Check formatting with Prettier

### 4. Publish to NPM

**Runs on:** Node 20.x
**Depends on:** Build, Test, Lint
**Triggers:** Only on GitHub releases

**Steps:**
1. Checkout code
2. Setup Node.js with npm registry
3. Install dependencies
4. Build library
5. Update package version from release tag
6. Publish to npm with public access
7. Create GitHub release assets

**Required Secret:** `NPM_TOKEN`

### 5. Publish to GitHub Package Registry

**Runs on:** Node 20.x
**Depends on:** Build, Test, Lint
**Triggers:** Only on GitHub releases

**Steps:**
1. Checkout code
2. Setup Node.js with GPR
3. Install dependencies
4. Build library
5. Update package version and name
6. Publish to GPR

**Uses:** `GITHUB_TOKEN` (automatically provided)

## Setting Up Secrets

### NPM_TOKEN

1. **Create npm access token:**
   - Go to https://www.npmjs.com/
   - Click on your profile → Access Tokens
   - Generate New Token → Classic Token
   - Select "Automation" type
   - Copy the token

2. **Add to GitHub:**
   - Go to your repository on GitHub
   - Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your npm token
   - Click "Add secret"

### CODECOV_TOKEN (Optional)

1. **Sign up on Codecov:**
   - Go to https://codecov.io/
   - Sign in with GitHub
   - Add your repository

2. **Get token:**
   - Copy the upload token from Codecov

3. **Add to GitHub:**
   - Same process as NPM_TOKEN
   - Name: `CODECOV_TOKEN`

## Creating a Release

### Method 1: GitHub UI

1. Go to your repository on GitHub
2. Click "Releases" → "Create a new release"
3. Click "Choose a tag"
4. Enter version (e.g., `v1.0.0`)
5. Click "Create new tag on publish"
6. Fill in release title and description
7. Click "Publish release"

### Method 2: Command Line

```bash
# Create and push a tag
git tag v1.0.0
git push origin v1.0.0

# Then create release on GitHub from this tag
```

### Version Format

Follow semantic versioning:
- `v1.0.0` - Major release (breaking changes)
- `v1.1.0` - Minor release (new features)
- `v1.1.1` - Patch release (bug fixes)

## Release Process

1. **Update version in package.json:**
   ```bash
   cd projects/angular-signals
   npm version patch  # or minor, or major
   ```

2. **Update CHANGELOG.md:**
   - Document all changes
   - Follow Keep a Changelog format

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "chore: bump version to 1.0.0"
   git push
   ```

4. **Create GitHub release:**
   - Tag: `v1.0.0`
   - Title: "Release 1.0.0"
   - Description: Copy from CHANGELOG

5. **CI/CD automatically:**
   - Builds library
   - Runs tests
   - Publishes to npm
   - Publishes to GPR

## Monitoring

### Check Workflow Status

1. Go to "Actions" tab in your repository
2. Click on the latest workflow run
3. View logs for each job

### Common Issues

**Build fails:**
- Check TypeScript errors
- Verify all dependencies installed
- Check Node version compatibility

**Tests fail:**
- Review test output
- Check if new tests added
- Verify test environment

**Publish fails:**
- Verify NPM_TOKEN is set correctly
- Check npm package name availability
- Ensure version doesn't already exist

**Lint fails:**
- Run `npx prettier --write "projects/**/*.{ts,html,css,json}"`
- Commit formatting changes

## Manual Publishing

If CI/CD fails, you can publish manually:

```bash
# Build library
npm run build

# Navigate to dist
cd dist/angular-signals

# Update version
npm version 1.0.0 --no-git-tag-version

# Publish to npm
npm publish --access public

# Publish to GPR
npm publish --registry=https://npm.pkg.github.com
```

## Best Practices

1. **Always test locally before pushing:**
   ```bash
   npm test
   npm run build
   ```

2. **Create PRs for changes:**
   - Let CI validate before merging
   - Get code review

3. **Use conventional commits:**
   - `feat:` for features
   - `fix:` for bug fixes
   - `docs:` for documentation

4. **Keep CHANGELOG updated:**
   - Document all notable changes
   - Update before creating release

5. **Test releases:**
   - Create release candidates first
   - Test in real projects before final release

## Troubleshooting

### NPM Publish Permission Denied

- Verify NPM_TOKEN is valid
- Check if you're owner/maintainer of package
- Ensure package name is available

### GitHub Release Not Triggering

- Ensure release is "published", not "draft"
- Check workflow file syntax
- Verify branch protection rules

### Tests Timeout

- Increase timeout in test configuration
- Check for infinite loops
- Verify async operations complete

## Security

- Never commit secrets or tokens
- Use GitHub secrets for sensitive data
- Regularly rotate npm tokens
- Review dependencies for vulnerabilities

## Support

- Open an issue for CI/CD problems
- Check GitHub Actions logs
- Review workflow file syntax

---

For more information, see [GitHub Actions Documentation](https://docs.github.com/en/actions).
