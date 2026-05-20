# Dzaky Shoes Shop 👟

A modern, full-stack e-commerce application built with Next.js 15, tailored for a seamless shoe shopping experience.

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Database:** [Neon Postgres](https://neon.tech/) (Serverless)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication:** [Better Auth](https://better-auth.com/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)

## Features

- 🛍️ Browse products with extensive filtering (size, color, gender)
- 🛒 Fully functional shopping cart
- 💳 User authentication and account management
- 📱 Responsive, mobile-first UI with smooth micro-animations
- ⚡ Lightning fast data fetching with Next.js Turbopack & React 19

## Getting Started

First, clone the repository and install dependencies:

```bash
npm install
```

Next, set up your local environment variables. Create a `.env.local` file in the root directory:

```env
DATABASE_URL="your_neon_postgres_connection_string"
```

Push the database schema and seed the initial data:

```bash
npm run db:push
npm run db:seed
```

Finally, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about the technologies used in this project, take a look at the following resources:
- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
