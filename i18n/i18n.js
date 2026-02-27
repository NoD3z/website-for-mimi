(() => {
  const SUPPORTED_LANGUAGES = ['en', 'de', 'it', 'es', 'ru'];
  const DEFAULT_LANGUAGE = 'de';
  const FALLBACK_LANGUAGE = 'en';
  const STORAGE_KEY = 'littleBeansLanguage';
  const cache = {};

  function resolveLanguage(candidate) {
    if (!candidate) {
      return null;
    }

    const normalized = String(candidate).toLowerCase();
    if (SUPPORTED_LANGUAGES.includes(normalized)) {
      return normalized;
    }

    const base = normalized.split('-')[0];
    return SUPPORTED_LANGUAGES.includes(base) ? base : null;
  }

  function detectBrowserLanguage() {
    const browserLanguages = Array.isArray(navigator.languages)
      ? navigator.languages
      : [navigator.language];

    for (const lang of browserLanguages) {
      const resolved = resolveLanguage(lang);
      if (resolved) {
        return resolved;
      }
    }

    return null;
  }

  async function loadLanguageFile(language) {
    if (cache[language]) {
      return cache[language];
    }

    const response = await fetch(`./i18n/translations/${language}.json`);
    if (!response.ok) {
      throw new Error(`Unable to load translations for "${language}".`);
    }

    const data = await response.json();
    cache[language] = data;
    return data;
  }

  function getNestedValue(dictionary, key) {
    return key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), dictionary);
  }

  function interpolate(template, values = {}) {
    if (typeof template !== 'string') {
      return template;
    }

    return template.replace(/\{(\w+)\}/g, (_, key) => (values[key] !== undefined ? values[key] : `{${key}}`));
  }

  const i18n = {
    language: DEFAULT_LANGUAGE,
    dictionaries: {
      [FALLBACK_LANGUAGE]: {}
    },

    t(key, values = {}) {
      const currentDictionary = this.dictionaries[this.language] || {};
      const fallbackDictionary = this.dictionaries[FALLBACK_LANGUAGE] || {};

      let value = getNestedValue(currentDictionary, key);
      if (value === undefined) {
        value = getNestedValue(fallbackDictionary, key);
        if (value === undefined) {
          console.warn(`[i18n] Missing translation key: ${key}`);
          return key;
        }
        console.warn(`[i18n] Missing key "${key}" in "${this.language}", falling back to "${FALLBACK_LANGUAGE}".`);
      }

      return interpolate(value, values);
    },

    applyTranslations() {
      document.querySelectorAll('[data-i18n]').forEach((node) => {
        const key = node.dataset.i18n;
        const targetAttr = node.dataset.i18nAttr;
        const translated = this.t(key);

        if (translated === key) {
          return;
        }

        if (targetAttr) {
          node.setAttribute(targetAttr, translated);
          return;
        }

        node.textContent = translated;
      });

      document.documentElement.lang = this.language;

      document.querySelectorAll('[data-language-switcher]').forEach((switcher) => {
        switcher.value = this.language;
      });

      document.dispatchEvent(new CustomEvent('i18n:updated', { detail: { language: this.language } }));
    },

    async setLanguage(language, { persist = true } = {}) {
      const resolved = resolveLanguage(language) || FALLBACK_LANGUAGE;

      try {
        if (!this.dictionaries[FALLBACK_LANGUAGE] || !Object.keys(this.dictionaries[FALLBACK_LANGUAGE]).length) {
          this.dictionaries[FALLBACK_LANGUAGE] = await loadLanguageFile(FALLBACK_LANGUAGE);
        }

        this.dictionaries[resolved] = await loadLanguageFile(resolved);
      } catch (error) {
        console.warn(`[i18n] ${error.message}`);
        this.language = FALLBACK_LANGUAGE;
        this.applyTranslations();
        return;
      }

      this.language = resolved;
      if (persist) {
        localStorage.setItem(STORAGE_KEY, resolved);
      }

      this.applyTranslations();
    }
  };

  function bindLanguageSwitcher() {
    document.querySelectorAll('[data-language-switcher]').forEach((switcher) => {
      switcher.addEventListener('change', (event) => {
        i18n.setLanguage(event.target.value, { persist: true });
      });
    });
  }

  async function initialize() {
    const storedLanguage = resolveLanguage(localStorage.getItem(STORAGE_KEY));
    const browserLanguage = detectBrowserLanguage();
    const initialLanguage = storedLanguage || browserLanguage || FALLBACK_LANGUAGE;

    bindLanguageSwitcher();
    await i18n.setLanguage(initialLanguage, { persist: !storedLanguage });
  }

  window.i18n = i18n;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
