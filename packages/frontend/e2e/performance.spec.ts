import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should load 100+ slides without lag', async ({ page }) => {
    await page.goto('/');
    
    const startTime = Date.now();
    
    for (let i = 0; i < 100; i++) {
      await page.evaluate(() => {
        const event = new CustomEvent('add-slide');
        window.dispatchEvent(event);
      });
    }
    
    await page.waitForTimeout(1000);
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    expect(loadTime).toBeLessThan(30000);
    
    const slideCount = await page.locator('[data-testid="slide-thumbnail"]').count();
    expect(slideCount).toBeGreaterThanOrEqual(100);
  });

  test('should render complex slide in under 3 seconds', async ({ page }) => {
    await page.goto('/');
    
    const startTime = Date.now();
    
    for (let i = 0; i < 50; i++) {
      await page.evaluate(() => {
        const event = new CustomEvent('add-element', {
          detail: { type: 'text', content: `Element ${Math.random()}` }
        });
        window.dispatchEvent(event);
      });
    }
    
    await page.waitForLoadState('networkidle');
    
    const endTime = Date.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(3000);
  });

  test('should maintain 60fps during animations', async ({ page }) => {
    await page.goto('/');
    
    await page.click('button[aria-label="Add Text"]');
    await page.click('button:has-text("Animations")');
    await page.click('button:has-text("Fade In")');
    
    const fps = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let frames = 0;
        let lastTime = performance.now();
        
        function measureFPS() {
          frames++;
          const currentTime = performance.now();
          const elapsed = currentTime - lastTime;
          
          if (elapsed >= 1000) {
            const fps = frames / (elapsed / 1000);
            resolve(fps);
          } else {
            requestAnimationFrame(measureFPS);
          }
        }
        
        requestAnimationFrame(measureFPS);
      });
    });
    
    expect(fps).toBeGreaterThan(50);
  });

  test('should handle virtual scrolling efficiently', async ({ page }) => {
    await page.goto('/');
    
    for (let i = 0; i < 200; i++) {
      await page.evaluate(() => {
        const event = new CustomEvent('add-slide');
        window.dispatchEvent(event);
      });
    }
    
    const sidebar = page.locator('aside').first();
    
    const scrollStartTime = Date.now();
    await sidebar.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await page.waitForTimeout(100);
    
    const scrollEndTime = Date.now();
    const scrollTime = scrollEndTime - scrollStartTime;
    
    expect(scrollTime).toBeLessThan(500);
  });

  test('should check for memory leaks', async ({ page }) => {
    await page.goto('/');
    
    const initialMetrics = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
        };
      }
      return null;
    });
    
    for (let i = 0; i < 50; i++) {
      await page.click('button[aria-label="Add Text"]');
      await page.keyboard.press('Delete');
    }
    
    await page.waitForTimeout(2000);
    
    const finalMetrics = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
        };
      }
      return null;
    });
    
    if (initialMetrics && finalMetrics) {
      const memoryIncrease = finalMetrics.usedJSHeapSize - initialMetrics.usedJSHeapSize;
      const percentageIncrease = (memoryIncrease / initialMetrics.usedJSHeapSize) * 100;
      
      expect(percentageIncrease).toBeLessThan(50);
    }
  });

  test('should start app in under 5 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    expect(loadTime).toBeLessThan(5000);
  });

  test('should handle bundle size optimization', async ({ page }) => {
    const response = await page.goto('/');
    
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map((entry: PerformanceEntry) => {
        const resourceEntry = entry as PerformanceResourceTiming;
        return {
          name: resourceEntry.name,
          size: resourceEntry.transferSize,
        };
      });
    });
    
    const totalSize = resources.reduce((sum, resource) => sum + (resource.size || 0), 0);
    const totalSizeMB = totalSize / (1024 * 1024);
    
    expect(totalSizeMB).toBeLessThan(10);
  });
});
