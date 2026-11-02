---
name: fasadminwebui-standards
description: Standardize and review FasAdminWebUI tables, typography, colors, cards, forms, dialogs, and admin layouts using the existing MUI theme and shared components. Use for admin UI changes and visual consistency audits.
---

# FasAdminWebUI Standards

## Overview

Use these standards for `FasAdminWebUI`. Admin screens should feel consistent with the project, show practical information, and avoid generic or bloated CRUD-style layouts.

## When To Use

Use this skill when editing:

- files under `src/app`, `src/components`, `src/services`, and `src/api`
- admin dashboard, menu items, management screens, template editors, and auth pages
- visible UI text, headings, chips, helper texts, alerts, and browser titles
- pages the user says should be "projeye uygun", "daha temiz", "aynı uygulama gibi", or "alt alta değil"

## Turkish Text Rules

- Always use proper Turkish characters in every visible label and sentence.
- Proactively fix mojibake and broken strings such as `Sifre`, `Giris`, `Baglanti`, `Kalem AdÄ±`, `Ã`, `Å`.
- Write natural Turkish for admin users. Avoid robotic or half-translated wording.
- Menu items, dashboard titles, breadcrumbs, tabs, and helper texts must all use correct Turkish.

## Admin UI Rules

- Use the application's actual MUI-based structure and patterns already present in the repo.
- Prefer project-consistent cards, buttons, chips, tables, and spacing.
- Do not leave raw HTML-looking buttons or unfinished utility layouts in production screens.
- Avoid duplicate top headings and oversized intro cards when the page already has context.
- Keep management pages compact, readable, and action-oriented.

## Dashboard Rules

- Use real API data, not placeholder stats.
- Show information that helps the admin act: counts, recent records, status summaries, and time-sensitive warnings.
- Keep the first screen informative without becoming noisy.
- If a list is shown, prefer short, high-value sections such as recent entities or upcoming renewals.

## Menu Rules

- Add entries to the menu file actually used by the running admin app.
- Do not create duplicate menu items.
- Keep labels Turkish and concise.
- If a route exists in both alias and canonical form, use the one that matches the current menu structure.

## Editor And Management Screen Rules

- If the user wants a simple editor, remove unnecessary multi-record CRUD complexity.
- For email template work, prioritize one practical MJML editing flow with preview over generic list management.
- If editing and preview are both core tasks, show them side by side on wide screens.
- Buttons and actions must match the project's styling and hierarchy.

## Form And Auth Rules

- Password help should not break layout or create large empty areas.
- Use compact helper UI when possible.
- Fix related Turkish texts across the whole auth flow, not just one field.

## Shared Design Contract

- Read [the design contract and rollout plan](docs/TASARIM-STANDARDIZASYON-PLANI.md) when adding or changing shared UI styling. It distinguishes current findings from proposed work; unchecked tasks are not implemented.
- For an audit or migration, regenerate [the source inventory](docs/TASARIM-TARAMA-ENVANTERI.md) with `python scripts/design-audit.py`. Matches are review candidates, including theme definitions, comments, reports, and inactive copies; inspect context before changing them.
- Use `src/utils/theme/Typography.tsx`, `Theme.tsx`, `Components.tsx`, and the existing palette files as the source of visual values. Keep Plus Jakarta Sans, theme selection, direction, and configurable card radius/shadows.
- The same component role must share the same styling across pages. Target table body: theme body1 (0.875rem/400); column header: body1/600; helper text: body2 (0.75rem). Use typography variants instead of page-specific pixel values.
- Table surfaces use background.paper, headers primary.light/text.primary, borders divider, hover action.hover, selection action.selected. Resolve actual palette values for imperative DOM styles; palette key strings only resolve through MUI styling.
- Define normal/compact density once for both table engines. Planned single-line body heights are 40/35px and header height 48px; allow wrapping, nested headers, and multiline cells to grow. These are rollout targets, not evidence of an existing implementation.
- Keep MUI list tables and Handsontable data-entry tables. Share their theme values without replacing either engine for a visual task. Use the existing `src/components/HotTableWrapper.tsx`; scope its CSS with `fas-hot-table`.
- Move decorative Handsontable header/renderer styles into the shared theme bridge as pages migrate. Preserve semantic formatting, readOnly/error/approval states, formulas, filters, merged cells, editors, refs, and export behavior.
- Avoid competing globally loaded light/dark input CSS and page-local !important overrides. Validate theme switching without a page reload.
- Reuse BlankCard, ParentCard, CustomTextField, CustomFormLabel, and existing button/dialog patterns from the active component tree. Inspect how sx is merged before relying on a wrapper override.
- Status colors use success/warning/error/info with a text or icon meaning. Monospace is appropriate for JSON, code, and stack traces; its surface still follows the theme.
- Brand graphics, chart series, printed/PDF/Excel reports, and user-authored rich-text formatting have separate purposes. Do not automatically replace their colors or font choices as screen-style violations.
- Trace imports from the active route/layout. `src/app/components`, `src/app/(AdminUI)/components`, and `Layout1` contain copies; changing one does not prove all callers use it. Do not delete duplicates without checking callers.
- Validate changed components at 375, 768, and 1440px with long Turkish labels and populated/empty/loading/error states, in light and dark mode. Check key interactions and report visual checks that could not run.
- Scope migrations to the requested work. An audit/plan request authorizes documentation and inspection; do not implement every migration item or change data behavior as part of writing the plan.

## Working Style

- Before changing an admin screen, inspect nearby pages and reuse their component pattern.
- When the user says a menu item still does not show, trace the active sidebar source instead of assuming the first matching file is correct.
- Prefer end-to-end fixes that cover text, layout, data source, and visibility together.
