function assert(condition: any, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}
assert.strictEqual = (actual: any, expected: any, message?: string) => {
  if (actual !== expected) {
    throw new Error(message || `Assertion failed: expected ${expected}, got ${actual}`);
  }
};
assert.ok = (value: any, message?: string): asserts value => {
  if (!value) {
    throw new Error(message || 'Assertion failed: value is not truthy');
  }
};
import en from '../src/i18n/locales/en';
import de from '../src/i18n/locales/de';
import { parseWikiLinks } from '../src/utils/wiki-links';
import {
  getCategories,
  getAllArticles,
  getArticles,
  getArticleById,
  getRelatedArticles,
} from '../src/data/drink-knowledge-service';

console.log('=== 1. VERIFYING I18N PARITY ===');
function getKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = [];
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

assert.strictEqual(missingInDe.length, 0, `Missing in DE: ${missingInDe.join(', ')}`);
assert.strictEqual(missingInEn.length, 0, `Missing in EN: ${missingInEn.join(', ')}`);
console.log(`✓ 100% key match between EN (${enKeys.length}) and DE (${deKeys.length}) locales.`);

// Check explore keys
assert.strictEqual(en.explore.types.all, 'All Types');
assert.strictEqual(de.explore.types.all, 'Alle Arten');
assert.strictEqual(en.explore.types.ingredient, 'Ingredient');
assert.strictEqual(de.explore.types.ingredient, 'Zutat');
assert.strictEqual(en.explore.types.location, 'Location');
assert.strictEqual(de.explore.types.location, 'Region / Ort');
console.log('✓ Article type translations verified.');

console.log('\n=== 2. VERIFYING WIKI-LINK PARSER ===');
// Test [[id|label]]
const seg1 = parseWikiLinks('Explore [[wine-burgundy|the Côte d\'Or]] terroir.');
assert.strictEqual(seg1.length, 3);
assert.strictEqual(seg1[0].type, 'text');
assert.strictEqual(seg1[0].text, 'Explore ');
assert.strictEqual(seg1[1].type, 'link');
assert.strictEqual(seg1[1].targetId, 'wine-burgundy');
assert.strictEqual(seg1[1].text, 'the Côte d\'Or');
assert.strictEqual(seg1[1].customLabel, 'the Côte d\'Or');
assert.strictEqual(seg1[2].type, 'text');
assert.strictEqual(seg1[2].text, ' terroir.');

// Test [[id]] fallback
const seg2 = parseWikiLinks('Try [[wine-pinot-noir]] today.');
assert.strictEqual(seg2.length, 3);
assert.strictEqual(seg2[1].type, 'link');
assert.strictEqual(seg2[1].targetId, 'wine-pinot-noir');
assert.strictEqual(seg2[1].text, 'wine-pinot-noir');
assert.strictEqual(seg2[1].customLabel, undefined);

// Test plain text
const seg3 = parseWikiLinks('Pure text with no links.');
assert.strictEqual(seg3.length, 1);
assert.strictEqual(seg3[0].type, 'text');

// Test empty string
const seg4 = parseWikiLinks('');
assert.strictEqual(seg4.length, 0);

// Test external and Wikipedia links
const seg5 = parseWikiLinks('See [[https://en.wikipedia.org/wiki/Pinot_noir|Wikipedia: Pinot Noir]] for more.');
assert.strictEqual(seg5.length, 3);
assert.strictEqual(seg5[1].type, 'link');
assert.strictEqual(seg5[1].isExternal, true);
assert.strictEqual(seg5[1].externalUrl, 'https://en.wikipedia.org/wiki/Pinot_noir');
assert.strictEqual(seg5[1].text, 'Wikipedia: Pinot Noir');

const seg6 = parseWikiLinks('Check [[wikipedia:Burgundy_wine|Burgundy Wiki]] article.');
assert.strictEqual(seg6.length, 3);
assert.strictEqual(seg6[1].type, 'link');
assert.strictEqual(seg6[1].isExternal, true);
assert.strictEqual(seg6[1].externalUrl, 'https://en.wikipedia.org/wiki/Burgundy_wine');
assert.strictEqual(seg6[1].text, 'Burgundy Wiki');

console.log('✓ Wiki-link parser passes all syntax, external URL, and edge-case tests.');

console.log('\n=== 3. VERIFYING DRINK KNOWLEDGE DATA & SERVICE ===');
const categories = getCategories();
assert.ok(categories.length >= 8, `Expected at least 8 categories, got ${categories.length}`);
console.log(`✓ Loaded ${categories.length} categories.`);

const allArticles = getAllArticles();
assert.ok(allArticles.length >= 20, `Expected at least 20 articles, got ${allArticles.length}`);
console.log(`✓ Loaded ${allArticles.length} total articles.`);

