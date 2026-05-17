// migrate_encrypt.js
// One-time script to encrypt all existing plain-text rows in the profiles table.
// Creates a local backup before making any changes.
// Run with: node migrate_encrypt.js
// Restore with: node migrate_encrypt.js --restore

import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { createCipheriv, randomBytes } from 'crypto';
import { writeFileSync, readFileSync, existsSync } from 'fs';

const ALGORITHM = 'aes-256-gcm';
const BACKUP_FILE = './profiles_backup.json';

function getKey() {
  if (!process.env.ENCRYPTION_KEY) throw new Error('ENCRYPTION_KEY not set');
  return Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
}

function isAlreadyEncrypted(value) {
  if (typeof value !== 'string') return false;
  const parts = value.split(':');
  if (parts.length < 3) return false;
  return parts.every(p => /^[0-9a-f]+$/i.test(p));
}

function encrypt(value) {
  if (value === null || value === undefined || value === '') return value;
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  if (isAlreadyEncrypted(str)) return str;

  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(str, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

const SKIP_FIELDS = ['id', 'resumes', 'created_at', 'updated_at'];

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ── RESTORE MODE ─────────────────────────────────────────────────────────────
async function restore() {
  if (!existsSync(BACKUP_FILE)) {
    console.error('No backup file found at', BACKUP_FILE);
    process.exit(1);
  }

  const profiles = JSON.parse(readFileSync(BACKUP_FILE, 'utf8'));
  console.log(`Restoring ${profiles.length} profile(s) from backup...\n`);

  let restored = 0;

  for (const profile of profiles) {
    const { id, created_at, updated_at, ...fields } = profile;

    const { error } = await supabase
      .from('profiles')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error(`  [FAIL] ${id} — ${error.message}`);
    } else {
      console.log(`  [OK]   ${id} — restored`);
      restored++;
    }
  }

  console.log(`\nRestore complete. ${restored}/${profiles.length} rows restored.`);
  console.log('IMPORTANT: Your data is now plain-text again in Supabase.');
}

// ── MIGRATE MODE ──────────────────────────────────────────────────────────────
async function migrate() {
  console.log('Fetching all profiles...');
  const { data: profiles, error } = await supabase.from('profiles').select('*');

  if (error) {
    console.error('Failed to fetch profiles:', error.message);
    process.exit(1);
  }

  console.log(`Found ${profiles.length} profile(s).\n`);

  // ── Step 1: Backup ──────────────────────────────────────────────────────
  writeFileSync(BACKUP_FILE, JSON.stringify(profiles, null, 2), 'utf8');
  console.log(`Backup saved to ${BACKUP_FILE}\n`);

  // ── Step 2: Encrypt & update ────────────────────────────────────────────
  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const profile of profiles) {
    const updates = {};

    for (const [key, val] of Object.entries(profile)) {
      if (SKIP_FIELDS.includes(key)) continue;
      if (val === null || val === undefined || val === '') continue;

      const str = typeof val === 'string' ? val : JSON.stringify(val);
      if (isAlreadyEncrypted(str)) continue;

      updates[key] = encrypt(val);
    }

    if (Object.keys(updates).length === 0) {
      console.log(`  [SKIP] ${profile.id} — already fully encrypted`);
      skipped++;
      continue;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id);

    if (updateError) {
      console.error(`  [FAIL] ${profile.id} — ${updateError.message}`);
      failed++;
    } else {
      console.log(`  [OK]   ${profile.id} — encrypted: ${Object.keys(updates).join(', ')}`);
      migrated++;
    }
  }

  console.log(`\n✅ Done. ${migrated} migrated, ${skipped} skipped, ${failed} failed.`);
  if (migrated > 0) {
    console.log(`\nBackup is at: ${BACKUP_FILE}`);
    console.log('Keep it safe. To restore plain-text data: node migrate_encrypt.js --restore');
  }
  if (failed > 0) {
    console.log(`\n⚠️  Some rows failed. Restore with: node migrate_encrypt.js --restore`);
  }
}

// ── Entry point ───────────────────────────────────────────────────────────────
if (process.argv.includes('--restore')) {
  restore();
} else {
  migrate();
}
