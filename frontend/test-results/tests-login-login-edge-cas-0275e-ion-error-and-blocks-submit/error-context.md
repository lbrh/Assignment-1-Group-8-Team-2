# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/login/login-edge-cases.spec.ts >> malformed email shows validation error and blocks submit
- Location: tests/login/login-edge-cases.spec.ts:27:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Please enter a valid email address')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Please enter a valid email address')

```

```yaml
- banner:
    - text: A App
    - link "Home":
        - /url: /
- heading "Sign in" [level=1]
- paragraph: Enter your credentials to continue
- button "Continue with Google"
- text: or Email
- textbox "Email":
    - /placeholder: you@example.com
    - text: not-an-email
- text: Password
- textbox "Password":
    - /placeholder: ••••••••
    - text: testUser1
- button "Sign in"
- paragraph:
    - text: Don't have an account?
    - link "Create one":
        - /url: /auth/signup
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   |
  3   | test('invalid login shows error and does not redirect', async ({ page }) => {
  4   |   await page.goto(
  5   |     'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/auth/signin'
  6   |   )
  7   |
  8   |   // Wait for form to load
  9   |   await page.locator('input[type="email"]').waitFor()
  10  |
  11  |   // Fill with incorrect credentials
  12  |   await page.fill('input[type="email"]', 'lbhounsell@gmail.com')
  13  |   await page.fill('input[type="password"]', 'wrongPassword123')
  14  |
  15  |   // Click sign in button
  16  |   await page.click('button:has-text("Sign in")')
  17  |
  18  |   // Expect an error toast
  19  |   await expect(page.getByText('Invalid email or password')).toBeVisible()
  20  |
  21  |   // Expect to remain on the signin page (no redirect)
  22  |   await expect(page).toHaveURL(
  23  |     'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/auth/signin'
  24  |   )
  25  | })
  26  |
  27  | test('malformed email shows validation error and blocks submit', async ({ page }) => {
  28  |   await page.goto(
  29  |     'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/auth/signin'
  30  |   )
  31  |
  32  |   await page.locator('input[type="email"]').waitFor()
  33  |
  34  |   // Fill with an invalid email format
  35  |   await page.fill('input[type="email"]', 'not-an-email')
  36  |   await page.fill('input[type="password"]', 'testUser1')
  37  |
  38  |   await page.click('button:has-text("Sign in")')
  39  |
  40  |   // Zod validation error should appear, no navigation occurs
> 41  |   await expect(page.getByText('Please enter a valid email address')).toBeVisible()
      |                                                                      ^ Error: expect(locator).toBeVisible() failed
  42  |   await expect(page).toHaveURL(
  43  |     'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/auth/signin'
  44  |   )
  45  | })
  46  |
  47  | test('empty form shows required field errors', async ({ page }) => {
  48  |   await page.goto(
  49  |     'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/auth/signin'
  50  |   )
  51  |
  52  |   await page.locator('input[type="email"]').waitFor()
  53  |
  54  |   // Submit without filling anything
  55  |   await page.click('button:has-text("Sign in")')
  56  |
  57  |   await expect(page.getByText('Please enter a valid email address')).toBeVisible()
  58  |   await expect(page.getByText('Password is required')).toBeVisible()
  59  |   await expect(page).toHaveURL(
  60  |     'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/auth/signin'
  61  |   )
  62  | })
  63  |
  64  | test('direct team page access without login redirects to signin', async ({ page }) => {
  65  |   await page.goto(
  66  |     'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/team'
  67  |   )
  68  |
  69  |   // proxy.ts redirects unauthenticated requests to /auth/signin?redirect=/team
  70  |   await expect(page).toHaveURL(
  71  |     'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/auth/signin?redirect=%2Fteam'
  72  |   )
  73  | })
  74  |
  75  | test('direct dashboard access without login redirects to signin', async ({ page }) => {
  76  |   await page.goto(
  77  |     'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/dashboard'
  78  |   )
  79  |
  80  |   await expect(page).toHaveURL(
  81  |     'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/auth/signin?redirect=%2Fdashboard'
  82  |   )
  83  | })
  84  |
  85  | test('direct profile access without login redirects to signin', async ({ page }) => {
  86  |   await page.goto(
  87  |     'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/profile'
  88  |   )
  89  |
  90  |   await expect(page).toHaveURL(
  91  |     'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/auth/signin?redirect=%2Fprofile'
  92  |   )
  93  | })
  94  |
  95  | test('direct settings access without login redirects to signin', async ({ page }) => {
  96  |   await page.goto(
  97  |     'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/settings'
  98  |   )
  99  |
  100 |   await expect(page).toHaveURL(
  101 |     'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/auth/signin?redirect=%2Fsettings'
  102 |   )
  103 | })
  104 |
  105 | // Invalid login tested
  106 | // Missing-photo and long-blurb edge cases tested
  107 | // Direct team-page access without login tested (must redirect)
  108 |
```
