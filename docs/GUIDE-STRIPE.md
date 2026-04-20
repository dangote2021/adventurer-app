# Guide Stripe — Adventurer

Objectif : activer les paiements coaching + marketplace + ambassadeurs en moins d'1 heure.

---

## 1. Créer le compte Stripe (5 min)

1. Va sur https://dashboard.stripe.com/register
2. Crée le compte avec adventurer.app.outdoor@gmail.com
3. Nom de l'entreprise : **Adventurer**
4. Pays : **France**
5. Type d'activité : **Software / SaaS** (sous-catégorie "Services en ligne")
6. Passe en mode **Live** une fois le KYC terminé (attention, tout commence en mode test).

---

## 2. Récupérer les clés API (2 min)

Dans le dashboard Stripe :

1. Clique sur **Developers → API keys** (ou https://dashboard.stripe.com/apikeys)
2. Copie :
   - **Publishable key** (commence par `pk_live_…` ou `pk_test_…`) — pas utilisée côté Adventurer pour le moment, mais à garder sous le coude.
   - **Secret key** (commence par `sk_live_…` ou `sk_test_…`) — **à ajouter dans Vercel**.

### Variables Vercel à ajouter

| Nom | Valeur | Environnements |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_...` ou `sk_test_...` | Production, Preview |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (voir étape 3) | Production, Preview |
| `STRIPE_PLATFORM_FEE_BPS` | `1000` (= 10 %) | Production, Preview |

> Settings → Environment Variables sur Vercel. Cocher les 3 environnements.

---

## 3. Configurer le webhook (3 min)

1. Dashboard Stripe → **Developers → Webhooks** → **Add endpoint**
2. URL : `https://adventurer-outdoor.vercel.app/api/stripe/webhook`
3. Sélectionner les événements :
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `account.updated` (pour Stripe Connect)
   - `payout.paid` (optionnel, pour tracker les versements aux ambassadeurs)
4. **Copier le "Signing secret"** (`whsec_...`) → le coller dans `STRIPE_WEBHOOK_SECRET` sur Vercel.
5. Redeploy depuis Vercel pour que la variable soit prise en compte.

---

## 4. Activer Stripe Connect (indispensable ambassadeurs + marketplace) — 10 min

1. Dashboard → **Settings → Connect settings** (ou https://dashboard.stripe.com/settings/connect)
2. Cliquer sur **Get started with Connect**
3. Choisir **Platform or marketplace**
4. Sélectionner **Express** (onboarding simplifié, KYC géré par Stripe)
5. Configurer :
   - Logo de la plateforme : logo Adventurer
   - Nom affiché : **Adventurer**
   - Couleur primaire : `#1B4332`
   - URL de support : `https://adventurer-outdoor.vercel.app`
   - Brand color : vert Adventurer
6. Dans **Capabilities**, activer :
   - `transfers` (pour verser aux ambassadeurs / coachs)
   - `card_payments` (pour que les coachs reçoivent des paiements via destination charges)

---

## 5. Test du flux complet (5 min)

### Test ambassadeur
1. Ouvre `/ambassadors` → soumets une candidature.
2. Une fois approuvé dans le dashboard admin, l'ambassadeur reçoit un mail avec son lien Stripe Connect Express.
3. Il clique, renseigne ses infos, revient sur Adventurer : son `stripe_account_id` est stocké.

### Test coaching
1. `/coach/[id]` → **Réserver**.
2. Paiement test : `4242 4242 4242 4242`, date future, CVC 123.
3. Vérifier dans Stripe :
   - Payment reçu
   - `application_fee_amount` appliqué (10 %)
   - Transfer automatique vers le coach

### Test marketplace
Idem avec `/marketplace/[id]`.

---

## 6. Checklist Go-Live

- [ ] Clés `sk_live_...` ajoutées sur Vercel Production
- [ ] Webhook en mode live avec `whsec_...` live
- [ ] Connect activé en mode live
- [ ] Compte KYC validé par Stripe (peut prendre 24-72h)
- [ ] Premier paiement test en live de 1 € (à rembourser ensuite)
- [ ] Mentions légales publiques (fait : `/legal/mentions`)
- [ ] CGU publiques (fait : `/legal/terms`)
- [ ] Politique de confidentialité publique (fait : `/legal/privacy`)

---

## 7. Commissions

- Coaching : 10 % de commission plateforme (`STRIPE_PLATFORM_FEE_BPS=1000`).
- Marketplace : 10 % également.
- Ambassadeurs : 5 € fixes par inscription confirmée, versés via Stripe transfers quand le compte Connect est prêt.

Pour ajuster les taux, modifier `STRIPE_PLATFORM_FEE_BPS` (basis points, 1000 = 10 %, 500 = 5 %).

---

## 8. Débogage

| Symptôme | Cause probable | Fix |
|---|---|---|
| Webhook signature invalid | `STRIPE_WEBHOOK_SECRET` pas synchro avec l'endpoint | Copier à nouveau le secret, redeploy |
| 401 sur `/api/stripe/*` | `STRIPE_SECRET_KEY` manquante | Vérifier Environment Variables sur Vercel |
| Transfer bloqué | Compte Connect non vérifié | L'ambassadeur doit finir son KYC Express |
| Paiement test ne passe pas | Tu es en mode live avec carte test | Utiliser la clé `sk_test_...` en preview, ou une vraie carte en live |

---

Contact support Stripe : https://support.stripe.com
