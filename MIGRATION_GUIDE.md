# Design System Migration Guide

## ✅ What's Done

1. **Removed Tailwind CSS** - Completely uninstalled and cleaned up
2. **Created Design System** - Tokens, mixins, and UI components
3. **Updated Entry Point** - ToastProvider wraps the app, globals.scss imported
4. **Fixed SCSS Architecture** - Updated to use `@use` instead of `@import`, all mixins available
5. **Updated All Component Styles** - Migrated existing components to use design tokens
6. **RLS Test Script** - Created for testing data isolation

## 🎯 Next Steps: Migrate Existing Components to UI Components

### 1. Update AppShell.tsx
```tsx
// Replace current styles with:
import { Button } from '@/components/ui';
import styles from './AppShell.module.scss';

// Use Button component for sign out:
<Button variant="ghost" onClick={() => supabase.auth.signOut()}>
  Sign out
</Button>
```

### 2. Update DashboardPage.tsx
```tsx
// Replace current styles with:
import { Card, CardHeader, CardContent, Badge } from '@/components/ui';
import styles from './Dashboard.module.scss';

// Use Card components:
<Card>
  <CardHeader title="Unpaid Invoices" sub={`$${unpaidTotal || 0}`} />
  <CardContent>
    {/* content */}
  </CardContent>
</Card>
```

### 3. Update LeadsPage.tsx
```tsx
// Replace current styles with:
import { TextField, Button, Card, CardHeader, CardContent } from '@/components/ui';
import styles from './Leads.module.scss';

// Use TextField and Button:
<TextField 
  label="Client Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  placeholder="Enter client name"
/>
<Button type="submit" loading={create.isPending}>
  Add Client
</Button>
```

### 4. Update TasksPage.tsx
```tsx
// Replace current styles with:
import { TextField, Button, Select, Card, CardHeader, CardContent } from '@/components/ui';
import styles from './Tasks.module.scss';

// Use Select component:
<Select
  label="Status"
  options={[
    { value: 'todo', label: 'To Do' },
    { value: 'doing', label: 'In Progress' },
    { value: 'done', label: 'Done' },
    { value: 'blocked', label: 'Blocked' }
  ]}
  value={status}
  onChange={(e) => setStatus(e.target.value)}
/>
```

### 5. Update InvoicesPage.tsx & SchedulePage.tsx
```tsx
// Apply same pattern - replace raw HTML with UI components
import { TextField, Button, Card, Badge, Modal } from '@/components/ui';
```

## 🧪 Testing RLS

Run the RLS test script:
```bash
node scripts/rls-test.js
```

This will test data isolation between two separate accounts.

## 🎨 Design System Benefits

- **Consistent styling** across all components
- **Accessible by default** - focus rings, labels, ARIA attributes
- **Type-safe** - TypeScript interfaces for all props
- **No external dependencies** - uses custom `cx` utility
- **Toast notifications** - `useToast()` available anywhere in the app
- **Modern SCSS** - Uses `@use` instead of deprecated `@import`

## 🚀 Quick Wins

1. **Toast notifications** - Already working! Use anywhere:
```tsx
import { useToast } from '@/components/ui';

const toast = useToast();
toast.add({ title: 'Success!', description: 'Client created successfully' });
```

2. **Consistent buttons** - Replace all `<button>` with `<Button>`:
```tsx
<Button variant="primary" size="md" loading={isLoading}>
  Save Changes
</Button>
```

3. **Form inputs** - Replace all `<input>` with `<TextField>`:
```tsx
<TextField 
  label="Email"
  type="email"
  placeholder="user@example.com"
  error={errors.email}
/>
```

## 🔧 SCSS Architecture

All components now use:
- `@use "../../styles/mixins.scss" as *;` for mixins
- Design tokens from `tokens.scss`
- Consistent spacing, colors, and typography
- No more deprecation warnings!

## 📱 Current Status

✅ **All SCSS files updated** - No more mixin errors  
✅ **Design system complete** - Tokens, mixins, UI components  
✅ **ToastProvider integrated** - Available throughout the app  
✅ **RLS test script ready** - For data isolation testing  
🔄 **Ready for UI component migration** - Next step in the process
