# Guide de configuration des services tiers - Adventurer V5

> **Compte principal :** adventurer.app.outdoor@gmail.com
> **Temps total estime :** ~40 minutes
> **Date :** 19 avril 2026

---

## Ordre recommande

| Priorite | Service | Temps | Cout |
|----------|---------|-------|------|
| 1 | Seed data Supabase | 5 min | Gratuit |
| 2 | Resend (emails) | 10 min | Gratuit (3 000 emails/mois) |
| 3 | Coach IA / Anthropic | 5 min | Pay-as-you-go |
| 4 | Stripe (paiements) | 20 min | Gratuit (commission par transaction) |

---

## 1. Resend (Emails transactionnels) -- 10 min

Resend gere l'envoi des emails transactionnels : confirmation d'inscription, notifications, reset de mot de passe, etc.

### Etapes

1. Aller sur **https://resend.com/signup**
2. Creer un compte avec `adventurer.app.outdoor@gmail.com`
3. Choisir le **Free plan** (3 000 emails/mois -- largement suffisant pour demarrer)
4. Une fois connecte, aller dans **API Keys** (menu lateral)
5. Cliquer sur **Create API Key**
   - Name : `adventurer-production`
   - Permission : **Full access**
6. **Copier la cle immediatement** (format `re_...`) -- elle ne sera plus affichee apres
7. Aller sur le **dashboard Vercel** :
   - https://vercel.com → projet `adventurer-outdoor`
   - **Settings** → **Environment Variables**
8. Ajouter les variables suivantes :

   | Variable | Valeur | Environnements |
   |----------|--------|----------------|
   | `RESEND_API_KEY` | `re_...` (la cle copiee) | Production + Preview |
   | `RESEND_FROM` | `Adventurer <adventurer.app.outdoor@gmail.com>` | Production + Preview |

9. Cliquer **Save** pour chaque variable
10. **Redeployer** le projet pour que les variables soient prises en compte

### Note importante

Les emails seront envoyes depuis `onboarding@resend.dev` tant qu'un domaine personnalise n'est pas verifie. Pour la production, il est recommande d'ajouter un domaine custom plus tard (`adventurer-outdoor.com`) via **Resend → Domains → Add Domain** pour ameliorer la delivrabilite et le branding.

---

## 2. Stripe (Paiements) -- 20 min

Stripe gere les paiements : abonnements premium, achats marketplace, paiements coaches.

### Etapes

1. Aller sur **https://dashboard.stripe.com/register**
2. Creer un compte avec `adventurer.app.outdoor@gmail.com`
3. Remplir les informations :
   - **Nom de l'entreprise :** Adventurer
   - **Pays :** France
   - **Type d'activite :** Software / SaaS
