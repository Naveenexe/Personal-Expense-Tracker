# Personal Expense Tracker

## Overview

A comprehensive web-based Personal Expense Tracker built with React and Express that allows users to manage their financial transactions, track spending patterns, and create budgets. The application features a modern UI built with Tailwind CSS and shadcn/ui components, providing a seamless experience for personal finance management with local data storage and visual analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with CSS variables for theming support
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React hooks with custom hooks for business logic
- **Data Fetching**: TanStack React Query for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful APIs with `/api` prefix
- **Development**: Hot module replacement via Vite integration
- **Build**: ESBuild for production bundling

### Data Storage Solutions
- **Primary Storage**: Browser localStorage for client-side persistence
- **Database Schema**: Drizzle ORM with PostgreSQL dialect (configured but not actively used)
- **Storage Interface**: Abstract storage layer with in-memory implementation
- **Data Models**: Transactions, Categories, and Budgets with type-safe schemas

### Application Structure
- **Multi-page Application**: Dashboard, Add Transaction, Transactions List, Reports, and Settings
- **Component Architecture**: Modular UI components with separation of concerns
- **Custom Hooks**: Reusable business logic for transactions, categories, and budgets
- **Type Safety**: Full TypeScript coverage with shared schema definitions

### Key Features
- **Transaction Management**: Add, edit, delete income and expense transactions
- **Category System**: Default and custom categories for both income and expenses
- **Budget Tracking**: Set and monitor spending limits with visual progress indicators
- **Analytics & Reports**: Charts and visualizations using Recharts
- **Data Export**: CSV export functionality for transaction data
- **Theme Support**: Light/dark mode toggle with persistent preferences
- **Responsive Design**: Mobile-first approach with adaptive layouts

## External Dependencies

### UI and Styling
- **shadcn/ui**: Complete UI component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Radix UI**: Headless UI primitives for accessibility and behavior
- **Lucide React**: Icon library for consistent iconography

### Data and Forms
- **React Hook Form**: Form state management with validation
- **Zod**: Schema validation for type safety
- **TanStack React Query**: Server state management and caching
- **date-fns**: Date manipulation and formatting utilities

### Charts and Visualization
- **Recharts**: React-based charting library for analytics dashboards

### Development Tools
- **Vite**: Fast build tool with hot module replacement
- **TypeScript**: Static type checking and developer experience
- **ESLint/Prettier**: Code quality and formatting (implicit)

### Database (Configured)
- **Drizzle ORM**: Type-safe database toolkit
- **PostgreSQL**: Relational database (Neon serverless ready)
- **Database Migrations**: Schema versioning and deployment

### Utilities
- **class-variance-authority**: Utility for component variant management
- **clsx**: Conditional className utility
- **wouter**: Minimalist routing solution