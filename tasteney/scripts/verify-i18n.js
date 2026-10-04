const assert = require('assert');

// Mock image asset loaders for Node.js test environment
require.extensions['.jpg'] = () => 1;
require.extensions['.png'] = () => 1;
require.extensions['.jpeg'] = () => 1;

const en = require('../src/i18n/locales/en').default;
const de = require('../src/i18n/locales/de').default;
const { DRINK_KNOWLEDGE_BASE_EN, DRINK_KNOWLEDGE_BASE_DE, getDrinkKnowledgeBase } = require('../src/data/drink-knowledge');

console.log('--- Verifying i18n Locales & Keys ---');

// Recursively verify key parity between en and de
function getKeys(obj, prefix = '') {
  let keys = [];
  for (const k in obj) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      keys = keys.concat(getKeys(obj[k], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const enKeys = getKeys(en);
const deKeys = getKeys(de);

const missingInDe = enKeys.filter((k) => !deKeys.includes(k));
const missingInEn = deKeys.filter((k) => !enKeys.includes(k));

console.log(`Total EN keys: ${enKeys.length}`);
console.log(`Total DE keys: ${deKeys.length}`);

assert.strictEqual(missingInDe.length, 0, `Missing keys in DE: ${missingInDe.join(', ')}`);
assert.strictEqual(missingInEn.length, 0, `Missing keys in EN: ${missingInEn.join(', ')}`);
console.log('✓ All translation keys are 100% matched between EN and DE.');

// Verify Beverage Archetypes in German
console.log('\n--- Verifying Archetype Translations ---');
assert.strictEqual(de.archetypes.Wine, 'Wein');
assert.strictEqual(de.archetypes.Coffee, 'Kaffee');
assert.strictEqual(de.archetypes.Spirits, 'Spirituosen');
assert.strictEqual(de.archetypes.Beer, 'Bier');
assert.strictEqual(de.archetypes.Tea, 'Tee');
assert.strictEqual(de.archetypes.Cocktail, 'Cocktail');
assert.strictEqual(de.archetypes.Other, 'Sonstiges');
console.log('✓ Archetype translations verified.');

// Verify Subtypes in German
console.log('\n--- Verifying Subtype Translations ---');
assert.strictEqual(de.subtypes.Wine.Red, 'Rotwein');
assert.strictEqual(de.subtypes.Wine.White, 'Weißwein');
assert.strictEqual(de.subtypes.Wine.Sparkling, 'Schaumwein / Sekt');
assert.strictEqual(de.subtypes.Beer['Lager / Pilsner'], 'Lager / Pils');
assert.strictEqual(de.subtypes.Coffee['Filter'], 'Filterkaffee');
assert.strictEqual(de.subtypes.Tea['Green'], 'Grüner Tee');
console.log('✓ Subtype translations verified.');

// Verify Rating Scores in German
console.log('\n--- Verifying Rating Score Translations ---');
assert.strictEqual(de.rating.scores[1], '1.0 — Fehlerhaft / Ungenießbar');
assert.strictEqual(de.rating.scores[5], '5.0 — Solide / Alltäglich');
assert.strictEqual(de.rating.scores[10], '10.0 — Vollendetes Meisterwerk');
console.log('✓ Rating score descriptions verified.');

// Verify Knowledge Base in German & English
console.log('\n--- Verifying Drink Knowledge Base ---');
assert.strictEqual(DRINK_KNOWLEDGE_BASE_EN.length, 8);
assert.strictEqual(DRINK_KNOWLEDGE_BASE_DE.length, 8);

const deKnowledge = getDrinkKnowledgeBase('de');
const enKnowledge = getDrinkKnowledgeBase('en');
const defaultKnowledge = getDrinkKnowledgeBase('fr');

assert.strictEqual(deKnowledge[0].title, 'Bier & Braukunst');
assert.strictEqual(enKnowledge[0].title, 'Beer & Ales');
assert.strictEqual(defaultKnowledge[0].title, 'Beer & Ales');
console.log('✓ Knowledge base localization and fallback verified.');

// Verify Device Language Detection Logic
console.log('\n--- Verifying Device Language Detection Logic ---');
function detectLanguage(locales) {
  if (locales && locales.length > 0) {
    const code = locales[0]?.languageCode;
    if (code && code.toLowerCase().startsWith('de')) {
      return 'de';
    }
  }
  return 'en';
}

assert.strictEqual(detectLanguage([{ languageCode: 'de' }]), 'de');
assert.strictEqual(detectLanguage([{ languageCode: 'de-DE' }]), 'de');
assert.strictEqual(detectLanguage([{ languageCode: 'de-AT' }]), 'de');
assert.strictEqual(detectLanguage([{ languageCode: 'de-CH' }]), 'de');
assert.strictEqual(detectLanguage([{ languageCode: 'en' }]), 'en');
assert.strictEqual(detectLanguage([{ languageCode: 'en-US' }]), 'en');
assert.strictEqual(detectLanguage([{ languageCode: 'fr' }]), 'en');
assert.strictEqual(detectLanguage([{ languageCode: 'es' }]), 'en');
assert.strictEqual(detectLanguage([]), 'en');
assert.strictEqual(detectLanguage([{ languageCode: null }]), 'en');
console.log('✓ Device language detection (German vs English fallback) verified.');

console.log('\n✅ ALL I18N TESTS PASSED SUCCESSFULLY!');
