import { BeverageArchetype } from '@/types/drink';

const BEER_IMAGE = require('@/assets/images/drinks/beer.jpg');
const WINE_IMAGE = require('@/assets/images/drinks/wine.jpg');
const COFFEE_IMAGE = require('@/assets/images/drinks/coffee.jpg');
const SPIRITS_IMAGE = require('@/assets/images/drinks/spirits.jpg');
const TEA_IMAGE = require('@/assets/images/drinks/tea.jpg');
const COCKTAIL_IMAGE = require('@/assets/images/drinks/cocktail.jpg');
const SODA_IMAGE = require('@/assets/images/drinks/soda.jpg');
const OTHER_IMAGE = require('@/assets/images/drinks/other.jpg');

export interface DrinkStyle {
  name: string;
  description: string;
  abv?: string;
  flavorNotes?: string[];
}

export interface DrinkCategoryKnowledge {
  id: string;
  archetype: BeverageArchetype;
  title: string;
  icon: string;
  tagline: string;
  bannerImage: any;
  origin: {
    era: string;
    region: string;
    history: string;
    milestones: { year: string; event: string }[];
  };
  production: {
    ingredients: string[];
    steps: { name: string; description: string }[];
    craftTrivia: string;
  };
  styles: DrinkStyle[];
  sensoryProfile: {
    keyAromas: string[];
    flavorCharacteristics: string;
    tastingTechnique: string;
  };
  serving: {
    idealTemperature: string;
    glassware: string[];
    proTips: string;
  };
  funFacts: string[];
}

