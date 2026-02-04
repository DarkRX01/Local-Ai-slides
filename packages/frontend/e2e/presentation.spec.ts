import { test, expect } from '@playwright/test';

test.describe('Presentation Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should create a new presentation', async ({ page }) => {
    await page.click('button:has-text("New Presentation")');
    
    await page.fill('input[placeholder*="title"]', 'Test Presentation');
    await page.click('button:has-text("Create")');
    
    await expect(page.locator('h1:has-text("Test Presentation")')).toBeVisible();
  });

  test('should add a new slide', async ({ page }) => {
    const addSlideButton = page.locator('button:has(svg)').first();
    const initialSlideCount = await page.locator('[data-testid="slide-thumbnail"]').count();
    
    await addSlideButton.click();
    
    const newSlideCount = await page.locator('[data-testid="slide-thumbnail"]').count();
    expect(newSlideCount).toBe(initialSlideCount + 1);
  });

  test('should delete a slide', async ({ page }) => {
    const initialSlideCount = await page.locator('[data-testid="slide-thumbnail"]').count();
    
    if (initialSlideCount > 1) {
      await page.locator('[data-testid="slide-thumbnail"]').first().click({ button: 'right' });
      await page.click('button:has-text("Delete")');
      
      const newSlideCount = await page.locator('[data-testid="slide-thumbnail"]').count();
      expect(newSlideCount).toBe(initialSlideCount - 1);
    }
  });

  test('should navigate between slides', async ({ page }) => {
    const slideCount = await page.locator('[data-testid="slide-thumbnail"]').count();
    
    if (slideCount > 1) {
      await page.locator('[data-testid="slide-thumbnail"]').nth(1).click();
      await expect(page.locator('[data-testid="slide-thumbnail"]').nth(1)).toHaveClass(/active/);
    }
  });
});
