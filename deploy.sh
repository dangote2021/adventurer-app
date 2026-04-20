#!/bin/bash
# Script de deploiement Adventurer V5 sur Vercel
# Usage: cd adventurer-v5 && bash deploy.sh

echo "Deploiement Adventurer V5 sur Vercel..."
echo ""

# Verifier que Node.js est installe
if ! command -v node &> /dev/null; then
    echo "Node.js n'est pas installe. Installe-le depuis https://nodejs.org"
    exit 1
fi

echo "Installation des dependances..."
npm install --silent

echo ""
echo "Deploiement en production sur Vercel..."
echo "(Si c'est la premiere fois, suis les instructions de connexion)"
echo ""

npx vercel deploy --prod --yes

echo ""
echo "Deploiement termine !"
echo "Ton app est disponible sur : https://adventurer-outdoor.vercel.app"