export const DRINK_KNOWLEDGE_BASE_EN: DrinkCategoryKnowledge[] = [
  {
    id: 'beer',
    archetype: 'Beer',
    title: 'Beer & Ales',
    icon: '🍺',
    tagline: 'From Ancient Sumerian Bread-Beer to Modern Craft Innovations',
    bannerImage: BEER_IMAGE,
    origin: {
      era: 'c. 5000–4000 BCE (Neolithic & Bronze Age)',
      region: 'Mesopotamia (Fertile Crescent) and Ancient Egypt',
      history:
        'Beer is one of the oldest prepared beverages in human civilization. Early hunter-gatherers and Sumerians discovered that soaked cereal grains naturally fermented into an intoxicating, nutritious liquid known as "sikaru". Beer was considered a sacred gift from the goddess Ninkasi, and early agricultural settlements often built entire societal structures around grain cultivation for brewing. In medieval Europe, brewing moved into Christian monasteries where monks introduced hops for preservation and flavor balance, leading to the famous Bavarian Reinheitsgebot (Beer Purity Law) of 1516.',
      milestones: [
        { year: '4000 BCE', event: 'Sumerians record the Hymn to Ninkasi, containing the oldest surviving beer recipe.' },
        { year: '1516 CE', event: 'Bavaria establishes the Reinheitsgebot, mandating only water, barley, and hops.' },
        { year: '1842 CE', event: 'Josef Groll invents the clear golden Pilsner lager in Plzeň, Bohemia.' },
        { year: '1970s–Present', event: 'The craft beer revolution begins, revitalizing IPAs, barrel-aged sours, and microbrewing.' },
      ],
    },
    production: {
      ingredients: ['Water (90-95%)', 'Malted Grains (Barley, Wheat, Oats, Rye)', 'Hops (Humulus lupulus)', 'Yeast (Saccharomyces cerevisiae / pastorianus)'],
      steps: [
        { name: '1. Malting', description: 'Grains are soaked, allowed to germinate to release enzymes, then kilned/roasted.' },
        { name: '2. Mashing', description: 'Cracked malt is mixed with hot water to convert complex starches into fermentable sugars (wort).' },
        { name: '3. Boiling & Hopping', description: 'Wort is boiled with hops added at various intervals for bitterness, flavor, and aromatic oils.' },
        { name: '4. Fermentation', description: 'Yeast converts sugars into alcohol and carbon dioxide (Top-fermenting Ales vs Bottom-fermenting Lagers).' },
        { name: '5. Conditioning', description: 'Beer is matured, filtered or dry-hopped, and naturally or forced-carbonated.' },
      ],
      craftTrivia:
        'Hops are botanical cousins of cannabis and were originally adopted because their alpha acids provide antibacterial protection against spoilage.',
    },
    styles: [
      {
        name: 'Pilsner & Pale Lager',
        description: 'Crisp, clean, golden brews fermented at cooler temperatures with noble hop aromatics.',
        abv: '4.2% - 5.4%',
        flavorNotes: ['Crackery Malt', 'Floral Hops', 'Clean Bitter Finish'],
      },
      {
        name: 'India Pale Ale (IPA)',
        description: 'Hop-centric ales bursting with citrus, pine, tropical fruits, and assertive resinous bitterness.',
        abv: '5.5% - 7.5%',
        flavorNotes: ['Grapefruit', 'Pine Resin', 'Mango', 'Dank Herbal'],
      },
      {
        name: 'Stout & Porter',
        description: 'Dark, opaque ales brewed with roasted malts that yield rich chocolate and coffee complexity.',
        abv: '5.0% - 10.0%',
        flavorNotes: ['Dark Chocolate', 'Espresso', 'Molasses', 'Toasted Oats'],
      },
      {
        name: 'Wheat / Hefeweizen',
        description: 'Unfiltered cloudy ales characterized by distinct yeast esters producing banana and clove aromatics.',
        abv: '4.5% - 5.5%',
        flavorNotes: ['Ripe Banana', 'Clove', 'Bready Dough', 'Citrus Peel'],
      },
      {
        name: 'Wild & Sour Ales',
        description: 'Fermented with Brettanomyces and lactic bacteria for complex tartness, funk, and fruitiness.',
        abv: '4.0% - 8.0%',
        flavorNotes: ['Tart Cherry', 'Barnyard Funk', 'Lemon Zest', 'Oak'],
      },
    ],
    sensoryProfile: {
      keyAromas: ['Citrus & Tropical Hops', 'Caramel & Biscuit Malt', 'Roasted Coffee', 'Fruity Yeast Esters', 'Pine & Resin'],
      flavorCharacteristics:
        'A dynamic spectrum balancing malt sweetness, hop bitterness, effervescent carbonation, and crisp clean acidity.',
      tastingTechnique:
        '1. Inspect color and foam head retention. 2. Swirl gently and take two short sniffs. 3. Sip and let the beer coat your palate, noticing carbonation prickle and mid-palate malt weight. 4. Exhale retro-nasally for hop finish.',
    },
    serving: {
      idealTemperature: '4°C – 7°C for Light Lagers; 8°C – 12°C for IPAs & Ales; 12°C – 15°C for Imperial Stouts',
      glassware: ['Tulip / Snifter (IPAs & Strong Ales)', 'Pilsner Flute (Lagers)', 'Nonic Pint (Stouts & Bitters)', 'Weizen Glass (Wheat Beer)'],
      proTips:
        'Always rinse glassware with cold water before pouring (beer-clean glass) to eliminate detergent residue that kills head retention.',
    },
    funFacts: [
      'In ancient Babylon, brewing was sacred and if a brewer watered down beer, they could face capital punishment under the Code of Hammurabi.',
      'Medieval beer was safer to drink than public well water because boiling the wort killed pathogens.',
      'Cenosillicaphobia is the genuine fear of an empty beer glass.',
    ],
  },
  {
    id: 'wine',
    archetype: 'Wine',
    title: 'Wine & Viticulture',
    icon: '🍷',
    tagline: 'The Expression of Terroir, Ancient Grapes, and Slow Cellar Aging',
    bannerImage: WINE_IMAGE,
    origin: {
      era: 'c. 6000 BCE (Early Neolithic)',
      region: 'South Caucasus (Georgia / Armenia) & Zagros Mountains',
      history:
        'Archaeological chemical residues in Georgian clay amphorae (qvevri) prove that humans were fermenting Vitis vinifera wild grapes over 8,000 years ago. Winemaking spread through ancient Phoenician traders across the Mediterranean to Greece and Rome. Romans elevated viticulture into a science, classifying grape clones, inventing wooden barrel storage, and planting vineyards in what are today Bordeaux, Burgundy, and the Mosel Valley. In modern times, the combination of soil, climate, topography, and cellar traditions is celebrated worldwide as "terroir".',
      milestones: [
        { year: '6000 BCE', event: 'Georgian winemakers ferment crushed grapes inside beeswax-sealed clay qvevri buried underground.' },
        { year: '4100 BCE', event: 'The oldest known complete winery facility is unearthed in Areni-1 cave, Armenia.' },
        { year: '1855 CE', event: 'Emperor Napoleon III establishes the official Bordeaux Wine Classification.' },
        { year: '1976 CE', event: 'The Judgment of Paris tasting puts California and New World wines on the global prestige map.' },
      ],
    },
    production: {
      ingredients: ['Wine Grapes (Vitis vinifera cultivars)', 'Natural or Cultured Yeast', 'Sulfites (SO₂ for stabilization)'],
      steps: [
        { name: '1. Harvest & Sorting', description: 'Grapes are picked at precise sugar-to-acid (Brix) equilibrium.' },
        { name: '2. Crushing & Maceration', description: 'Red wines undergo skin contact for color, tannin, and polyphenols; white grapes are pressed immediately.' },
        { name: '3. Fermentation', description: 'Yeast transforms grape sugars into ethanol and aromatic bouquet esters.' },
        { name: '4. Aging & Malolactic Conversion', description: 'Maturation in French/American oak barrels or stainless steel vats to soften harsh malic acid into lactic acid.' },
        { name: '5. Clarification & Bottling', description: 'Fining and filtration before bottling and potential bottle-aging.' },
      ],
      craftTrivia:
        'White wine can be made from dark red grapes by pressing them immediately without letting the juice touch the skin (Blanc de Noirs).',
    },
    styles: [
      {
        name: 'Full-Bodied Red (Cabernet, Syrah)',
        description: 'Deep ruby, high tannin, structured backbone with notes of blackcurrant, cedar, and leather.',
        abv: '13.5% - 15.0%',
        flavorNotes: ['Blackberry', 'Cassis', 'Tobacco', 'Vanilla Oak'],
      },
      {
        name: 'Aromatic & Crisp White (Sauvignon, Riesling)',
        description: 'High refreshing acidity, mineral streaks, and vivacious citrus or green fruit tension.',
        abv: '11.0% - 13.5%',
        flavorNotes: ['Green Apple', 'Lime Zest', 'Flint Minerality', 'Elderflower'],
      },
      {
        name: 'Sparkling (Champagne, Cava, Prosecco)',
        description: 'Secondary fermentation creates fine, persistent mousse and bready, brioche notes.',
        abv: '11.5% - 12.5%',
        flavorNotes: ['Brioche', 'Green Pear', 'Toasted Almond', 'Chalky Citrus'],
      },
      {
        name: 'Delicate Red (Pinot Noir, Nebbiolo)',
        description: 'Translucent color, silky texture, complex floral and forest floor undergrowth aromatics.',
        abv: '12.5% - 14.0%',
        flavorNotes: ['Red Cherry', 'Rose Petal', 'Truffle', 'Forest Floor'],
      },
    ],
    sensoryProfile: {
      keyAromas: ['Primary Fruit (Berry, Citrus)', 'Secondary Oak (Vanilla, Clove)', 'Tertiary Age (Leather, Earth, Truffle)'],
      flavorCharacteristics:
        'Evaluated across 5 pillars: Sweetness (Dry vs Sweet), Acidity (Crispness), Tannin (Astringency), Alcohol (Warmth), and Body (Weight).',
      tastingTechnique:
        'The 5 S’s: See (color & rim variation), Swirl (release volatiles), Sniff (top & bottom of glass), Sip (chew the wine), and Savor (length of the finish).',
    },
    serving: {
      idealTemperature: 'White & Sparkling: 6°C – 10°C; Light Reds: 12°C – 15°C; Bold Reds: 16°C – 18°C',
      glassware: ['Bordeaux Glass (Large bowl for bold reds)', 'Burgundy Balloon (Aromatic reds)', 'White Wine Stem (Preserves chill)', 'Tulip Flute (Sparkling)'],
      proTips:
        'Decanting young, high-tannin reds 30-60 minutes prior exposes the liquid to oxygen, softening astringency and revealing fruit bouquet.',
    },
    funFacts: [
      'A single standard bottle of wine contains approximately 600 to 800 individual grapes.',
      'The punt (indentation at the bottom of a wine bottle) historically gave structural integrity to hand-blown glass bottles under pressure.',
      'Ancient Romans added lead-sweetened syrup (sapa) and seawater to their wine as flavoring and preservatives.',
    ],
  },
  {
    id: 'coffee',
    archetype: 'Coffee',
    title: 'Specialty Coffee',
    icon: '☕',
    tagline: 'The Journey from Ethiopian Cloud Forests to Single-Origin Extractions',
    bannerImage: COFFEE_IMAGE,
    origin: {
      era: 'c. 9th–15th Century CE',
      region: 'Kaffa / Ethiopian Highlands & Yemen (Mocha)',
      history:
        'Legend tells of an Ethiopian goat herder named Kaldi who noticed his herd dancing excitedly after grazing on bright red coffee cherries. Ethiopian tribes crushed cherries with animal fat as energy rations. By the 15th century, Sufi mystics in Yemen cultivated coffee trees and brewed hot "qahwa" infusions to stay alert during midnight meditative prayers. Public coffee houses (qahveh khaneh) flourished in Istanbul, Cairo, and London, becoming vibrant hubs of philosophical discourse, commerce, and political revolutions.',
      milestones: [
        { year: 'c. 850 CE', event: 'Kaldi discovers the energizing effects of the Coffea arabica shrub in Ethiopia.' },
        { year: '1555 CE', event: 'The first recorded coffeehouse opens in Constantinople (Istanbul).' },
        { year: '1901 CE', event: 'Luigi Bezzera patents the first commercial espresso extraction machine in Milan.' },
        { year: '2000s–Present', event: 'The Third Wave specialty movement treats coffee as an artisanal agriculture product like wine.' },
      ],
    },
    production: {
      ingredients: ['100% Arabica or Robusta Green Coffee Seeds', 'Filtered Water (Ideal 50-150 ppm mineral balance)'],
      steps: [
        { name: '1. Cherry Harvesting', description: 'Selective picking of ripe red cherries at high altitude (1,200m–2,200m ASL).' },
        { name: '2. Processing Method', description: 'Washed (clean acidity), Natural/Dry (heavy fruit sweetness), or Honey/Pulped Natural.' },
        { name: '3. Roasting Profile', description: 'Thermal application triggers Maillard reaction and caramelization (Light, Medium, or Dark Roast).' },
        { name: '4. Precision Grinding', description: 'Burr grinders achieve uniform particle size tailored to brew contact time.' },
        { name: '5. Controlled Extraction', description: 'Water between 90°C–96°C extracts soluble organic compounds (target 18-22% extraction yield).' },
      ],
      craftTrivia:
        'A coffee bean is not actually a bean—it is the twin seed found inside the fleshy sweet fruit of the coffee cherry.',
    },
    styles: [
      {
        name: 'Single Origin Pour Over (V60 / Chemex)',
        description: 'Delicate paper filter extraction highlighting floral, tea-like clarity and terroir nuances.',
        flavorNotes: ['Jasmine', 'Bergamot', 'Stone Fruit', 'Meyer Lemon'],
      },
      {
        name: 'Espresso (9 Bar Pressure)',
        description: 'Concentrated 25-30 second extraction producing thick syrupy crema and intense flavor density.',
        flavorNotes: ['Dark Cocoa', 'Toasted Hazelnut', 'Black Cherry', 'Molasses'],
      },
      {
        name: 'Immersion Cold Brew',
        description: 'Coarse grounds steeped in room/cold water for 16-24 hours for smooth, low-acid sweetness.',
        flavorNotes: ['Brown Sugar', 'Milk Chocolate', 'Fig', 'Vanilla'],
      },
      {
        name: 'Flat White & Cortado',
        description: 'Microfoam steamed milk harmoniously folded into espresso without overwhelming espresso terroir.',
        flavorNotes: ['Caramel Cream', 'Butterscotch', 'Sweet Praline'],
      },
    ],
    sensoryProfile: {
      keyAromas: ['Floral & Herbal', 'Citrus & Berry Acidity', 'Stone Fruit', 'Chocolate & Nutty', 'Spices & Sweet Aromatics'],
      flavorCharacteristics:
        'Specialty cupping scores evaluate Fragrance/Aroma, Acidity brightness, Body/Mouthfeel texture, Balance, and Clean Cup finish.',
      tastingTechnique:
        'Slurp vigorously from a cupping spoon to aerate the liquid across your tongue, stimulating both taste buds and olfactory bulb receptors.',
    },
    serving: {
      idealTemperature: 'Brew water: 92°C – 96°C; Drinking temperature: 55°C – 65°C (flavors blossom as cup cools)',
      glassware: ['Ceramic Tulip Cup (Espresso)', 'Double-wall Glass (Pour Over)', 'Gibraltar Tumbler (Cortado)'],
      proTips:
        'Grind right before brewing. Whole bean coffee loses up to 60% of volatile aromatics within 15 minutes of being ground.',
    },
    funFacts: [
      'Arabica coffee contains roughly 44 chromosomes and produces complex flavors, whereas Robusta contains 22 chromosomes and has double the caffeine.',
      'Coffee is the second most traded legal physical commodity in the world, surpassed only by crude oil.',
      'In 17th-century England, King Charles II attempted to ban coffeehouses, calling them hotbeds of rebellious political plots.',
    ],
  },
  {
    id: 'spirits',
    archetype: 'Spirits',
    title: 'Distilled Spirits',
    icon: '🥃',
    tagline: 'The Alchemy of Distillation, Oak Maturation, and Botanicals',
    bannerImage: SPIRITS_IMAGE,
    origin: {
      era: 'c. 1st–12th Century CE',
      region: 'Hellenistic Egypt (Alexandria) & Medieval Salerno / Arab world',
      history:
        'The science of distillation was pioneered by Greco-Egyptian alchemists who invented the alembic pot still. Medieval Islamic scholars refined distillation apparatuses, which later entered European medical schools in Salerno and Montpellier. Monks called the concentrated distillate "aqua vitae" (water of life) or "uisce beatha" in Gaelic (which evolved into "whiskey"). Originally prized as panaceas for plague and ailments, spirits evolved into regional masterpieces: Scotch, Bourbon, Cognac, Gin, and Agave spirits.',
      milestones: [
        { year: '800 CE', event: 'Alchemist Jabir ibn Hayyan designs the improved alembic still in the Middle East.' },
        { year: '1494 CE', event: 'First documented entry for Scotch whisky: Friar John Cor given malt to make "aquavitae".' },
        { year: '1789 CE', event: 'Bourbon production takes root in Kentucky with charred virgin American white oak barrels.' },
        { year: '1830 CE', event: 'Aeneas Coffey invents the continuous column still, enabling high-volume grain distillation.' },
      ],
    },
    production: {
      ingredients: ['Fermented Mash / Wash (Grain, Grape, Sugar Cane, Agave, Potato)', 'Copper Pot or Column Stills', 'Charred Oak Casks'],
      steps: [
        { name: '1. Fermentation Base', description: 'Yeasts convert source sugars into a low-ABV wash or wine (6-10% ABV).' },
        { name: '2. Fractional Distillation', description: 'Heated wash vaporizes alcohol at 78.3°C before water; vapors recondense into high-proof spirit.' },
        { name: '3. Cutting the Run', description: 'Master distiller separates harsh heads (methanol/esters) and oily tails, keeping the prized "heart".' },
        { name: '4. Cask Maturation', description: 'Years inside charred or toasted wood extract vanillin, tannins, lactones, and natural amber color.' },
        { name: '5. Proofing & Blending', description: 'Dilution with pure spring water to standard bottling strength (typically 40-50% ABV).' },
      ],
      craftTrivia:
        'The spirit that evaporates through the porous oak staves during yearly barrel aging is poetically called the "Angel’s Share" (approx. 2% per year).',
    },
    styles: [
      {
        name: 'Single Malt Scotch & Bourbon',
        description: 'Grain spirits aged in oak, ranging from peaty Islay smoke to sweet Kentucky vanilla and caramel.',
        abv: '40% - 60%',
        flavorNotes: ['Charred Oak', 'Peat Smoke', 'Vanilla', 'Honeycomb', 'Dried Fruit'],
      },
      {
        name: 'Agave (Tequila & Mezcal)',
        description: 'Distilled from slow-grown Blue Weber or wild agave hearts (piñas), often roasted in earthen pit ovens.',
        abv: '38% - 50%',
        flavorNotes: ['Cooked Agave', 'Smoky Earth', 'White Pepper', 'Citrus Peel'],
      },
      {
        name: 'London Dry & Contemporary Gin',
        description: 'Neutral grain spirit redistilled with juniper berries, coriander seeds, and citrus peel botanicals.',
        abv: '40% - 47%',
        flavorNotes: ['Pine Juniper', 'Coriander', 'Lemon Zest', 'Angelica Root'],
      },
      {
        name: 'Cognac & Aged Brandies',
        description: 'Double-distilled white wine from Charente aged for years in Limousin French oak barrels.',
        abv: '40% - 45%',
        flavorNotes: ['Dried Apricot', 'Leather', 'Nutmeg', 'Rancio'],
      },
    ],
    sensoryProfile: {
      keyAromas: ['Oak Vanillin', 'Grain / Malt', 'Peat & Smoke', 'Botanical Herbs', 'Dried Fruit & Raisin'],
      flavorCharacteristics:
        'Distinguished by alcohol warmth, viscous oily mouthfeel, oak complexity, and long resonant finish.',
      tastingTechnique:
        'Never stick your nose directly in high-proof spirit. Keep your mouth slightly open while nosing, and add a few drops of water to open the bouquet.',
    },
    serving: {
      idealTemperature: 'Neat at room temperature: 16°C – 20°C; Gin/Vodka chilled or in mixed drinks',
      glassware: ['Glencairn / Nosing Glass (Whisky & Cognac)', 'Rocks / Lowball Glass (On the rocks)', 'Copita Glass'],
      proTips:
        'Adding 2-3 drops of room-temperature spring water reduces alcohol burn and releases trapped aromatic fatty-acid esters.',
    },
    funFacts: [
      'Bourbon must legally be aged in brand new, charred oak barrels—distillers can never reuse them for Bourbon.',
      'Scotland has more barrels of aging whisky maturing in bonded warehouses than human residents.',
      'Gin must legally possess a predominant flavor of juniper berries to be categorized as gin.',
    ],
  },
  {
    id: 'tea',
    archetype: 'Tea',
    title: 'Artisanal Tea',
    icon: '🍵',
    tagline: 'From Ancient Yunnan Cloud Trees to Gongfu Ceremony Steepings',
    bannerImage: TEA_IMAGE,
    origin: {
      era: 'c. 2737 BCE (Mythological) / Shang Dynasty',
      region: 'Southwest China (Yunnan / Sichuan border)',
      history:
        'According to Chinese mythology, Emperor Shennong was boiling drinking water beneath a Camellia sinensis tree when wind-blown leaves drifted into his pot. In ancient China, tea was initially consumed as medicine and savory herbal broth before the Tang Dynasty transformed it into an exquisite cultural art form, codified in Lu Yu’s "The Classic of Tea" (Cha Jing). Zen Buddhist monks introduced tea to Japan as an aid for meditation, birthing the revered Chanoyu tea ceremony.',
      milestones: [
        { year: '2737 BCE', event: 'Emperor Shennong discovers tea when leaves fall into boiling water.' },
        { year: 'c. 760 CE', event: 'Lu Yu writes the "Cha Jing" (The Classic of Tea), the first definitive book on tea culture.' },
        { year: '1610 CE', event: 'Dutch East India Company imports the first commercial tea chests into Europe.' },
        { year: '1848 CE', event: 'Robert Fortune smuggles tea plants and knowledge out of China into Darjeeling, India.' },
      ],
    },
    production: {
      ingredients: ['Camellia sinensis leaf buds (sinensis or assamica cultivars)', 'Soft, pure spring water'],
      steps: [
        { name: '1. Selective Plucking', description: 'Hand-plucking top two leaves and an unopened bud ("two leaves and a bud").' },
        { name: '2. Withering', description: 'Leaves are laid out on bamboo trays to evaporate moisture and become pliable.' },
        { name: '3. Rolling / Bruising', description: 'Twisting and tumbling ruptures cell walls to release enzymes and essential oils.' },
        { name: '4. Oxidation Control', description: 'Green tea (0% oxidation - heat kill / fix), Oolong (20-80%), Black tea (100% full oxidation).' },
        { name: '5. Final Drying / Firing', description: 'Baking halts enzyme activity and stabilizes moisture below 3% for storage.' },
      ],
      craftTrivia:
        'All true teas (White, Green, Yellow, Oolong, Black, Pu-erh) originate from the exact same botanical plant species: Camellia sinensis.',
    },
    styles: [
      {
        name: 'Green & Matcha (Unoxidized: 0%)',
        description: 'Steamed or pan-fired to retain vibrant chlorophyll, high catechins, and sweet grassy umami.',
        flavorNotes: ['Steamed Spinach', 'Fresh Grass', 'Sweet Umami', 'Chestnut'],
      },
      {
        name: 'White Tea (Minimal Process)',
        description: 'Sun-withered tender silver buds; delicate, airy, floral, with high natural antioxidants.',
        flavorNotes: ['Melon', 'White Peach', 'Dry Hay', 'Wild Honey'],
      },
      {
        name: 'Oolong (Semi-Oxidized: 20-80%)',
        description: 'The master craft of tea; complex spectrum from light floral lilac to roasted honey and charcoal.',
        flavorNotes: ['Orchid', 'Roasted Peach', 'Honey Nectar', 'Creamy Milk'],
      },
      {
        name: 'Black / Hong Cha (Fully Oxidized: 100%)',
        description: 'Robust, tannic, amber-red liquor with malt, dried stone fruit, and dark wood richness.',
        flavorNotes: ['Malt', 'Muscatel Grape', 'Dried Plum', 'Dark Molasses'],
      },
      {
        name: 'Aged Pu-erh & Dark Tea (Post-Fermented)',
        description: 'Microbially fermented and compressed into cakes; earthy, medicinal, and soothingly smooth.',
        flavorNotes: ['Forest Loam', 'Wet Autumn Leaves', 'Camphor', 'Cocoa Shell'],
      },
    ],
    sensoryProfile: {
      keyAromas: ['Fresh Meadow Grass', 'Orchid Floral', 'Malted Grain', 'Honeyed Fruit', 'Earthy Forest Floor'],
      flavorCharacteristics:
        'Analyzed through Liquor Color clarity, Sweetness onset (Hui Gan), Astringency structure, and Throat resonance (Cha Qi).',
      tastingTechnique:
        'Gongfu Style: Brew with a high leaf-to-water ratio in a small clay Yixing pot or Gaiwan, performing multiple short 15-second steepings.',
    },
    serving: {
      idealTemperature: 'Green / White: 75°C – 80°C; Oolong: 85°C – 95°C; Black & Pu-erh: 95°C – 100°C',
      glassware: ['Gaiwan & Aroma Tasting Cups', 'Kyusu Ceramic Teapot', 'Double-Walled Glass Cup'],
      proTips:
        'Never use boiling 100°C water on delicate green or white teas—scorching hot water destroys delicate catechins and makes the cup bitter.',
    },
    funFacts: [
      'Tea is the most widely consumed beverage on Earth after plain water.',
      'L-theanine, an amino acid unique to tea, works synergistically with caffeine to induce a state of relaxed yet sharp mental focus.',
      'A vintage 50-year-old aged Pu-erh tea cake can auction for over $10,000 among international collectors.',
    ],
  },
  {
    id: 'cocktail',
    archetype: 'Cocktail',
    title: 'The Art of Mixology',
    icon: '🍸',
    tagline: 'Balance, Bitters, Ice Dynamics, and the Golden Ratios',
    bannerImage: COCKTAIL_IMAGE,
    origin: {
      era: 'c. 1806 / Mid-19th Century',
      region: 'United States (New York & New Orleans)',
      history:
        'The term "cock-tail" was first defined in print in 1806 in The Balance and Columbian Repository as "a stimulating liquor, composed of spirits of any kind, sugar, water, and bitters." Jerry Thomas, considered the father of American mixology, published "The Bartender’s Guide" in 1862. American prohibition in the 1920s drove bartenders to European capitals (Paris, London), establishing legendary hotel bars. The modern cocktail renaissance has returned to fresh citrus, house-made tinctures, and crystal-clear ice sculpting.',
      milestones: [
        { year: '1806 CE', event: 'First published definition of a cocktail in Hudson, New York.' },
        { year: '1862 CE', event: 'Jerry Thomas releases "How to Mix Drinks", establishing bartending as a professional culinary craft.' },
        { year: '1920–1933 CE', event: 'Prohibition creates speakeasy culture and spreads classic recipes internationally.' },
        { year: '2000s–Present', event: 'Craft cocktail renaissance led by Sasha Petraske (Milk & Honey) and Dale DeGroff.' },
      ],
    },
    production: {
      ingredients: ['Base Spirit (40-50ml)', 'Modifier / Vermouth / Liqueur', 'Acid (Fresh Lemon / Lime Juice)', 'Sweetener (Simple / Rich Syrups)', 'Bitters & Aromatics'],
      steps: [
        { name: '1. Jigger Precision', description: 'Exact volumetric measurement to preserve harmonious structural balance.' },
        { name: '2. Shaking (Citrus Drinks)', description: 'Aggressive shake with dense ice to chill, aerate, and achieve proper dilution.' },
        { name: '3. Stirring (Spirit-Forward)', description: 'Gentle rotational stirring for 30-45 seconds to create a silky, crystal-clear texture without air bubbles.' },
        { name: '4. Fine Straining', description: 'Hawthorne and fine mesh strainers remove ice shards that would over-dilute the glass.' },
        { name: '5. Citrus Expression', description: 'Twisting citrus peel over the rim sprays essential citrus oils across the surface.' },
      ],
      craftTrivia:
        'Dilution is not a flaw—it is a mandatory ingredient! A properly shaken or stirred cocktail incorporates 20% to 25% chilled water from ice.',
    },
    styles: [
      {
        name: 'Old Fashioned & Manhattan',
        description: 'The archetype spirit-forward drinks: whiskey balanced with sugar/vermouth and aromatic Angostura bitters.',
        flavorNotes: ['Bourbon / Rye', 'Orange Oil', 'Spiced Bitters', 'Luxardo Cherry'],
      },
      {
        name: 'The Sour Family (Daiquiri, Margarita)',
        description: 'The golden ratio of 2 parts base spirit : 1 part fresh acid : 0.75 parts sweet balance.',
        flavorNotes: ['Crisp Lime', 'Agave / Cane Sugar', 'Bright Refreshing Spirit'],
      },
      {
        name: 'The Negroni & Boulevardier',
        description: 'Equal parts gin (or bourbon), sweet red vermouth, and Italian bitter aperitivo (Campari).',
        flavorNotes: ['Gentian Bitter', 'Orange Zest', 'Sweet Botanical Vermouth'],
      },
      {
        name: 'Martini (Gin or Vodka)',
        description: 'The quintessential minimalist cocktail: crisp dry spirit, dry French vermouth, and a lemon twist or olive.',
        flavorNotes: ['Pine Juniper', 'Crisp Saline', 'Lemon Peel Essence'],
      },
    ],
    sensoryProfile: {
      keyAromas: ['Fresh Citrus Oils', 'Botanical Herbs & Roots', 'Spicy Bitters', 'Spirit Base'],
      flavorCharacteristics:
        'A flawless tension between Sweet, Sour, Bitter, Saline, and Alcoholic Punch, where no single note overpowers the others.',
      tastingTechnique:
        'Evaluate the first aromatic hit from the garnish express, then the crisp initial chill, followed by the mid-palate balance and lingering bittersweet finish.',
    },
    serving: {
      idealTemperature: 'Served "Up": -2°C to 0°C; Served "On the Rocks": 0°C to 2°C with directional clear ice block',
      glassware: ['Coupe / Nick & Nora Glass', 'Double Old Fashioned / Lowball Tumbler', 'Highball / Collins Glass'],
      proTips:
        'Always chill your glassware in the freezer for 10 minutes before pouring your finished cocktail.',
    },
    funFacts: [
      'The phrase "hair of the dog" originally referred to a folk remedy of placing dog hairs on a rabies bite wound before it became slang for morning hangover drinks.',
      'Directionally frozen clear ice is transparent because water freezes from one direction, pushing trapped air bubbles and impurities to the discarded bottom.',
      'Ernest Hemingway had a custom sugar-free Daiquiri recipe made for him at Havana’s El Floridita bar with double rum and grapefruit juice (The Hemingway Daiquiri).',
    ],
  },
  {
    id: 'soda-tonics',
    archetype: 'Soda & Tonics',
    title: 'Sodas, Tonics & Botanicals',
    icon: '🫧',
    tagline: 'Carbonation Chemistry, Quinine Roots, and Artisanal Mixers',
    bannerImage: SODA_IMAGE,
    origin: {
      era: 'c. 1767–1850s CE',
      region: 'England, Switzerland & British Colonial India',
      history:
        'In 1767, English scientist Joseph Priestley discovered how to artificially carbonate water by holding water bowls over fermenting beer vats. Jacob Schweppe industrialized the process in Geneva in 1783. In the 1800s, British colonial officers in tropical India mixed bitter medicinal quinine (extracted from South American cinchona bark to prevent malaria) with carbonated water, sugar, and gin—creating the iconic Gin & Tonic. Today, craft botanical sodas and tonics celebrate cold-pressed fruits, roots, and natural effervescence.',
      milestones: [
        { year: '1767 CE', event: 'Joseph Priestley invents carbonated water in Leeds, England.' },
        { year: '1783 CE', event: 'Jacob Schweppe perfects the commercial carbonation process and founds Schweppes.' },
        { year: '1858 CE', event: 'Erasmus Bond patents the first commercial "Aerated Tonic Water" with medicinal cinchona quinine.' },
        { year: '2005–Present', event: 'Craft premium mixer revival pioneered by brands focusing on natural botanicals.' },
      ],
    },
    production: {
      ingredients: ['Purified Spring Water', 'Cinchona Bark Extract (Quinine)', 'Natural Cane Sugar / Agave', 'Botanical Extracts (Lemongrass, Bitter Orange, Ginger)', 'CO₂ Pressure'],
      steps: [
        { name: '1. Water Demineralization', description: 'Water is filtered to ensure pristine clean canvas without metallic off-tastes.' },
        { name: '2. Botanical Infusion', description: 'Essential oils, roots, and citrus zests are macerated or vapor-extracted.' },
        { name: '3. Sweetness & Acid Balance', description: 'Citric or malic acid is balanced with unrefined cane sugar for crisp mouthfeel.' },
        { name: '4. High-Pressure Carbonation', description: 'CO₂ is dissolved at cold temperatures (1°C–3°C) to create fine, champagne-like micro-bubbles.' },
        { name: '5. Sterile Bottling', description: 'Glass bottling under pressure locks in carbonation retention.' },
      ],
      craftTrivia:
        'Tonic water glows bright electric blue under UV / blacklight due to the natural fluorescence of quinine molecules.',
    },
    styles: [
      {
        name: 'Indian & Mediterranean Tonic Water',
        description: 'Crisp, refreshing balance of bitter quinine, zesty citrus peel, and gentle botanical herbs.',
        flavorNotes: ['Cinchona Bitter', 'Lemon Verbena', 'Fresh Thyme', 'Cane Sugar'],
      },
      {
        name: 'Artisanal Ginger Beer & Ginger Ale',
        description: 'Brewed with real pressed ginger root, cane sugar, and lime for a fiery, spicy throat kick.',
        flavorNotes: ['Fiery Ginger', 'Lime Juice', 'Warm Pepper', 'Caramel'],
      },
      {
        name: 'Craft Botanical Colas & Bitters',
        description: 'Complex spice blends featuring kola nut, cinnamon bark, vanilla bean, and nutmeg.',
        flavorNotes: ['Kola Nut', 'Cinnamon', 'Clove', 'Madagascar Vanilla'],
      },
      {
        name: 'Sparkling Mineral & Seltzers',
        description: 'Zero-sugar naturally or artificially carbonated water with crisp mineral crispness.',
        flavorNotes: ['Pure Effervescence', 'Clean Crisp Finish'],
      },
    ],
    sensoryProfile: {
      keyAromas: ['Fresh Citrus Zest', 'Pungent Fresh Ginger', 'Botanical Herbs', 'Clean Effervescence'],
      flavorCharacteristics:
        'Defined by Bubble Size (fine prickle vs aggressive bite), Dry Bitterness finish, and refreshing palate-cleansing acidity.',
      tastingTechnique:
        'Pour down the side of a tilted glass to preserve carbonation. Taste neat at 4°C to evaluate sweetness-to-bitter balance and bubble persistence.',
    },
    serving: {
      idealTemperature: 'Ice Cold: 2°C – 4°C',
      glassware: ['Highball Glass', 'Stemmed Copa / Balloon Glass (for G&T with fresh botanicals)'],
      proTips:
        'When mixing with spirits, pour the tonic gently down a spiral barspoon into ice to prevent losing up to 40% of carbonation on impact.',
    },
    funFacts: [
      'Early American soda fountains were housed inside pharmacies because pharmacists originally dispensed carbonated tonic medicines.',
      'Quinine extracted from the bark of the Andean "Fever Tree" (Cinchona) saved millions of lives from malaria throughout the 19th and 20th centuries.',
      'High-grade craft tonic water uses 100% natural cane sugar instead of high-fructose corn syrup, producing a significantly cleaner finish.',
    ],
  },
  {
    id: 'other',
    archetype: 'Other',
    title: 'Heritage & Specialty Ferments',
    icon: '✨',
    tagline: 'Mead, Cider, Sake, and Ancient Botanical Potions',
    bannerImage: OTHER_IMAGE,
    origin: {
      era: 'c. 7000 BCE – Present',
      region: 'Global: Scandinavia, Japan, Normandy, Caucasus',
      history:
        'Beyond modern beer and wine lies humanity’s broader heritage of fermented drinks. Mead (honey wine) is widely considered humanity’s very first alcoholic beverage, predating agriculture when rainwater naturally fermented wild beehives. In Japan, Sake (Nihonshu) evolved as a sacred imperial and Shinto offering using Koji mold (Aspergillus oryzae) for multiple parallel fermentation. In Western Europe, crisp apple Ciders and pear Perries sustained rural agrarian societies for centuries.',
      milestones: [
        { year: '7000 BCE', event: 'Chemical proof of fermented honey, rice, and fruit beverages found in Jiahu, Henan, China.' },
        { year: '700 CE', event: 'Nara period in Japan: Sake brewing becomes institutionalized under the Imperial Court.' },
        { year: '1700s CE', event: 'Cider becomes the staple everyday beverage of colonial America and rural England.' },
        { year: '2010s–Present', event: 'Global renaissance of craft meaderies, natural ciders, and raw probiotic kombuchas.' },
      ],
    },
    production: {
      ingredients: ['Raw Honey (Mead)', 'Heritage Cider Apples (Malus domestica)', 'Polished Rice & Koji Mold (Sake)', 'Fermentation Cultures'],
      steps: [
        { name: '1. Raw Material Preparation', description: 'Pressing bittersharp/bittersweet heirloom apples, milling rice, or diluting raw unpasteurized honey.' },
        { name: '2. Inoculation & Conversion', description: 'In sake, koji mold converts rice starches to sugars while yeast ferments them simultaneously (Multiple Parallel Fermentation).' },
        { name: '3. Slow Fermentation', description: 'Cold fermentation preserves delicate floral, honey, and ester aromatics.' },
        { name: '4. Racking & Maturation', description: 'Aging in wood barrels, stainless tanks, or ceramic jars.' },
        { name: '5. Blending & Finishing', description: 'Balancing residual sweetness, tart malic/lactic acidity, and natural effervescence.' },
      ],
      craftTrivia:
        'Sake brewing is neither wine nor beer��its unique simultaneous saccharification and fermentation can achieve over 20% natural ABV without distillation.',
    },
    styles: [
      {
        name: 'Traditional & Melomel Mead',
        description: 'Fermented honey wine ranging from bone-dry to rich dessert sweetness, often infused with fruits or spices.',
        abv: '6% - 14%',
        flavorNotes: ['Wildflower Honey', 'Orange Blossom', 'Honeycomb', 'Beeswax'],
      },
      {
        name: 'Heritage Cider & Perry',
        description: 'Tannic, dry, complex fermentations made from dedicated cider apple varieties with rustic farmhouse funk.',
        abv: '5.0% - 8.5%',
        flavorNotes: ['Tannic Apple Skin', 'Barnyard Funk', 'Citrus Acidity', 'Baked Pear'],
      },
      {
        name: 'Junmai Daiginjo Sake',
        description: 'Super-premium sake with rice polished to 50% or less, delivering ethereal aromas of melon, lychee, and clean water.',
        abv: '14% - 16%',
        flavorNotes: ['Honeydew Melon', 'Lychee', 'White Peach', 'Spring Water'],
      },
      {
        name: 'Raw Living Kombucha',
        description: 'Effervescent fermented sweet tea cultured with a SCOBY, packed with crisp acetic tang and living probiotics.',
        abv: '0.5% - 1.5%',
        flavorNotes: ['Tart Apple Vinegar', 'Green Apple', 'Lemon Zest', 'Fresh Ginger'],
      },
    ],
    sensoryProfile: {
      keyAromas: ['Wild Blossom Honey', 'Rustic Apple Tannin', 'Melon & Rice Esters', 'Crisp Tangy Ferment'],
      flavorCharacteristics:
        'An expansive range balancing unrefined natural sugars, farm-fresh fruit acidity, earthy wild funk, and live effervescence.',
      tastingTechnique:
        'Swirl in a white wine glass to observe natural unfiltered sediment or crystalline clarity. Sip slowly to assess balance of honey/fruit sweetness against crisp tart acidity.',
    },
    serving: {
      idealTemperature: 'Cider & Kombucha: 4°C – 6°C; Daiginjo Sake: 8°C – 10°C; Mead: 10°C – 14°C',
      glassware: ['White Wine Stem', 'Ochoko Ceramic Cup (Sake)', 'Traditional Horn / Goblet (Mead)'],
      proTips:
        'Treat heritage cider like fine white wine: serve in stemmed glassware at cellar temp to allow complex terroir and rustic tannins to breathe.',
    },
    funFacts: [
      'The term "honeymoon" originated from the ancient tradition where newlyweds drank mead daily for one full moon cycle to ensure fertility and happiness.',
      'Normandy cider orchards cultivate over 700 distinct heritage apple varieties specifically bred for cider production.',
      'To brew Junmai Daiginjo sake, master brewers often mill rice kernels for over 50 hours continuously to remove protein-rich outer layers.',
    ],
  },
];

