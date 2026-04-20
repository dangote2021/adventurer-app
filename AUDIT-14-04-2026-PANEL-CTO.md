# Audit Adventurer — 14 avril 2026
## Panel 5 personas en conditions réelles + vision CTO & modèle économique

Déploiement vérifié : **dpl_HhC3DGMrRWm5Z3jCkHVzkUY7JhwJ**, state `READY`, prod le 14/04 vers 15h41 heure française. Build Next.js OK, runtime stats nominales.

---

## 1. Vérification des 4 bugs du matin

| Bug signalé | Fix déployé | Statut |
|---|---|---|
| Scroll cassé sur modal "Suggestion du jour" | `WelcomeModal.tsx` : ajout `overflow-y-auto max-h-[90vh]` | ✅ Corrigé |
| "++ Nouveau" en double dans Messages | Suppression du `+ ` dans les valeurs i18n FR/EN (le JSX ajoutait déjà `+`) | ✅ Corrigé |
| Carte grise après acceptation géoloc | `MapPage.tsx` : split en 2 useEffect (init `[]` + update marker) | ✅ Corrigé |
| Fiches coachs pauvres sur Home | `NEARBY_COACHES` enrichi (rating, reviews, prix/h, dispo) + carte verticale riche | ✅ Corrigé |
| Classement limité à 3 critères | `ExplorePage` : 5 critères (sorties, D+, km, heures, vitesse) | ✅ Corrigé |

Aucune régression détectée sur les parcours critiques (onboarding, carte, messages, profile, coach IA).

---

## 2. Test panel — 5 personas, conditions réelles

### 🏃 Sophie — Traileuse experte, Chamonix
**Scénario** : prépare l'UTMB 2026 (170 km), veut un plan d'entraînement + trouver un binôme pour une sortie 40 km ce week-end.

**Ce qui marche**
- Onboarding : coche Trail + Ultra-trail + Ski de rando en 15 secondes, niveau Confirmé sélectionné.
- Coach IA : génère bien un plan progressif sur l'ultra, avec semaines de charge/décharge.
- Explorer filtré sur ses sports : voit des routes alpines cohérentes.

**Ce qui coince**
- ❗ **Pas de recherche de binôme pour UNE sortie précise.** Les Teams sont permanentes ("rejoindre une équipe") mais elle veut juste trouver quelqu'un samedi à 6h au Brévent.
- ❗ **Plan coach IA non sauvegardé.** Si elle ferme la page, elle doit tout regénérer.
- ❗ **Pas d'export GPX ni de connexion Garmin/Strava.** Une traileuse de son niveau vit sur Garmin Connect.
- ⚠ Les conditions "Neige fraîche / Cornices" ne sont pas signalées par la communauté sur la carte — elle fait déjà ça dans CamptoCamp.

### 🪁 Marco V. — Kitesurfeur, Tarifa
**Scénario** : lundi matin, Levante annoncé 28 nœuds. Veut savoir quel spot marche, qui est là, et potentiellement vendre sa vieille aile.

