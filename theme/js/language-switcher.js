/**
 * WEBSITE: https://themefisher.com
 * TWITTER: https://twitter.com/themefisher
 * FACEBOOK: https://facebook.com/themefisher
 * GITHUB: https://github.com/themefisher/
 */

// Simple Language Switcher
(function() {
  "use strict";

  // Language data
  const languages = {
    vi: { name: "Tiếng Việt", flag: "🇻🇳" },
    en: { name: "English", flag: "🇬🇧" },
    ru: { name: "Русский", flag: "🇷🇺" },
    ko: { name: "한국어", flag: "🇰🇷" }
  };

  // Helper to read cookie
  const getCookie = (name) => {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length === 2) {
      return parts.pop().split(";").shift();
    }
    return null;
  };

  // Sync current language from cookie or localStorage
  let currentLang = localStorage.getItem("selectedLanguage") || "vi";
  const googtrans = getCookie("googtrans");
  if (googtrans) {
    const parts = googtrans.split("/");
    const cookieLang = parts[parts.length - 1];
    if (cookieLang && languages[cookieLang]) {
      currentLang = cookieLang;
      localStorage.setItem("selectedLanguage", cookieLang);
    }
  }

  // Create language switcher UI
  const createLanguageSwitcher = () => {
    const switcher = document.createElement("div");
    switcher.id = "language-switcher";
    switcher.className = "language-switcher";
    
    const flagName = languages[currentLang];
    
    switcher.innerHTML = `
      <button id="lang-toggle" class="lang-toggle" title="Select Language">
        <span class="lang-flag">${flagName.flag}</span>
      </button>
      <div id="lang-menu" class="lang-menu" style="display: none;">
        ${Object.entries(languages).map(([code, { name, flag }]) => `
          <button class="lang-option ${code === currentLang ? "active" : ""}" data-lang="${code}">
            <span class="lang-flag">${flag}</span>
            <span class="lang-name">${name}</span>
            <span class="lang-code">(${code.toUpperCase()})</span>
          </button>
        `).join("")}
      </div>
    `;
    
    document.body.appendChild(switcher);
  };

  // Google Translate Integration
  const initGoogleTranslate = () => {
    // 1. Inject off-screen container for Google Translate widget
    const gtDiv = document.createElement("div");
    gtDiv.id = "google_translate_element";
    gtDiv.style.position = "absolute";
    gtDiv.style.top = "-9999px";
    gtDiv.style.left = "-9999px";
    gtDiv.style.width = "1px";
    gtDiv.style.height = "1px";
    gtDiv.style.overflow = "hidden";
    document.body.appendChild(gtDiv);

    // 2. Define callback function
    window.googleTranslateElementInit = () => {
      new google.translate.TranslateElement({
        pageLanguage: "vi",
        includedLanguages: "vi,en,ru,ko",
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
      }, "google_translate_element");
    };

    // 3. Inject Google Translate script
    const script = document.createElement("script");
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.head.appendChild(script);
  };

  // Change language
  const changeLanguage = (lang) => {
    if (lang === currentLang) {
      return;
    }
    
    currentLang = lang;
    localStorage.setItem("selectedLanguage", lang);
    document.documentElement.lang = lang;
    
    // Set googtrans cookie for domain-wide automatic translation persistence
    const cookieValue = "/vi/" + lang;
    document.cookie = "googtrans=" + cookieValue + "; path=/";
    document.cookie = "googtrans=" + cookieValue + "; path=/; domain=" + location.hostname;
    document.cookie = "googtrans=" + cookieValue + "; path=/; domain=." + location.hostname;
    
    // Reload the page once to apply the new translation immediately
    window.location.reload();
  };

  // Initialize everything
  const init = () => {
    // Render custom UI
    createLanguageSwitcher();

    // Init Google Translate
    initGoogleTranslate();
    
    // Add event listeners
    const toggle = document.getElementById("lang-toggle");
    const menu = document.getElementById("lang-menu");
    
    if (toggle && menu) {
      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.style.display = menu.style.display === "none" ? "block" : "none";
      });

      document.querySelectorAll(".lang-option").forEach(btn => {
        btn.addEventListener("click", () => {
          const lang = btn.getAttribute("data-lang");
          changeLanguage(lang);
        });
      });

      // Close menu when clicking outside
      document.addEventListener("click", () => {
        menu.style.display = "none";
      });
    }
  };

  // Wait for DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Export to window
  window.languageSwitcher = {
    changeLanguage,
    currentLang: () => currentLang
  };
})();
