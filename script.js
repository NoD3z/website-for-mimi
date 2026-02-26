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

const testimonials = [
  {
    quote: '“I finally finished a hot coffee while my toddler had the best afternoon.”',
    author: '— Sam, parent of 1'
  },
  {
    quote: '“The quiet zone helped me catch up on work without feeling guilty.”',
    author: '— Alex, caregiver of 2'
  },
  {
    quote: '“My daughter asked to come back before we even got home.”',
    author: '— Priya, parent of 1'
  }
];

function updatePlanner() {
  if (!plannerKids || !plannerHours || !plannerVibe) {
    return;
  }

  const kids = Number(plannerKids.value) || 1;
  const hours = Number(plannerHours.value);
  const basePrice = 13;
  const siblingDiscount = kids > 1 ? (kids - 1) * 2 : 0;
  const total = Math.max(kids * hours * basePrice - siblingDiscount, 18);

  hoursOutput.textContent = `${hours} hours`;
  priceOutput.textContent = `$${total.toFixed(2)}`;
  vibeOutput.textContent = `You'll probably enjoy: ${plannerVibe.options[plannerVibe.selectedIndex].text}`;
}

if (plannerKids && plannerHours && plannerVibe) {
  plannerKids.addEventListener('input', updatePlanner);
  plannerHours.addEventListener('input', updatePlanner);
  plannerVibe.addEventListener('change', updatePlanner);
  updatePlanner();
}

if (quoteButton) {
  quoteButton.addEventListener('click', () => {
    const currentQuote = quoteText.textContent;
    const options = testimonials.filter((item) => item.quote !== currentQuote);
    const next = options[Math.floor(Math.random() * options.length)];

    quoteText.textContent = next.quote;
    quoteAuthor.textContent = next.author;
  });
}

if (joinForm && formMessage) {
  joinForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.querySelector('#name').value.trim();

    formMessage.textContent = name
      ? `Thanks ${name}! We will email you available slots in the next 24 hours.`
      : 'Thanks! We will email you available slots in the next 24 hours.';

    joinForm.reset();
  });
}
