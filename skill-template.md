## Visual Feedback Loop (vibe-eyes)

You have access to three MCP tools: preview_screenshot, preview_diff,
and preview_status.

### When to use them

Use the visual feedback loop for any task that touches:
- Layout or positioning (.css, .scss, tailwind classes)
- Component structure (.tsx, .jsx, .vue, .svelte)
- Styling tokens or themes
- Responsive breakpoints
- Any HTML template file

Do NOT use for logic-only changes (API calls, state management, utility
functions) unless those changes affect what is rendered.

### The loop

1. Call preview_status() to confirm the dev server is running
2. Call preview_screenshot() and store the result as `before`
3. Make your code changes
4. Wait 1500ms for the dev server hot-reload to complete
5. Call preview_screenshot() again and store as `after`
6. Call preview_diff(before_id, after_id, context="describe what you changed")
7. Look at both images. Identify any layout issues, broken spacing, misaligned
   elements, or visual regressions compared to your intent
8. If the UI looks correct: you are done
9. If issues exist: fix them based on what you see, go back to step 3
10. Do not ask the human to check the UI at any point in this loop
11. Only stop looping if you have made 4+ attempts with no visible improvement
    (signal stuck, ask human for input)

### What counts as passing

- No broken layout or misaligned elements
- Spacing and hierarchy look intentional
- Nothing is clipped, overflowing, or invisible that shouldn't be
