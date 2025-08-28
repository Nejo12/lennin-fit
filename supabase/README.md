# Supabase Schema Setup

This directory contains the database schema for the TILSF application.

## Setup Instructions

1. **Open your Supabase project dashboard**
2. **Navigate to the SQL Editor**
3. **Copy and paste the entire contents of `schema.sql`**
4. **Run the SQL script**

## Schema Overview

The schema includes all the core TILSF tables:

### Core Tables

- **Organizations** - Workspaces for users
- **Profiles** - User profiles linked to auth.users
- **Memberships** - User-organization relationships with roles

### TILSF Tables

- **Clients** (Leads) - Customer/client information
- **Projects** - Project management
- **Tasks** (T) - Task management with priorities and status
- **Invoices** (I) - Invoice management with status tracking
- **Invoice Items** - Line items for invoices
- **Payments** - Payment tracking

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Policies** ensure users can only access their organization's data
- **`is_member()` function** for checking organization membership
- **`init_user()` RPC** for automatic workspace creation on first login

### Key Features

- **UUID primary keys** for all tables
- **Cascading deletes** for data integrity
- **Generated columns** for calculated fields (invoice totals, item amounts)
- **Check constraints** for data validation
- **Timestamps** for audit trails

## After Setup

Once the schema is deployed:

1. **Test the `init_user` function** by signing up a new user
2. **Verify RLS policies** are working correctly
3. **Check that the application can create and read data**

## Development

- The schema uses `IF NOT EXISTS` clauses for safe re-runs
- All tables have proper foreign key relationships
- The schema is designed to be lean and efficient
- RLS policies ensure data isolation between organizations
