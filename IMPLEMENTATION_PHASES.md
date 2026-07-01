# Implementation Phases — Tech & Tune

> Full-stack build roadmap derived from `PRD.md`, `TRD.md`, `App Flow.md`,
> `UI - UX design.md`, and `DATABASE_SCHEMA.md`.
> Stack: Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4 ·
> shadcn/ui · PostgreSQL · Prisma · Better Auth · Cloudinary · UploadThing ·
> Resend · Vercel.

**Status:** Planning → Build
**Sequencing principle:** each phase ships something usable and is a dependency
for the next. Foundation and data model come first; revenue flows (catalog →
cart → checkout) before secondary modules; admin/CMS before content-heavy work;
hardening and AI last.

---

## Phase 0 — Foundation & Tooling

**Goal:** A running, deployable skeleton with standards enforced from day one.

- `create-next-app` (App Router, TS, ESLint), Tailwind v4, shadcn/ui, Lucide.
- Feature-based folder structure per TRD §3 (`app/`, `components/`, `features/`,
  `hooks/`, `lib/`, `services/`, `actions/`, `types/`, `constants/`,
  `providers/`, `styles/`, `middleware.ts`).
- Dev standards: strict TS, ESLint, Prettier, Husky + lint-staged, Conventional
  Commits.
- Env management (`.env`, `.env.example`), `zod`-validated env loader.
- Git repo init + GitHub + Vercel project (Development / Preview / Production).
- Base providers: theme, Lenis smooth scroll, Framer Motion config, Toaster.

**Deliverable:** Empty themed app deploys to Vercel preview on every push.

---

## Phase 1 — Database & Data Layer

**Goal:** Complete schema and a typed data access layer.

- Provision PostgreSQL (Neon/Supabase/Vercel Postgres).
- Prisma schema for all `DATABASE_SCHEMA.md` models: Users/Roles/Permissions,
  Category/Brand/Product/ProductImage/Specification/Inventory, Cart/CartItem,
  Wishlist, Order/OrderItem/Payment, Address, Quote, Rental, ServiceRequest,
  Review, Blog/BlogCategory, Project, Testimonial, FAQ, Coupon, Notification,
  Media, Settings, AuditLog.
- Design principles from the doc: UUID PKs, FK constraints, soft deletes,
  timestamps everywhere, indexes (email, phone, slug, sku, orderNumber,
  productId, categoryId, brandId, status, paymentStatus, createdAt).
- Seed script: roles, sample categories/brands, demo products, settings.
- Prisma client singleton + repository/service helpers in `services/`.

**Deliverable:** `prisma migrate` + `prisma db seed` produce a populated DB.

---

## Phase 2 — Authentication & RBAC

**Goal:** Secure accounts with role-based access.

- Better Auth: email/password, Google OAuth, email verification, password reset.
- Roles: Guest, Customer, Admin, Super Admin (future: Dealer, Engineer, Sales
  Manager).
- `src/proxy.ts` route protection (Next 16 renamed `middleware`→`proxy`) for
  `/dashboard`, `/orders`, `/wishlist`, `/profile`, `/addresses`, `/admin`.
- Auth UI (login, register, verify, reset) using design-brief styles.
- Resend wired for verification + reset emails.

**Deliverable:** Users sign up, verify, log in (email + Google); routes guard by
role.

---

## Phase 3 — Design System & Global Layout

**Goal:** Reusable UI matching the design brief before building pages.

- Tailwind theme tokens: color palette (`#08170E`, `#102417`, `#122C1D`,
  greens `#4CAF50`/`#76C043`/`#3AAE4E`, text, borders), Manrope/Inter fonts,
  spacing/radius scale (16–20px cards).
- Core components: Button (primary/secondary + hover states), Card, Input/Form
  (inline validation), Badge, Accordion, Modal/Quick View, Skeletons, Toasts.
- Global chrome from App Flow: sticky navbar (transparent→solid on scroll),
  mega menu, search bar, breadcrumbs, footer, floating WhatsApp + call buttons,
  back-to-top, cookie consent, page loader.
- Animation primitives: fade-in, scroll reveal, counters, hover lift, image zoom.

**Deliverable:** Storybook-like component gallery + global layout shell.

