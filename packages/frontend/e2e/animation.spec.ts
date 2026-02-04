import { test, expect } from '@playwright/test';

test.describe('Animation System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.click('button[aria-label="Add Text"]');
    await page.locator('[data-testid="slide-element"]').first().click();
  });

  test('should add animation to element', async ({ page }) => {
    await page.click('button:has-text("Animations")');
    
    await page.click('button:has-text("Fade In")');
    
    await expect(page.locator('[data-testid="animation-timeline"]')).toContainText('Fade');
  });

  test('should preview animation', async ({ page }) => {
    await page.click('button:has-text("Animations")');
    await page.click('button:has-text("Slide In")');
    
    await page.click('button[aria-label="Preview Animation"]');
    
    await page.waitForTimeout(1000);
    
    const element = page.locator('[data-testid="slide-element"]').first();
    await expect(element).toBeVisible();
  });

  test('should edit animation duration', async ({ page }) => {
    await page.click('button:has-text("Animations")');
    await page.click('button:has-text("Zoom In")');
    
    await page.fill('input[name="duration"]', '2000');
    
    const durationValue = await page.inputValue('input[name="duration"]');
    expect(durationValue).toBe('2000');
  });

  test('should delete animation', async ({ page }) => {
    await page.click('button:has-text("Animations")');
    await page.click('button:has-text("Rotate")');
    
    const deleteButton = page.locator('button[aria-label="Delete Animation"]');
    await deleteButton.click();
    
    await expect(page.locator('[data-testid="animation-timeline"]')).not.toContainText('Rotate');
  });

  test('should chain multiple animations', async ({ page }) => {
    await page.click('button:has-text("Animations")');
    
    await page.click('button:has-text("Fade In")');
    await page.click('button:has-text("Add Another")');
    await page.click('button:has-text("Zoom In")');
    
    const animationCount = await page.locator('[data-testid="animation-item"]').count();
    expect(animationCount).toBeGreaterThanOrEqual(2);
  });
});
