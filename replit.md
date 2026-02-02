# InvoiceGen - Invoice Generation Application

## Overview

InvoiceGen is a full-stack invoice generation and management application. Users can create professional invoices with customizable line items, discounts, and currency options. The application supports PDF export functionality and maintains a searchable history of all saved invoices. Built with a React frontend and Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **PDF Generation**: jsPDF with html2canvas for converting invoice views to downloadable PDFs
- **Build Tool**: Vite with path aliases (@/, @shared/, @assets/)

### Backend Architecture
- **Framework**: Express 5 on Node.js
- **API Design**: REST endpoints with Zod schema validation
- **Route Definitions**: Centralized in `shared/routes.ts` with type-safe request/response schemas
- **Storage Layer**: Database abstraction through `IStorage` interface in `server/storage.ts`

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` - shared between frontend and backend
- **Migrations**: Drizzle Kit with output to `./migrations` directory
- **Key Entity**: Invoices table storing invoice number, client details, line items (JSONB), pricing info, and status

### Project Structure
```
├── client/src/          # React frontend
│   ├── components/ui/   # Shadcn UI components
│   ├── pages/           # Route pages (create-invoice, history)
│   ├── hooks/           # Custom hooks including API hooks
│   └── lib/             # Utilities and query client
├── server/              # Express backend
│   ├── routes.ts        # API route handlers
│   ├── storage.ts       # Database operations
│   └── db.ts            # Database connection
├── shared/              # Shared code between frontend/backend
│   ├── schema.ts        # Drizzle database schema
│   └── routes.ts        # API route definitions with Zod schemas
└── migrations/          # Database migrations
```

### Key Design Patterns
- **Shared Types**: Schema and route definitions are shared between client and server for type safety
- **Storage Interface**: `IStorage` interface allows for easy swapping of storage implementations
- **API Contract**: Route definitions include method, path, input schema, and response schemas using Zod

## External Dependencies

### Database
- **PostgreSQL**: Primary database accessed via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management
- **connect-pg-simple**: PostgreSQL session store (available for future session management)

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **jsPDF + html2canvas**: PDF generation from DOM elements
- **date-fns**: Date formatting utilities
- **Radix UI**: Accessible UI primitive components
- **Tailwind CSS**: Utility-first CSS framework

### Development Tools
- **Vite**: Frontend build tool with HMR
- **esbuild**: Server bundling for production
- **TypeScript**: Type checking across the codebase
- **Drizzle Kit**: Database migration tooling

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string (required)