**Ce qui marche**
- Voit Marco V. dans les profils (on l'a ajouté), Valdevaqueros & Los Lances dans les routes.
- Marketplace affiche combi / palmes / GPS cohérents.

**Ce qui coince**
- ❗ **Pas de vent temps réel sur la carte.** Un kiter vérifie Windguru ou Windy avant chaque session. Pas de widget vent/orientation sur les spots.
- ❗ **Pas de "je suis sur le spot" live.** Il veut savoir QUI RIDE MAINTENANT à Valdevaqueros.
- ❗ **Marketplace sans messagerie intégrée acheteur-vendeur.** Tout passe par "contacter", mais pas de thread dédié à une annonce.
- ⚠ Pas de filtre "spot débutant / confirmé / expert" avec ranges de vent recommandés par aile.

### 🤿 Paolo V. — Apnéiste, Cassis
**Scénario** : veut progresser de 2min à 3min30, trouver un coach local, rejoindre une équipe apnée.

**Ce qui marche**
- Paolo dans les profils, Team Apnée Cassis créée, route épave Donator présente.
- Coach IA apnée génère bien les tables CO2/O2 adaptées au niveau.

**Ce qui coince**
- ❗ **Pas de booking coach.** Il voit Paolo Verdi comme coach, mais aucun moyen de réserver une session (pourtant c'est là que l'argent se fait).
- ❗ **Safety absente.** L'apnée en solo tue. Il faudrait un "buddy check" pré-session et un contact d'urgence automatique si pas de check-in retour.
- ⚠ Profondeurs / paliers non trackés. Pas d'intégration montre apnée (Garmin Descent / Suunto D5).

### 🧗 Thomas — Alpiniste, Grenoble
**Scénario** : cherche un binôme pour le Dôme des Écrins en juillet, veut vérifier conditions glaciaires.

**Ce qui marche**
- Explorer affiche alpinisme dans les filtres sports.

**Ce qui coince**
- ❗ **Pas de topo consultable** (croquis de voies, cotations TD/ED, longueurs). Un alpiniste vérifie CamptoCamp systématiquement.
- ❗ **Pas de "conditions récentes" datées** signalées par la communauté (Dernière sortie : 02/04 — rimaye franchissable mais…).
- ❗ **Pas de carnet de course post-sortie.** Après sa course, il ne peut pas laisser un compte-rendu daté (alors que c'est LA valeur pour la communauté d'alpinistes).

### 👶 Julie — Débutante, bascule FR→EN pendant l'usage
**Scénario** : découvre l'app, a coché "Randonnée" et "Paddle", ne sait pas par où commencer. Change de langue en cours de route car son copain anglophone regarde avec elle.

**Ce qui marche**
- Onboarding fluide, swipe entre univers OK.
- Toggle FR/EN sur AuthPage et dans les pages principales fonctionne.
- WelcomeModal scroll OK désormais.

**Ce qui coince**
- ❗ **Trop de choix, pas de "premier pas".** À l'arrivée sur la Home, elle ne sait pas si elle doit regarder la carte, les défis, les coachs…
- ❗ **Aucun tutoriel / coach mark** pour guider les 60 premières secondes.
- ⚠ La suggestion du jour est pertinente mais unique — elle aimerait 2-3 "Premières aventures pour débutants".
- ⚠ Termes techniques (D+, GPX, bivouac, rappel) pas expliqués.

---

## 3. Priorisation des modifications (P1 → P3)

### 🔴 P1 — Bloquants / Rétention

1. **Sauvegarder les plans Coach IA dans le profil** (localStorage via Zustand persist → Supabase quand BDD).
   - Sans ça, le coach IA est un gadget one-shot. C'est la feature différenciante → elle DOIT persister.
2. **"Quick Match" — Trouver un binôme pour UNE sortie datée.**
   - Sur chaque spot/route : bouton "Je pars samedi 9h, qui m'accompagne ?" → crée une micro-annonce géolocalisée 48h.
   - Résout à la fois Sophie, Thomas, et indirectement Paolo (buddy apnée).
3. **Widget vent/météo temps réel sur spots nautiques** (kite/surf/wing/apnée).
   - Proxy vers Open-Meteo (gratuit) ou StormGlass. Affiche vent + direction + houle sur SpotDetail.
   - Critère vital pour crédibilité auprès des kiters/surfeurs/plongeurs.
4. **Onboarding → "3 premières aventures pour toi"**.
   - Après le niveau, on montre 3 cartes adaptées sport + niveau + géoloc. Julie sait quoi faire en 10 secondes.
5. **Booking coach humain (flow complet, même sans paiement réel en V1)**.
   - Vue disponibilités hebdo du coach → sélection créneau → confirmation par notif.
   - Fondation directe du modèle économique (cf. section 4).

### 🟠 P2 — Valeur forte, pas bloquants

6. **Check-in sécurité pré-session + contact d'urgence**.
   - Spot dangereux (apnée, alpi, big wave) → "Je pars à 8h, retour prévu 12h" → si pas de check-in retour à 13h → alerte SMS au contact défini.
   - Feature différenciante forte vs Strava/Komoot.
7. **Export GPX + import depuis Garmin Connect / Strava (OAuth)**.
   - Les users sérieux vivent déjà sur Garmin. Refuser la connexion = les perdre.
   - GPX export = trivial, import = OAuth Strava (gratuit).
8. **Compte-rendu de sortie daté** (sur chaque route/spot après l'avoir faite).
   - Note qualitative (pas /10), conditions du jour, photos. C'est la valeur communautaire pour alpi/rando/freeride.
9. **Marketplace : thread de discussion acheteur-vendeur par annonce**.
   - Sans ça, aucune conversion sur la marketplace.
10. **Tutoriel "30 secondes" au premier lancement** (après onboarding).
    - 4 coach marks : "La carte = tous les spots", "Le coach IA = ton plan", "Les défis = ta motivation", "Ton profil = tes stats".

### 🟡 P3 — Polish & différenciation

11. **Indicateurs "conditions récentes" daté par la communauté** sur chaque spot/route (style CamptoCamp).
12. **Glossaire flottant** (tap sur D+, GPX, rimaye → bulle d'explication).
13. **Topo schématique** pour grandes voies d'escalade/alpi (même juste image + cotation).
14. **Badge "Présent sur le spot aujourd'hui"** (geofencing simple, opt-in).
15. **Deep-links à partir de chaque page** (share une aventure spécifique).
16. **Mode sombre automatique** selon heure locale (confort de lecture en bivouac).

---

## 4. 💰 Modèle économique — Vision moyen terme (12-18 mois)

### Philosophie

L'app doit rester **gratuite pour le cœur de l'expérience** (carte, communauté, défis, marketplace basique). Le revenu vient de 4 leviers complémentaires, **sans dégrader l'expérience** des utilisateurs non-payants.

### Les 4 piliers de revenu

**1. Booking coachs humains — commission 15%** *(pilier principal, TAM énorme)*
- Le coach définit ses dispos + prix horaire. Adventurer prend 15% (benchmark : Superprof 20%, MyCoach 25%).
- Flow : réserver → paiement Stripe Connect → libération après session → avis.
- Estimation : 5 000 réservations/mois × 60€ moyens × 15% = **45 K€/mois** (plausible à T+12).
- Technique : Stripe Connect Standard, pas de contrainte PSD2 lourde à gérer.

**2. Marketplace matériel — commission 5% + boost payant** *(pilier secondaire)*
- 5% sur transaction (benchmark : Vinted 5%, LeBonCoin 0% mais pub). Plus bas que Vinted volontairement pour attirer le volume.
- "Boost annonce" : 2,99€ pour remonter 7 jours.
- Optionnel : assurance envoi +1,50€ (reversée à un partenaire style MondialRelay / Colissimo).

**3. Abonnement Adventurer Pro — 4,99€/mois ou 39€/an**
- Cartes offline HD illimitées (coûteux à servir, pertinent gating).
- Coach IA : plans illimités + historique complet (vs 3/mois en gratuit).
- Export GPX illimité + sync Garmin/Strava automatique.
- Badge "Pro" dans le profil (statut, pas privilège social).
- **Jamais gratuit les fonctions safety** (check-in, SOS) — ça reste accessible à tous pour raison éthique.

**4. Partenariats marques outdoor — content sponsorisé & affiliation**
- Affiliation marketplace → retailers (Snowleader, AlltricksSport, Decathlon Pro) : 3-8% par clic converti.
- "Défis sponsorisés" contextuels (Salomon finance un défi "100 km en octobre" avec dossard offert aux 10 premiers). Transparence : badge "Défi partenaire".
- Pas de bannières publicitaires classiques. Jamais.

### Projection 12 mois (conservateur)

Hypothèse : 50 000 utilisateurs actifs à T+12, dont 10% payants d'une façon ou d'une autre.

| Levier | Revenu mensuel cible | Part |
|---|---|---|
| Booking coachs | 45 000 € | 47% |
| Abonnement Pro | 25 000 € (5 000 abonnés × 4,99€) | 26% |
| Marketplace | 15 000 € | 16% |
| Partenariats | 10 000 € | 11% |
| **Total** | **~95 K€/mois** | 100% |

### Ce qui est prioritaire côté dev pour débloquer le revenu

**Tranche 1 (0-3 mois)** — Booking coach V1 + abonnement Pro basique
→ P1#5 (booking flow) + P1#1 (sauvegarder plans = justifie Pro) + infra Stripe Connect.

**Tranche 2 (3-6 mois)** — Marketplace payments + Pro complet
→ P2#9 (messagerie marketplace) + intégration paiement + gating offline/export GPX Pro.

**Tranche 3 (6-12 mois)** — Partenariats + affiliation
→ Dashboard admin marques, SDK tracking affiliation, onboarding sponsors.

### Garde-fous éthiques

- **Safety = jamais monétisée**. Check-in, SOS, contact d'urgence : gratuits à vie.
- **Pas de paywall sur la communauté**. Lire et répondre aux posts reste gratuit.
- **Pas de publicité display**. L'écosystème outdoor déteste ça.
- **Transparence totale sur les défis sponsorisés et l'affiliation marketplace**.

---

## 5. Roadmap 3 sprints recommandée

**Sprint 1 (2 semaines) — Rétention**
- P1#1 Sauvegarde plans Coach IA + historique
- P1#4 Onboarding "3 premières aventures"
- P2#10 Tutoriel 30 secondes
- P3#12 Glossaire flottant

**Sprint 2 (2 semaines) — Social réel**
- P1#2 Quick Match (binôme 48h)
- P2#8 Compte-rendus datés sur routes/spots
- P2#7 Export GPX + OAuth Strava

**Sprint 3 (2 semaines) — Préparation revenue**
- P1#5 Booking coach V1 (pas encore de paiement réel, juste flow)
- P1#3 Widget vent temps réel (Open-Meteo)
- P2#6 Check-in sécurité + SMS (Twilio trial)

À l'issue de ces 3 sprints : l'app est prête à passer en bêta payante et à onboarder les 10 premiers coachs partenaires.

---

*Audit réalisé par le CTO Adventurer le 14/04/2026. Prochaine étape recommandée : valider les 5 items P1 en priorité sur le Sprint 1.*
