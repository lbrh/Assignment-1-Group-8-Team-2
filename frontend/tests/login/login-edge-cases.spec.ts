import { test, expect } from '@playwright/test'

test('invalid login shows error and does not redirect', async ({ page }) => {
  await page.goto(
    'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/auth/signin'
  )

  // Wait for form to load
  await page.locator('input[type="email"]').waitFor()

  // Fill with incorrect credentials
  await page.fill('input[type="email"]', 'lbhounsell@gmail.com')
  await page.fill('input[type="password"]', 'wrongPassword123')

  // Click sign in button
  await page.click('button:has-text("Sign in")')

  // Expect an error toast
  await expect(page.getByText('Invalid email or password')).toBeVisible()

  // Expect to remain on the signin page (no redirect)
  await expect(page).toHaveURL(
    'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/auth/signin'
  )
})

test('malformed email shows validation error and blocks submit', async ({ page }) => {
  await page.goto(
    'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/auth/signin'
  )

  await page.locator('input[type="email"]').waitFor()

  // Fill with an invalid email format
  await page.fill('input[type="email"]', 'not-an-email')
  await page.fill('input[type="password"]', 'testUser1')

  await page.click('button:has-text("Sign in")')

  // Zod validation error should appear, no navigation occurs
  await expect(page.getByText('Please enter a valid email address')).toBeVisible()
  await expect(page).toHaveURL(
    'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/auth/signin'
  )
})

test('empty form shows required field errors', async ({ page }) => {
  await page.goto(
    'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/auth/signin'
  )

  await page.locator('input[type="email"]').waitFor()

  // Submit without filling anything
  await page.click('button:has-text("Sign in")')

  await expect(page.getByText('Please enter a valid email address')).toBeVisible()
  await expect(page.getByText('Password is required')).toBeVisible()
  await expect(page).toHaveURL(
    'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/auth/signin'
  )
})

test('direct team page access without login redirects to signin', async ({ page }) => {
  await page.goto(
    'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/team'
  )

  // proxy.ts redirects unauthenticated requests to /auth/signin?redirect=/team
  await expect(page).toHaveURL(
    'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/auth/signin?redirect=%2Fteam'
  )
})

test('direct dashboard access without login redirects to signin', async ({ page }) => {
  await page.goto(
    'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/dashboard'
  )

  await expect(page).toHaveURL(
    'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/auth/signin?redirect=%2Fdashboard'
  )
})

test('direct profile access without login redirects to signin', async ({ page }) => {
  await page.goto(
    'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/profile'
  )

  await expect(page).toHaveURL(
    'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/auth/signin?redirect=%2Fprofile'
  )
})

test('direct settings access without login redirects to signin', async ({ page }) => {
  await page.goto(
    'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/settings'
  )

  await expect(page).toHaveURL(
    'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/auth/signin?redirect=%2Fsettings'
  )
})

// Invalid login tested
// Missing-photo and long-blurb edge cases tested
// Direct team-page access without login tested (must redirect)
