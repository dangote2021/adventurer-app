# Variables d'environnement Vercel — Adventurer

Toutes les variables à configurer sur Vercel (Settings → Environment Variables).

---

## ✅ Déjà configurées (Production)

| Variable | Valeur | Source |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://avldyvgvouzpeprygvyw.supabase.co` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` (anon JWT) | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` (service_role JWT) | Supabase → Project Settings → API |

---

## 🔐 À ajouter — Admin Dashboard

| Variable | Valeur | Explication |
|---|---|---|
| `ADMIN_TOKEN` | **une chaîne aléatoire longue** (ex: `openssl rand -hex 32`) | Protège `/admin` et `/api/admin/stats` |

**Pour générer le token :**
```bash
# sur Mac/Linux
openssl rand -hex 32
# ou en ligne : https://generate-secret.vercel.app/32
```

Garder ce token secret — quiconque l'a peut voir toutes les données admin.

**Utilisation :** va sur `https://adventurer-outdoor.vercel.app/admin`, colle le token.

---

## 💳 À ajouter — Stripe (voir `GUIDE-STRIPE.md`)

| Variable | Valeur | Env |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_...` ou `sk_live_...` | Production + Preview |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Production + Preview |
| `STRIPE_PLATFORM_FEE_BPS` | `1000` (= 10 %) | Production + Preview |

---

## 📧 À ajouter — Resend (voir `GUIDE-RESEND.md`)

| Variable | Valeur | Env |
|---|---|---|
| `RESEND_API_KEY` | `re_...` | Production + Preview |
| `RESEND_FROM_EMAIL` | `hello@adventurer-outdoor.com` | Production + Preview |

---

## 🧭 Optionnelles

| Variable | Valeur | Usage |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://adventurer-outdoor.vercel.app` | URL publique pour emails & redirections |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Coach IA (à activer quand prêt) |
| `MAPBOX_TOKEN` | `pk.eyJ...` | Cartographie (quand feature active) |

---

## 🔄 Après chaque ajout

1. Sauvegarder la variable sur Vercel.
2. **Redeploy** (Deployments → dernier deploy → `···` → Redeploy).
3. Vérifier avec `/admin` ou un test route que tout fonctionne.

---

## ⚠️ Sécurité

- **JAMAIS** commit `.env.local` dans Git (déjà dans `.gitignore`).
- **JAMAIS** coller un secret Stripe ou Service Role key sur Slack, Trello, Notion public…
- Rotation recommandée des secrets tous les 6 mois.
- Si une clé fuit : révoquer immédiatement dans le dashboard du service concerné et générer une nouvelle.
