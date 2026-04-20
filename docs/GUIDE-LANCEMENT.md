# Guide de lancement -- Adventurer V5

> Document pratique pour Guillaume -- 19 avril 2026
> Tout est ecrit etape par etape. Aucune connaissance technique prealable requise.

---

## Ce qui est PRET (peut aller en production tel quel)

Tout ce qui suit fonctionne deja sur https://adventurer-outdoor.vercel.app :

- **App deployee sur Vercel** -- le site est en ligne et accessible au public
- **Auth Google OAuth** -- les utilisateurs peuvent se connecter avec leur compte Google
- **5 pages principales fonctionnelles** -- Accueil, Explorer, Map, Marketplace, Profil
- **8 coachs pilotes avec profils detailles** -- fiches coach, specialites, tarifs, formulaire de reservation
- **Coach IA** (si cle API Anthropic configuree) -- generation de plans d'entrainement personnalises
- **Marketplace avec 15 articles** -- annonces d'equipement d'occasion avec photos, prix, contact
- **31 spots outdoor France** -- lieux reels avec coordonnees GPS, affiches sur la carte
- **10 evenements et defis communautaires** -- calendrier d'activites outdoor
- **Pages legales** (mentions legales, CGU, politique de confidentialite) -- conformes RGPD
- **Securite** -- Next.js a jour, headers de securite, auth guards sur toutes les API

---

## A configurer avant le lancement (15 min par service)

### 1. Stripe (paiements)

Stripe permet de recevoir les paiements des reservations coach et des transactions marketplace.

> Voir le guide detaille : [docs/GUIDE-STRIPE.md](./GUIDE-STRIPE.md)

**Resume rapide :**
1. Creer un compte sur https://stripe.com
2. Recuperer la cle publique (pk_live_...) et la cle secrete (sk_live_...)
3. Ajouter ces cles dans Vercel (voir section "Ajouter une variable Vercel" ci-dessous)
4. Configurer le webhook Stripe pour pointer vers `https://adventurer-outdoor.vercel.app/api/stripe/webhook`

### 2. Resend (emails transactionnels)

Resend envoie les emails de confirmation de reservation, de bienvenue, etc.

> Voir le guide detaille : [docs/GUIDE-RESEND.md](./GUIDE-RESEND.md)

**Resume rapide :**
1. Creer un compte sur https://resend.com
2. Verifier le domaine (ou utiliser le domaine par defaut pour tester)
3. Recuperer la cle API
4. Ajouter la variable `RESEND_API_KEY` dans Vercel

### 3. Cle API Anthropic (Coach IA)

Le coach IA genere des plans d'entrainement personnalises grace a l'API Claude d'Anthropic.

1. Aller sur https://console.anthropic.com
2. Creer un compte et ajouter un moyen de paiement
3. Generer une cle API dans la section "API Keys"
4. Ajouter la variable `ANTHROPIC_API_KEY` dans Vercel (voir ci-dessous)

**Cout estime :** environ 0.01 EUR a 0.05 EUR par plan genere. Pour 100 utilisateurs/jour, compter environ 5 EUR/jour maximum.

### 4. Domaine custom (optionnel mais recommande)

Un domaine personnalise (ex : adventurer-outdoor.com) donne une image plus professionnelle.

1. Acheter le domaine sur https://namecheap.com ou https://ovh.com (environ 10-15 EUR/an)
2. Dans Vercel > Settings > Domains > ajouter le domaine
3. Vercel donne des enregistrements DNS a configurer chez le registrar
4. Attendre la propagation (quelques minutes a quelques heures)
5. Le SSL (https) est automatique avec Vercel

---

### Comment ajouter une variable d'environnement sur Vercel

Cette manipulation est commune aux etapes 1 a 3 ci-dessus :

1. Aller sur https://vercel.com et se connecter
2. Cliquer sur le projet **adventurer-v5**
3. Aller dans **Settings** (barre du haut)
4. Dans le menu de gauche, cliquer sur **Environment Variables**
5. Remplir le champ **Key** (ex : `ANTHROPIC_API_KEY`) et **Value** (la cle)
6. Cocher les 3 environnements : Production, Preview, Development
7. Cliquer sur **Save**
8. **Important :** apres avoir ajoute une variable, il faut relancer un deploiement pour qu'elle soit prise en compte. Le plus simple : aller dans l'onglet **Deployments**, cliquer sur les 3 points du dernier deploiement, puis **Redeploy**.

---

## Pour le lancement officiel

### Checklist go-live en 10 etapes

Suivre cet ordre pour un lancement sans accroc :

