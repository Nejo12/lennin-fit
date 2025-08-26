# Lennin Fit

A modern fitness application built with React, TypeScript, and Vite.

## 🏃‍♂️ About

Lennin Fit is a comprehensive fitness platform designed to help users achieve their health and wellness goals. Built with modern web technologies for optimal performance and user experience.

## 🚀 Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + CSS Modules
- **State Management**: TanStack Query + Jotai
- **Authentication**: Supabase Auth
- **Database**: Supabase
- **Routing**: React Router DOM
- **Linting**: ESLint with TypeScript support
- **Domain**: [lennin.fit](https://lennin.fit)

## 🛠️ Development

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Nejo12/lennin-fit.git
cd lennin-fit

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your Supabase credentials:
# - VITE_SUPABASE_URL: Your Supabase project URL
# - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous key

# Start development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
lennin-fit/
├── src/
│   ├── app/           # Protected app routes
│   │   ├── auth/      # Authentication pages
│   │   ├── clients/   # Client management
│   │   ├── dashboard/ # Dashboard page
│   │   ├── layout/    # App layout components
│   │   ├── projects/  # Project management
│   │   └── tasks/     # Task management
│   ├── components/    # React components
│   ├── landing/       # Landing page
│   ├── lib/           # Supabase client & utilities
│   ├── pages/         # Public pages (Privacy, Terms, etc.)
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   ├── types/         # TypeScript type definitions
│   └── assets/        # Static assets
├── public/            # Public assets
└── dist/              # Build output
```

## 🌐 Deployment

The application is configured for deployment and will be accessible at [lennin.fit](https://lennin.fit).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for the fitness community
