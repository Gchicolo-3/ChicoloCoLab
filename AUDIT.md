# Front-End Design & Language Audit — chicolocolab (index.html)

Audited: July 28, 2026 · Scope: `index.html` (the entire site), checked against
`colab-site-copy-update.md` and `colab-pricing-structure.md`.

---

## Headline finding: the approved copy/pricing update has not been applied

`colab-site-copy-update.md` says "Every string below is final copy, ready to drop in,"
and `colab-pricing-structure.md` explains why the old prices undersell the work.
The live page still carries the **old** copy and the **old** prices everywhere.
This is the single highest-impact issue on the site — everything below it is secondary.

### Pricing on the page vs. the approved structure

| Item | On the site | Approved (pricing doc) |
|---|---|---|
| Spark | $597 flat | **$997** flat |
| System | $1,997 flat | **$2,997** flat |
| Team tier | *missing entirely* | **$5,997** flat |
| Edge | $497/mo | **$497/mo solo, $997/mo team** |
| Brokerage packages | "$3,000–$8,000" | **"$8,000 to $15,000"** |
| Free discovery call as a pricing entry | missing | explicit FREE tier card |
| Add-on modules section (9 items, $197–$997) | missing | required, "published, never quoted live" |

The pricing doc's own analysis: $1,997 signals "cheap" (below the cheapest fixed-price
competitor at $2,997 for identical scope). Every day the old page is live, it anchors
prospects at the old numbers — and per the doc's Heather rule, quotes seen on the site
have to be honored.

### Copy still on the old positioning

The copy doc's stated goal is to widen positioning beyond real-estate-only. The page
still reads agents-first:

- **Hero headline:** "Built by someone who gets it." → should be "Built by someone who runs a business too."
- **Hero subhead:** "for agents and small businesses" → new copy targets "small businesses that are tired of duct taped software and missed follow ups."
- **Closer:** "The agents who figure this out now own their markets." → "The businesses that figure this out now pull ahead."
- **Meta description:** "for agents and small businesses" — same issue, and it's what Google shows.
- **Why-this-works heading:** "Built by an agent." → "Built by an operator."
- **Primary CTA:** page leads with "Start a Project →"; the doc makes the **free 30-minute call** the explicit primary CTA everywhere.
- **Problem strip item 3:** "A website that doesn't represent you" → replaced by "Paying per seat, every month, forever" (which sets up the pricing pitch).
- **Process step 1:** "Fill Out the Intake" → "Free discovery call"; step 2 becomes "Scope and fixed price."
- **Proof section (Section 6):** missing entirely. The four vague stat blocks (10+ / Days / $0 / NJ +) are still there; the doc replaces them with the four named/anonymous system cards (Chicolo Group, Kiwi Nutz, Burke AllTrade, anonymous CRE consultant — Card 4 must stay unnamed).
- **Footer:** still says "Separate from The Chicolo Group." The doc explicitly retires this line ("no longer works once Chicolo Group is a named proof point") in favor of "The Chicolo Group is our real estate practice in Bergen County, NJ. Separate business, same standards."
- **Intake form budget options:** still Under $500 / $500–$1,500 / $1,500–$3,000 / $3,000+. Under the new pricing, System ($2,997) and Team ($5,997) don't map to these brackets. Doc specifies: Under $1,000 / $1,000–$3,000 / $3,000–$6,000 / $6,000+ / Not sure.
- **Cold-traffic escape hatch above the form** ("Not ready to fill this out? Book a call instead…") — missing.

---

## Language & tone (beyond the pending update)

1. **Voice flips between "I" and "we."** Hero and About speak as George ("I'm a working
   real estate agent…"); Services, Process, and the form speak as "we." Solo-operator
   authenticity is the brand's core asset — either commit to "I" throughout, or
   establish "we" once ("CoLab means you and me") and stay consistent. Right now it
   reads accidental rather than chosen.
2. **CTA label sprawl.** Five variants compete: "Start a Project →", "Book a Free Call →",
   "Get Started →", "Let's Talk →", "Submit Project Request →". Pick one primary
   (book the free call, per the copy doc) and one secondary, and repeat them verbatim.
   Repetition builds momentum; variety dilutes it.
3. **"No monthly SaaS trap" vs. a $497/mo tier.** The pricing heading swears off monthly
   fees two cards away from a monthly retainer. The distinction (you *own* the build;
   the retainer is optional support, not rent) is real but never stated. One sentence
   on the Edge card ("You own the system either way — this is support, not rent")
   resolves the tension.
4. **Non-numeric "stats."** "Days" and "NJ +" styled as big stat values undermine the
   stat format — a number treatment with no number reads as padding. The copy doc
   already solves this by replacing the block with proof cards; that's the right call.
5. **Unverifiable claims.** "10+ hours saved per week" has no attribution. Anonymous
   but concrete proof ("20+ corporate accounts off spreadsheets") is stronger and
   already written in the copy doc.
6. **Hero eyebrow duplicates the logo.** "Chicolo Consultative CoLab" appears in the
   nav and again as the eyebrow six inches below. The eyebrow slot could carry a value
   line instead (e.g. "AI systems for small businesses · Bergen County, NJ").
7. **The form's Section 03 is CRM-only but shown to everyone.** A visitor who checks
   only "Website" still scrolls a long CRM checklist. The copy doc forbids structural
   form changes, so no action now — but retitling it "If you need a CRM…" or making it
   conditional is worth a future pass.

---

## Design & visual system

**What's working — keep it.** The dark navy + gold palette, Syne/DM Sans/DM Mono
pairing, mono uppercase section labels, and card language are coherent, distinctive,
and appropriately premium. The copy doc is right that this is a copy update, not a
redesign. Issues below are refinements, not a rework.

1. **Emoji as icons** (📋 ⏰ 🌐 🤷 🤖 🗂️ ⚡ 🏡 🤝, plus "⭐ Most Popular" and "📩" in the
   submit note). They render differently on every OS, clash with the refined gold/navy
   system, and are announced aloud by screen readers. Inline SVG line icons in the gold
   accent color would match the brand's polish. This is the biggest visual-credibility gap.
2. **Body text runs very small.** Large amounts of content sit at 0.76–0.84rem
   (~12–13px): service lists, price features, step descriptions, form labels, hints.
   Below ~14px readability suffers, especially on mobile where most of this traffic
   will land. Recommend a floor of 0.875rem (14px) for anything users must read.
3. **Mobile nav disappears.** Under 768px, `.nav-links` is `display:none` with no
   hamburger — Services / How It Works / Pricing / Book a Call are unreachable from
   the nav on phones. The Calendly CTA survives, but section navigation is lost until
   the footer. Add a minimal hamburger or keep a condensed link row.
4. **Problem-strip borders break on mobile.** At the 2-column breakpoint, only
   `:last-child` loses its right border, so items 2 and 4 draw a stray border at the
   container's right edge. Use `:nth-child(2n)` at that breakpoint (or switch to gap +
   no borders).
