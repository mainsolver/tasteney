import { BeverageArchetype } from '@/types/drink';

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
  bannerImage: string;
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

export const DRINK_KNOWLEDGE_BASE: DrinkCategoryKnowledge[] = [
  {
    id: 'beer',
    archetype: 'Beer',
    title: 'Beer & Ales',
    icon: '🍺',
    tagline: 'From Ancient Sumerian Bread-Beer to Modern Craft Innovations',
    bannerImage:
      'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=1200&q=80',
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
    bannerImage:
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
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
    bannerImage:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
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
    bannerImage:
      'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=1200&q=80',
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
        name: 'London Dry & Botanical Gin',
        description: 'Neutral grain spirit redistilled with juniper berries, coriander, citrus peel, and botanical roots.',
        abv: '40% - 47%',
        flavorNotes: ['Piney Juniper', 'Coriander Seed', 'Orris Root', 'Lemon Verbena'],
      },
      {
        name: 'Aged Rum & Cachaça',
        description: 'Crafted from pure sugarcane juice or dark blackstrap molasses in tropical coastal climates.',
        abv: '40% - 55%',
        flavorNotes: ['Toffee', 'Banana Flambé', 'Nutmeg', 'Tobacco'],
      },
    ],
    sensoryProfile: {
      keyAromas: ['Wood Vanillins & Lactones', 'Ester Fruits', 'Peat & Campfire Smoke', 'Baking Spice', 'Botanical Herbs'],
      flavorCharacteristics:
        'Intensity, alcoholic warmth (without excessive burn), viscosity/mouth-coating oils, and lengthy lingering finish.',
      tastingTechnique:
        'Do not plunge your nose directly into high-proof spirit! Hold the glass 2 inches away with lips slightly parted to avoid burning your olfactory nerve.',
    },
    serving: {
      idealTemperature: 'Neat: 18°C – 20°C (Room Temp); On the rocks: with a large, slow-melting dense ice sphere',
      glassware: ['Glencairn Glass (Tasting & nosing)', 'Rocks / Old Fashioned Glass', 'Copita / Snifter'],
      proTips:
        'Adding 3 to 4 drops of room-temperature spring water breaks the surface tension and unlocks hidden hydrophobic aroma molecules.',
    },
    funFacts: [
      'By law, 100% Bourbon whiskey must be aged in brand new, charred American white oak containers—it can never be reused for Bourbon.',
      'Historically, British Royal Navy sailors tested gunpowder strength by soaking it in rum—if it still ignited, the rum was "100 Proof" (57.1% ABV).',
      'True Mezcal must be made from mature agave plants that can take anywhere from 7 to 30 years to reach harvest size.',
    ],
  },
  {
    id: 'tea',
    archetype: 'Tea',
    title: 'Tea & Camellia Cultivation',
    icon: '🍵',
    tagline: 'Ancient Eastern Ceremonies, Terroir Leaves, and Oxidation Craft',
    bannerImage:
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80',
    origin: {
      era: 'c. 2737 BCE (Mythological) / 2nd Century BCE',
      region: 'Ancient China (Yunnan / Sichuan Provinces)',
      history:
        'According to Chinese mythology, Emperor Shennong was resting under a wild Camellia sinensis tree when windblown leaves drifted into his boiling water cauldron, infusing a fragrant herbal tonic. In the Tang Dynasty, Lu Yu penned "The Classic of Tea" (Cha Jing), codifying the art of tea brewing into a spiritual and philosophical practice. Japanese monks like Eisai brought Zen tea seeds to Kyoto, founding the Chanoyu tea ceremony. Later maritime trade brought tea to Europe and spurred the British afternoon tea tradition.',
      milestones: [
        { year: '2737 BCE', event: 'Emperor Shennong discovers tea leaves falling into boiling water.' },
        { year: '760 CE', event: 'Lu Yu writes the Cha Jing (Classic of Tea), the first monograph on tea culture.' },
        { year: '1191 CE', event: 'Zen Master Eisai introduces stone-ground Matcha tea from China to Japan.' },
        { year: '1848 CE', event: 'Botanist Robert Fortune transports Chinese tea cuttings and secrets to British India (Darjeeling).' },
      ],
    },
    production: {
      ingredients: ['Camellia sinensis leaves (Sinensis & Assamica varieties)', 'Pure Spring Water'],
      steps: [
        { name: '1. Plucking', description: 'Careful hand-picking of the top terminal bud and two tender young leaves (Two Leaves & a Bud).' },
        { name: '2. Withering', description: 'Leaves are laid on bamboo trays to reduce moisture and make leaves pliable.' },
        { name: '3. Rolling & Bruising', description: 'Cell walls are cracked to initiate enzymatic polyphenol oxidation.' },
        { name: '4. Kill-Green (Shaqing)', description: 'Heat application (pan-firing or steam) stops enzymatic oxidation at the desired stage.' },
        { name: '5. Drying & Shaping', description: 'Leaves are shaped into pearls, twists, or needles and dried for longevity.' },
      ],
      craftTrivia:
        'White, Green, Yellow, Oolong, Black, and Pu-erh teas all come from the exact same plant species (Camellia sinensis)—the only difference is processing and oxidation degree.',
    },
    styles: [
      {
        name: 'Green & Matcha (Unoxidized: 0%)',
        description: 'Steamed or pan-fired immediately; vibrant vegetal, grassy, umami, and sweet seaweed character.',
        flavorNotes: ['Sweet Grass', 'Steamed Spinach', 'Marine Umami', 'Chestnut'],
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
    bannerImage:
      'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80',
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
    bannerImage:
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80',
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
    bannerImage:
      'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=1200&q=80',
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
        'Sake brewing is neither wine nor beer—its unique simultaneous saccharification and fermentation can achieve over 20% natural ABV without distillation.',
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
        flavorNotes: ['Honeydew Melon', 'White Jasmine', 'Anise', 'Silky Rice Umami'],
      },
      {
        name: 'Raw Kombucha & Jun',
        description: 'Effervescent fermented sweetened tea fermented with a symbiotic culture of bacteria and yeast (SCOBY).',
        abv: '< 0.5% (Non-alcoholic)',
        flavorNotes: ['Tart Acetic / Gluconic Acid', 'Green Tea', 'Raw Ginger', 'Probiotic Crispness'],
      },
    ],
    sensoryProfile: {
      keyAromas: ['Honey & Floral Blossom', 'Crisp Tannic Orchard Fruits', 'Rice Koji Umami', 'Subtle Ferment Funk'],
      flavorCharacteristics:
        'A spectrum from luscious honeyed richness to bracing orchard tartness and silky rice smooth umami.',
      tastingTechnique:
        'Savor the delicate balance between natural unfermented sugars, crisp organic acids, and complex yeast/microbial fermentation depth.',
    },
    serving: {
      idealTemperature: 'Cider & Kombucha: 4°C – 8°C; Mead: 10°C – 14°C; Premium Sake: 10°C – 12°C or gently warmed (Atsukan) for rustic styles',
      glassware: ['Ochoko & Tokkuri / Wine Glass (Sake)', 'Cider Goblet / Flute', 'Snifter (Mead)'],
      proTips:
        'Drink premium Daiginjo sake in a standard white wine glass rather than a small shot cup to capture its delicate floral aroma bouquet.',
    },
    funFacts: [
      'The word "honeymoon" comes from the ancient Norse and European tradition of gifting newlywed couples a full month’s supply of mead for fertility and good luck.',
      'In 18th-century Normandy and England, farm laborers were partially paid their wages in barrels of fresh farm cider.',
      'Koji mold (Aspergillus oryzae) is so essential to Japanese culinary culture (sake, soy sauce, miso) that it is officially designated Japan’s "National Fungus".',
    ],
  },
];
