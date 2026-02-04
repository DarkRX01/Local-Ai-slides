import { test, expect } from '@playwright/test';

test.describe('Slide Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should add text element to slide', async ({ page }) => {
    await page.click('button[aria-label="Add Text"]');
    
    const canvas = page.locator('canvas').first();
    await canvas.click({ position: { x: 200, y: 200 } });
    
    await page.fill('textarea', 'Test Text');
    
    await expect(page.locator('text=Test Text')).toBeVisible();
  });

  test('should add image element to slide', async ({ page }) => {
    await page.click('button[aria-label="Add Image"]');
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('test-assets/sample-image.png');
    
    await expect(page.locator('img[alt*="slide element"]')).toBeVisible();
  });

  test('should resize element', async ({ page }) => {
    await page.click('button[aria-label="Add Shape"]');
    
    const element = page.locator('[data-testid="slide-element"]').first();
    await element.click();
    
    const resizeHandle = page.locator('[data-testid="resize-handle"]').first();
    const box = await resizeHandle.boundingBox();
    
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + 100, box.y + 100);
      await page.mouse.up();
    }
    
    await expect(element).toHaveAttribute('data-resized', 'true');
  });

  test('should undo and redo actions', async ({ page }) => {
    await page.click('button[aria-label="Add Text"]');
    await page.fill('textarea', 'Undo Test');
    
    await page.keyboard.press('Control+Z');
    await expect(page.locator('text=Undo Test')).not.toBeVisible();
    
    await page.keyboard.press('Control+Y');
    await expect(page.locator('text=Undo Test')).toBeVisible();
  });

  test('should copy and paste element', async ({ page }) => {
    await page.click('button[aria-label="Add Text"]');
    
    const element = page.locator('[data-testid="slide-element"]').first();
    await element.click();
    
    await page.keyboard.press('Control+C');
    await page.keyboard.press('Control+V');
    
    const elementCount = await page.locator('[data-testid="slide-element"]').count();
    expect(elementCount).toBeGreaterThan(1);
  });
});
