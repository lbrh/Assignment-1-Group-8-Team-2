[//]: # '
AI was used in part to format this MD file. 
'

# Login E2E Tests

End-to-end tests for the authentication flow using Playwright.

## Test: Complete Login Flow

**File:** `login.spec.ts`

### What It Does

This test validates the complete user login flow on the deployed Vercel instance:

1. Navigates to the sign-in page
2. Waits for the login form to load
3. Enters test email and password credentials
4. Clicks the "Sign in" button
5. Verifies the page redirects from `/auth/signin` → `/team`
6. Takes a screenshot snapshot to verify the team page content matches expected state

### Step-by-Step Flow

```
1. Navigate to https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/auth/signin
   ↓
2. Wait for email input field to render
   ↓
3. Fill email field: lbhounsell@gmail.com
   ↓
4. Fill password field: testUser1
   ↓
5. Click "Sign in" button
   ↓
6. Wait for page to redirect to /team
   ↓
7. Verify URL is now /team (not /auth/signin)
   ↓
8. Take screenshot snapshot of team page
   ↓
9. Compare snapshot against baseline (tests/login/login.spec.ts-snapshots/team-page.png)
```

### Running the test

```bash
pnpm --filter frontend exec playwright test tests/login/login.spec.ts
```