4. **Completer la verification KYC** (piece d'identite, adresse, coordonnees bancaires)
   - Cette etape peut prendre quelques minutes a quelques jours selon la verification
5. Une fois valide, aller dans **Developers** → **API Keys**
6. Copier les deux cles :
   - **Publishable key** : `pk_live_...`
   - **Secret key** : `sk_live_...` (cliquer sur "Reveal live key")
7. Aller sur le **dashboard Vercel** → projet `adventurer-outdoor` → **Settings** → **Environment Variables**
8. Ajouter les variables :

   | Variable | Valeur | Environnements |
   |----------|--------|----------------|
   | `STRIPE_SECRET_KEY` | `sk_live_...` | Production + Preview |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Production + Preview |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_...` (voir etape suivante) | Production + Preview |

9. **Creer le Webhook :**
   - Dans Stripe : **Developers** → **Webhooks** → **Add endpoint**
   - **URL du endpoint :** `https://adventurer-outdoor.vercel.app/api/stripe/webhook`
   - **Evenements a ecouter :** cocher les suivants :
     - `checkout.session.completed`
     - `account.updated`
   - Cliquer **Add endpoint**
   - Sur la page du webhook cree, copier le **Signing secret** (`whsec_...`)
   - Ajouter ce secret dans Vercel en tant que `STRIPE_WEBHOOK_SECRET`

10. **Redeployer** le projet sur Vercel

### Note importante

**Commencer en mode TEST !** Utiliser les cles de test (`pk_test_...`, `sk_test_...`) pour verifier que tout fonctionne avant de passer en live. En mode test, aucun vrai paiement n'est effectue. Carte de test : `4242 4242 4242 4242`, date future quelconque, CVC quelconque.

---

## 3. Coach IA (Claude API / Anthropic) -- 5 min

Le Coach IA utilise l'API Claude d'Anthropic pour generer des plans d'entrainement personnalises.

### Etapes

1. Aller sur **https://console.anthropic.com**
2. Creer un compte avec `adventurer.app.outdoor@gmail.com` (ou utiliser un compte existant)
3. Ajouter un moyen de paiement (facturation a l'usage)
4. Aller dans **API Keys** → **Create Key**
   - Donner un nom : `adventurer-production`
5. **Copier la cle** (format `sk-ant-...`) -- elle ne sera plus affichee apres
6. Aller sur le **dashboard Vercel** → projet `adventurer-outdoor` → **Settings** → **Environment Variables**
7. Ajouter la variable :

   | Variable | Valeur | Environnements |
   |----------|--------|----------------|
   | `ANTHROPIC_API_KEY` | `sk-ant-...` | Production + Preview |

8. **Redeployer** le projet

### Note

L'endpoint `/api/coach/ai` dispose deja de plans d'entrainement de secours (fallback) si la cle API est absente. Cependant, les plans generes par l'IA sont nettement plus personnalises et de meilleure qualite. La configuration de cette cle est donc fortement recommandee.

---

## 4. Seed Data Supabase -- 5 min

Le fichier seed insere les donnees de demonstration : spots outdoor, evenements, coaches et articles marketplace.

### Etapes

1. Aller sur **https://supabase.com/dashboard/project/avldyvgvouzpeprygvyw**
2. Se connecter avec le compte Supabase du projet
3. Dans le menu lateral, cliquer sur **SQL Editor**
4. Depuis le code source du projet, ouvrir le fichier :
   ```
   supabase/seed.sql
   ```
5. **Copier l'integralite du contenu** du fichier
6. **Coller** dans l'editeur SQL de Supabase
7. Cliquer sur **Run** (ou `Ctrl+Enter`)
8. Verifier que l'execution se termine sans erreur

### Donnees inserees

| Type | Quantite | Description |
|------|----------|-------------|
| Spots outdoor | 32 | Spots reels (kitesurf, trail, plongee, escalade...) |
| Evenements | 10 | Evenements communautaires a venir |
| Coaches | 8 | Profils de coaches certifies |
| Articles marketplace | 15 | Materiel d'occasion en vente |

---

## 5. Variables d'environnement Vercel -- Recapitulatif

Dashboard : https://vercel.com → projet `adventurer-outdoor` → **Settings** → **Environment Variables**

| Variable | Valeur | Statut |
|----------|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://avldyvgvouzpeprygvyw.supabase.co` | Deja configure |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Deja configure |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Deja configure |
| `ADMIN_TOKEN` | (votre token admin) | Deja configure |
| `NEXT_PUBLIC_APP_URL` | `https://adventurer-outdoor.vercel.app` | Deja configure |
| `RESEND_API_KEY` | `re_...` | A configurer |
| `RESEND_FROM` | `Adventurer <adventurer.app.outdoor@gmail.com>` | A configurer |
| `STRIPE_SECRET_KEY` | `sk_live_...` | A configurer |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | A configurer |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | A configurer |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | A configurer |

### Verification

Apres avoir ajoute toutes les variables, **redeployer** le projet :
- Vercel → projet `adventurer-outdoor` → **Deployments** → cliquer sur les 3 points du dernier deploiement → **Redeploy**

---

## 6. Ordre recommande d'activation

```
Etape 1 ──→ Seed data Supabase
             (immediat, gratuit, donne du contenu visible)
             
Etape 2 ──→ Resend
             (gratuit, active les emails transactionnels)
             
Etape 3 ──→ Coach IA / Anthropic
             (active le coaching IA personnalise)
             
Etape 4 ──→ Stripe
             (active les paiements — en dernier car necessite la verification KYC)
```

### Pourquoi cet ordre ?

- **Supabase seed** en premier : ca ne coute rien et l'app aura immediatement du contenu a afficher (spots, coaches, evenements).
- **Resend** en deuxieme : gratuit, rapide a configurer, et les emails sont critiques pour l'experience utilisateur (confirmation de compte, notifications).
- **Anthropic** en troisieme : le coaching IA est une feature differenciante, et la configuration ne prend que 5 minutes.
- **Stripe** en dernier : la verification KYC peut prendre du temps, et les paiements ne sont pas critiques tant que l'app n'a pas d'utilisateurs payants. Commencer en mode test.

---

> **Temps total :** ~40 minutes (hors delai de verification KYC Stripe)
> **Cout total :** 0 EUR pour demarrer (Resend gratuit, Stripe gratuit hors commissions, Anthropic pay-as-you-go)