---

## Phase 4 — Product Catalog (Browse & Discover)

**Goal:** The core browsing experience.

- Routes: `/products`, `/category/[slug]`, `/brand/[slug]`, `/product/[slug]`.
- Listing with filters (category, brand, KVA, fuel type, price), sorting,
  pagination — Server Components + URL search params.
- Product detail page (PRD §Product Detail Page): image gallery + zoom, specs,
  engine/alternator/fuel data, downloads (brochure/datasheet via UploadThing),
  stock status, related products, reviews, FAQs, and CTAs (Buy / Add to Cart /
  Request Quote / WhatsApp).
- Discovery: search with suggestions, recently viewed, featured/best-sellers/
  new arrivals, product comparison table, quick view.

**Deliverable:** Visitors browse, filter, search, compare, and view full product
detail.

---

## Phase 5 — Cart, Checkout & Orders (Phase-1 Payments)

**Goal:** End-to-end purchase flow.

- Guest + persistent cart (cart/cart item models), quantity updates, coupons,
  shipping calc, order summary.
- Checkout: customer info, shipping/billing address, delivery + payment method,
  review, place order.
- Phase-1 payments per PRD/TRD: Bank Transfer, Cash on Delivery, manual
  verification (no gateway yet).
- Order creation, `orderNumber`, status lifecycle (Pending→Confirmed→…→
  Delivered/Cancelled/Refunded), invoice generation (PDF), confirmation email.
- Customer dashboard v1: orders list, order tracking, download invoice, saved
  addresses, wishlist.

**Deliverable:** A customer completes a real order and tracks it; admin can
confirm payment.

---

## Phase 6 — Lead-Gen Modules: Quote, Rental, Service

**Goal:** The B2B/lead flows that drive much of this business.

- **Quote system** (TRD §16): public form (name, company, phone, email, city,
  required KVA, brand, purchase/rental, budget, message, file upload) →
  DB + Resend admin notification → status pipeline (Pending→Contacted→Quoted→
  Approved/Rejected), assignable.
- **Rental module** (TRD §15): select generator, duration, delivery location,
  installation/transport flags, expected load, preferred date → request →
  admin review → rental quotation → status lifecycle.
- **Service booking** (TRD §14): brand, model, serial, problem, priority,
  preferred date, address, photo upload (Cloudinary) → engineer assignment →
  status tracking.
- Customer dashboard v2: rental requests, service requests, warranty requests.

**Deliverable:** All four conversion paths (buy/quote/rent/service) work
end-to-end with admin notifications.

---

## Phase 7 — Admin Dashboard & CMS

**Goal:** Operators manage everything without code.

- Admin shell (RBAC-gated) with analytics overview.
- CRUD: Products, Categories, Brands, Inventory (low-stock alerts), Orders,
  Customers, Quotes, Rentals, Service Requests, Coupons, Reviews (moderation).
- Media Library (Cloudinary/UploadThing browser).
- CMS-editable content (TRD §17): homepage sections, About, Services, Blog,
  Projects, FAQs, Testimonials, hero sections, footer, SEO metadata.
- Website Settings: company info, contacts, social links, SEO defaults,
  analytics IDs.
- Audit logging on admin mutations.

**Deliverable:** Non-developer staff run the catalog, orders, leads, and site
content.

---

## Phase 8 — Content, Marketing & Homepage

**Goal:** The public storytelling surfaces and SEO content.

- Homepage assembled per UI brief §Homepage Structure (hero → trusted brands →
  featured categories → featured products → services → why choose us →
  industries → projects → testimonials → statistics → FAQ → CTA → footer).
- Static/marketing pages: About, Services (sales/rental/repair/overhaul/parts),
  Industries, Projects showcase, Contact (WhatsApp/call/email/form), FAQ.
- Blog: listing, categories, article, related posts, contact CTA.
- Newsletter signup, contact form (Resend + reCAPTCHA).

**Deliverable:** Complete public site reflecting the premium brand.

---

## Phase 9 — SEO, Performance & Accessibility Hardening

**Goal:** Hit the TRD quality bars.

