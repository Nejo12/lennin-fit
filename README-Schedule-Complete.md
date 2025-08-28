# Schedule Complete — integration

1. DB migration:
   - Run `003_schedule_extras.sql` in Supabase.
   - Confirm tasks table has position and recurrence columns.

2. Functions (Netlify):
   - Add `materialize-recurrence.ts` and `materialize-cron.ts`.
   - Env (server-side):
     - SUPABASE_URL
     - SUPABASE_SERVICE_ROLE_KEY
   - Deploy.
   - In Netlify UI → Scheduled Functions → call `/materialize-cron` daily.

3. Client:
   - Replace your `src/app/schedule/api.ts` and `SchedulePage.tsx` with the updated versions.
   - Add `ScheduleFilters.tsx` and `TaskDetailsModal.tsx`.
   - Ensure `schedule.scss` is imported once.

4. Test plan:
   - Create tasks Mon–Fri; drag Wed → Fri (persists on reload).
   - Mark some as done; ensure overdue highlight appears next day for the rest.
   - Open a task; set recurrence Weekly every 1 week for 6 times; save.
   - Call `/.netlify/functions/materialize-recurrence` (POST) or wait for cron; verify future instances created.
   - Use filters: search text, status, priority toggles work.

5. Optional:
   - Add navbar links to Month `/app/schedule/month` and Agenda `/app/schedule/agenda`.
