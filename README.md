# Real Estate Admin Panel — AI-Powered Real Estate Marketplace

Admin panel only (no public site). Next.js App Router, pure `.jsx`, Redux Toolkit,
react-hook-form + yup, react-hot-toast, framer-motion, Tailwind CSS, lucide-react, recharts.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000 — it redirects to `/admin/dashboard`.

## What's built (Step 1)

- Folder structure exactly as specified (`app/admin/*`, `components/{layout,ui,providers}`, `redux/slices`, `hooks`, `utils`, `lib`)
- Redux store wired with a slice per module: `ui`, `notifications`, `dashboard`, and
  `listings / users / leads / payments / builders / reviews / cms / settings / township`
  (the last 9 share a `createListSlice` factory: `items`, `filters`, `selectedId`, `loading`, `error`)
- Sidebar (collapsible, active-route highlight, framer-motion) + mobile slide-in drawer
- Topbar: search bar, notification bell (dropdown, unread badge, toast on click, mark-all-read),
  dark mode toggle (persisted), admin profile dropdown
- Reusable UI kit in `components/ui`: `Button`, `Badge`, `Card`, `StatCard`, `Modal`,
  `Table` (sortable + searchable + paginated + skeleton/empty/error states), `Skeleton`,
  `EmptyState`, `ErrorState`
- Dashboard page: 6 KPI `StatCard`s pulling live from the `dashboard` Redux slice, plus
  placeholders for the two charts and the pending-approvals table
- Every other module route (`listings`, `users`, `leads`, `payments`, `builders`, `reviews`,
  `reports`, `cms`, `settings`, `township`) renders a `ComingSoon` panel listing that module's
  planned features, so the whole nav is clickable and the app never 404s

## Theme

Dark charcoal sidebar (`sidebar.*` in `tailwind.config.js`) + white/light content area,
deep red primary accent (`primary.*`, 600/700 = `#dc2626` / `#b91c1c`), rounded-2xl cards,
soft shadows, Inter font, dark mode via the `dark` class strategy.

## Next steps (module-by-module, as requested)

Dashboard (full charts + table) → Listings → Users → Leads → Payments → Builders →
Reviews → Reports → CMS → Township → Settings.
