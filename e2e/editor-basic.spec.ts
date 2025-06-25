import { test, expect } from '@playwright/test';

test.describe('Basic Editor Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-slate-editor="true"]');
  });

  test('should load editor and allow typing', async ({ page }) => {
    const editor = page.locator('[data-slate-editor="true"]');
    await editor.click();
    
    // Type some text
    await page.keyboard.type('Hello World!');
    
    // Verify text appears
    const content = await editor.textContent();
    expect(content).toContain('Hello World!');
  });

  test('should support basic formatting', async ({ page }) => {
    const editor = page.locator('[data-slate-editor="true"]');
    await editor.click();
    
    // Type and apply bold
    await page.keyboard.type('This is ');
    await page.keyboard.press('Control+b');
    await page.keyboard.type('bold');
    await page.keyboard.press('Control+b');
    await page.keyboard.type(' text');
    
    // Verify content
    const content = await editor.textContent();
    expect(content).toContain('This is bold text');
    
    // Check for bold formatting (strong tag)
    const boldElement = await editor.locator('strong').count();
    expect(boldElement).toBeGreaterThan(0);
  });

  test('should support multiple paragraphs', async ({ page }) => {
    const editor = page.locator('[data-slate-editor="true"]');
    await editor.click();
    
    // Type multiple paragraphs
    await page.keyboard.type('First paragraph');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Second paragraph');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Third paragraph');
    
    // Count paragraph elements
    const paragraphs = await editor.locator('p').count();
    expect(paragraphs).toBe(3);
  });

  test('should support code blocks', async ({ page }) => {
    const editor = page.locator('[data-slate-editor="true"]');
    await editor.click();
    
    // Type code block using markdown syntax
    await page.keyboard.type('```');
    await page.keyboard.press('Enter');
    await page.keyboard.type('const hello = "world";');
    await page.keyboard.press('Enter');
    await page.keyboard.type('console.log(hello);');
    
    // Verify code block exists
    const codeBlock = await editor.locator('pre').count();
    expect(codeBlock).toBeGreaterThan(0);
    
    // Verify code content
    const codeContent = await editor.locator('pre').textContent();
    expect(codeContent).toContain('const hello = "world";');
    expect(codeContent).toContain('console.log(hello);');
  });

  test('should handle question input', async ({ page }) => {
    const editor = page.locator('[data-slate-editor="true"]');
    await editor.click();
    await page.keyboard.type('Sample document content');
    
    // Find and interact with question input
    const questionInput = page.locator('input[placeholder*="Ask a question"]');
    await expect(questionInput).toBeVisible();
    
    await questionInput.click();
    await questionInput.fill('How can I improve this document?');
    
    // Verify input value
    const inputValue = await questionInput.inputValue();
    expect(inputValue).toBe('How can I improve this document?');
  });

  test('should show toolbar buttons', async ({ page }) => {
    // Verify essential toolbar buttons are present
    await expect(page.locator('button:has-text("Paste")')).toBeVisible();
    await expect(page.locator('button[aria-label="Copy prompt to clipboard"]')).toBeVisible();
  });

  test('should navigate between main and demo pages', async ({ page }) => {
    // Start on main page
    await expect(page).toHaveURL('/');
    
    // Navigate to demo page
    await page.goto('/demo');
    await page.waitForSelector('[data-slate-editor="true"]');
    
    // Verify demo page loaded
    await expect(page).toHaveURL('/demo');
    
    // Verify editor works on demo page
    const editor = page.locator('[data-slate-editor="true"]');
    await editor.click();
    await page.keyboard.type('Demo page test');
    
    const content = await editor.textContent();
    expect(content).toContain('Demo page test');
  });

  test('should clear editor content with select all and delete', async ({ page }) => {
    const editor = page.locator('[data-slate-editor="true"]');
    await editor.click();
    
    // Type some content
    await page.keyboard.type('Line 1');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Line 2');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Line 3');
    
    // Select all and delete
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
    
    // Verify editor is empty
    const content = await editor.textContent();
    expect(content).toBe('');
  });
});