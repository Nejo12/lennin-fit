# Focus Dashboard — Integration

## Overview

The Focus Dashboard provides a daily productivity overview with KPIs, task management, overdue invoice tracking, and AI-powered action planning.

## Files Added

- `src/app/focus/FocusPage.tsx` - Main dashboard component
- `src/app/focus/api.ts` - Data hooks and API calls
- `src/app/focus/ai.ts` - AI client wrapper
- `src/styles/focus.scss` - Dashboard styling
- `netlify/functions/ai-focus-today.ts` - Server-side AI function

## Features

- **KPIs**: Unpaid total, overdue count, weekly progress, today's tasks
- **Today's Tasks**: Interactive task list with checkboxes
- **Top Overdue**: List of most overdue invoices with client names
- **AI Planning**: Generate prioritized action plans
- **Responsive Design**: Works on mobile and desktop

## Setup

### 1. Environment Variables

Add to Netlify Environment Variables:

```
OPENAI_API_KEY = sk-...
```

### 2. Routes

The focus page is available at `/app/focus`

### 3. Navigation

Add to your navigation menu:

- Focus → `/app/focus`
- Schedule → `/app/schedule`
- Invoices → `/app/invoices`
- Leads → `/app/leads`
- Tasks → `/app/tasks`

## Testing

### 1. Data Setup

Seed test data:

- Create a "sent" invoice with past due date
- Add tasks due today
- Create some overdue invoices

### 2. Test Flow

1. Navigate to `/app/focus`
2. Verify KPIs show correct values
3. Test task checkbox toggles
4. Check overdue invoice list
5. Click "Generate" on AI card
6. Test "Copy plan" functionality

### 3. Expected Behavior

- KPIs update in real-time
- Task status changes persist
- AI generates 3-4 prioritized actions
- Plan copies to clipboard as text

## Technical Details

### Data Resilience

- Works with `invoice_public` view if available
- Gracefully falls back to `invoices` table
- Handles missing Supabase configuration

### TypeScript

- All components use strict typing
- No `any` types used
- Proper interface definitions

### Styling

- Uses existing design tokens
- Responsive grid layout
- Consistent with app design system

## Troubleshooting

### AI Not Working

- Check `OPENAI_API_KEY` is set in Netlify
- Verify function is deployed to `/.netlify/functions/ai-focus-today`
- Check browser console for errors

### Data Not Loading

- Verify Supabase connection
- Check RLS policies allow access
- Ensure user has proper permissions

### Styling Issues

- Verify `focus.scss` is imported in `globals.scss`
- Check CSS custom properties are defined
- Test responsive breakpoints
