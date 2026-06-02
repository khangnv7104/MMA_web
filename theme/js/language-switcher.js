/**
 * WEBSITE: https://themefisher.com
 * TWITTER: https://twitter.com/themefisher
 * FACEBOOK: https://facebook.com/themefisher
 * GITHUB: https://github.com/themefisher/
 */

// Simple Language Switcher
(function() {
  // Language data
  const languages = {
    vi: { name: 'Tiếng Việt', flag: '🇻🇳' },
    en: { name: 'English', flag: '🇬🇧' },
    ru: { name: 'Русский', flag: '🇷🇺' },
    ko: { name: '한국어', flag: '🇰🇷' }
  };

  let translations = {};
  let currentLang = localStorage.getItem('selectedLanguage') || 'vi';

  // Load translations
  const loadTranslations = async (lang) => {
    try {
      const response = await fetch(`/locales/${lang}.json`);
      translations[lang] = await response.json();
      return translations[lang];
    } catch (error) {
      console.error(`Failed to load ${lang} translations:`, error);
      return {};
    }
  };

  // Translate key
  const t = (key, lang = currentLang) => {
    const keys = key.split('.');
    let value = translations[lang];
    
    for (let k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  // Create language switcher UI
  const createLanguageSwitcher = () => {
    const switcher = document.createElement('div');
    switcher.id = 'language-switcher';
    switcher.className = 'language-switcher';
    
    const flagName = languages[currentLang];
    
    switcher.innerHTML = `
      <button id="lang-toggle" class="lang-toggle" title="Select Language">
        <span class="lang-flag">${flagName.flag}</span>
      </button>
      <div id="lang-menu" class="lang-menu" style="display: none;">
        ${Object.entries(languages).map(([code, { name, flag }]) => `
          <button class="lang-option ${code === currentLang ? 'active' : ''}" data-lang="${code}">
            <span class="lang-flag">${flag}</span>
            <span class="lang-name">${name}</span>
            <span class="lang-code">(${code.toUpperCase()})</span>
          </button>
        `).join('')}
      </div>
    `;
    
    document.body.appendChild(switcher);
  };

  // Update page content
  const updatePageContent = () => {
    document.documentElement.lang = currentLang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translated = t(key, currentLang);
      if (translated && translated !== key) {
        el.textContent = translated;
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const translated = t(key, currentLang);
      if (translated && translated !== key) {
        el.title = translated;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const translated = t(key, currentLang);
      if (translated && translated !== key) {
        el.placeholder = translated;
      }
    });
  };

  // Change language
  const changeLanguage = async (lang) => {
    if (lang === currentLang) return;
    
    currentLang = lang;
    localStorage.setItem('selectedLanguage', lang);
    document.documentElement.lang = lang;
    
    // Load translation if not already loaded
    if (!translations[lang]) {
      await loadTranslations(lang);
    }
    
    // Update UI
    document.getElementById('lang-toggle').innerHTML = `
      <span class="lang-flag">${languages[lang].flag}</span>
    `;
    
    document.querySelectorAll('.lang-option').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    
    // Close menu
    document.getElementById('lang-menu').style.display = 'none';
    
    // Update page content
    updatePageContent();
  };

  // Initialize
  const init = async () => {
    // Load all translations
    for (let lang of Object.keys(languages)) {
      await loadTranslations(lang);
    }
    
    // Create UI
    createLanguageSwitcher();
    
    // Add event listeners
    const toggle = document.getElementById('lang-toggle');
    const menu = document.getElementById('lang-menu');
    
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });

    document.querySelectorAll('.lang-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        changeLanguage(lang);
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', () => {
      menu.style.display = 'none';
    });

    // Update initial content
    updatePageContent();
  };

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export to window
  window.languageSwitcher = {
    changeLanguage,
    t,
    currentLang: () => currentLang
  };
})();
