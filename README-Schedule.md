# Schedule & ICS — wiring

## ✅ Already Complete

1. **Route**: `/app/schedule` → `<SchedulePage />` (already in AppRouter.tsx)
2. **Styles**: `@/styles/schedule.scss` (imported in main.tsx)
3. **ICS Function**: `netlify/functions/ics-tasks.ts` (already exists and updated)

## Environment Variables (Netlify Functions)

Add these to your Netlify environment variables:

```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=… (server key, never exposed to client)
```

## Features Implemented

- **Weekly grid** shows tasks grouped by `due_date` (Mon–Sun)
- **Quick add** creates a task for that day without leaving the page
- **Status change** inline updates Supabase and reflects immediately
- **Subscribe (ICS)** link downloads a valid calendar feed with one all-day event per task due date
- **Responsive**: 7 columns on desktop, 2/1 on smaller widths
- **A11y**: form inputs labeled, keyboard tab order sane

## Testing

1. Create a few tasks with due dates this week
2. Open `/app/schedule` → tasks appear under the right day
3. Click "Subscribe (ICS)" → calendar app offers subscription

## Investor Demo Flow

1. Go to **Schedule** → "This week"
2. Add two tasks on Wed/Fri via **Quick add**
3. Change one to **doing**, one to **done**
4. Click **Subscribe (ICS)** → open in Calendar → see tasks populate the week
