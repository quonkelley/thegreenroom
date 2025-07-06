# Development Guide - TheGreenRoom.ai

This document outlines the development practices, coding standards, and workflow for TheGreenRoom.ai, following 2025 best practices.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- VS Code (recommended)

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd TheGreenRoom

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your credentials

# Start development server
npm run dev
```

## 🛠️ Development Workflow

### 1. Code Quality Standards

We follow strict code quality standards to ensure maintainability and reliability:

#### ESLint Configuration

- **TypeScript-first**: Strict TypeScript rules enabled
- **Security-focused**: Security rules to prevent vulnerabilities
- **Import organization**: Consistent import ordering
- **React best practices**: Hooks rules and JSX standards

#### Prettier Configuration

- **Consistent formatting**: 2-space indentation, single quotes
- **Line length**: 80 characters max
- **Trailing commas**: ES5 compatible

#### TypeScript Configuration

- **Strict mode**: All strict checks enabled
- **Path mapping**: Clean import paths with `@/*`
- **Modern targets**: ES2022+ features

### 2. Git Workflow

#### Branch Strategy

```
main          # Production-ready code
├── develop   # Integration branch
├── feature/* # New features
├── bugfix/*  # Bug fixes
└── hotfix/*  # Critical production fixes
```

#### Commit Standards

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add venue discovery feature
fix: resolve authentication token issue
docs: update API documentation
style: format code with prettier
refactor: simplify analytics calculation
test: add unit tests for email service
chore: update dependencies
```

#### Pre-commit Hooks

- **lint-staged**: Runs on staged files only
- **ESLint**: Code quality checks
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Tests**: Related test execution

### 3. Testing Strategy

#### Unit Tests (Jest)

- **Location**: `__tests__/` directory
- **Coverage**: Minimum 80% coverage required
- **Naming**: `*.test.ts` or `*.test.tsx`

```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

#### E2E Tests (Playwright)

- **Location**: `e2e/` directory
- **Browsers**: Chrome, Firefox, Safari
- **Mobile**: Responsive testing

```bash
npm run test:e2e          # Run E2E tests
npm run test:e2e:ui       # Interactive mode
npm run test:e2e:headed   # Visual mode
```

### 4. Code Review Process

#### Pull Request Checklist

- [ ] Code follows style guidelines
- [ ] Tests pass and coverage is adequate
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance impact considered
- [ ] Accessibility standards met

#### Review Guidelines

- **Constructive feedback**: Focus on improvement
- **Security review**: Check for vulnerabilities
- **Performance review**: Consider optimization
- **Accessibility review**: Ensure inclusive design

## 📁 Project Structure

```
TheGreenRoom/
├── components/          # Reusable UI components
├── pages/              # Next.js pages and API routes
├── lib/                # Utility functions and services
├── types/              # TypeScript type definitions
├── styles/             # Global styles and Tailwind config
├── __tests__/          # Unit tests
├── e2e/                # End-to-end tests
├── docs/               # Documentation
└── public/             # Static assets
```

## 🔧 Development Tools

### VS Code Extensions (Recommended)

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "ms-playwright.playwright"
  ]
}
```

### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## 🚀 Deployment

### Environment Variables

Required environment variables for deployment:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Email Service
RESEND_API_KEY=

# AI Services
OPENAI_API_KEY=

# App Configuration
NEXT_PUBLIC_APP_URL=
```

### Deployment Pipeline

1. **Security Scan**: Vulnerability assessment
2. **Quality Check**: Linting and formatting
3. **Test Suite**: Unit and integration tests
4. **E2E Tests**: End-to-end validation
5. **Build**: Production build
6. **Deploy**: Vercel deployment
7. **Performance**: Lighthouse CI

## 🔒 Security Best Practices

### Code Security

- **Input validation**: All user inputs validated
- **SQL injection prevention**: Parameterized queries
- **XSS protection**: Content sanitization
- **Authentication**: Secure token handling
- **Authorization**: Role-based access control

### Dependency Security

- **Regular audits**: `npm audit` in CI/CD
- **Vulnerability scanning**: Snyk integration
- **Dependency updates**: Automated security patches

## 📊 Performance Optimization

### Frontend Performance

- **Code splitting**: Dynamic imports
- **Image optimization**: Next.js Image component
- **Bundle analysis**: Webpack bundle analyzer
- **Caching**: Static generation and ISR

### Backend Performance

- **Database optimization**: Indexed queries
- **API caching**: Response caching
- **Rate limiting**: Request throttling
- **Monitoring**: Performance metrics

## 🧪 Testing Best Practices

### Unit Testing

```typescript
// Example test structure
describe('EmailService', () => {
  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      // Arrange
      const emailData = { to: 'test@example.com', subject: 'Test' };

      // Act
      const result = await sendEmail(emailData);

      // Assert
      expect(result.success).toBe(true);
    });
  });
});
```

### E2E Testing

```typescript
// Example E2E test
test('user can complete onboarding flow', async ({ page }) => {
  await page.goto('/onboarding');
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.click('[data-testid="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

## 📈 Monitoring and Analytics

### Error Tracking

- **Sentry**: Error monitoring and performance tracking
- **Logging**: Structured logging with correlation IDs
- **Metrics**: Custom business metrics

### User Analytics

- **Privacy-first**: GDPR compliant tracking
- **Performance**: Core Web Vitals monitoring
- **Business metrics**: Conversion and engagement tracking

## 🤝 Contributing

### Development Process

1. **Fork** the repository
2. **Create** a feature branch
3. **Develop** with quality standards
4. **Test** thoroughly
5. **Submit** a pull request
6. **Review** and iterate
7. **Merge** when approved

### Communication

- **Issues**: Use GitHub issues for bugs and features
- **Discussions**: Use GitHub discussions for questions
- **Code review**: Provide constructive feedback
- **Documentation**: Keep docs updated

## 📚 Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

### Tools

- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Jest Configuration](https://jestjs.io/docs/configuration)
- [Playwright Testing](https://playwright.dev/docs/intro)

---

**Remember**: Quality code is maintainable code. Follow these practices to ensure TheGreenRoom.ai remains a robust, scalable, and secure platform for the music industry.
