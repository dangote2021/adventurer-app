# 🚀 Déploiement — Ce qui est prêt à partir

## Ce qui a été ajouté dans ce sprint

1. **Dashboard admin** : `/admin` (protégé par `ADMIN_TOKEN`)
   - Route API : `/api/admin/stats`
   - Vue des ambassadeurs + waitlist + revenus plateforme
   - Stats agrégées par statut et par feature

2. **Pages légales** (requises pour Stripe KYC + conformité RGPD)
   - `/legal/privacy` — Politique de confidentialité
   - `/legal/terms` — CGU
   - `/legal/mentions` — Mentions légales
   - Liens ajoutés dans le footer de `/ambassadors`

3. **Helper DMs Instagram** (pour contacter les 20 ambassadeurs cibles)
   - `/dm-ambassadeurs.html` — 20 messages prêts à copier/coller

4. **Documentation**
   - `docs/GUIDE-STRIPE.md` — setup Stripe complet
   - `docs/GUIDE-RESEND.md` — setup Resend + DNS
   - `docs/ENV-VARS.md` — toutes les variables Vercel

---

## ⚠️ Avant de déployer : ajouter `ADMIN_TOKEN`

Sur Vercel → Settings → Environment Variables, ajouter :

| Nom | Valeur |
|---|---|
| `ADMIN_TOKEN` | une chaîne longue aléatoire (voir ci-dessous) |

Pour générer la valeur, dans n'importe quel terminal :

```bash
openssl rand -hex 32
```

Ou en ligne : https://generate-secret.vercel.app/32

→ **Garder cette valeur au chaud** : c'est ton mot de passe pour `/admin`.

---

## Déployer

Double-clique sur `deploy.bat` (Windows) ou exécute `bash deploy.sh` (Mac/Linux).

Le script va :
1. Vérifier Node.js
2. `npm install`
3. `npm run build` (catch les erreurs avant le deploy)
4. `vercel --prod` → déploiement live

---

## Après déploiement : tester

1. ✅ `https://adventurer-outdoor.vercel.app/` → app charge
2. ✅ `https://adventurer-outdoor.vercel.app/ambassadors` → formulaire OK (texte lisible sur les inputs)
3. ✅ `https://adventurer-outdoor.vercel.app/legal/privacy` → page lisible
4. ✅ `https://adventurer-outdoor.vercel.app/admin` → écran de login avec token
5. ✅ Colle le `ADMIN_TOKEN` → tu vois le dashboard

Si une candidature ambassadeur a été soumise, tu la verras dans l'onglet "Ambassadeurs".

---

## Ensuite (ordre recommandé)

1. **Stripe** : suis `docs/GUIDE-STRIPE.md` (compte + clés + webhook + Connect) — 30 min
2. **Resend** : suis `docs/GUIDE-RESEND.md` (clé + domaine + DNS) — 20 min + propagation DNS
3. **Ambassadeurs** : ouvre `https://adventurer-outdoor.vercel.app/dm-ambassadeurs.html`, copie/colle les DMs, envoie-les 5/jour pour rester sous le radar Instagram

---

## En cas de souci

- Vérifie les **build logs** : Vercel → Deployments → dernier deploy → Build logs
- Vérifie les **runtime logs** : même endroit → Functions
- Si `/admin` renvoie 503 : `ADMIN_TOKEN` pas configuré sur Vercel
- Si `/admin` renvoie 401 : tu n'as pas le bon token
