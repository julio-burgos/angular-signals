# NPM Publishing Setup Guide

Quick guide to set up automated npm publishing for angular-signals.

## Prerequisites

✅ GitHub repository created
✅ npm account created (https://www.npmjs.com/)
✅ Library code ready to publish

## Step-by-Step Setup

### 1. Create npm Access Token

1. Log in to https://www.npmjs.com/
2. Click your profile picture → "Access Tokens"
3. Click "Generate New Token" → "Classic Token"
4. Select token type: **Automation**
5. Copy the token (you won't see it again!)

### 2. Add Token to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add the following:
   - **Name:** `NPM_TOKEN`
   - **Secret:** (paste your npm token)
5. Click **"Add secret"**

### 3. Verify Package Configuration

Check `projects/angular-signals/package.json`:

```json
{
  "name": "angular-signals",
  "version": "0.0.2",
  "description": "Advanced Angular signals library...",
  "author": "Your Name",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/angular-signals.git"
  }
}
```

**Important:** Update the repository URL with your actual GitHub username!

### 4. Check Package Name Availability

Before publishing, verify the name is available:

```bash
npm search angular-signals
```

If taken, update the name in:
- `projects/angular-signals/package.json`
- README.md installation instructions

### 5. Update Repository URLs

Replace `yourusername` with your GitHub username in:

- [x] `README.md` (all badge links and URLs)
- [x] `projects/angular-signals/package.json` (repository and bugs URLs)
- [x] `CHANGELOG.md` (comparison links)
- [x] `CONTRIBUTING.md` (clone URL)

### 6. Test Build Locally

```bash
# Build the library
npm run build

# Check dist folder
ls -la dist/angular-signals

# Verify package.json exists
cat dist/angular-signals/package.json
```

### 7. Create Your First Release

#### Option A: GitHub UI

1. Go to your repository on GitHub
2. Click **"Releases"** → **"Create a new release"**
3. Click **"Choose a tag"**
4. Type: `v0.0.2` (or your version)
5. Click **"Create new tag: v0.0.2 on publish"**
6. **Release title:** `v0.0.2`
7. **Description:**
   ```
   Initial release of angular-signals

   Features:
   - deepSignal - Signals with deep equality
   - deepComputed - Computed signals with deep equality
   - spring - Physics-based animations
   - tween - Time-based animations
   ```
8. Click **"Publish release"**

#### Option B: Command Line

```bash
# Create and push tag
git tag v0.0.2
git push origin v0.0.2

# Then create release from tag on GitHub UI
```

### 8. Monitor CI/CD

1. Go to **"Actions"** tab in GitHub
2. Watch the CI/CD workflow run
3. Verify all jobs complete successfully:
   - ✅ Build
   - ✅ Test
   - ✅ Lint
   - ✅ Publish to NPM
   - ✅ Publish to GPR

### 9. Verify npm Publication

Check if package is published:

```bash
# View on npm
open https://www.npmjs.com/package/angular-signals

# Or install to test
npm install angular-signals
```

### 10. Test Installation

Create a test project:

```bash
# Create new Angular app
npx @angular/cli new test-app
cd test-app

# Install your package
npm install angular-signals lodash-es

# Test import
```

## Troubleshooting

### "403 Forbidden" Error

**Problem:** npm publish returns 403
**Solutions:**
- Verify NPM_TOKEN is correct in GitHub secrets
- Check you're logged into npm: `npm whoami`
- Ensure package name is available
- Verify you have publish rights

### "Version Already Exists"

**Problem:** Cannot publish same version twice
**Solutions:**
- Update version in `projects/angular-signals/package.json`
- Create new release with new tag
- Or use `npm version patch/minor/major`

### "Package Name Taken"

**Problem:** Package name already exists
**Solutions:**
- Choose a different name
- Add scope: `@yourusername/angular-signals`
- Update all references to new name

### CI/CD Not Running

**Problem:** Release created but workflow doesn't run
**Solutions:**
- Check `.github/workflows/ci-cd.yml` exists
- Verify workflow syntax is correct
- Ensure release is "published" not "draft"
- Check Actions are enabled in repo settings

## Publishing Updates

For subsequent releases:

1. **Update code and tests**
2. **Update version:**
   ```bash
   cd projects/angular-signals
   npm version patch  # 0.0.2 → 0.0.3
   npm version minor  # 0.0.2 → 0.1.0
   npm version major  # 0.0.2 → 1.0.0
   ```
3. **Update CHANGELOG.md**
4. **Commit changes:**
   ```bash
   git add .
   git commit -m "chore: release v0.1.0"
   git push
   ```
5. **Create GitHub release** with new version tag
6. **CI/CD automatically publishes**

## Manual Publishing (Fallback)

If CI/CD fails:

```bash
# Build
npm run build

# Navigate to dist
cd dist/angular-signals

# Login to npm
npm login

# Publish
npm publish --access public
```

## Best Practices

✅ **Always test locally before releasing**
✅ **Update CHANGELOG.md with every release**
✅ **Use semantic versioning** (major.minor.patch)
✅ **Write clear release notes**
✅ **Test package installation** after publishing
✅ **Tag releases** in git for traceability
✅ **Keep README.md updated**

## Security Checklist

- [x] NPM_TOKEN stored in GitHub Secrets (never committed)
- [x] No sensitive data in code or config files
- [x] `.npmignore` excludes test files and source
- [x] Token type is "Automation" (not "Publish")
- [x] Repository has two-factor authentication enabled

## Quick Commands Reference

```bash
# Check if logged in to npm
npm whoami

# View package info
npm view angular-signals

# Check package versions
npm view angular-signals versions

# Unpublish (within 72 hours only!)
npm unpublish angular-signals@0.0.2

# Deprecate version
npm deprecate angular-signals@0.0.1 "Use version 0.0.2 instead"
```

## Next Steps

After successful publication:

1. ✅ Add npm badge to README.md
2. ✅ Share on social media
3. ✅ Submit to Angular community lists
4. ✅ Create example projects
5. ✅ Write blog post/tutorial
6. ✅ Respond to issues and PRs

---

🎉 **Congratulations!** Your package is now on npm!

For issues, see [CI_CD.md](.github/CI_CD.md) or open an issue.
