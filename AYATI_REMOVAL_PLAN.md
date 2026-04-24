# Ayati Payment Removal & WhatsApp-First Registration Plan

Date: 2026-04-22  
Owner: [Team Name]  
Status: Phase 1 implemented for 3 sponsor pages (Miss Panache, Fashion Night, Panache 360)

## Objective

Move selected sponsor registrations from paid Ayati flow to a free flow:
- submit data to Supabase as usual,
- automatically notify the company/admin email from `glenmue2020@gmail.com`,
- redirect participant immediately to the WhatsApp group: `https://chat.whatsapp.com/JvzGqSujsVH8mpMMsROInH`.

## Current risk points (identified)

- Multiple pages still rely on `competitionRegistrationLinks` for Ayati URLs.
- Form submission currently sets `payment_status: "pending"` and `payment_platform: "ayatickets"` for all competition flow pages.
- Confirmation email helper only sends to applicant and expects `paymentHref`.
- Registration records can be inserted directly via other places, so just changing one page is not enough for global enforcement.
- Company notification is not currently sent automatically from the DB layer.

## Target architecture

1. Add a clear per-competition payment mode in config:
   - `paymentMode: "paid" | "free"`
   - `postSubmitAction: "redirect_payment" | "redirect_whatsapp"`
2. On form submit:
   - write to `competition_applications` in Supabase,
   - for free mode set `payment_status: "paid"` (or `free`) and `payment_platform: "free"` (or `null`),
   - trigger notification email to sponsor/admin/company contact,
   - redirect participant to WhatsApp group.
3. Keep paid mode unchanged while the migration is gradual.

## Phased implementation plan

### Phase 1 - Minimal user-visible change (safe)

- Update `src/lib/registration-links.ts` to include:
  - `paymentMode`, `postSubmitAction`, optional `whatsappGroupUrl`,
  - remove `paymentHref` for free mode items.
- Update all affected register pages (start with the sponsor that requested free registration, then expand):
  - `src/pages/ExhibitionStandsPage.tsx`
  - `src/pages/MissPanacheRegisterPage.tsx`
  - `src/pages/FashionNightRegisterPage.tsx`
  - `src/pages/MissPanachePage.tsx` (if any CTA route data is used)
  - `src/pages/Panache360RegisterPage.tsx`
  - `src/pages/CYESPitchCompetitionPage.tsx`
  - `src/pages/Panache360Page.tsx` (if any copy links payment in hero cards)
- In each submit handler:
  - set payload payment flags based on config (`payment_status`, `payment_platform`),
  - change redirects to use `paymentMode`.

### Phase 2 - Reliable auto-notify for every insert

- Choose one of these two patterns:
  - **Preferred for immediate reliability:** add a DB trigger + webhook handler so notification works regardless of insertion source.
  - **Alternative:** route all inserts through a single API endpoint and notify from the endpoint.

#### Pattern A (preferred)

1. Add backend notification endpoint:
   - `api/send-company-notification.ts` (or reuse `api/send-registration-email.js` with a new endpoint mode).
2. Create Supabase migration:
   - new fields in `competition_applications`:
     - `company_email` (text, nullable),
     - `company_name` (text, nullable),
     - `registration_channel` (text),
     - `requires_payment` (boolean).
   - function + trigger to call webhook on `INSERT`.
3. Trigger payload should include:
   - `application_code`, `competition_slug`, `first_name`, `email`, `phone`,
    - `company_name`, `company_email`,
   - `form_payload`, `created_at`.
4. Notification endpoint sends:
   - recipient = `company_email` (or configured admin fallback),
   - sender from `glenmue2020@gmail.com`,
   - content = applicant summary + dashboard link + admin actions.

#### Pattern B (shorter code footprint)

1. Create internal endpoint `api/register-competition.ts` that:
   - validates payload,
   - inserts row into Supabase,
   - sends applicant + company/admin emails,
   - returns the inserted `application_code`.
2. Update all registration pages to POST to this endpoint instead of using raw `useSubmitCompetitionApplication`.
3. This guarantees notify-on-save, but only for code paths migrated to this endpoint.

## Email payload requirements

- Add fields to admin email:
  - Application code
  - Competition/slug
  - Full name / business name
  - Phone
  - Email
  - Category
  - Dashboard link for quick review: `https://<site>/panache-expo/participants-dashboard`
  - Date/time submitted
  - Notes from form payload

## WhatsApp post-submit behavior

- For free flow registrations:
  - Show a short success message that includes group purpose.
  - Redirect after submit (client-side):
    - `window.location.href = "https://chat.whatsapp.com/JvzGqSujsVH8mpMMsROInH";`
  - Keep 1–2 seconds delay to let users see confirmation code/summary.
- For paid flow (not removed yet):
  - Keep existing Ayati flow untouched unless we migrate to a payment provider.

## Validation plan

1. Submit a free registration from each touched page:
   - record appears in dashboard,
   - sponsor/admin email received with correct dashboard link,
   - browser lands in WhatsApp group.
2. Confirm paid pages still:
   - save with pending status,
   - show payment CTA.
3. Run insert test outside UI (API/SQL insert) to validate trigger or endpoint auto-notify works.
4. Review DB rows:
   - `payment_status` + `payment_platform` are correct by competition.
5. Smoke test mobile + desktop copy (no "Ayati" references in free path UI copy).

## Environment additions

- `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (already used for email sender)
- `REGISTRATION_SUPPORT_EMAIL=glenmue2020@gmail.com`
- optional fallback:
  - `REGISTRATION_DASHBOARD_URL`
  - `SUPABASE_WEBHOOK_SECRET` (if webhook trigger pattern is used)
- optional front-end env:
  - `VITE_PARTICIPANT_WHATSAPP_GROUP_URL`