- SEO (TRD §18): Metadata API, OpenGraph/Twitter, structured data (Product,
  Article, FAQ, Breadcrumb, Organization, LocalBusiness), XML sitemap,
  robots.txt, canonicals.
- Performance (TRD §19, §28): Server Components default, image optimization,
  lazy loading, code splitting, caching, ISR where appropriate. Targets:
  Lighthouse Perf ≥95 / SEO 100 / A11y ≥95, FCP <1.5s, LCP <2.5s, CLS <0.1.
- Accessibility (TRD §21): WCAG AA, keyboard nav, ARIA, focus states, contrast.
- Security (TRD §20): Zod validation everywhere, rate limiting, CSRF, secure
  cookies, sanitized HTML, SQL-injection/XSS protection.
- Analytics: Google Analytics, Search Console, Microsoft Clarity.

**Deliverable:** Lighthouse + a11y + security checks pass against targets.

---

## Phase 10 — Testing, QA & Launch

**Goal:** Production confidence and go-live.

- Unit tests (services/utils), integration tests (server actions/route
  handlers), E2E (Playwright) for the four core flows, accessibility tests.
- Manual QA matrix across breakpoints (375 / 768 / 1024 / 1440 / 1920px).
- CI on GitHub → Vercel preview → production pipeline (TRD §27).
- Logging (app/error/API/auth/order) and error monitoring.
- Definition of Done checklist (TRD §31) signed off.

**Deliverable:** Production launch on Vercel.

---

## Phase 11 — Payments Phase 2 & Future Enhancements

**Goal:** Post-launch growth items (explicitly "future" in the specs).

- **Payments Phase 2:** JazzCash, Easypaisa, Stripe, PayPal — integrate against
  the existing Payment model/provider field.
- Tax calculation, warehouse management, 360° product imaging.
- **AI features:** Power-requirement calculator, generator recommendation,
  live-chat assistant, AI quote assistant.
- Roadmap (TRD §29): multi-language, multi-currency, dealer/customer portals,
  ERP/CRM integration, inventory sync, PWA, React Native app.

**Deliverable:** Incremental releases after MVP.

---

## Dependency Map (quick reference)

```
P0 Foundation
  └─ P1 Database ─ P2 Auth/RBAC ─ P3 Design System
                                      └─ P4 Catalog
                                            └─ P5 Cart/Checkout/Orders
                                                  └─ P6 Quote/Rental/Service
                                                        └─ P7 Admin/CMS
                                                              └─ P8 Content/Home
                                                                    └─ P9 SEO/Perf/A11y
                                                                          └─ P10 Test/Launch
                                                                                └─ P11 Payments-2/AI
```

## MVP cut line

A lean first launch = **Phases 0–5 + 7 (partial) + 8 (homepage) + 9–10**:
catalog, cart/checkout with manual payments, basic admin, homepage, hardening.
Quote/Rental/Service (P6) can ship in the same wave since they are high-value
B2B leads and relatively low-complexity forms — recommend including P6 in MVP.

1. why the movment is very slow like from when i click on button like products on admin panel why i ttakes a lot of time, fix it
1. Use a loader on whole website if it takes time

1. On admin panel when i click on Home Page I get this

## Error Type

Runtime Error

## Error Message

Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.
<... checked={true} action={function action} label=...>
^^^^^^^^^^^^^^^^^
at stringify (<anonymous>:1:18)
at stringify (<anonymous>:1:18)
at <anonymous> (src\features\admin\components\data-table.tsx:53:17)
at Array.map (<anonymous>:1:18)
at <anonymous> (src\features\admin\components\data-table.tsx:52:24)
at Array.map (<anonymous>:1:18)
at DataTable (src\features\admin\components\data-table.tsx:50:17)
at HomepageAdminPage (src\app\admin\homepage\page.tsx:83:7)

## Code Frame

51 | <TableRow key={getKey(row)}>
52 | {columns.map((col, i) => (

> 53 | <TableCell key={i} className={cn(col.className)}>
> | ^
> 54 | {col.cell(row)}
> 55 | </TableCell>
> 56 | ))}
> Next.js version: 16.2.9 (Turbopack)

4. remove the category section and make it manage all deapartment, category and sub categpry form navigation on admin panel, Also make dynamic nav links from admin panel
   a
