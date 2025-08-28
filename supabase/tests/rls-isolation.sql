-- Replace these with two test user UUIDs from your auth.users
-- Then run each block in a session that sets request.jwt.claim.sub accordingly.

-- As User A
set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000000001';
select count(*) from invoices;

-- As User B
set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000000002';
select count(*) from invoices;
-- Expected: each user only sees their own org's rows.
