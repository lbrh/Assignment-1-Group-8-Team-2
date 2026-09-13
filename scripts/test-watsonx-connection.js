#!/usr/bin/env node
// Proves the watsonx.ai connection works — one trivial text-generation call.
// Not part of the app yet. Run via: node scripts/test-watsonx-connection.js
'use strict'

const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
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
  console.error('No .env file found at the repo root.')
  process.exit(1)
}

const env = parseEnv(fs.readFileSync(envPath, 'utf8'))
const apiKey = env.IBM_CLOUD_API_KEY
const projectId = env.WATSONX_PROJECT_ID
const region = env.WATSONX_REGION

if (!apiKey || !projectId || !region) {
  console.error('IBM_CLOUD_API_KEY, WATSONX_PROJECT_ID, and WATSONX_REGION must all be set in .env.')
  process.exit(1)
}

async function getAccessToken() {
  const res = await fetch('https://iam.cloud.ibm.com/identity/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
      apikey: apiKey,
    }),
  })
  if (!res.ok) {
    throw new Error(`IAM token request failed: ${res.status} ${await res.text()}`)
  }
  const data = await res.json()
  return data.access_token
}

async function testConnection() {
  const token = await getAccessToken()
  console.log('IAM token acquired.')

  const url = `https://${region}.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model_id: 'ibm/granite-13b-instruct-v2',
      input: 'Reply with the single word: connected',
      project_id: projectId,
      parameters: { max_new_tokens: 5 },
    }),
  })

  if (!res.ok) {
    throw new Error(`watsonx.ai request failed: ${res.status} ${await res.text()}`)
  }

  const data = await res.json()
  console.log('watsonx.ai response:', data.results?.[0]?.generated_text ?? data)
}

testConnection().catch((err) => {
  console.error('Connection test failed:', err.message)
  process.exit(1)
})
