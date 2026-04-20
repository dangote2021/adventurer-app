# Guide Resend — Adventurer

Resend = service d'envoi d'emails transactionnels (confirmation candidature ambassadeur, notifications coaching, etc.). ~10 min à configurer.

---

## 1. Créer le compte (2 min)

1. Va sur https://resend.com/signup
2. Crée le compte avec adventurer.app.outdoor@gmail.com
3. Plan **Free** suffisant pour démarrer (3 000 emails/mois, 100/jour).

---

## 2. Récupérer la clé API (1 min)

1. Dashboard Resend → **API Keys** (https://resend.com/api-keys)
2. **Create API Key** → nom : `adventurer-production` → permission : **Full access** (ou Sending only)
3. Copier la clé `re_...` (elle ne sera plus visible ensuite).

### Variable Vercel à ajouter

| Nom | Valeur | Environnements |
|---|---|---|
| `RESEND_API_KEY` | `re_...` | Production, Preview |
| `RESEND_FROM_EMAIL` | `hello@adventurer-outdoor.com` (une fois domaine vérifié) | Production, Preview |

---

## 3. Vérifier un domaine (5 min + propagation DNS ~15 min)

> Tant que le domaine n'est pas vérifié, Resend te limite à envoyer **uniquement** depuis `onboarding@resend.dev` et seulement vers l'email du compte. C'est OK pour les tests, pas pour la prod.

### Étapes

1. Dashboard Resend → **Domains** → **Add Domain**
2. Saisir : `adventurer-outdoor.com` (ou le domaine que tu comptes utiliser)
3. Resend affiche 3 enregistrements DNS à ajouter chez ton registrar (OVH, Gandi, Namecheap…) :
   - **MX** : `feedback-smtp.eu-west-1.amazonses.com` (priorité 10)
   - **TXT SPF** : `v=spf1 include:amazonses.com ~all`
   - **TXT DKIM** : `resend._domainkey` → longue chaîne fournie par Resend
4. Ajouter aussi (recommandé) :
   - **TXT DMARC** : `v=DMARC1; p=none;` (à durcir en `p=quarantine` puis `p=reject` après 2 semaines sans problème)
5. Dans Resend, cliquer **Verify DNS records**. Attendre que les 3 lignes soient `Verified` (vert).

### Avec le domaine Vercel

Si tu utilises `adventurer-outdoor.vercel.app` sans domaine custom, tu **ne peux pas** envoyer depuis ce domaine via Resend. Deux options :

- **Option A (recommandée)** : acheter un domaine custom (ex: `adventurer-outdoor.com` ~12 €/an chez OVH) et le pointer à la fois vers Vercel (CNAME/A) et Resend (DKIM/SPF).
- **Option B (tempo)** : utiliser `onboarding@resend.dev` pour les tests et limiter les envois à ton propre email.

---

## 4. Tester l'envoi (2 min)

Une fois `RESEND_API_KEY` en place sur Vercel :

```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer re_..." \
  -H "Content-Type: application/json" \
  -d '{
    "from": "hello@adventurer-outdoor.com",
    "to": "adventurer.app.outdoor@gmail.com",
    "subject": "Test Adventurer",
    "html": "<p>Ça marche !</p>"
  }'
```

Réponse attendue : `{ "id": "..." }` → check ta boîte.

---

## 5. Emails transactionnels Adventurer

| Trigger | Template | À qui |
|---|---|---|
| Candidature ambassadeur soumise | `emails/ambassador-application.tsx` | Candidat + guillaume@ (copie) |
| Candidature approuvée | `emails/ambassador-approved.tsx` | Ambassadeur |
| Lien Stripe Connect | `emails/stripe-onboard.tsx` | Ambassadeur |
| Réservation coaching confirmée | `emails/coach-booking.tsx` | Client + coach |
| Paiement marketplace reçu | `emails/marketplace-receipt.tsx` | Acheteur + vendeur |

> À implémenter dans `src/lib/email.ts` puis appeler depuis les routes concernées.

---

## 6. Checklist Go-Live

- [ ] Domaine custom acheté et pointé vers Vercel
- [ ] DNS Resend (SPF + DKIM + MX) vérifiés
- [ ] DMARC en `p=none` posé
- [ ] `RESEND_API_KEY` en Vercel Production
- [ ] `RESEND_FROM_EMAIL=hello@adventurer-outdoor.com` en Vercel
- [ ] Test d'envoi réel effectué
- [ ] Templates principaux câblés sur les routes (ambassadeur, coaching, marketplace)

---

## 7. Dépannage

| Symptôme | Fix |
|---|---|
| `Domain not verified` | Attendre la propagation DNS (dig sur les enregistrements), vérifier la casse |
| `From address not allowed` | Le `from` doit utiliser le domaine vérifié, pas gmail ou autre |
| Emails en spam | Ajouter DMARC, vérifier l'adresse IP de réception, éviter les mots trigger dans l'objet |
| Rate limit | Plan Free = 100/jour. Passer à **Pro** (20 €/mois, 50k emails) quand tu scales |

Contact Resend : https://resend.com/support