// Verify all article references exist
for (const article of allArticles) {
  assert.ok(article.id, 'Article must have an ID');
  assert.ok(article.title, `Article ${article.id} must have a title`);
  assert.ok(['general', 'ingredient', 'location'].includes(article.type), `Invalid type ${article.type} for ${article.id}`);
  assert.ok(categories.some((c) => c.id === article.category), `Category ${article.category} not found for ${article.id}`);

  if (article.relatedArticleIds) {
    for (const relId of article.relatedArticleIds) {
      const rel = getArticleById(relId);
      assert.ok(rel, `Broken related link ${relId} in article ${article.id}`);
    }
  }
}
console.log('✓ All articles and cross-references are valid.');

// Test filtering by category
const wineArticles = getArticles({ category: 'wine' });
assert.ok(wineArticles.length > 0);
assert.ok(wineArticles.every((a) => a.category === 'wine'));

// Test filtering by type
const ingredientArticles = getArticles({ type: 'ingredient' });
assert.ok(ingredientArticles.length > 0);
assert.ok(ingredientArticles.every((a) => a.type === 'ingredient'));

const locationArticles = getArticles({ type: 'location' });
assert.ok(locationArticles.length > 0);
assert.ok(locationArticles.every((a) => a.type === 'location'));

// Test combined filtering & search
const burgundyMatch = getArticles({ category: 'wine', type: 'location', searchQuery: 'Burgundy' });
assert.strictEqual(burgundyMatch.length, 1);
assert.strictEqual(burgundyMatch[0].id, 'wine-burgundy');

// Test getRelatedArticles helper
const relatedToRedBasics = getRelatedArticles('wine-red-basics');
assert.ok(relatedToRedBasics.length >= 2);
assert.ok(relatedToRedBasics.some((a) => a.id === 'wine-burgundy'));

console.log('✓ Knowledge service filtering and queries passed with 100% accuracy.');

console.log('\n=== 4. VERIFYING MULTILINGUAL LOCALIZATION & FALLBACKS ===');
// Verify every article has en and de translations
for (const article of allArticles) {
  assert.ok(article.translations, `Article ${article.id} missing translations block`);
  assert.ok(article.translations.en, `Article ${article.id} missing en translation`);
  assert.ok(article.translations.de, `Article ${article.id} missing de translation`);
  assert.ok(article.translations.en.content, `Article ${article.id} missing en content`);
  assert.ok(article.translations.de.content, `Article ${article.id} missing de content`);
  assert.ok(article.translations.en.title, `Article ${article.id} missing en title`);
  assert.ok(article.translations.de.title, `Article ${article.id} missing de title`);
  assert.ok(article.translations.en.summary, `Article ${article.id} missing en summary`);
  assert.ok(article.translations.de.summary, `Article ${article.id} missing de summary`);
}
console.log('✓ All 24 articles have complete en and de translation records.');

// Verify German article resolution
const deArticle = getArticleById('wine-pinot-noir', 'de');
assert.ok(deArticle, 'Expected German article for wine-pinot-noir');
assert.strictEqual(deArticle.title, 'Pinot Noir (Spätburgunder)');
assert.ok(deArticle.content.includes('Leitrebe'));
assert.strictEqual(deArticle.wikipediaUrl, 'https://de.wikipedia.org/wiki/Sp%C3%A4tburgunder');
console.log('✓ German article and Wikipedia link resolution verified.');

// Verify English article resolution
const enArticle = getArticleById('wine-pinot-noir', 'en');
assert.ok(enArticle, 'Expected English article for wine-pinot-noir');
assert.strictEqual(enArticle.title, 'Pinot Noir');
assert.ok(enArticle.content.includes('ancient cultivated grape'));
assert.strictEqual(enArticle.wikipediaUrl, 'https://en.wikipedia.org/wiki/Pinot_noir');
console.log('✓ English article and Wikipedia link resolution verified.');

// Verify German Wiki-Link parsing
const deWikiSegments = parseWikiLinks(deArticle.content);
const deLink = deWikiSegments.find((s) => s.type === 'link');
assert.ok(deLink, 'Expected wiki-link in German article');
assert.strictEqual(deLink.targetId, 'wine-burgundy');
assert.strictEqual(deLink.text, 'Burgunds');
console.log('✓ German wiki-links parsed with custom labels.');

// Verify Localized Search in German
const deSearchResults = getArticles({ searchQuery: 'Spätburgunder', language: 'de' });
assert.ok(deSearchResults.length >= 1, 'Expected search results for Spätburgunder in German');
assert.ok(deSearchResults.some((a) => a.id === 'wine-pinot-noir'));

const deFermentResults = getArticles({ searchQuery: 'Maischegärung', language: 'de' });
assert.ok(deFermentResults.length >= 1, 'Expected search results for Maischegärung in German');
assert.ok(deFermentResults.some((a) => a.id === 'wine-red-basics'));
console.log('✓ Localized search queries in German verified.');

// Verify Fallback for unknown language
const fallbackArticle = getArticleById('wine-red-basics', 'fr');
assert.ok(fallbackArticle, 'Expected fallback article for fr');
assert.strictEqual(fallbackArticle.title, 'Red Wine: Craft & Fundamentals');
console.log('✓ Fallback to English for unknown locales verified.');

console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
