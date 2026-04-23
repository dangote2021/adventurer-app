#!/usr/bin/env node
/**
 * Build wrapper pour la version mobile (Capacitor / Android AAB).
 *
 * Problème : les routes API (src/app/api/*) utilisent `export const dynamic = "force-dynamic"`
 * (Stripe webhooks, admin stats, weather, coach IA…) — ces routes n'ont PAS leur place
 * dans un build statique Capacitor. L'app mobile appelle de toute façon l'API
 * déployée sur Vercel, pas une API embarquée localement.
 *
 * Solution : on renomme temporairement `src/app/api` → `src/app/_api_hidden` le temps
 * du build mobile, puis on restaure. Le try/finally garantit la restauration même
 * si le build plante (pour ne pas casser les prochains builds Vercel / dev).
 */

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const API_DIR = path.join(ROOT, 'src', 'app', 'api');
const HIDDEN_DIR = path.join(ROOT, 'src', 'app', '_api_hidden');

function log(msg) {
  console.log(`[mobile-build] ${msg}`);
}

function hideApiDir() {
  if (fs.existsSync(HIDDEN_DIR)) {
    // Cas anormal : restauration précédente pas faite. On remet d'abord.
    log('⚠ _api_hidden existe déjà (restauration précédente incomplète), on remet en place');
    if (fs.existsSync(API_DIR)) {
      throw new Error('Les deux dossiers api/ ET _api_hidden/ existent — conflit, intervention manuelle requise');
    }
    fs.renameSync(HIDDEN_DIR, API_DIR);
  }
  if (fs.existsSync(API_DIR)) {
    log(`→ Masque src/app/api pour le build mobile`);
    fs.renameSync(API_DIR, HIDDEN_DIR);
    return true;
  }
  log('ℹ Pas de dossier src/app/api à masquer');
  return false;
}

function restoreApiDir(wasHidden) {
  if (!wasHidden) return;
  if (fs.existsSync(HIDDEN_DIR)) {
    log(`← Restaure src/app/api`);
    fs.renameSync(HIDDEN_DIR, API_DIR);
  }
}

function run(cmd) {
  log(`$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: ROOT, env: { ...process.env } });
}

let wasHidden = false;
let exitCode = 0;
try {
  wasHidden = hideApiDir();
  run('cross-env CAPACITOR_BUILD=true NEXT_PUBLIC_CAPACITOR_BUILD=true next build');
  run('npx cap sync');
  log('✔ Build mobile OK');
} catch (err) {
  log(`✖ Build mobile FAILED: ${err.message}`);
  exitCode = 1;
} finally {
  try {
    restoreApiDir(wasHidden);
  } catch (restoreErr) {
    log(`✖ Erreur lors de la restauration: ${restoreErr.message}`);
    exitCode = 2;
  }
}

process.exit(exitCode);
