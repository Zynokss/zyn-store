# Graph Report - zyn-store  (2026-08-19)

## Corpus Check
- 7 files · ~27,945 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 312 nodes · 467 edges · 26 communities (18 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Backend API & Auth
- Storefront Catalog & Cart
- Account & Checkout Pages
- Dev Dependencies & Docs
- TypeScript Config
- Runtime Dependencies
- App Layout & Providers
- Package Scripts
- Database Seed Script
- CORS Proxy Config
- ESLint Config
- Next.js Config
- PostCSS Config
- Public Icon Asset
- Public Icon Asset
- Public Icon Asset
- Public Icon Asset
- Public Icon Asset

## God Nodes (most connected - your core abstractions)
1. `useLanguage()` - 17 edges
2. `compilerOptions` - 16 edges
3. `Product` - 14 edges
4. `useCart()` - 13 edges
5. `prisma` - 13 edges
6. `ZYNSTORE` - 10 edges
7. `verifyAdminSession()` - 10 edges
8. `verifyUserSession()` - 9 edges
9. `ProductCard()` - 7 edges
10. `include` - 7 edges

## Surprising Connections (you probably didn't know these)
- `ZYNSTORE` --references--> `tailwindcss`  [EXTRACTED]
  README.md → package.json
- `ZYNSTORE` --references--> `typescript`  [EXTRACTED]
  README.md → package.json
- `ZYNSTORE` --references--> `lucide-react`  [EXTRACTED]
  README.md → package.json
- `ContactPage()` --calls--> `useLanguage()`  [EXTRACTED]
  app/contact/page.tsx → components/providers/IntlProvider.tsx
- `TrackOrderPage()` --calls--> `useLanguage()`  [EXTRACTED]
  app/track-order/page.tsx → components/providers/IntlProvider.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **ZYNSTORE Tech Stack** — readme_nextjs, readme_supabase_js, readme_nextauth, readme_vercel [EXTRACTED 1.00]

## Communities (26 total, 8 thin omitted)

### Community 0 - "Backend API & Auth"
Cohesion: 0.06
Nodes (36): GET(), GET, POST, CartItem, POST(), dynamic, GET(), OrderItemInput (+28 more)

### Community 1 - "Storefront Catalog & Cart"
Cohesion: 0.08
Nodes (35): CatalogGridContent(), fetchProducts(), CatalogProductExt, COLOR_HEX_MAP, FilterSectionProps, parsePrice(), ProductColor, ProductColorObject (+27 more)

### Community 2 - "Account & Checkout Pages"
Cohesion: 0.08
Nodes (26): AccountPage(), CIH_ACCOUNT_DETAILS, MOROCCAN_CITIES, Order, OrderItem, MOROCCAN_CITIES, SettingsPage(), BankDetails (+18 more)

### Community 3 - "Dev Dependencies & Docs"
Cohesion: 0.06
Nodes (37): dotenv, eslint, eslint-config-next, lucide-react, lucide-react, devDependencies, dotenv, eslint (+29 more)

### Community 4 - "TypeScript Config"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 5 - "Runtime Dependencies"
Cohesion: 0.07
Nodes (27): bcryptjs, better-auth, clsx, next, next-intl, dependencies, bcryptjs, better-auth (+19 more)

### Community 6 - "App Layout & Providers"
Cohesion: 0.14
Nodes (13): inter, metadata, viewport, AuthProvider(), BFCacheFix(), IntlProvider, applyTheme(), Theme (+5 more)

### Community 7 - "Package Scripts"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, start, version

### Community 8 - "Database Seed Script"
Cohesion: 0.28
Nodes (8): ADJECTIVES, CATEGORIES, getRandomElement(), getRandomPrice(), IMAGE_POOL, ITEM_TYPES, main(), prisma

### Community 9 - "CORS Proxy Config"
Cohesion: 0.50
Nodes (4): ALLOWED_ORIGINS, config, isOriginAllowed(), proxy()

## Knowledge Gaps
- **127 isolated node(s):** `CartItem`, `OrderItemInput`, `OrderRecord`, `ValidStatus`, `RawProduct` (+122 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Runtime Dependencies` to `Dev Dependencies & Docs`, `Package Scripts`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Dev Dependencies & Docs` to `Package Scripts`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **What connects `CartItem`, `OrderItemInput`, `OrderRecord` to the rest of the system?**
  _127 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Backend API & Auth` be split into smaller, more focused modules?**
  _Cohesion score 0.06203007518796992 - nodes in this community are weakly interconnected._
- **Should `Storefront Catalog & Cart` be split into smaller, more focused modules?**
  _Cohesion score 0.07922077922077922 - nodes in this community are weakly interconnected._
- **Should `Account & Checkout Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.08097165991902834 - nodes in this community are weakly interconnected._
- **Should `Dev Dependencies & Docs` be split into smaller, more focused modules?**
  _Cohesion score 0.06006006006006006 - nodes in this community are weakly interconnected._