export const DRINK_KNOWLEDGE_BASE_DE: DrinkCategoryKnowledge[] = [
  {
    id: 'beer',
    archetype: 'Beer',
    title: 'Bier & Braukunst',
    icon: '🍺',
    tagline: 'Vom antiken sumerischen Fladenbrot-Bier bis zur modernen Craft-Bier-Bewegung',
    bannerImage: BEER_IMAGE,
    origin: {
      era: 'ca. 5000–4000 v. Chr. (Jungsteinzeit & Bronzezeit)',
      region: 'Mesopotamien (Fruchtbarer Halbmond) & Altes Ägypten',
      history:
        'Bier zählt zu den ältesten zubereiteten Getränken der Menschheit. Bereits frühe Jäger und Sammler sowie die Sumerer entdeckten, dass eingeweichte Getreidekörner auf natürliche Weise zu einer berauschenden, nahrhaften Flüssigkeit namens "Sikaru" vergoren. Bier galt als heilige Gabe der Göttin Ninkasi. Im mittelalterlichen Europa verlagerte sich das Brauwesen in christliche Klöster, wo Mönche Hopfen zur Konservierung und Geschmacksharmonisierung einführten – was 1516 zum berühmten bayerischen Reinheitsgebot führte.',
      milestones: [
        { year: '4000 v. Chr.', event: 'Sumerer verfassen die Ninkasi-Hymne mit dem ältesten überlieferten Bierrezept.' },
        { year: '1516 n. Chr.', event: 'In Bayern wird das Reinheitsgebot erlassen (nur Wasser, Gerste und Hopfen).' },
        { year: '1842 n. Chr.', event: 'Josef Groll braut im böhmischen Pilsen das erste goldene Pilsner Lager.' },
        { year: '1970er–heute', event: 'Die Craft-Beer-Revolution revitalisiert IPAs, holzfassgereifte Sauerbiere und Mikrobrauereien.' },
      ],
    },
    production: {
      ingredients: ['Wasser (90–95 %)', 'Braumalz (Gerste, Weizen, Hafer, Roggen)', 'Hopfen (Humulus lupulus)', 'Hefe (Saccharomyces cerevisiae / pastorianus)'],
      steps: [
        { name: '1. Mälzen', description: 'Getreide wird eingeweicht, zum Keimen gebracht, um Enzyme zu aktivieren, und anschließend gedarrt/geröstet.' },
        { name: '2. Maischen', description: 'Geschrotetes Malz wird mit heißem Wasser vermengt, um Stärke in vergärbaren Zucker (Würze) umzuwandeln.' },
        { name: '3. Kochen & Hopfung', description: 'Die Würze wird gekocht; Hopfen wird für Bitterkeit, Aroma und ätherische Öle zugegeben.' },
        { name: '4. Gärung', description: 'Hefe wandelt Zucker in Alkohol und Kohlensäure um (obergärige Ales vs. untergärige Lager).' },
        { name: '5. Reifung & Lagerung', description: 'Das Bier reift, wird geklärt oder kaltgehopft und karbonisiert.' },
      ],
      craftTrivia:
        'Hopfen ist botanisch mit Hanf verwandt und wurde ursprünglich genutzt, weil seine Alphawürzsäuren antibakteriell vor Verderb schützen.',
    },
    styles: [
      {
        name: 'Pils & Helles Lager',
        description: 'Knackig-frische, goldene Biere, kalt vergoren mit feiner Hopfenblume.',
        abv: '4,2 % - 5,4 %',
        flavorNotes: ['Keksiges Malz', 'Floraler Hopfen', 'Klarer herber Abgang'],
      },
      {
        name: 'India Pale Ale (IPA)',
        description: 'Hopfenbetonte Ales mit Aromen von Zitrus, Kiefernharz, Tropenfrüchten und markanter Bittere.',
        abv: '5,5 % - 7,5 %',
        flavorNotes: ['Grapefruit', 'Kiefernharz', 'Mango', 'Würzige Kräuter'],
      },
      {
        name: 'Stout & Porter',
        description: 'Dunkle, blickdichte Biere mit Röstmalzen, die reichhaltige Noten von Schokolade und Espresso hervorbringen.',
        abv: '5,0 % - 10,0 %',
        flavorNotes: ['Dunkle Schokolade', 'Espresso', 'Melasse', 'Gerösteter Hafer'],
      },
      {
        name: 'Weizenbier / Hefeweizen',
        description: 'Unfiltrierte, naturtrübe Biere mit typischen Hefe-Estern, die Aromen von Banane und Nelke erzeugen.',
        abv: '4,5 % - 5,5 %',
        flavorNotes: ['Reife Banane', 'Gewürznelke', 'Frisches Brot', 'Zitrusabrieb'],
      },
      {
        name: 'Sauerbier & Wild Ales',
        description: 'Vergoren mit Brettanomyces und Milchsäurebakterien für komplexe Säure, Fruchtigkeit und Funk.',
        abv: '4,0 % - 8,0 %',
        flavorNotes: ['Sauerkirsche', 'Funk', 'Zitronenschale', 'Eichenholz'],
      },
    ],
    sensoryProfile: {
      keyAromas: ['Zitrus- & Tropenhopfen', 'Karamell- & Biskuitmalz', 'Röstkaffee', 'Fruchtige Hefe-Ester', 'Kiefer & Harz'],
      flavorCharacteristics:
        'Ein dynamisches Spektrum im Gleichgewicht aus Malzsüße, Hopfenbittere, feinperligem Prickeln und sauberer Frische.',
      tastingTechnique:
        '1. Farbe und Schaumkrone betrachten. 2. Glas schwenken und zweimal kurz riechen. 3. Schlucken und den gesamten Gaumen benetzen. 4. Retronasal ausatmen für das Hopfenfinale.',
    },
    serving: {
      idealTemperature: '4 °C – 7 °C für helle Lager; 8 °C – 12 °C für IPAs & Ales; 12 °C – 15 °C für Imperial Stouts',
      glassware: ['Tulpe / Snifter (IPAs & Starkbiere)', 'Pilsstange / Flöte (Lager)', 'Nonic Pint (Stouts & Bitters)', 'Weizenglas (Weizenbier)'],
      proTips:
        'Gläser vor dem Einschenken immer kalt mit klarem Wasser ausspülen, um Spülmittelreste zu entfernen, die die Schaumkrone zerstören.',
    },
    funFacts: [
      'Im antiken Babylon galt das Brauen als heilig. Verwässertes Bier konnte nach dem Codex Hammurapi mit dem Tode bestraft werden.',
      'Im Mittelalter war Bier oft sicherer zu trinken als Brunnenwasser, weil das Kochen der Würze Keime abtötete.',
      'Cenosillicaphobie bezeichnet die tatsächliche Angst vor einem leeren Bierglas.',
    ],
  },
  {
    id: 'wine',
    archetype: 'Wine',
    title: 'Wein & Weinbau',
    icon: '🍷',
    tagline: 'Der Ausdruck von Terroir, uralten Rebsorten und meisterhafter Kellerreifung',
    bannerImage: WINE_IMAGE,
    origin: {
      era: 'ca. 6000 v. Chr. (Frühes Neolithikum)',
      region: 'Südkaukasus (Georgien / Armenien) & Zagros-Gebirge',
      history:
        'Chemische Rückstände in georgischen Tonamphoren (Kwewri) belegen, dass Menschen bereits vor über 8.000 Jahren Trauben der Edlen Weinrebe vergoren. Phönizische Händler verbreiteten den Weinbau im Mittelmeerraum. Die Römer erhoben ihn zur Wissenschaft, erfanden das Holzfass und legten Weinberge in Bordeaux, Burgund und an der Mosel an. Bis heute gilt das Zusammenspiel aus Boden, Klima, Hanglage und Tradition als das Herzstück des Terroirs.',
      milestones: [
        { year: '6000 v. Chr.', event: 'Georgische Winzer vergären Trauben in im Boden vergrabenen Tonamphoren (Kwewri).' },
        { year: '4100 v. Chr.', event: 'In der Höhle Areni-1 in Armenien wird die älteste vollständig erhaltene Weinkellerei entdeckt.' },
        { year: '1855 n. Chr.', event: 'Kaiser Napoleon III. führt die offizielle Bordeaux-Klassifizierung ein.' },
        { year: '1976 n. Chr.', event: 'Die Weinjury von Paris katapultiert Weine aus Übersee (Kalifornien) auf die globale Weltbühne.' },
      ],
    },
    production: {
      ingredients: ['Weintrauben (Vitis vinifera)', 'Reinzucht- oder Wildhefen', 'Sulfite (zur Stabilisierung)'],
      steps: [
        { name: '1. Lese & Selektion', description: 'Trauben werden im optimalen Zucker-Säure-Gleichgewicht geerntet.' },
        { name: '2. Maischung & Pressung', description: 'Rotweine gären auf der Maische für Farbe und Tannine; Weißweine werden rasch gepresst.' },
        { name: '3. Gärung', description: 'Hefen wandeln Traubenzucker in Alkohol und feine Aromen um.' },
        { name: '4. Ausbau & Malolaktische Gärung', description: 'Reifung in Holzfässern (Barrique) oder Edelstahltanks zur Harmonisierung der Säure.' },
        { name: '5. Klärung & Abfüllung', description: 'Schonende Filtration vor der Flaschenfüllung und weiteren Flaschenreife.' },
      ],
      craftTrivia:
        'Weißwein kann auch aus roten Trauben gekeltert werden, wenn der Saft sofort und ohne Schalenkontakt abgepresst wird (Blanc de Noirs).',
    },
    styles: [
      {
        name: 'Kräftige Rotweine (Cabernet, Syrah)',
        description: 'Tiefes Rubinrot, präsentes Tannin, dichte Struktur mit Cassis, Zeder und Leder.',
        abv: '13,5 % - 15,0 %',
        flavorNotes: ['Brombeere', 'Cassis', 'Tabak', 'Vanilleholz'],
      },
      {
        name: 'Frische & mineralische Weißweine (Riesling, Sauvignon)',
        description: 'Lebendige Säure, feine Mineralik und knackige Fruchtspannung.',
        abv: '11,0 % - 13,5 %',
        flavorNotes: ['Grüner Apfel', 'Zitronenabrieb', 'Feuerstein', 'Holunderblüte'],
      },
      {
        name: 'Schaumweine (Champagner, Winzersekt, Cava)',
        description: 'Zweite Gärung sorgt für feinperliges Mousseux und hefige Briochenoten.',
        abv: '11,5 % - 12,5 %',
        flavorNotes: ['Brioche', 'Grüne Birne', 'Geröstete Mandel', 'Kalkige Zitrusnoten'],
      },
      {
        name: 'Elegante Rotweine (Spätburgunder / Pinot Noir, Nebbiolo)',
        description: 'Transparente Farbe, samtige Textur und vielschichtige Wald- und Beerenaromen.',
        abv: '12,5 % - 14,0 %',
        flavorNotes: ['Sauerkirsche', 'Rosenblätter', 'Trüffel', 'Waldboden'],
      },
    ],
    sensoryProfile: {
      keyAromas: ['Primärfrucht (Beeren, Zitrus)', 'Sekundärnoten (Eichenholz, Vanille)', 'Tertiäraromen (Leder, Trüffel, Unterholz)'],
      flavorCharacteristics:
        'Bewertet nach den 5 Säulen: Süße, Säure, Tanninstruktur, Alkoholwärme und Körper.',
      tastingTechnique:
        'Die 5 Schritte: Sehen (Farbe & Viskosität), Schwenken (Aromafreisetzung), Riechen, Schmecken (im Mund bewegen) und Nachhall prüfen.',
    },
    serving: {
      idealTemperature: 'Weiß- & Schaumweine: 6 °C – 10 °C; Leichte Rotweine: 12 °C – 15 °C; Kräftige Rotweine: 16 °C – 18 °C',
      glassware: ['Bordeaux-Glas (großer Kelch)', 'Burgunder-Ballon', 'Weißweinglas', 'Tulpenglas (Schaumwein)'],
      proTips:
        'Junge, tanninreiche Rotweine 30–60 Minuten vor dem Genuss dekantieren, damit Sauerstoff die Tannine abrundet.',
    },
    funFacts: [
      'In einer Standardflasche Wein stecken ca. 600 bis 800 einzelne Weintrauben.',
      'Der Flaschenboden-Einstich (Culot) verlieh mundgeblasenen Glasflaschen historisch Stabilität.',
      'Im antiken Rom mischte man eingedickten Traubensirup und Meerwasser in den Wein.',
    ],
  },
  {
    id: 'coffee',
    archetype: 'Coffee',
    title: 'Spezialitätenkaffee',
    icon: '☕',
    tagline: 'Von den äthiopischen Nebelwäldern bis zur Single-Origin-Filterextraktion',
    bannerImage: COFFEE_IMAGE,
    origin: {
      era: 'ca. 9.–15. Jahrhundert n. Chr.',
      region: 'Kaffa / Äthiopisches Hochland & Jemen (Mokka)',
      history:
        'Der Legende nach bemerkte der äthiopische Ziegenhirte Kaldi, wie seine Herde nach dem Verzehr roter Kaffeekirschen voller Energie herumsprang. Im 15. Jahrhundert kultivierten Sufi-Mönche im Jemen Kaffeesträucher, um bei nächtlichen Gebeten wach zu bleiben. Kaffeehäuser in Istanbul, Kairo, Venedig und London entwickelten sich zu Zentren des Austauschs, der Wissenschaft und Aufklärung.',
      milestones: [
        { year: 'ca. 850 n. Chr.', event: 'Kaldi entdeckt in Äthiopien die belebende Wirkung der Coffea-Arabica-Pflanze.' },
        { year: '1555 n. Chr.', event: 'In Konstantinopel (Istanbul) eröffnet das erste überlieferte Kaffeehaus.' },
        { year: '1901 n. Chr.', event: 'Luigi Bezzera patentiert in Mailand die erste kommerzielle Espressomaschine.' },
        { year: '2000er–heute', event: 'Die Third-Wave-Bewegung zelebriert Kaffee als handwerkliches Agrarprodukt mit Terroir.' },
      ],
    },
    production: {
      ingredients: ['100 % Arabica- oder Robusta-Rohkaffeebohnen', 'Gefiltertes Wasser (idealerweise 50–150 ppm Mineralien)'],
      steps: [
        { name: '1. Ernte der Kaffeekirschen', description: 'Selektives Pflücken reifer Kirschen im Hochland (1.200 m – 2.200 m ü. M.).' },
        { name: '2. Aufbereitung', description: 'Washed (klare Säure), Natural/Trocken (ausgeprägte Fruchtsüße) oder Honey.' },
        { name: '3. Röstprofil', description: 'Gezielte Röstung steuert Maillard-Reaktion und Karamellisierung (Hell, Mittel, Dunkel).' },
        { name: '4. Präzisionsmahlung', description: 'Scheiben- oder Kegelmahlwerke für gleichmäßige Korngröße passend zur Brühmethode.' },
        { name: '5. Kontrollierte Extraktion', description: 'Wasser zwischen 90 °C–96 °C löst wertvolle Aromastoffe (18–22 % Extraktionsausbeute).' },
      ],
      craftTrivia:
        'Kaffeebohnen sind biologisch gar keine Bohnen, sondern die paarigen Samen im Inneren der süßen Kaffeekirsche.',
    },
    styles: [
      {
        name: 'Single Origin Pour Over (V60 / Chemex)',
        description: 'Feine Filterextraktion mit floraler Klarheit und eleganter Fruchtnote.',
        flavorNotes: ['Jasmin', 'Bergamotte', 'Pfirsich', 'Zitrone'],
      },
      {
        name: 'Espresso (9 Bar Druck)',
        description: 'Konzentrierte 25–30 Sekunden Extraktion mit dichter Crema und intensiver Aromadichte.',
        flavorNotes: ['Dunkler Kakao', 'Geröstete Haselnuss', 'Schwarzkirsche', 'Melasse'],
      },
      {
        name: 'Cold Brew',
        description: 'Grobes Kaffeemehl zieht 16–24 Stunden in kaltem Wasser für milde, säurearme Schokoladensüße.',
        flavorNotes: ['Brauner Zucker', 'Vollmilchschokolade', 'Feige', 'Vanille'],
      },
      {
        name: 'Flat White & Cortado',
        description: 'Seidiger Mikroschaum, harmonisch eingegossen in Espresso ohne das Terroir zu überdecken.',
        flavorNotes: ['Karamellcreme', 'Buttertoffee', 'Süße Praline'],
      },
    ],
    sensoryProfile: {
      keyAromas: ['Blumig & Kräuterig', 'Zitrus- & Beerensäure', 'Steinobst', 'Schokolade & Nuss', 'Würzige Röstnoten'],
      flavorCharacteristics:
        'Professionelles Cupping bewertet Duft/Aroma, Säurebrillanz, Körper/Mundgefühl, Balance und Reinheit.',
      tastingTechnique:
        'Kaffee laut und schwungvoll vom Cupping-Löffel schlürfen, um ihn fein im Mundraum und Rachen zu vernebeln.',
    },
    serving: {
      idealTemperature: 'Brühwasser: 92 °C – 96 °C; Trinktemperatur: 55 °C – 65 °C (Aromen entfalten sich beim Abkühlen)',
      glassware: ['Keramik-Tasse (Espresso)', 'Doppelwandiges Glas (Filterkaffee)', 'Tumbler (Cortado)'],
      proTips:
        'Immer erst direkt vor dem Brühen mahlen. Gemahlener Kaffee verliert innerhalb von 15 Minuten bis zu 60 % seiner flüchtigen Aromen.',
    },
    funFacts: [
      'Arabica-Kaffee besitzt 44 Chromosomen für komplexe Aromen, während Robusta 22 besitzt und doppelt so viel Koffein enthält.',
      'Kaffee ist nach Erdöl eines der meistgehandelten Rohgüter der Welt.',
      'König Karl II. von England versuchte im 17. Jahrhundert Kaffeehäuser als Horte rebellischer Verschwörungen zu verbieten.',
    ],
  },
  {
    id: 'spirits',
    archetype: 'Spirits',
    title: 'Edle Spirituosen & Destillate',
    icon: '🥃',
    tagline: 'Die Alchemie der Destillation, Holzfassreifung und Botanicals',
    bannerImage: SPIRITS_IMAGE,
    origin: {
      era: 'ca. 1.–12. Jahrhundert n. Chr.',
      region: 'Hellenistisches Ägypten (Alexandria) & Arabische Welt / Salerno',
      history:
        'Die Destillationskunst wurde von Alchemisten in Alexandria erfunden, die den Alambic-Brennkolben entwickelten. Islamische Gelehrte verfeinerten die Technik, die später über italienische Klosterschulen nach Europa gelangte. Das hochprozentige Destillat wurde als "Aqua Vitae" (Lebenswasser) oder gälisch "Uisce Beatha" (woraus "Whisky" entstand) bezeichnet. Ursprünglich als Medizin geschätzt, entstanden daraus regionale Meisterwerke: Scotch, Bourbon, Cognac, Gin und Agavenbrände.',
      milestones: [
        { year: '800 n. Chr.', event: 'Der Alchemist Dschābir ibn Hayyān verbessert den Alambic-Destillierkolben.' },
        { year: '1494 n. Chr.', event: 'Erste urkundliche Erwähnung von schottischem Whisky ("Aquavitae").' },
        { year: '1789 n. Chr.', event: 'In Kentucky beginnt die Bourbon-Tradition in ausgekohlten Fässern aus amerikanischer Weißeiche.' },
        { year: '1830 n. Chr.', event: 'Aeneas Coffey erfindet die kontinuierliche Kolonnendestillation.' },
      ],
    },
    production: {
      ingredients: ['Vergorene Maische (Getreide, Trauben, Zuckerrohr, Agave, Kartoffeln)', 'Kupferbrennblasen oder Kolonnen', 'Eichenholzfässer'],
      steps: [
        { name: '1. Maischegärung', description: 'Hefen vergären den zuckerhaltigen Rohstoff zu einer Maische mit 6–10 % vol.' },
        { name: '2. Destillation', description: 'Erhitzter Alkohol verdampft bei 78,3 °C vor dem Wasser und kondensiert wieder.' },
        { name: '3. Abtrennung (Herzstück)', description: 'Vorlauf (Methanol) und Nachlauf (Fusillöle) werden abgetrennt; nur das reine Herzstück wird verwendet.' },
        { name: '4. Fasslagerung', description: 'Jahre im getoasteten Holzfass schenken Vanillin, Tannine und goldene Bernsteinfarbe.' },
        { name: '5. Vermählung & Herabsetzen', description: 'Verdünnung mit reinem Quellwasser auf Trinkstärke (meist 40–50 % vol).' },
      ],
      craftTrivia:
        'Der Anteil an Destillat, der jährlich durch das poröse Holz der Fässer verdunstet, wird poetisch als "Angel’s Share" (Engelsanteil) bezeichnet.',
    },
    styles: [
      {
        name: 'Single Malt Scotch & Bourbon',
        description: 'Im Eichenfass gereifte Getreidebrände – von torfig-rauchigem Islay-Whisky bis zu süßem Vanille-Karamell-Bourbon.',
        abv: '40 % - 60 %',
        flavorNotes: ['Getoastetes Eichenholz', 'Torfrauch', 'Vanille', 'Honigwabe', 'Trockenobst'],
      },
      {
        name: 'Agavenbrände (Tequila & Mezcal)',
        description: 'Aus sonnengereiften Agavenherzen destilliert, oft traditionell in Erdöfen geröstet.',
        abv: '38 % - 50 %',
        flavorNotes: ['Gegarte Agave', 'Rauchige Erde', 'Weißer Pfeffer', 'Zitrusabrieb'],
      },
      {
        name: 'London Dry & Contemporary Gin',
        description: 'Reiner Agraralkohol redestilliert mit Wacholderbeeren, Koriandersamen und Zitruszesten.',
        abv: '40 % - 47 %',
        flavorNotes: ['Wacholder', 'Koriander', 'Zitronenabrieb', 'Angelikawurzel'],
      },
      {
        name: 'Cognac & Brandys',
        description: 'Zweifach in Kupferbrennblasen destillierter Weißwein aus der Charente, jahrelang in Limousin-Eiche gereift.',
        abv: '40 % - 45 %',
        flavorNotes: ['Getrocknete Aprikose', 'Leder', 'Muskat', 'Rancio'],
      },
    ],
    sensoryProfile: {
      keyAromas: ['Fass-Eiche & Vanillin', 'Getreide & Malz', 'Torf & Rauch', 'Frische Botanicals', 'Trockenfrüchte'],
      flavorCharacteristics:
        'Alkoholische Wärme, viskose Öligkeit, Holzkomplexität und ein langer, wärmender Abgang.',
      tastingTechnique:
        'Destillat im Nosing-Glas nicht zu tief einatmen. Mit wenigen Tropfen stillem Wasser öffnen, um Ester freizusetzen.',
    },
    serving: {
      idealTemperature: 'Pur bei Raumtemperatur: 16 °C – 20 °C; Gin/Wodka eiskalt oder in Cocktails',
      glassware: ['Glencairn / Nosing-Glas', 'Tumbler / Rocks-Glas', 'Copita-Glas'],
      proTips:
        'Füge gereiften Spirituosen ein paar Tropfen raumtemperiertes Wasser hinzu, um die Oberflächenspannung zu brechen und Aromen zu entfalten.',
    },
    funFacts: [
      'Echtes Bourbon-Whiskey muss per Gesetz in fabrikneuen, innen ausgekohlten Fässern aus amerikanischer Eiche reifen.',
      'In Schottland lagern zu jedem Zeitpunkt mehr Fässer Whisky, als das Land Einwohner hat.',
      'Wacholder ist der gesetzlich vorgeschriebene Hauptbestandteil, damit ein Destillat sich Gin nennen darf.',
    ],
  },
  {
    id: 'tea',
    archetype: 'Tea',
    title: 'Artisanaler Tee',
    icon: '🍵',
    tagline: 'Von uralten Teebäumen in Yunnan zur meditativen Gongfu-Teezeremonie',
    bannerImage: TEA_IMAGE,
    origin: {
      era: 'ca. 2737 v. Chr.',
      region: 'Südwestchina (Yunnan / Sichuan)',
      history:
        'Der chinesischen Legende nach fiel ein getrocknetes Blatt der Camellia sinensis in den Kessel mit kochendem Wasser von Kaiser Shennong. Im antiken China zunächst als Heilkraut und Suppe konsumiert, entwickelte sich Tee während der Tang-Dynastie zum Kulturgut, festgehalten in Lu Yus "Cha Jing" (Klassiker des Tees). Zen-Mönche brachten Tee nach Japan, wo die Chanoyu-Zeremonie entstand.',
      milestones: [
        { year: '2737 v. Chr.', event: 'Kaiser Shennong entdeckt zufällig den Teegenuss.' },
        { year: 'ca. 760 n. Chr.', event: 'Lu Yu verfasst das "Cha Jing", die erste Monografie über Tee.' },
        { year: '1610 n. Chr.', event: 'Die Niederländische Ostindien-Kompanie bringt die ersten Teekisten nach Europa.' },
        { year: '1848 n. Chr.', event: 'Robert Fortune schmuggelt Teepflanzen aus China nach Indien und begründet Darjeeling.' },
      ],
    },
    production: {
      ingredients: ['Frische Blätter der Camellia sinensis (var. sinensis oder assamica)', 'Weiches Quellwasser'],
      steps: [
        { name: '1. Pflücken', description: 'Sorgfältige Handernte der Knospe und der obersten zwei Blätter ("Two leaves and a bud").' },
        { name: '2. Welken', description: 'Wasserentzug auf Bambusmatten, um die Blätter geschmeidig zu machen.' },
        { name: '3. Rollen & Zellaufschluss', description: 'Mechanisches Rollen bricht Zellwände auf und setzt ätherische Öle frei.' },
        { name: '4. Oxidation & Fixierung', description: 'Gezielte Oxidation (Grüntee: gestoppt durch Erhitzen; Schwarztee: 100 % oxidiert).' },
        { name: '5. Trocknung', description: 'Heißlufttrocknung stabilisiert das Blatt für lange Haltbarkeit.' },
      ],
      craftTrivia:
        'Alle echten Tees (Weiß, Grün, Gelb, Oolong, Schwarz, Pu-Erh) stammen von derselben Pflanzenart (Camellia sinensis).',
    },
    styles: [
      {
        name: 'Grüner Tee & Matcha',
        description: 'Unoxidiert, reich an Antioxidantien mit frischen Noten von Frühlingswiese und Umami.',
        flavorNotes: ['Gedämpfter Spinat', 'Frisches Gras', 'Süßes Umami', 'Kastanien'],
      },
      {
        name: 'Weißer Tee (Silver Needle)',
        description: 'Minimal verarbeitet aus zarten Flaumknospen; ätherisch, sanft und blumig.',
        flavorNotes: ['Melone', 'Weißer Pfirsich', 'Heu', 'Wildblüten'],
      },
      {
        name: 'Oolong (Teiloxidiert: 20–80 %)',
        description: 'Die Königsdisziplin der Teekunst; von floralen Orchideennoten bis zu Rösthonig.',
        flavorNotes: ['Orchidee', 'Gerösteter Pfirsich', 'Blütennektar', 'Milchcreme'],
      },
      {
        name: 'Schwarzer Tee / Hong Cha',
        description: 'Vollständig oxidiert mit bernsteinfarbener Tasse, malziger Tiefe und Holznoten.',
        flavorNotes: ['Malz', 'Muskatellertraube', 'Dörrpflaume', 'Dunkle Melasse'],
      },
      {
        name: 'Gereifter Pu-Erh (Postfermentiert)',
        description: 'Mikrobiell gereift und zu Fladen gepresst; erdig, waldig und samtweich.',
        flavorNotes: ['Waldboden', 'Feuchtes Herbstlaub', 'Kampfer', 'Kakaoschale'],
      },
    ],
    sensoryProfile: {
      keyAromas: ['Frisches Wiesengras', 'Orchideenblüten', 'Geröstetes Malz', 'Honigfrüchte', 'Erdiger Waldboden'],
      flavorCharacteristics:
        'Geprägt von Tassenfarbe, Aufgussklarheit, süßem Nachhall (Hui Gan) und Mundresonanz (Cha Qi).',
      tastingTechnique:
        'Gongfu Cha: Hohe Blattmenge im kleinen Yixing-Kännchen oder Gaiwan mit vielen kurzen Aufgüssen (15–30 Sek.).'
    },
    serving: {
      idealTemperature: 'Grün- & Weißtee: 75 °C – 80 °C; Oolong: 85 °C – 95 °C; Schwarztee & Pu-Erh: 95 °C – 100 °C',
      glassware: ['Gaiwan & Riechbecher', 'Kyusu-Kännchen', 'Doppelwandiges Teeglas'],
      proTips:
        'Verwende niemals kochendes 100 °C heißes Wasser für feine Grün- oder Weißtees, da dies Bitterstoffe herauslöst.',
    },
    funFacts: [
      'Tee ist nach reinem Wasser das meistgetrunkene Getränk der Welt.',
      'Die im Tee enthaltene Aminosäure L-Theanin sorgt zusammen mit Koffein für fokussierte, entspannte Wachheit.',
      'Ein 50 Jahre gereifter Pu-Erh-Teefladen kann bei Auktionen über 10.000 Euro erzielen.',
    ],
  },
  {
    id: 'cocktail',
    archetype: 'Cocktail',
    title: 'Die Kunst der Mixologie',
    icon: '🍸',
    tagline: 'Balance, Bitters, Eisdynamik und die goldenen Mischverhältnisse',
    bannerImage: COCKTAIL_IMAGE,
    origin: {
      era: 'ca. 1806 / Mitte des 19. Jahrhunderts',
      region: 'USA (New York & New Orleans)',
      history:
        'Der Begriff "Cock-tail" wurde erstmals 1806 in New York schriftlich definiert als anregendes Getränk aus Spirituosen, Zucker, Wasser und Bitters. Jerry Thomas begründete 1862 mit "The Bartender’s Guide" das professionelle Bargewerbe. Die amerikanische Prohibition (1920–1933) brachte Barkeeper nach Europa (Paris, London) und begründete legendäre Hotelbars. Heute erlebt die Barkultur ein goldenes Zeitalter mit handgeschnittenem Klareis und hauseigenen Essenzen.',
      milestones: [
        { year: '1806 n. Chr.', event: 'Erste gedruckte Definition des Begriffs Cocktail in Hudson, New York.' },
        { year: '1862 n. Chr.', event: 'Jerry Thomas veröffentlicht das erste Rezeptbuch für Barkeeper.' },
        { year: '1920–1933 n. Chr.', event: 'Die Prohibition beflügelt die Speakeasy-Kultur weltweit.' },
        { year: '2000er–heute', event: 'Die moderne Craft-Cocktail-Renaissance um Sasha Petraske und Dale DeGroff.' },
      ],
    },
    production: {
      ingredients: ['Basisspirituose (40–50 ml)', 'Modifikator / Wermut / Likör', 'Säure (Frischer Zitronen-/Limettensaft)', 'Süßungsmittel (Sirup / Likör)', 'Bitters & Aromaten'],
      steps: [
        { name: '1. Präzises Abmessen', description: 'Nutzung des Jiggers für exakte Proportionen und perfekte Geschmacksbalance.' },
        { name: '2. Shaken (bei Zitrussäften)', description: 'Kräftiges Schütteln mit solidem Eis kühlt, belüftet und schmilzt kontrolliert Schmelzwasser ein.' },
        { name: '3. Rühren (bei Spirit-Forward Drinks)', description: 'Sanftes Rühren für 30–45 Sekunden sorgt für seidige Textur ohne Luftbläschen.' },
        { name: '4. Doppeltes Abseihen (Fine Strain)', description: 'Entfernt feine Eissplitter, um die Verwässerung im Glas zu stoppen.' },
        { name: '5. Zesten-Expression', description: 'Ausdrücken von Zitrusschalen sprüht aromatische Öle über den Drink.' },
      ],
      craftTrivia:
        'Schmelzwasser ist kein Makel, sondern eine unverzichtbare Zutat! Ein Cocktail enthält 20 % bis 25 % Schmelzwasser aus Eis.',
    },
    styles: [
      {
        name: 'Old Fashioned & Manhattan',
        description: 'Klassische Spirit-Forward Drinks: Whisky ausbalanciert mit Zucker/Wermut und aromatischen Bitters.',
        flavorNotes: ['Bourbon / Rye', 'Orangenöl', 'Würzige Bitters', 'Maraschino-Kirsche'],
      },
      {
        name: 'Die Sour-Familie (Daiquiri, Margarita)',
        description: 'Das goldene Verhältnis: 2 Teile Basis-Spirituose : 1 Teil frische Säure : 0,75 Teile Süße.',
        flavorNotes: ['Frische Limette', 'Agavensüße', 'Klare Spirituosenfrucht'],
      },
      {
        name: 'Negroni & Boulevardier',
        description: 'Gleiche Teile Gin (oder Bourbon), roter Wermut und italienischer Bitter-Aperitif (Campari).',
        flavorNotes: ['Enzian-Bitter', 'Orangenzeste', 'Kräuterwermut'],
      },
      {
        name: 'Martini (Gin oder Wodka)',
        description: 'Der Inbegriff puristischer Barmixkunst: trockene Spirituose, trockener Wermut und Zitronenzeste oder Olive.',
        flavorNotes: ['Wacholder', 'Feine Salzigkeit', 'Zitronenöl'],
      },
    ],
    sensoryProfile: {
      keyAromas: ['Frische Zitrusöle', 'Würzige Kräuter & Wurzeln', 'Aromatische Bitters', 'Basis-Destillat'],
      flavorCharacteristics:
        'Harmonisches Spannungsfeld aus Süße, Säure, Bitterkeit und Alkoholgehalt.',
      tastingTechnique:
        'Zuerst das Aroma der Zeste wahrnehmen, dann die kühle Frische am Gaumen und den langen bittersüßen Nachhall.',
    },
    serving: {
      idealTemperature: 'Straight Up: -2 °C bis 0 °C; On the Rocks: 0 °C bis 2 °C mit handgeschnittenem Klareisblock',
      glassware: ['Coupe / Nick & Nora Glas', 'Old Fashioned / Tumbler', 'Highball-Glas'],
      proTips:
        'Glasturngeräte und Gästegläser immer 10 Minuten vor dem Servieren im Tiefkühler vorkühlen.',
    },
    funFacts: [
      'Kristallklares Eis entsteht durch gerichtetes Frieren (Directional Freezing), das Luftbläschen nach unten verdrängt.',
      'Ernest Hemingway ließ sich in Havannas Bar El Floridita einen zuckerfreien Daiquiri mit doppeltem Rum mixen (Hemingway Daiquiri).',
      'Die klassische Cocktailkirsche wurde ursprünglich in Maraschino-Kirschlikör eingelegt.',
    ],
  },
  {
    id: 'soda-tonics',
    archetype: 'Soda & Tonics',
    title: 'Sodas, Tonics & Botanicals',
    icon: '🫧',
    tagline: 'Karbonisierungschemie, Chinarinde und handwerkliche Mixer',
    bannerImage: SODA_IMAGE,
    origin: {
      era: 'ca. 1767–1850er Jahre',
      region: 'England, Schweiz & Britisch-Indien',
      history:
        '1767 entdeckte der englische Naturforscher Joseph Priestley, wie man Wasser mit Kohlensäure anreichert. Jacob Schweppe industrialisierte das Verfahren 1783 in Genf. Im 19. Jahrhundert mischten britische Kolonialoffiziere in Indien bitteres Chinin (aus südamerikanischer Chinarinde zur Malariaprophylaxe) mit Sodawasser, Zucker und Gin – die Geburtsstunde des Gin & Tonic.',
      milestones: [
        { year: '1767 n. Chr.', event: 'Joseph Priestley stellt erstmals künstlich kohlensäurehaltiges Mineralwasser her.' },
        { year: '1783 n. Chr.', event: 'Jacob Schweppe perfektioniert die Karbonisierung und gründet Schweppes.' },
        { year: '1858 n. Chr.', event: 'Erasmus Bond patentiert das erste kommerzielle Tonic Water mit Chinin.' },
        { year: '2005–heute', event: 'Die Premium-Mixer-Revolution mit natürlichen Botanicals und feiner Kohlensäure.' },
      ],
    },
    production: {
      ingredients: ['Reines Quellwasser', 'Chinarindenextrakt (Chinin)', 'Rohrzucker / Agave', 'Botanical-Extrakte (Zitronengras, Bitterorange, Ingwer)', 'Kohlensäure (CO₂)'],
      steps: [
        { name: '1. Wasseraufbereitung', description: 'Schonende Filtration für ein neutrales, geschmacksreines Fundament.' },
        { name: '2. Mazeration der Botanicals', description: 'Schonender Auszug ätherischer Öle und Zitrusschalen.' },
        { name: '3. Süße-Säure-Abstimmung', description: 'Harmonische Balance aus Zitronensäure und unraffiniertem Rohrzucker.' },
        { name: '4. Hochdruck-Karbonisierung', description: 'CO₂ wird bei eisigen 1 °C–3 °C feinperlig gelöst.' },
        { name: '5. Sterile Flaschenfüllung', description: 'Druckabfüllung in Glasflaschen für langanhaltendes Prickeln.' },
      ],
      craftTrivia:
        'Tonic Water leuchtet unter UV-Schwarzlicht bläulich fluoreszierend aufgrund der Chininmoleküle.',
    },
    styles: [
      {
        name: 'Indian & Mediterranean Tonic Water',
        description: 'Frische Balance aus Chininbittere, Zitrusschalen und mediterranen Kräutern.',
        flavorNotes: ['Chinin-Bittere', 'Zitronenverbene', 'Thymian', 'Rohrzucker'],
      },
      {
        name: 'Craft Ginger Beer & Ginger Ale',
        description: 'Mit echtem Ingwer gebraut für feurige, wärmende Schärfe im Abgang.',
        flavorNotes: ['Feuriger Ingwer', 'Limettensaft', 'Warmer Pfeffer', 'Karamell'],
      },
      {
        name: 'Botanische Colas & Herbal Sodas',
        description: 'Würzige Essenzen aus Kolanuss, Zimtrinde, Vanille und Muskatnuss.',
        flavorNotes: ['Kolanuss', 'Zimtrinde', 'Gewürznelke', 'Bourbon-Vanille'],
      },
      {
        name: 'Prickelndes Mineralwasser & Seltzers',
        description: 'Zuckerfreie, kristallklare Erfrischung mit feiner Mineralik.',
        flavorNotes: ['Reine Kohlensäure', 'Klarer frischer Abgang'],
      },
    ],
    sensoryProfile: {
      keyAromas: ['Frische Zitruszesten', 'Würziger Ingwer', 'Mediterrane Kräuter', 'Reine Frische'],
      flavorCharacteristics:
        'Perlagestruktur (feinperlig vs. kräftig prickelnd), herbe Chininbittere und mundwässernde Frische.',
      tastingTechnique:
        'Vorsichtig an der Glaswand einschenken. Bei 4 °C pur verkosten, um Süße, Bittere und Spritzigkeit zu prüfen.',
    },
    serving: {
      idealTemperature: 'Eiskalt: 2 °C – 4 °C',
      glassware: ['Highball-Glas', 'Copa-Ballonglas (für Gin & Tonic mit Botanicals)'],
      proTips:
        'Beim Mischen das Tonic vorsichtig über den gedrehten Barlöffel ins Eis gießen, um Kohlensäureverlust zu minimieren.',
    },
    funFacts: [
      'Amerikanische Soda Fountains entstanden in Apotheken, da Apotheker früher kohlensäurehaltige Heiltränke ausgaben.',
      'Chinin aus der Rinde des südamerikanischen Fieberbaums rettete im 19. Jahrhundert Millionen Menschenleben vor Malaria.',
      'Hochwertige Craft-Tonics verwenden echten Rohrzucker statt Glukose-Fruktose-Sirup für einen sauberen Abgang.',
    ],
  },
  {
    id: 'other',
    archetype: 'Other',
    title: 'Traditionelle & Besondere Fermente',
    icon: '✨',
    tagline: 'Met, Cidre, Sake und uralte Fermentationsgetränke',
    bannerImage: OTHER_IMAGE,
    origin: {
      era: 'ca. 7000 v. Chr. – heute',
      region: 'Weltweit: Skandinavien, Japan, Normandie, Kaukasus',
      history:
        'Abseits von klassischem Bier und Wein besitzt die Menschheit ein reiches Erbe fermentierter Getränke. Met (Honigwein) gilt als das älteste alkoholische Getränk überhaupt, entstanden vor dem Ackerbau durch natürlich vergorene Bienennester. In Japan entwickelte sich Sake (Nihonshu) zur kaiserlichen Zeremonialkultur unter Nutzung von Koji-Pilzen. In der Normandie und England prägten spritzige Apfel-Cidres und Birnen-Perries die ländliche Kultur.',
      milestones: [
        { year: '7000 v. Chr.', event: 'Chemische Spuren vergorener Honig- und Reisgetränke im chinesischen Jiahu.' },
        { year: '700 n. Chr.', event: 'Nara-Zeit in Japan: Sake-Brauen wird institutionalisiert.' },
        { year: '1700er n. Chr.', event: 'Cider wird zum täglichen Grundgetränk im kolonialen Amerika und ländlichen England.' },
        { year: '2010er–heute', event: 'Weltweite Renaissance von Craft-Meaderies, Naturcidern und lebendigem Kombucha.' },
      ],
    },
    production: {
      ingredients: ['Reiner Honig (Met)', 'Alte Apfelsorten (Cidre)', 'Polierter Reis & Koji-Kulturen (Sake)', 'Fermentationskulturen'],
      steps: [
        { name: '1. Rohstoffaufbereitung', description: 'Keltern gerbstoffreicher Äpfel, Polieren von Sake-Reis oder Verdünnen von rohem Honig.' },
        { name: '2. Beimpfung & Verzuckerung', description: 'Bei Sake wandelt Koji Reisstärke in Zucker um, während Hefe gleichzeitig gärt.' },
        { name: '3. Kaltgärung', description: 'Schonende Fermentation bewahrt zarte Blüten-, Honig- und Esteraromen.' },
        { name: '4. Reifung', description: 'Ausbau in Holzfässern, Edelstahltanks oder Steingutgefäßen.' },
        { name: '5. Harmonisierung', description: 'Feinabstimmung von Restsüße, Apfelsäure und feiner natürlicher Kohlensäure.' },
      ],
      craftTrivia:
        'Sake-Brauen ist weder Bier noch Wein – durch die gleichzeitige Verzuckerung und Gärung können über 20 % natürlicher Alkoholgehalt entstehen.',
    },
    styles: [
      {
        name: 'Traditioneller & Frucht-Met (Melomel)',
        description: 'Vergorener Honigwein von knochentrocken bis dessertsüß, oft mit Waldbeeren oder Gewürzen verfeinert.',
        abv: '6 % - 14 %',
        flavorNotes: ['Wildblütenhonig', 'Orangenblüte', 'Honigwabe', 'Bienenwachs'],
      },
      {
        name: 'Handwerklicher Cidre & Perry',
        description: 'Tanninreich, trocken und charaktervoll aus alten Streuobst-Sorten mit rustikalem Funk.',
        abv: '5,0 % - 8,5 %',
        flavorNotes: ['Gerbstoffreiche Apfelschale', 'Bauernhof-Funk', 'Apfelfrische', 'Gebackene Birne'],
      },
      {
        name: 'Junmai Daiginjo Sake',
        description: 'Super-Premium-Sake aus zu mindestens 50 % poliertem Reis mit Aromen von Honigmelone und Litschi.',
        abv: '14 % - 16 %',
        flavorNotes: ['Honigmelone', 'Litschi', 'Weißer Pfirsich', 'Klares Quellwasser'],
      },
      {
        name: 'Roher Bio-Kombucha',
        description: 'Spritzig fermentierter Tee mit lebendigen Kulturen (SCOBY), erfrischend säuerlich und probiotisch.',
        abv: '0,5 % - 1,5 %',
        flavorNotes: ['Heller Essig-Touch', 'Grüner Apfel', 'Zitronenabrieb', 'Frischer Ingwer'],
      },
    ],
    sensoryProfile: {
      keyAromas: ['Blütenhonig & Bienenwachs', 'Herbe Apfelschale', 'Melone & Reis-Ester', 'Spritzige Fermentnoten'],
      flavorCharacteristics:
        'Ein faszinierendes Zusammenspiel aus natürlicher Restsüße, lebendiger Säure und delikater Gärungsfrische.',
      tastingTechnique:
        'Im Weißweinglas schwenken, um zarte Honig- oder Frucht-Ester zu entfalten.',
    },
    serving: {
      idealTemperature: 'Cidre & Kombucha: 4 °C – 6 °C; Daiginjo-Sake: 8 °C – 10 °C; Met: 10 °C – 14 °C',
      glassware: ['Weißweinkelch', 'Ochoko-Sake-Schälchen', 'Traditionelles Ton-Trinkhorn'],
      proTips:
        'Hochwertigen handwerklichen Cidre wie Weißwein servieren und leicht gekühlt im Kelchglas genießen.',
    },
    funFacts: [
      'Der Begriff "Flitterwochen" (Honeymoon) stammt aus der alten Tradition, dass Brautpaare einen Mondzyklus lang täglich Met tranken.',
      'In der Normandie gibt es über 700 traditionelle Apfelsorten, die speziell für Cidre gezüchtet wurden.',
      'Um Sake zu brauen, polieren Meisterbrauer die Reiskörner oft tagelang, um Fette und Proteine in der Schale abzutragen.',
    ],
  },
];

export const getDrinkKnowledgeBase = (languageOrIsGerman?: boolean | string): DrinkCategoryKnowledge[] => {
  const isDe =
    typeof languageOrIsGerman === 'boolean'
      ? languageOrIsGerman
      : typeof languageOrIsGerman === 'string'
      ? languageOrIsGerman.startsWith('de')
      : false;
  return isDe ? DRINK_KNOWLEDGE_BASE_DE : DRINK_KNOWLEDGE_BASE_EN;
};

export const DRINK_KNOWLEDGE_BASE = DRINK_KNOWLEDGE_BASE_EN;
