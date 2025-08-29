# Supabase Setup Guide

## 🚀 Quick Start

Your Supabase local development environment is now fully configured and running!

### Current Status

- ✅ Supabase CLI installed (v2.39.2)
- ✅ Local Supabase instance running
- ✅ Database schema applied
- ✅ All migrations applied
- ✅ Environment variables configured
- ✅ Development server running

## 🔗 Access URLs

| Service             | URL                                                     | Description                       |
| ------------------- | ------------------------------------------------------- | --------------------------------- |
| **Supabase Studio** | http://127.0.0.1:54323                                  | Database dashboard and management |
| **API**             | http://127.0.0.1:54321                                  | REST API endpoint                 |
| **GraphQL**         | http://127.0.0.1:54321/graphql/v1                       | GraphQL endpoint                  |
| **Database**        | postgresql://postgres:postgres@127.0.0.1:54322/postgres | Direct database connection        |
| **Storage**         | http://127.0.0.1:54321/storage/v1/s3                    | File storage API                  |
| **Email Testing**   | http://127.0.0.1:54324                                  | Email testing interface           |

## 🔑 API Keys

```bash
# Anon Key (for client-side)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Service Role Key (for server-side)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# JWT Secret
super-secret-jwt-token-with-at-least-32-characters-long
```

## 📊 Database Schema

Your database includes the following tables:

### Core Tables

- **organizations** - Multi-tenant organization management
- **profiles** - User profiles with default organization
- **memberships** - User-organization relationships
- **clients** - Client/lead management
- **projects** - Project management
- **tasks** - Task management with scheduling
- **invoices** - Invoice management
- **invoice_items** - Invoice line items

### Features

- ✅ Row Level Security (RLS) policies
- ✅ Multi-tenant architecture
- ✅ Task scheduling and recurrence
- ✅ Invoice calculations and totals
- ✅ User authentication and authorization

## 🛠️ Common Commands

### Start/Stop Supabase

```bash
# Start local Supabase
supabase start

# Stop local Supabase
supabase stop

# Check status
supabase status
```

### Database Management

```bash
# Reset database (applies all migrations)
supabase db reset

# Apply new migrations
supabase db push

# Generate migration from schema changes
supabase db diff

# Connect to database directly
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

### Development

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

## 🔧 Environment Variables

Your `.env.local` file contains:

```bash
VITE_APP_URL=http://localhost:5173
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📁 Project Structure

```
supabase/
├── config.toml          # Supabase configuration
├── schema.sql           # Base database schema
├── migrations/          # Database migrations
│   ├── 002_invoice_totals_and_view.sql
│   ├── 003_add_phone_column.sql
│   └── 003_schedule_extras.sql
└── tests/               # Database tests
    └── rls-isolation.sql
```

## 🚨 Troubleshooting

### Docker Issues

```bash
# Check if Docker is running
docker ps

# Restart Docker if needed
open -a Docker
```

### Database Connection Issues

```bash
# Check if Supabase is running
supabase status

# Restart if needed
supabase stop && supabase start
```

### Migration Issues

```bash
# Reset database completely
supabase db reset

# Or apply schema manually
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f supabase/schema.sql
```

## 🔄 Next Steps

1. **Explore Supabase Studio** - Open http://127.0.0.1:54323 to manage your database
2. **Test Your App** - Your development server should be running at http://localhost:5173
3. **Add Data** - Use the Studio to add test data or create seed files
4. **Develop Features** - Your app is now connected to the local Supabase instance

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Local Development Guide](https://supabase.com/docs/guides/local-development)
- [Database Schema Design](https://supabase.com/docs/guides/database/designing-schemas)

---

**Happy coding! 🎉**
