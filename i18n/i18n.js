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

  function deepMerge(target, source) {
    Object.entries(source).forEach(([key, value]) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) {
          target[key] = {};
        }
        deepMerge(target[key], value);
        return;
      }

      target[key] = value;
    });

    return target;
  }

  async function loadLanguageFile(path, language) {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Unable to load translations for "${language}" from ${path}.`);
    }

    return response.json();
  }

  async function loadLanguageDictionaries(language) {
    if (cache[language]) {
      return cache[language];
    }

    const basePath = `./i18n/translations/${language}.json`;
    const pagesPath = `./i18n/translations/pages/${language}.json`;

    const base = await loadLanguageFile(basePath, language);

    try {
      const pages = await loadLanguageFile(pagesPath, language);
      cache[language] = deepMerge(base, pages);
    } catch (error) {
      console.warn(`[i18n] Optional page dictionary missing for "${language}": ${pagesPath}`);
      cache[language] = base;
    }

    return cache[language];
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
          this.dictionaries[FALLBACK_LANGUAGE] = await loadLanguageDictionaries(FALLBACK_LANGUAGE);
        }

        this.dictionaries[resolved] = await loadLanguageDictionaries(resolved);
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
