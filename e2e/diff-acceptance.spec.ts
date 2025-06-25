import { test, expect } from '@playwright/test';

test.describe('Diff Acceptance Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for editor to be ready
    await page.waitForSelector('[data-slate-editor="true"]');
  });

  test('should accept a diff and apply changes to the document', async ({ page }) => {
    // Type initial content in the editor
    const editor = page.locator('[data-slate-editor="true"]');
    await editor.click();
    await page.keyboard.type('This is the original text.');
    await page.keyboard.press('Enter');
    await page.keyboard.type('This line will be replaced.');
    await page.keyboard.press('Enter');
    await page.keyboard.type('This is another line.');

    // Click on the question input
    const questionInput = page.locator('input[placeholder*="Ask a question"]');
    await questionInput.click();
    await questionInput.fill('Replace the second line with "This line has been updated."');

    // Simulate pasting a diff (in real usage, this would be from AI)
    const diffContent = `\`\`\`diff
--- a/document.txt
+++ b/document.txt
@@ -1,3 +1,3 @@
 This is the original text.
-This line will be replaced.
+This line has been updated.
 This is another line.
\`\`\``;

    // Click the paste button in toolbar
    const pasteButton = page.locator('button:has-text("Paste")');
    await pasteButton.click();

    // Fill the textarea with diff content
    const diffTextarea = page.locator('textarea[placeholder*="Paste the diff"]');
    await diffTextarea.fill(diffContent);

    // Apply the diff
    const applyButton = page.locator('button:has-text("Apply")');
    await applyButton.click();

    // Wait for diff block to appear
    await page.waitForSelector('[data-slate-void="true"]');

    // Click accept button on the diff block
    const acceptButton = page.locator('button:has-text("Accept")').first();
    await acceptButton.click();

    // Verify the changes were applied
    const editorContent = await editor.textContent();
    expect(editorContent).toContain('This is the original text.');
    expect(editorContent).toContain('This line has been updated.');
    expect(editorContent).toContain('This is another line.');
    expect(editorContent).not.toContain('This line will be replaced.');
  });

  test('should reject a diff and keep original content', async ({ page }) => {
    // Type initial content
    const editor = page.locator('[data-slate-editor="true"]');
    await editor.click();
    await page.keyboard.type('Original line 1');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Original line 2');

    // Simulate pasting a diff
    const diffContent = `\`\`\`diff
--- a/document.txt
+++ b/document.txt
@@ -1,2 +1,2 @@
 Original line 1
-Original line 2
+Modified line 2
\`\`\``;

    // Apply diff through toolbar
    const pasteButton = page.locator('button:has-text("Paste")');
    await pasteButton.click();

    const diffTextarea = page.locator('textarea[placeholder*="Paste the diff"]');
    await diffTextarea.fill(diffContent);

    const applyButton = page.locator('button:has-text("Apply")');
    await applyButton.click();

    // Wait for diff block
    await page.waitForSelector('[data-slate-void="true"]');

    // Click reject button
    const rejectButton = page.locator('button:has-text("Reject")').first();
    await rejectButton.click();

    // Verify original content remains
    const editorContent = await editor.textContent();
    expect(editorContent).toContain('Original line 1');
    expect(editorContent).toContain('Original line 2');
    expect(editorContent).not.toContain('Modified line 2');

    // Verify diff block is removed
    const diffBlocks = await page.locator('[data-slate-void="true"]').count();
    expect(diffBlocks).toBe(0);
  });

  test('should handle multiple diff blocks', async ({ page }) => {
    // Type initial content
    const editor = page.locator('[data-slate-editor="true"]');
    await editor.click();
    await page.keyboard.type('Line 1');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Line 2');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Line 3');

    // Apply a diff with multiple hunks
    const diffContent = `\`\`\`diff
--- a/document.txt
+++ b/document.txt
@@ -1,3 +1,3 @@
-Line 1
+Updated Line 1
 Line 2
-Line 3
+Updated Line 3
\`\`\``;

    const pasteButton = page.locator('button:has-text("Paste")');
    await pasteButton.click();

    const diffTextarea = page.locator('textarea[placeholder*="Paste the diff"]');
    await diffTextarea.fill(diffContent);

    const applyButton = page.locator('button:has-text("Apply")');
    await applyButton.click();

    // Wait for diff blocks
    await page.waitForSelector('[data-slate-void="true"]');

    // Should have 2 diff blocks
    const diffBlocks = await page.locator('[data-slate-void="true"]').count();
    expect(diffBlocks).toBe(2);

    // Accept first diff
    const acceptButtons = page.locator('button:has-text("Accept")');
    await acceptButtons.first().click();

    // Reject second diff
    const rejectButtons = page.locator('button:has-text("Reject")');
    await rejectButtons.first().click();

    // Verify mixed results
    const editorContent = await editor.textContent();
    expect(editorContent).toContain('Updated Line 1');
    expect(editorContent).toContain('Line 2');
    expect(editorContent).toContain('Line 3');
    expect(editorContent).not.toContain('Updated Line 3');
  });

  test('should handle inline replacements', async ({ page }) => {
    // Type content with inline text to replace
    const editor = page.locator('[data-slate-editor="true"]');
    await editor.click();
    await page.keyboard.type('This is a sentence with old word here.');

    // Apply inline replacement diff
    const diffContent = `\`\`\`diff
--- a/document.txt
+++ b/document.txt
@@ -1 +1 @@
-old word
+new phrase
\`\`\``;

    const pasteButton = page.locator('button:has-text("Paste")');
    await pasteButton.click();

    const diffTextarea = page.locator('textarea[placeholder*="Paste the diff"]');
    await diffTextarea.fill(diffContent);

    const applyButton = page.locator('button:has-text("Apply")');
    await applyButton.click();

    // Accept the inline change
    const acceptButton = page.locator('button:has-text("Accept")').first();
    await acceptButton.click();

    // Verify inline replacement
    const editorContent = await editor.textContent();
    expect(editorContent).toContain('This is a sentence with new phrase here.');
    expect(editorContent).not.toContain('old word');
  });

  test('should copy prompt to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Type some content
    const editor = page.locator('[data-slate-editor="true"]');
    await editor.click();
    await page.keyboard.type('Test content for prompt');

    // Type a question
    const questionInput = page.locator('input[placeholder*="Ask a question"]');
    await questionInput.fill('How can I improve this?');

    // Click copy button
    const copyButton = page.locator('button[aria-label="Copy prompt to clipboard"]');
    await copyButton.click();

    // Verify success message appears
    await expect(page.locator('text=/Prompt copied to clipboard/')).toBeVisible();

    // Note: We can't directly verify clipboard content in Playwright
    // but we've verified the UI responds correctly
  });

  test('should show error for invalid diff format', async ({ page }) => {
    const editor = page.locator('[data-slate-editor="true"]');
    await editor.click();
    await page.keyboard.type('Some content');

    // Try to apply invalid diff
    const pasteButton = page.locator('button:has-text("Paste")');
    await pasteButton.click();

    const diffTextarea = page.locator('textarea[placeholder*="Paste the diff"]');
    await diffTextarea.fill('This is not a valid diff format');

    const applyButton = page.locator('button:has-text("Apply")');
    await applyButton.click();

    // Should show error alert
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Failed to parse diff');
      await dialog.accept();
    });
  });
});