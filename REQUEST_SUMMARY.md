# Website i18n + Multi-Page Request Summary

This document summarizes everything requested so far and what has been implemented so you can review and test in one place.

## 1) Core goals requested

- Full client-side i18n with vanilla JS (no framework), GitHub Pages compatible.
- Languages: English (`en`), German (`de`, preferred/default), Italian (`it`), Spanish (`es`), Russian (`ru`).
- Replace hardcoded UI text with translation keys (including visible text + relevant attributes).
- Add language switcher and persist selection via `localStorage`.
- Auto-detect browser language on first visit.
- Dynamic `<html lang>` updates.
- English fallback for missing keys with warning in console.
- Keep existing design mostly unchanged.

## 2) Structural goals requested

- Refactor from one long page into multiple pages.
- Add/maintain dedicated pages:
  - `index.html`
  - `how-it-works.html`
  - `benefits.html`
  - `pricing.html`
  - `faq.html`
  - `contact.html`
- Keep older content pages available (`activities.html`, `community.html`).
- Keep navigation clear and link pages directly.
- Keep style consistent and mobile-friendly.

## 3) UX additions requested later

- Add a clear description block on each page so users understand what each page is for.
- Keep this content translated across all languages.

## 4) Current implemented approach (for review)

- Runtime i18n file: `i18n/i18n.js`.
- Translation files:
  - `i18n/translations/en.json`
  - `i18n/translations/de.json`
  - `i18n/translations/it.json`
  - `i18n/translations/es.json`
  - `i18n/translations/ru.json`
- Localized pages include language switcher + `data-i18n` mappings.
- Dynamic JS text in planner/testimonials/form uses i18n.
- Page-purpose summary section added to all key pages.

## 5) What to validate in your test pass

1. Open site locally and switch language from navbar dropdown.
2. Confirm labels/headings/buttons are translated (no raw keys like `home.heroTitle`).
3. Refresh page and verify selected language persists.
4. Navigate across pages and ensure language remains applied.
5. Test dynamic UI:
   - pricing planner labels/output
   - testimonials button
   - contact form success text
6. Confirm no merge conflict markers exist in deployed code.

## 6) Local run instructions

```bash
python -m http.server 5500
```

Then open:

- `http://localhost:5500/index.html`
- and other pages from nav.

## 7) GitHub conflict-resolution guidance (important)

If GitHub shows conflicts, do **not** choose “accept both” blindly for i18n files.
Prefer the side that contains:

- real translated sentences in JSON (not key names rendered as values),
- `data-i18n` attributes in HTML,
- a clean `i18n/i18n.js` runtime without conflict markers.

