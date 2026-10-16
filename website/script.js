/**
 * Tasteney – Static Website Interactive Scripts
 * Handles mobile navigation, smooth scrolling, and dynamic category previews.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. Mobile Drawer Navigation
  // --------------------------------------------------------------------------
  const menuToggle = document.getElementById('menuToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      mobileDrawer.classList.toggle('is-open');
    });

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileDrawer.classList.remove('is-open');
      });
    });
  }

  // --------------------------------------------------------------------------
  // 2. Sticky Header Elevation on Scroll
  // --------------------------------------------------------------------------
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (header) {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  });

  // --------------------------------------------------------------------------
  // 3. Interactive Sensory Journal Demo Showcase
  // --------------------------------------------------------------------------
  const sampleData = {
    wine: {
      image: 'assets/images/drinks/wine.jpg',
      badge: 'Wein · Rotwein',
      name: 'Château Margaux Premier Grand Cru',
      producerOrigin: 'Château Margaux · Bordeaux, Frankreich (2015)',
      rating: '9.6',
      notes: '„Außergewöhnliche Eleganz und Seidigkeit. Unglaubliche Balance zwischen frischer Säure und konzentrierter Frucht. Jetzt schon großartig, mit Jahrzehnten Reifepotenzial.“',
      time: 'Eintrag gespeichert · Gestern, 20:45 Uhr',
      flavors: [
        { name: 'Schwarze Johannisbeere', dots: '•••••' },
        { name: 'Zeder & Tabak', dots: '••••' },
        { name: 'Graphit', dots: '•••' },
        { name: 'Dunkle Schokolade', dots: '••••' }
      ]
    },
    coffee: {
      image: 'assets/images/drinks/coffee.jpg',
      badge: 'Kaffee · Handfilter (V60)',
      name: 'Ethiopia Yirgacheffe Washed Grade 1',
      producerOrigin: 'Keffa Specialty Roastery · Yirgacheffe, Äthiopien',
      rating: '9.2',
      notes: '„Klarer, teeartiger Körper mit strahlender Zitrusfruchtigkeit und betörenden floralen Kopfnoten. Feine Honigsüße im Nachgeschmack.“',
      time: 'Eintrag gespeichert · Heute, 08:30 Uhr',
      flavors: [
        { name: 'Bergamotte', dots: '•••••' },
        { name: 'Jasminblüte', dots: '••••' },
        { name: 'Pfirsich', dots: '•••••' },
        { name: 'Zitrusnote', dots: '•••' }
      ]
    },
    beer: {
      image: 'assets/images/drinks/beer.jpg',
      badge: 'Bier · New England IPA',
      name: 'Hazy Galaxy Double IPA',
      producerOrigin: 'Cloudline Brewing · Portland, USA (7.8% Vol.)',
      rating: '8.9',
      notes: '„Saftig und trüb mit explosiver tropischer Aromatik. Seidiges Mundgefühl dank Haferanteil, perfekt eingebundene Bittere.“',
      time: 'Eintrag gespeichert · Samstag, 19:15 Uhr',
      flavors: [
        { name: 'Maracuja', dots: '•••••' },
        { name: 'Mango & Ananas', dots: '••••' },
        { name: 'Harzig', dots: '••' },
        { name: 'Hafercreme', dots: '••••' }
      ]
    },
    spirits: {
      image: 'assets/images/drinks/spirits.jpg',
      badge: 'Spirituosen · Islay Single Malt',
      name: 'Laphroaig 10 Cask Strength (Batch 15)',
      producerOrigin: 'Laphroaig Distillery · Islay, Schottland (56.5% Vol.)',
      rating: '9.5',
      notes: '„Kraftvoller Antritt von maritimem Rauch und Teer, gefolgt von einer überraschenden Malzsüße und warmer Eichenwürze. Langer, wärmender Nachklang.“',
      time: 'Eintrag gespeichert · 10. Oktober, 22:10 Uhr',
      flavors: [
        { name: 'Torfrauch', dots: '•••••' },
        { name: 'Jod & Meersalz', dots: '•••••' },
        { name: 'Vanille', dots: '•••' },
        { name: 'Eichenholz', dots: '••••' }
      ]
    },
    tea: {
      image: 'assets/images/drinks/tea.jpg',
      badge: 'Tee · Uji Gyokuro',
      name: 'Kyoto Supreme Gyokuro',
      producerOrigin: 'Marukyu Koyamaen · Uji, Kyoto, Japan',
      rating: '9.4',
      notes: '„Intensiv grüner Aufguss mit tiefem, samtigem Umami. Praktisch keine Bitterkeit bei 55°C Brühung. Sehr langanhaltende, süßliche Frische.“',
      time: 'Eintrag gespeichert · Vor 3 Tagen, 15:20 Uhr',
      flavors: [
        { name: 'Umami', dots: '•••••' },
        { name: 'Frisches Seegras', dots: '••••' },
        { name: 'Süße Erbse', dots: '•••' },
        { name: 'Vegetabil', dots: '••••' }
      ]
    }
  };

  const tabs = document.querySelectorAll('#categoryTabs .filter-pill');
  const demoCard = document.getElementById('demoCard');
  const demoImage = document.getElementById('demoImage');
  const demoArchetypeBadge = document.getElementById('demoArchetypeBadge');
  const demoDrinkName = document.getElementById('demoDrinkName');
  const demoProducerOrigin = document.getElementById('demoProducerOrigin');
  const demoRating = document.getElementById('demoRating');
  const demoFlavorTags = document.getElementById('demoFlavorTags');
  const demoNotes = document.getElementById('demoNotes');
  const demoTime = document.getElementById('demoTime');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;
      if (!sampleData[target]) return;

      // Update Active Tab Pill
      tabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Animate Card Content Switch
      if (demoCard) {
        demoCard.style.opacity = '0.4';
        demoCard.style.transform = 'translateY(4px)';

        setTimeout(() => {
          const item = sampleData[target];
          if (demoImage) demoImage.src = item.image;
          if (demoArchetypeBadge) demoArchetypeBadge.textContent = item.badge;
          if (demoDrinkName) demoDrinkName.textContent = item.name;
          if (demoProducerOrigin) demoProducerOrigin.textContent = item.producerOrigin;
          if (demoRating) demoRating.textContent = item.rating;
          if (demoNotes) demoNotes.textContent = item.notes;
          if (demoTime) demoTime.textContent = item.time;

          if (demoFlavorTags) {
            demoFlavorTags.innerHTML = item.flavors
              .map(
                (f) =>
                  `<span class="flavor-tag">${f.name} <span class="intensity-dots">${f.dots}</span></span>`
              )
              .join('');
          }

          demoCard.style.opacity = '1';
          demoCard.style.transform = 'translateY(0)';
        }, 120);
      }
    });
  });
});
