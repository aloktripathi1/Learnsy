# Contributing to Learnsy 🎓

First off, thank you for considering contributing to Learnsy! It's people like you that make Learnsy such a great tool for learners worldwide.

## 🌟 How Can I Contribute?

### Reporting Bugs 🐛

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template:**
- **Description**: Clear description of what the bug is
- **Steps to Reproduce**: Step-by-step instructions
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Screenshots**: If applicable
- **Environment**: Browser, OS, Node version
- **Additional Context**: Any other relevant information

### Suggesting Features 💡

Feature suggestions are tracked as GitHub issues. When creating a feature request:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested feature
- **Explain why this feature would be useful** to most users
- **List any alternatives** you've considered
- **Include mockups or examples** if applicable

### Pull Requests 🔧

1. **Fork the repo** and create your branch from `main`
2. **Follow the code style** of the project
3. **Write clear commit messages**
4. **Test your changes** thoroughly
5. **Update documentation** if needed
6. **Open a PR** with a clear title and description

## 🚀 Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Setup Steps

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/learnsy.git
   cd learnsy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open http://localhost:3000**

## 📝 Code Style Guidelines

### TypeScript
- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` types when possible

### React Components
- Use functional components with hooks
- Keep components small and focused
- Use meaningful component names

### File Naming
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Server actions: `kebab-case.ts`

### Code Formatting
- Use Prettier for formatting (runs automatically)
- 2 spaces for indentation
- Single quotes for strings
- Semicolons at the end of statements

### Commit Messages
Follow the conventional commits specification:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```
feat: add video speed control
fix: resolve streak calculation bug
docs: update installation instructions
```

## 🏗️ Project Architecture

### Key Directories

- **`/app`** - Next.js app router pages and layouts
- **`/components`** - React components
- **`/lib`** - Utility functions and services
- **`/database`** - Database schema and migrations
- **`/hooks`** - Custom React hooks

### Important Files

- **Server Actions**: `/app/actions/` - Database operations
- **Database Service**: `/lib/database.ts` - Core database logic
- **Auth Utilities**: `/lib/auth.ts` - Authentication helpers
- **API Routes**: `/app/api/` - External API endpoints

## 🧪 Testing

Before submitting a PR:

1. **Manual Testing**
   - Test the feature/fix locally
   - Verify on both desktop and mobile
   - Check dark mode compatibility

2. **Build Test**
   ```bash
   npm run build
   ```

3. **Lint Check**
   ```bash
   npm run lint
   ```

## 🎯 Areas to Contribute

### High Priority
- [ ] Add unit tests
- [ ] Improve mobile UX
- [ ] Add playlist search functionality
- [ ] Implement video playback speed control
- [ ] Add export notes feature

### Good First Issues
- [ ] Fix typos in documentation
- [ ] Improve error messages
- [ ] Add loading states
- [ ] Enhance accessibility (ARIA labels)
- [ ] Add more keyboard shortcuts

### Advanced Features
- [ ] Offline mode support
- [ ] Multiple language support (i18n)
- [ ] Video subtitles/transcripts
- [ ] Study session analytics
- [ ] Social features (study groups)

## 📋 Pull Request Process

1. **Update the README.md** if needed
2. **Ensure your code builds** without errors
3. **Test on multiple browsers** if UI changes
4. **Link related issues** in the PR description
5. **Request review** from maintainers
6. **Address review feedback** promptly

## 🔍 Code Review Process

- Maintainers review PRs regularly
- Reviews focus on code quality, functionality, and maintainability
- Be patient and respectful during reviews
- Address feedback constructively

## 📜 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information

## 🤔 Questions?

Feel free to:
- Open a [Discussion](https://github.com/aloktripathi1/learnsy/discussions)
- Comment on related issues
- Reach out to maintainers

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Learnsy! 🎉**
