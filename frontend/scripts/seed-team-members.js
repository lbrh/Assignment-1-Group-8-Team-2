#!/usr/bin/env node
// Seeds the teamMembers collection. Safe to re-run, upserts by slug id.
// Run via: pnpm --filter frontend run seed:team
'use strict'

const fs = require('fs')
const path = require('path')
const { initializeApp, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp } = require('firebase-admin/firestore')

const root = path.resolve(__dirname, '..', '..')
const envPath = path.join(root, '.env')

// minimal .env parser, mirrors scripts/sync-env.js
function parseEnv(content) {
  const vars = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    vars[key] = value
  }
  return vars
}

if (!fs.existsSync(envPath)) {
  console.error(
    'No .env file found at the repo root. Create it first (see docs/ENV-VARS.md), ' +
      'then set FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 and NEXT_PUBLIC_FIREBASE_PROJECT_ID.',
  )
  process.exit(1)
}

const env = parseEnv(fs.readFileSync(envPath, 'utf8'))
const serviceAccountKey = env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64
const projectId = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

if (!serviceAccountKey || !projectId) {
  console.error(
    'FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 and NEXT_PUBLIC_FIREBASE_PROJECT_ID must both be set in .env.',
  )
  process.exit(1)
}

initializeApp({
  credential: cert(JSON.parse(Buffer.from(serviceAccountKey, 'base64').toString('utf8'))),
  projectId,
})

const db = getFirestore()

const ROSTER = [
  {
    id: 'aryaveer-singh',
    name: 'Aryaveer Singh',
    role: 'Business Analyst',
    photoUrl: null,
    blurb:
      'Wrote the Sprint 1 requirements doc: the team-page fields, the login styling-only scope, and the edge cases for UX to design around.',
    order: 1,
  },
  {
    id: 'benjamin-cosentino',
    name: 'Benjamin Cosentino',
    role: 'UX Designer',
    photoUrl: null,
    blurb:
      'Designed the restyled login page and the team page layout, including the default-avatar and long-blurb edge cases the BA flagged.',
    order: 2,
  },
  {
    id: 'htet-myet-aung-win',
    name: 'Htet Myet Aung Win',
    role: 'Developer 1',
    photoUrl: null,
    blurb:
      'Built the team page — member cards with photo, role and blurb — plus the redirect from login and the guard on direct URL access.',
    order: 3,
  },
  {
    id: 'liam-robinson-hounsell',
    name: 'Liam Robinson Hounsell',
    role: 'Developer 2',
    photoUrl: null,
    blurb:
      'Applied the approved login styling — colours, layout, branding — with the auth logic, validation and session handling left untouched.',
    order: 4,
  },
  {
    id: 'kayd-ho',
    name: 'Kayd Ho',
    role: 'Project Manager',
    photoUrl: null,
    blurb:
      "Reviewed the finished feature against the requirements and design, checked every task's completion, and signed off with the board closed out.",
    order: 5,
  },
]

async function seed() {
  const now = Timestamp.now()
  const batch = db.batch()

  for (const member of ROSTER) {
    const { id, ...data } = member
    const ref = db.collection('teamMembers').doc(id)
    batch.set(ref, {
      ...data,
      updatedAt: now,
      createdAt: now,
      _schemaVersion: 1,
    })
  }

  await batch.commit()
  console.log(`Seeded ${ROSTER.length} team members.`)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
