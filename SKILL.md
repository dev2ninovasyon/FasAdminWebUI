---
name: fasadminwebui-standards
description: Use this skill when editing FasAdminWebUI screens, admin dashboard, menus, forms, and template tools. Apply Turkish text quality, app-consistent MUI components, compact admin layouts, practical dashboards, and usable editing screens.
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

## Working Style

- Before changing an admin screen, inspect nearby pages and reuse their component pattern.
- When the user says a menu item still does not show, trace the active sidebar source instead of assuming the first matching file is correct.
- Prefer end-to-end fixes that cover text, layout, data source, and visibility together.
