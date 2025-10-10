# Contributing to Angular Signals

Thank you for considering contributing to Angular Signals! This document outlines the process for contributing to this project.

## Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/angular-signals.git
   cd angular-signals
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the library**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## Development Workflow

### Project Structure

```
angular-signals/
├── projects/
│   ├── angular-signals/     # Library source code
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── signal/       # deepSignal implementation
│   │   │   │   ├── computed/     # deepComputed implementation
│   │   │   │   └── animation/    # spring and tween
│   │   │   └── public-api.ts     # Public exports
│   │   └── package.json
│   └── demo/                # Demo application
│       └── src/
└── .github/
    └── workflows/
        └── ci-cd.yml        # CI/CD pipeline
```

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, well-documented code
   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm test
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

   We follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `test:` - Adding or updating tests
   - `refactor:` - Code refactoring
   - `chore:` - Maintenance tasks

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your feature branch
   - Fill in the PR template

## Code Style

- Use TypeScript strict mode
- Follow Angular coding standards
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

## Testing

- Write unit tests for all new features
- Ensure all tests pass before submitting PR
- Aim for high code coverage
- Test edge cases

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## Documentation

- Update README.md if adding new features
- Add JSDoc comments to all public APIs
- Update CHANGELOG.md following [Keep a Changelog](https://keepachangelog.com/)
- Include examples in documentation

## Pull Request Guidelines

### PR Checklist

- [ ] Code follows the project style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Commit messages follow conventional commits
- [ ] No breaking changes (or clearly documented)

### PR Description

Please include:
- Summary of changes
- Motivation for changes
- Screenshots (if applicable)
- Related issues

## Release Process

Releases are automated through GitHub Actions:

1. **Create a new release on GitHub**
   - Tag version following semver (e.g., `v1.2.3`)
   - Write release notes

2. **CI/CD automatically:**
   - Builds the library
   - Runs all tests
   - Publishes to npm
   - Publishes to GitHub Package Registry

## Reporting Issues

### Bug Reports

Include:
- Angular version
- Library version
- Steps to reproduce
- Expected behavior
- Actual behavior
- Code samples
- Error messages

### Feature Requests

Include:
- Use case description
- Proposed API
- Example usage
- Why it would be useful

## Questions?

- Open an issue for questions
- Check existing issues and PRs
- Read the documentation

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
