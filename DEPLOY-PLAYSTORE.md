# Adventurer - Guide de deploiement Play Store

## Pre-requis

- Android Studio installe et configure
- Un compte Google Play Console (25$ une fois) : https://play.google.com/console
- Java JDK 17+ installe
- Node.js 18+

## Etape 1 : Lancer le deploy-all.bat

Double-cliquer sur `deploy-all.bat` dans le dossier adventurer-v5.
Ce script fait tout automatiquement :
1. Installe les dependances npm
2. Installe Vercel CLI et deploie sur https://adventurer-outdoor.vercel.app
3. Build le mode statique (Capacitor)
4. Sync les plateformes Android/iOS

## Etape 2 : Generer la cle de signature (une seule fois)

Ouvrir un terminal et lancer :

```
keytool -genkey -v -keystore adventurer-release.keystore -alias adventurer -keyalg RSA -keysize 2048 -validity 10000
```

Repondre aux questions (nom, organisation, etc.).
IMPORTANT : noter le mot de passe, il sera demande a chaque build.

Deplacer le fichier `adventurer-release.keystore` dans le dossier `android/app/`.

## Etape 3 : Ouvrir dans Android Studio

```
npx cap open android
```

## Etape 4 : Configurer la signature

Dans Android Studio :
1. Menu Build > Generate Signed Bundle / APK
2. Choisir "Android App Bundle" (obligatoire pour le Play Store)
3. Selectionner le keystore : `android/app/adventurer-release.keystore`
4. Entrer l'alias : `adventurer`
5. Entrer le mot de passe
6. Choisir "release" comme build variant
7. Cliquer "Create"

Le fichier `.aab` sera genere dans `android/app/release/app-release.aab`

## Etape 5 : Creer l'app sur Google Play Console

1. Aller sur https://play.google.com/console
2. "Creer une application"
3. Remplir :
   - Nom : Adventurer
   - Langue par defaut : Francais
   - Application ou Jeu : Application
   - Gratuit ou Payant : Gratuit
4. Accepter les conditions

## Etape 6 : Remplir la fiche Play Store

Section "Presence sur le Store" > "Fiche principale" :

- Titre : Adventurer - Outdoor Adventure
- Description courte (80 car.) : Ton compagnon d'aventure outdoor. Trail, kite, plongee, escalade et +
- Description longue : (voir ci-dessous)
- Icone : 512x512 PNG (utiliser public/icon-512x512.png)
- Banniere : 1024x500 PNG
- Captures d'ecran : min 2, format 16:9 ou 9:16

Description longue suggeree :
```
Adventurer est l'app outdoor tout-en-un pour les passionnes d'aventure.

Que tu fasses du trail, du kitesurf, de l'escalade, de la plongee ou du parapente, Adventurer t'accompagne avant, pendant et apres chaque sortie.

AVANT - Prepare ton aventure
- Aventure du Jour personnalisee selon tes sports et la meteo
- Coach IA pour creer des plans d'entrainement sur mesure
- Marketplace de materiel d'occasion
- Defis communautaires

PENDANT - Vis l'aventure
- Carte interactive avec spots et itineraires
- Geolocalisation et partage de position

APRES - Valorise ton aventure
- Badges et statistiques
- Partage avec la communaute

Rejoins une communaute de passionnes outdoor !
```

## Etape 7 : Configurer le contenu

Section "Politique relative au contenu" :
- Classification du contenu : lancer le questionnaire (repondre "non" a tout)
- Public cible : 18+ ou Tout public
- Applications d'actualites : Non
- Publicites : L'app ne contient pas de pub

## Etape 8 : Uploader le bundle

Section "Production" > "Creer un release" :
1. Cliquer "Upload" et selectionner le fichier `.aab`
2. Nom du release : "1.0.0"
3. Notes de version : "Premiere version d'Adventurer"
4. Cliquer "Enregistrer" puis "Verifier le release"
5. Cliquer "Deployer en production"

## Etape 9 : Attendre la review

Google review l'app en 1 a 7 jours.
Tu recevras un email quand l'app sera publiee.

## Informations techniques

- App ID : `app.adventurer.outdoor`
- Version : 1.0.0
- Min SDK : 22 (Android 5.1+)
- Target SDK : 34 (Android 14)
- Architecture : arm64-v8a, armeabi-v7a, x86_64