1. ~~**Verifier que le site fonctionne**~~ FAIT -- toutes les pages testees, connexion Google OK
2. ~~**Configurer Stripe**~~ FAIT -- cle secrete + webhook configures (mode test), a passer en live apres KYC
3. ~~**Configurer Resend**~~ FAIT -- cle API configuree, emails transactionnels prets
4. ~~**Configurer la cle Anthropic**~~ FAIT -- Coach IA operationnel avec claude-sonnet-4-6
5. ~~**Activer Vercel Analytics + Speed Insights**~~ FAIT -- dashboard actif, score performance 96/100
6. **Configurer le domaine custom** (optionnel) -- acheter et pointer adventurer-outdoor.com vers Vercel
7. **Relire les pages legales** -- verifier que l'email de contact et les informations sont corrects
8. **Deployer les derniers changements de code** -- lancer deploy.bat sur le PC Windows
9. **Tester le parcours complet** -- creation de compte > explorer les spots > reserver un coach > acheter sur la marketplace
10. **Inviter 5 a 10 beta-testeurs** -- envoyer le lien par email, demander des retours
11. **Corriger les retours** -- les premiers utilisateurs trouvent toujours des choses a ameliorer
12. **Passer Stripe en mode live** -- activer le compte, remplacer sk_test par sk_live dans Vercel
13. **Annoncer publiquement** -- reseaux sociaux, email, bouche-a-oreille

### Comment inviter les premiers utilisateurs

- Envoyer un email simple avec le lien du site
- Preciser qu'ils doivent se connecter avec Google
- Leur demander de tester : explorer la carte, consulter un coach, parcourir la marketplace
- Creer un Google Form ou un canal WhatsApp pour centraliser les retours

### Comment ajouter de nouveaux coachs

Pour le moment, les coachs sont ajoutes directement dans la base de donnees Supabase :

1. Aller sur https://supabase.com et se connecter au projet Adventurer
2. Dans le menu de gauche, cliquer sur **Table Editor**
3. Selectionner la table **coaches**
4. Cliquer sur **Insert row**
5. Remplir les champs : nom, specialite, bio, tarif horaire, photo (URL), localisation, certifications
6. Enregistrer -- le coach apparait immediatement sur le site

> A terme, un formulaire d'inscription coach en self-service pourra etre ajoute.

---

## Apres le lancement

### Monitoring (suivre l'activite du site)

1. **Vercel Analytics** (deja integre dans le code) :
   - Aller dans le projet Vercel > onglet **Analytics** > cliquer sur **Enable**
   - Les donnees apparaissent automatiquement : visiteurs, pages vues, temps de chargement
   - **Speed Insights** est aussi integre pour surveiller les Core Web Vitals

2. **Supabase Dashboard** :
   - Se connecter sur https://supabase.com
   - Voir le nombre d'utilisateurs inscrits, les requetes a la base de donnees
   - Surveiller l'utilisation du storage (photos, etc.)

### Ajout de spots par la communaute

Actuellement, 31 spots sont pre-remplis. Pour en ajouter :

- **En base directement** : Table Editor > table **spots** > Insert row (memes etapes que pour les coachs)
- **Par les utilisateurs** : une fonctionnalite de soumission de spot par la communaute peut etre ajoutee dans une prochaine version. Les soumissions passeraient par une moderation avant publication.

### Moderation de la marketplace

La marketplace contient des articles d'occasion postes par les utilisateurs. Pour moderer :

1. Dans Supabase > Table Editor > table **marketplace_items**
2. Verifier les nouveaux articles (colonne `created_at` pour trier par date)
3. Supprimer les articles inappropries ou frauduleux en selectionnant la ligne et en cliquant sur **Delete**
4. En cas de signalement, contacter le vendeur via l'email de son profil

> A terme, un systeme de signalement et de moderation automatique peut etre mis en place.

### Faire evoluer Resend si besoin

Le plan gratuit de Resend permet d'envoyer 100 emails/jour. Si le trafic augmente :

1. Aller sur https://resend.com/settings/billing
2. Passer au plan Pro (20 USD/mois pour 50 000 emails/mois)
3. Ce sera necessaire uniquement quand le site depasse quelques centaines d'utilisateurs actifs

### Prochaines fonctionnalites possibles

- Systeme de notation et d'avis sur les coachs
- Chat en direct entre utilisateurs
- Soumission de spots par la communaute (avec moderation)
- Application mobile (React Native)
- Programme de parrainage avec recompenses
- Gamification (badges, niveaux, defis)

---

## En cas de probleme

| Probleme | Solution |
|----------|----------|
| Le site ne charge plus | Verifier sur https://vercel.com > Deployments que le dernier deploiement est en "Ready" |
| Erreur de connexion Google | Verifier dans Supabase > Authentication > Providers que Google est bien active |
| Le coach IA ne repond pas | Verifier que la variable ANTHROPIC_API_KEY est bien configuree dans Vercel |
| Les emails ne partent pas | Verifier que RESEND_API_KEY est configuree et que le domaine est verifie |
| Un utilisateur signale un bug | Regarder les logs dans Vercel > Deployments > dernier deploiement > Functions |

**Contact technique :** adventurer.app.outdoor@gmail.com

---

> Ce guide a ete mis a jour le 19 avril 2026 pour le projet Adventurer V5.
> Derniere mise a jour : configuration Stripe/Resend/Anthropic completee, Analytics active, pages callback Stripe ajoutees.
