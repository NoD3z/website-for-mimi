const plannerKids = document.querySelector('#plan-kids');
const plannerHours = document.querySelector('#plan-hours');
const plannerVibe = document.querySelector('#plan-vibe');
const hoursOutput = document.querySelector('#hours-output');
const priceOutput = document.querySelector('#price-output');
const vibeOutput = document.querySelector('#vibe-output');

const quoteText = document.querySelector('#quote-text');
const quoteAuthor = document.querySelector('#quote-author');
const quoteButton = document.querySelector('#new-quote');

const joinForm = document.querySelector('#join-form');
const formMessage = document.querySelector('#form-message');

let currentQuoteIndex = 0;

function t(key, values = {}) {
  if (window.i18n && typeof window.i18n.t === 'function') {
    return window.i18n.t(key, values);
  }

  return key;
}

function getTestimonials() {
  const language = window.i18n ? window.i18n.language : 'en';
  const dictionary = window.i18n && window.i18n.dictionaries ? window.i18n.dictionaries[language] : null;
  const fallbackDictionary = window.i18n && window.i18n.dictionaries ? window.i18n.dictionaries.en : null;

  const localized = dictionary && dictionary.testimonials && Array.isArray(dictionary.testimonials.items)
    ? dictionary.testimonials.items
    : null;

  if (localized && localized.length) {
    return localized;
  }

  return fallbackDictionary && fallbackDictionary.testimonials && Array.isArray(fallbackDictionary.testimonials.items)
    ? fallbackDictionary.testimonials.items
    : [];
}

function updatePlanner() {
  if (!plannerKids || !plannerHours || !plannerVibe) {
    return;
  }

  const kids = Number(plannerKids.value) || 1;
  const hours = Number(plannerHours.value);
  const basePrice = 13;
  const siblingDiscount = kids > 1 ? (kids - 1) * 2 : 0;
  const total = Math.max(kids * hours * basePrice - siblingDiscount, 18);

  hoursOutput.textContent = t('planner.hoursValue', { hours });
  priceOutput.textContent = `$${total.toFixed(2)}`;
  vibeOutput.textContent = t('planner.vibeOutput', {
    vibe: plannerVibe.options[plannerVibe.selectedIndex].text
  });
}

function updateQuoteDisplay() {
  if (!quoteText || !quoteAuthor) {
    return;
  }

  const testimonials = getTestimonials();
  if (!testimonials.length) {
    return;
  }

  const safeIndex = Math.min(currentQuoteIndex, testimonials.length - 1);
  const current = testimonials[safeIndex];

  quoteText.textContent = current.quote;
  quoteAuthor.textContent = current.author;
}

if (plannerKids && plannerHours && plannerVibe) {
  plannerKids.addEventListener('input', updatePlanner);
  plannerHours.addEventListener('input', updatePlanner);
  plannerVibe.addEventListener('change', updatePlanner);
  updatePlanner();
}

if (quoteButton) {
  quoteButton.addEventListener('click', () => {
    const testimonials = getTestimonials();

    if (!testimonials.length) {
      return;
    }

    const choices = testimonials
      .map((_, index) => index)
      .filter((index) => index !== currentQuoteIndex);

    currentQuoteIndex = choices[Math.floor(Math.random() * choices.length)] ?? currentQuoteIndex;
    updateQuoteDisplay();
  });

  updateQuoteDisplay();
}

if (joinForm && formMessage) {
  joinForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.querySelector('#name').value.trim();

    formMessage.textContent = name
      ? t('join.successWithName', { name })
      : t('join.successGeneric');

    joinForm.reset();
    updatePlanner();
  });
}

document.addEventListener('i18n:updated', () => {
  updatePlanner();
  updateQuoteDisplay();
});
