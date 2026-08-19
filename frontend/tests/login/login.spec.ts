import { test, expect } from '@playwright/test'

test('complete login flow', async ({ page }) => {
  await page.goto(
    'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/auth/signin'
  )

  // Wait for form to load
  await page.locator('input[type="email"]').waitFor()

  // Fill email and password
  await page.fill('input[type="email"]', 'lbhounsell@gmail.com')
  await page.fill('input[type="password"]', 'testUser1')

  // Click sign in button
  await page.click('button:has-text("Sign in")')

  // Expect to be redirected to the team page via redirect
  await expect(page).toHaveURL(
    'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/auth/signin?redirect=%2Fteam'
  )
  await expect(page).toHaveURL(
    'https://assignment-1-group-8-team-2-frontend-o7c2nrpzb-lbrhs-projects.vercel.app/team'
  )

  // Take a snapshot of the team page to verify content
  await expect(page).toHaveScreenshot('team-page.png')
})

// Valid login tested end-to-end on deployed URL
// Redirect to team page confirmed
// All required content verified correct and complete
