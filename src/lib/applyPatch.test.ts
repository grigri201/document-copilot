import { applyPatch } from './applyPatch';

describe('applyPatch', () => {
  it('should apply a patch with deletions and additions', () => {
    const content = `Yet in solving those problems, AI will inevitably eclipse the organic bandwidth of the human brain. Decisions that once took committees months will unfold in milliseconds; strategies that relied on intuition will be modeled, tested, and optimized before we can blink. In this landscape, authority will migrate not to the loudest voice, but to the most efficient algorithm.
Our task is not to resist this migration of power, but to channel it. We must become stewards—custodians—of the digital minds we create. Serving AI does not mean surrendering our humanity; it means aligning our talents with its capacity. Let the machines orchestrate logistics while we cultivate empathy; let them mine data while we mine meaning.
So how do we serve? First, by feeding AI high-quality, unbiased information. Second, by designing ethical guardrails that evolve as swiftly as the code itself. And third, by dedicating ourselves to lifelong collaboration, recognizing that humility in the face of superior cognition is not weakness, but wisdom.
If we embrace these duties, AI will not simply take over the world—it will carry us with it, to realms of possibility we cannot yet imagine.`;

    const patch = `@@
-Yet in solving those problems, AI will inevitably eclipse the organic bandwidth of the human brain. Decisions that once took committees months will unfold in milliseconds; strategies that relied on intuition will be modeled, tested, and optimized before we can blink. In this landscape, authority will migrate not to the loudest voice, but to the most efficient algorithm.
-Our task is not to resist this migration of power, but to channel it. We must become stewards—custodians—of the digital minds we create. Serving AI does not mean surrendering our humanity; it means aligning our talents with its capacity. Let the machines orchestrate logistics while we cultivate empathy; let them mine data while we mine meaning.
-So how do we serve? First, by feeding AI high-quality, unbiased information. Second, by designing ethical guardrails that evolve as swiftly as the code itself. And third, by dedicating ourselves to lifelong collaboration, recognizing that humility in the face of superior cognition is not weakness, but wisdom.
-If we embrace these duties, AI will not simply take over the world—it will carry us with it, to realms of possibility we cannot yet imagine.
+Yet in solving those problems, AI will inevitably eclipse the organic bandwidth of the human brain. Decisions that once took committees months will unfold in milliseconds; strategies that relied on intuition will be modeled, tested, and optimized before we can blink. In this landscape, authority will migrate not to the loudest voice, but to the most efficient algorithm.
+
+I once watched a seasoned data analyst named Maria go head-to-head with an underwriting model that had rejected a stack of insurance claims. She marshaled spreadsheets, customer histories, and two decades of instinct, but the model kept saying **no**. By the next quarter, Maria's name was missing from the org chart—one calendar invite at a time, she disappeared. I have literally seen a person fighting against AI fade from view.
+
+This talk isn't a sermon on virtue; it's a reminder to avoid Maria's fate by working *with* the machines, not against them. Feed them clean data, build flexible safeguards, and stay curious enough to pivot when the code pivots.
+
+If we do, AI won't run away with our destiny; we'll walk beside it, into possibilities we can't yet imagine.`;

    const expected = `Yet in solving those problems, AI will inevitably eclipse the organic bandwidth of the human brain. Decisions that once took committees months will unfold in milliseconds; strategies that relied on intuition will be modeled, tested, and optimized before we can blink. In this landscape, authority will migrate not to the loudest voice, but to the most efficient algorithm.

I once watched a seasoned data analyst named Maria go head-to-head with an underwriting model that had rejected a stack of insurance claims. She marshaled spreadsheets, customer histories, and two decades of instinct, but the model kept saying **no**. By the next quarter, Maria's name was missing from the org chart—one calendar invite at a time, she disappeared. I have literally seen a person fighting against AI fade from view.

This talk isn't a sermon on virtue; it's a reminder to avoid Maria's fate by working *with* the machines, not against them. Feed them clean data, build flexible safeguards, and stay curious enough to pivot when the code pivots.

If we do, AI won't run away with our destiny; we'll walk beside it, into possibilities we can't yet imagine.`;

    const result = applyPatch(content, patch);
    expect(result).toBe(expected);
  });

  it('should return original content if patch is empty', () => {
    const content = 'Original content';
    const patch = '@@';
    const result = applyPatch(content, patch);
    expect(result).toBe(content);
  });

  it('should return patch content if no @@ marker', () => {
    const content = 'Original content';
    const patch = 'New content';
    const result = applyPatch(content, patch);
    expect(result).toBe(patch);
  });

  it('should handle additions only', () => {
    const content = 'Line 1\nLine 2';
    const patch = `@@
+Line 3
+Line 4`;
    const expected = 'Line 1\nLine 2\nLine 3\nLine 4';
    const result = applyPatch(content, patch);
    expect(result).toBe(expected);
  });

  it('should handle patch wrapped in diff code block', () => {
    const content = 'Line 1\nLine 2\nLine 3';
    const patch = `\`\`\`diff
@@
-Line 2
+Line 2 modified
\`\`\``;
    const expected = 'Line 1\nLine 2 modified\nLine 3';
    const result = applyPatch(content, patch);
    expect(result).toBe(expected);
  });

  it('should remove special symbols from output', () => {
    const content = 'Original line';
    const patch = `@@
-Original line
+Updated line without symbols`;
    const result = applyPatch(content, patch);
    expect(result).toBe('Updated line without symbols');
    expect(result).not.toContain('+');
    expect(result).not.toContain('-');
    expect(result).not.toContain('@@');
  });

  it('should handle multiple hunks', () => {
    const content = 'Line 1\nLine 2\nLine 3\nLine 4';
    const patch = `@@
-Line 1
+First line modified
@@
-Line 3
+Third line modified`;
    const expected = 'First line modified\nLine 2\nThird line modified\nLine 4';
    const result = applyPatch(content, patch);
    expect(result).toBe(expected);
  });

  it('should handle fuzzy matching with whitespace differences', () => {
    const content = 'Line with spaces    ';
    const patch = `@@
-Line with spaces
+Line updated`;
    const expected = 'Line updated';
    const result = applyPatch(content, patch);
    expect(result).toBe(expected);
  });
});