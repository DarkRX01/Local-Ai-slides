import { test, expect } from '@playwright/test';

test.describe('Export Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should export as PDF', async ({ page }) => {
    await page.click('button:has-text("Export")');
    await page.click('button:has-text("PDF")');
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download")');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  });

  test('should export as PPTX', async ({ page }) => {
    await page.click('button:has-text("Export")');
    await page.click('button:has-text("PowerPoint")');
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download")');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.pptx$/);
  });

  test('should export as HTML', async ({ page }) => {
    await page.click('button:has-text("Export")');
    await page.click('button:has-text("HTML")');
    
    await page.click('button:has-text("Download")');
    
    await expect(page.locator('text=Export completed')).toBeVisible({ timeout: 10000 });
  });

  test('should show export progress', async ({ page }) => {
    await page.click('button:has-text("Export")');
    await page.click('button:has-text("Video")');
    await page.click('button:has-text("Start Export")');
    
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
    
    await expect(page.locator('text=Exporting')).toBeVisible();
  });

  test('should cancel export', async ({ page }) => {
    await page.click('button:has-text("Export")');
    await page.click('button:has-text("Video")');
    await page.click('button:has-text("Start Export")');
    
    await page.click('button:has-text("Cancel")');
    
    await expect(page.locator('text=Export cancelled')).toBeVisible();
  });
});
