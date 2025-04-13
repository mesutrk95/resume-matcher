This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Code Style and Linting

This project uses ESLint and Prettier to ensure consistent code style and quality across the codebase.

### Available Scripts

- `npm run lint` - Run ESLint to check for code quality issues
- `npm run lint:fix` - Run ESLint and automatically fix issues when possible
- `npm run format` - Run Prettier to format all code files
- `npm run format:check` - Check if all files are properly formatted without making changes

### VS Code Integration

For the best development experience with VS Code:

1. Install the [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extensions
2. The project includes VS Code settings that will:
   - Format code on save using Prettier
   - Run ESLint fix actions on save

### Pre-commit Hooks (Optional)

For teams wanting to enforce code style before commits, consider adding [husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged).

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
