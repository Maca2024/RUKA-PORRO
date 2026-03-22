/**
 * RUKA-PORRO — E2E Smoke Tests
 *
 * Validates that the game boots, renders a canvas, surfaces its HUD,
 * and responds to keyboard input. These tests run against the live
 * Next.js dev server (localhost:3000).
 *
 * Run: npx playwright test tests/e2e/smoke.spec.ts
 */

import { test, expect } from '@playwright/test'

test.describe('RUKA PORRO Smoke Tests', () => {
  // 1. Landing page loads with title and start button
  test('landing page loads with title and start button', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('RUKA')
    await expect(page.getByText(/start|begin|aloita/i)).toBeVisible()
  })

  // 2. Game page loads canvas
  test('game page loads canvas', async ({ page }) => {
    await page.goto('/game')
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 })
  })

  // 3. HUD appears after game loads
  test('HUD appears after game loads', async ({ page }) => {
    await page.goto('/game')
    await page.waitForSelector('canvas', { timeout: 10000 })
    await expect(
      page.locator('[data-testid="hud"]').or(page.locator('.hud')),
    ).toBeVisible({ timeout: 5000 })
  })

  // 4. Pause menu opens on Escape
  test('pause menu opens on Escape', async ({ page }) => {
    await page.goto('/game')
    await page.waitForSelector('canvas', { timeout: 10000 })
    await page.keyboard.press('Escape')
    await expect(page.getByText(/pause|pauze/i)).toBeVisible({ timeout: 3000 })
  })

  // 5. Page title contains game name
  test('page title references the game', async ({ page }) => {
    await page.goto('/')
    const title = await page.title()
    expect(title.toLowerCase()).toMatch(/ruka|porro/)
  })

  // 6. Game page does not produce console errors on load
  test('game page loads without critical console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto('/game')
    await page.waitForSelector('canvas', { timeout: 10000 })
    // Allow a short settle time for async initialisation
    await page.waitForTimeout(1000)
    // Filter out known non-critical browser extension noise
    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('extension'),
    )
    expect(criticalErrors).toHaveLength(0)
  })

  // 7. Canvas has non-zero dimensions after render
  test('canvas has non-zero width and height after Three.js initialisation', async ({ page }) => {
    await page.goto('/game')
    await page.waitForSelector('canvas', { timeout: 10000 })

    const { width, height } = await page.locator('canvas').evaluate((el) => {
      const canvas = el as HTMLCanvasElement
      return { width: canvas.width, height: canvas.height }
    })

    expect(width).toBeGreaterThan(0)
    expect(height).toBeGreaterThan(0)
  })

  // 8. Escape closes pause and returns to game screen
  test('pressing Escape twice closes the pause menu and returns to game', async ({ page }) => {
    await page.goto('/game')
    await page.waitForSelector('canvas', { timeout: 10000 })

    // Open pause
    await page.keyboard.press('Escape')
    await expect(page.getByText(/pause|pauze/i)).toBeVisible({ timeout: 3000 })

    // Close pause
    await page.keyboard.press('Escape')
    await expect(page.getByText(/pause|pauze/i)).not.toBeVisible({ timeout: 3000 })
    await expect(page.locator('canvas')).toBeVisible()
  })
})