5. **Inline styles drifting in.** The pricing section, brokerage box, and Book section
   carry substantial inline `style=""` attributes while everything else uses classes.
   Harmless today, but it's the start of two styling systems in one file.
6. **No `prefers-reduced-motion` handling.** The pulsing eyebrow dot, hover
   `translateY` transforms, and `scroll-behavior:smooth` all animate unconditionally.
   A short media query disabling them is a few lines.
7. **Contrast is borderline in places.** `--muted` (#6a788f) on the darkest
   backgrounds sits near the WCAG AA 4.5:1 threshold, and the dimmer hint text
   (`rgba(106,120,143,0.7)` at 12px) and placeholder text (same at 0.5 alpha) fall
   below it. Nudging muted text up (e.g. #7d8ba3) preserves the look and clears AA.

---

## Accessibility

1. **Form labels aren't real labels.** Every field uses `<div class="field-label">`
   next to an input — no `<label for>`/`id` association, so screen readers announce
   bare inputs. This is the most important a11y fix and is purely markup (no visual
   or structural change, so it doesn't conflict with the "copy changes only" rule).
2. **Required fields are asterisk-only.** Add `required` / `aria-required="true"` and
   a legend explaining `*`.
3. **Validation via `alert()`.** Blocking, jarring, and invisible to assistive tech as
   field-level feedback. Inline error text tied to the fields (with
   `aria-describedby`) is the standard fix. There's also no email-format check —
   `george@` submits fine.
4. **No skip-to-content link** and no custom `:focus-visible` styles on links/buttons
   (inputs have focus rings; nav links and CTAs rely on browser defaults, which are
   nearly invisible on this dark palette).
5. **Decorative emoji are read aloud** (see design #1); until replaced, wrap them in
   `aria-hidden="true"` spans.

---

## Technical / functional

1. **Submissions can silently vanish.** The Apps Script `fetch` uses `mode:'no-cors'`
   (response is always opaque) and the `catch` only logs — the success screen shows
   even when the POST failed. At minimum, treat a thrown fetch as failure and tell the
   user to email/book instead. Longer-term, have Apps Script return CORS headers or
   move to a form service so success is verifiable. Related dead code: the
   `SCRIPT_URL !== 'YOUR_COLAB_CRM_SCRIPT_URL_HERE'` guard can never be false, and
   `gcb()`, `gcbSection()`, and `allCheckboxes` are unused.
2. **Checkbox harvesting is value-list matching.** Submission filters every checked
   checkbox on the page against hard-coded value arrays. It works only while every
   value stays globally unique; adding a checkbox (or an add-ons section) without
   updating the arrays silently drops data. Scoping queries per form section (or
   `name` attributes) is safer.
3. **No spam protection** on a public form posting to Apps Script — expect bot
   submissions. A honeypot field is a five-minute fix.
4. **No social/share metadata.** Zero Open Graph or Twitter Card tags and no favicon —
   links shared by referral-heavy audiences (exactly this business's channel) unfurl
   as a bare URL. Add `og:title`, `og:description`, `og:image`, and a favicon.
5. **No structured data.** A `LocalBusiness`/`ProfessionalService` JSON-LD block
   (Hillsdale NJ, service area, Calendly URL) is cheap local-SEO value for a
   Bergen-County-anchored business. A canonical URL tag is also missing (relevant
   given the planned Netlify→Vercel migration in the tech notes — two live hosts
   without a canonical means duplicate indexing).
6. **Fonts block first paint.** The Google Fonts CSS link has no
   `preconnect`/`display=swap` is present in the URL (good) but adding
   `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` shaves
   real time off first render.
7. **Minor:** the submitted `Timestamp` uses `toLocaleString()` (locale/timezone of
   the visitor's browser — inconsistent in the sheet; ISO string is sorter-friendly),
   and `gv('f-clients') || document.getElementById('f-clients').value` is redundant.

---

## Priority order

1. **Apply `colab-site-copy-update.md`** — pricing, positioning, proof section,
   add-ons, footer, budget brackets. Everything is already written; the site is
   actively underselling at old prices until this ships.
2. **Fix form reliability** — real `<label>`s, inline validation, honest
   failure handling, honeypot. The form is the conversion asset; it should not be
   able to lose a lead silently.
3. **Mobile nav + text-size floor + contrast bump** — the audience is phone-first.
4. **Replace emoji with SVG icons; add OG tags + favicon + JSON-LD.**
5. **Housekeeping** — dead JS, inline styles, reduced-motion, preconnect.
