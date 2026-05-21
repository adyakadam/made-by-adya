# Deploy Made by Adya

From zero to live in ~20 minutes. You need accounts on: **Supabase**, **Stripe**, **Vercel**.

---

## 1. Supabase (database)

1. Go to [app.supabase.com](https://app.supabase.com) → New project
2. Choose a name (e.g. `made-by-adya`) and a strong database password → Create
3. Wait for the project to boot (~1 min)
4. **SQL Editor → New Query** → paste the entire contents of `supabase/schema.sql` → **Run**
5. Go to **Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`  ⚠️ Keep secret — never expose client-side

---

## 2. Stripe (payments)

### Test mode first
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) → API Keys
2. Copy **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Copy **Secret key** → `STRIPE_SECRET_KEY`

### Webhook (needed for orders to save)
After deploying to Vercel you'll have a URL. Then:
1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. URL: `https://your-app.vercel.app/api/webhooks/stripe`
3. Events: select `checkout.session.completed`
4. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

> For local testing: install [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:
> ```bash
> stripe listen --forward-to localhost:3000/api/webhooks/stripe
> ```
> It will print a local `STRIPE_WEBHOOK_SECRET` to use in `.env.local`.

---

## 3. Local development

```bash
# Copy the env template
cp .env.local.example .env.local
# Fill in all values, then:
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin) — use the password you set in `ADMIN_PASSWORD`.

---

## 4. Deploy to Vercel

```bash
npm install -g vercel   # if not already installed
vercel                  # follow prompts, link to a new project
```

Or push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new).

**Add environment variables** in Vercel → Project → Settings → Environment Variables:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | From Stripe |
| `STRIPE_SECRET_KEY` | From Stripe |
| `STRIPE_WEBHOOK_SECRET` | From Stripe (after step 2) |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` |
| `ADMIN_PASSWORD` | Pick a strong password |

Then **redeploy**. Your site is live!

---

## 5. Go live with Stripe

When you're ready to accept real money:
1. Stripe Dashboard → toggle **Test/Live** → get Live API keys
2. Update `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` in Vercel env
3. Create a new Live webhook with the same settings
4. Update `STRIPE_WEBHOOK_SECRET` with the live signing secret
5. Redeploy

---

## How payments work

```
Customer → Cart → Checkout form (shipping) → POST /api/checkout
  → Stripe Checkout Session created
  → Customer redirected to stripe.com to pay
  → On success → /order/success (cart cleared)
  → Stripe sends webhook → POST /api/webhooks/stripe
    → Order saved to Supabase
    → Product stock decremented
```

---

## Admin panel

- URL: `/admin`
- Password: `ADMIN_PASSWORD` env var
- Features: view orders, update status + tracking, add/edit products

---

## Custom domain (optional)

Vercel → Project → Settings → Domains → Add your domain → follow DNS instructions.
