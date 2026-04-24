# Corrections Tracker (Execution Status)

Last updated: 2026-04-24  
Source: `corrections.md`  
Owner: Panache Foundation Web Team

## Completed

- [x] About section no longer blocks header CTA clicks at page transition (peak-only background + non-interactive intro container).
- [x] About section now leaves visible text headroom during transition so section entry feels continuous while preventing click capture issues.
- [x] Miss Panache, Fashion Night, and Panache 360 now submit with the shared free-flow registration config and redirect to WhatsApp after save.
- [x] Manual client-side registration confirmation email calls were removed from those free-flow pages; backend now sends admin notifications from the same payload flow.

## P0 - Must fix before launch

| ID | Area | Issue | Status | Validation note |
| --- | --- | --- | --- | --- |
| P0-01 | Panache Expo Overview | Hero buttons not working | DONE | Hero CTA routes exist, and the About intro no longer captures clicks over the hero transition. |
| P0-02 | Panache Expo Overview | "beauty, fashion and entrepreneurship" typo/unclear heading text | DONE | Hero copy is now the clarified Panache overview wording used on the live page. |
| P0-03 | Panache Runway/Sponsors | WhatsApp links for runway use a different number | DONE | Runway registration now redirects to the dedicated runway WhatsApp group and shared Panache support links use the official number. |
| P0-04 | Panache D'or | Wording says "Register for Awards" in places meant for nominations | DONE | Panache D'or CTA copy now uses nomination language where applicable. |
| P0-05 | Panache Expo Post-registration | Contestant registration does not redirect to WhatsApp flow | DONE | Confirmed for Miss Panache, Fashion Night, and Panache 360 via config-driven post-submit config. |
| P0-06 | CYES Hero | "cameroon youth entrepreneural summit" spelling/wording incorrect | DONE | CYES wording now uses the corrected "Cameroon Youth Entrepreneurial" spelling across the current hero/register flow. |

## P1 - High priority content fixes

| ID | Area | Issue | Status | Validation note |
| --- | --- | --- | --- | --- |
| P1-01 | Panache Overview | About section feels flat | TODO | Confirm redesign approved against prior mockups. |
| P1-02 | Gallery | Event gallery repetition feels noisy | DONE | The original immersive gallery was split into its own component and the live Panache page now uses a simpler, non-overlapping gallery layout. |
| P1-03 | Panache Awards bio | "panacha Expo founded..." copy should use "Africa" | DONE | Founder bio now references Panache Expo Africa. |
| P1-04 | Panache Awards bio | Copy phrase needs updated wording | DONE | Founder bio now uses the approved "entrepreneurs, beauty, fashion and professionals" wording. |
| P1-05 | Panache Overview/Footer | Footer image is too small | DONE | Footer muse image was scaled up for a more balanced desktop and mobile presence. |
| P1-06 | CYES Register | Need a 5th track (agri business and food security) | DONE | CYES registration now includes Agri Business & Food Security and updates the track count to five. |
| P1-07 | Panache D'or Awards 2026 | Page misses exact flyer details and "filming stick" content | DONE | Panache D'or page now spells out the 1.5 million FCFA winner package, website feature, media support, ambassador role, and DJI Pocket 3 prize details. |

## P2 - Brand and visual consistency

| ID | Area | Issue | Status | Validation note |
| --- | --- | --- | --- | --- |
| P2-01 | Panache Expo | Add sponsor assets (KOVR vector files + KEM logo) | DONE | KOVR and KEM assets added to sponsor marquee and wired into Panache variant. |
| P2-02 | Footer | Missing "Miss Panache" + "Djoulhida Soule" | DONE | Footer now features Djoulhida Soule as a proper titleholder profile with Miss Panache D'or branding. |
| P2-03 | Panache Runway | Runway sponsor should be Yulem logo 3.png with correct treatment | DONE | Added Yulem sponsor section with brand logo, spacing, and prize context on FashionNight page. |
| P2-04 | Panache D'or | Winner and payout text style/content | DONE | Added winner payout block with required phrase and matching visual emphasis on Panache D'or page. |
| P2-05 | Panache Runway | Prize detail should mention industrial sewing machine | DONE | Explicit prize copy now references industrial sewing machine support. |
| P2-06 | Panache D'or | Missing partner sponsor references from official list | DONE | Added AA Foundation logo to CYES marquee variant as an official partner reference. |

## P3 - Process + quality cleanup

| ID | Area | Issue | Status | Validation note |
| --- | --- | --- | --- | --- |
| P3-01 | Nominations | Need full names + stage names in entries | DONE | Nomination form now requires nominee and nominator full names plus stage or brand names. |
| P3-02 | Nominations | WhatsApp numbers missing on nomination flow | DONE | Nomination form now requires WhatsApp numbers and shows helper guidance for follow-up contact. |

## New Flow Work (Ayati Removal)

- [x] Add config-driven registration mode so free registrations can bypass payment cleanly.
- [x] Add payload fields from front-end (`competitionTitle`, `postSubmitHref`, `notificationEmails`) to trigger backend email notifications.
- [x] Redirect free-sponsor registrations straight to WhatsApp group: `https://chat.whatsapp.com/JvzGqSujsVH8mpMMsROInH`.
- [x] Remove manual Ayati copy/link from Miss Panache, Fashion Night, and Panache 360 free-flow pages.
- [x] Route Panache Runway registrations to the dedicated runway WhatsApp group provided by the team.
- [x] Centralize the official Panache WhatsApp support number across footer, homepage, contact, and exhibition stand CTA surfaces.

## Execution order

1. Complete `P0` items and run full CTA/route smoke tests.
2. Finish `P1` visual/content updates.
3. Complete `P2` sponsor/brand alignment items.
4. Finish `P3` quality/process cleanup.
5. Execute and verify the Ayati-removal migration end-to-end.
