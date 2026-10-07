#!/usr/bin/env node
/**
 * Vérifie que les textes à traduire ont une traduction en anglais et en hébreu.
 * Usage : npm run i18n:check
 *
 * Sources des clés (texte français) :
 *  - t('…') / tr('…') ;
 *  - champs traduits par les composants partagés : header, label, title, description, success, placeholder… ;
 *  - messages de validation zod (.min, .regex, .email, .url, message:).
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('../src/', import.meta.url).pathname
const walk = dir => readdirSync(dir).flatMap(f => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]))
const files = walk(root).filter(f => /\.(ts|tsx)$/.test(f) && !f.includes('/i18n/') && !f.includes('/components/ui/'))

const PATTERNS = [
  /\b(?:t|tr)\(\s*'((?:[^'\\]|\\.)*)'/g,
  /\b(?:header|label|title|description|success|placeholder|hint|allLabel|cardTitle|unit|createLabel|deleteLabel|confirmLabel|message|invalid_type_error)\s*[:=]\s*'((?:[^'\\]|\\.)*)'/g,
  /\.(?:min|max|regex|email|url|int)\([^)]*?'((?:[^'\\]|\\.)*)'\)/g
]
const classLike = s => s.split(/\s+/).every(tok => /^[a-z0-9:[\]./%#_!-]+$/.test(tok) && /-/.test(tok))
const looksLikeText = s => /[A-Za-zÀ-ÿ]{2}/.test(s) && /\s|[À-ÿ]|^[A-Z]/.test(s) && !classLike(s)

const keys = new Map()
for (const f of files) {
  const src = readFileSync(f, 'utf8')
  for (const re of PATTERNS) {
    for (const m of src.matchAll(re)) {
      const k = m[1].replace(/\\'/g, "'")
      if (!k || !looksLikeText(k) || k.startsWith('/') || k.includes('${')) continue
      if (!keys.has(k)) keys.set(k, f.replace(root, 'src/'))
    }
  }
}

const catalogKeys = file => new Set([...readFileSync(join(root, 'i18n/messages', file), 'utf8').matchAll(/^\s*'((?:[^'\\]|\\.)*)':/gm)].map(m => m[1].replace(/\\'/g, "'")))
const catalogs = { en: catalogKeys('en.ts'), he: catalogKeys('he.ts') }

let missing = 0
for (const [lang, set] of Object.entries(catalogs)) {
  const list = [...keys].filter(([k]) => !set.has(k))
  missing += list.length
  console.log(`\n[${lang}] ${list.length} traduction(s) manquante(s)`)
  list.forEach(([k, f]) => console.log(`  ${JSON.stringify(k)}  (${f})`))
}
console.log(`\n${keys.size} texte(s) analysé(s).`)
process.exit(missing ? 1 : 0)
