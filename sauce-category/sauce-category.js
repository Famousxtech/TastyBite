// === ELEMENT REFERENCES ===
const modalOverlay = document.querySelector('.modal-overlay');
const modalImage = document.querySelector('.modal-img');
const modalName = document.querySelector('.modal-details h2');
const modalPrice = document.querySelector('.modal-price');
const modalIngredients = document.querySelector('.modal-ingredients');
const modalSize = document.querySelector('.modal-size');
const modalQty = document.querySelector('.modal-qty');
const orderBtn = document.querySelector('.modal-order-btn');
const closeBtn = document.querySelector('.close-btn');
const soupCards = document.querySelectorAll('.soup-card');

// === OPEN MODAL ===
soupCards.forEach(card => {
  const selectBtn = card.querySelector('.select-option');
  const img = card.querySelector('.soup-image');

  const openPopup = () => {
  // 🔸 Mark this soup as active
  document.querySelectorAll('.soup-card').forEach(c => c.classList.remove('active'));
  card.classList.add('active');

  // 🔸 Get soup info
  const name = card.dataset.soup;
  const ingredients = card.dataset.ingredients;
  const imgSrc = card.querySelector('.soup-image').src;

  // 🔸 Update modal content
  modalName.textContent = name;
  modalImage.src = imgSrc;
  modalIngredients.innerHTML = `
  <h3>Ingredients</h3>
  <p>${ingredients}</p>
`;

  modalSize.value = '1 Litre';
  modalQty.value = 1;

  // 🔸 Update price dynamically
  updatePrice();

  document.body.style.overflow = 'hidden';
  // 🔸 Show popup
  modalOverlay.classList.remove('hidden');

  
};


  selectBtn.addEventListener('click', openPopup);
  img.addEventListener('click', openPopup);
});

// === CLOSE MODAL ===
closeBtn.addEventListener('click', () => {
  modalOverlay.classList.add('hidden');
  document.body.style.overflow = '';
});

// === PRICE CALCULATION ===
function updatePrice() {
  const size = modalSize.value;
  const qty = parseInt(modalQty.value);

  // Retrieve the selected soup’s price data
  const activeSoup = document.querySelector('.soup-card.active');
  const price1 = parseInt(activeSoup.dataset.price1);
  const price3 = parseInt(activeSoup.dataset.price3);
  const price5 = parseInt(activeSoup.dataset.price5);

  let unitPrice = 0;
  if (size === '1 Litre') unitPrice = price1;
  else if (size === '3 Litres') unitPrice = price3;
  else if (size === '5 Litres') unitPrice = price5;

  const total = unitPrice * qty;
  modalPrice.textContent = `₦${total.toLocaleString()}`;
}


// === UPDATE PRICE WHEN CHANGING SIZE OR QTY ===
modalSize.addEventListener('change', updatePrice);
modalQty.addEventListener('input', updatePrice);

// === WHATSAPP ORDER ===
orderBtn.addEventListener('click', () => {
  const name = modalName.textContent;
  const size = modalSize.value;
  const qty = modalQty.value;
  const price = modalPrice.textContent;

  const message = `Hello, I’d like to order ${qty} × ${size} of ${name} (${price}).`;
  const encoded = encodeURIComponent(message);
  const phone = "2349076929934";
  window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
});

// === OPTIONAL ENHANCEMENTS ===

// Prevent invalid quantities
modalQty.addEventListener('blur', () => {
  if (modalQty.value < 1) modalQty.value = 1;
});

// Close modal when clicking outside it
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) modalOverlay.classList.add('hidden');
});

// === CUSTOM QUANTITY BUTTONS ===
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('qty-btn')) {
    const isPlus = e.target.classList.contains('plus');
    const qtyInput = document.querySelector('.modal-qty');

    let current = parseInt(qtyInput.value);
    if (isPlus) {
      qtyInput.value = current + 1;
    } else if (current > 1) {
      qtyInput.value = current - 1;
    }
    updatePrice();
  }
  
});

// === REVIEW SYSTEM ===
let currentRating = 0;
const stars = document.querySelectorAll('.star');
const reviewForm = document.getElementById('review-form');
const reviewsList = document.getElementById('reviews-list');

// ⭐ STAR SELECTION
stars.forEach(star => {
  star.addEventListener('click', () => {
    currentRating = star.dataset.value;
    stars.forEach(s => s.classList.remove('selected'));
    star.classList.add('selected');
    // Highlight all previous stars
    for (let i = 0; i < star.dataset.value; i++) {
      stars[i].classList.add('selected');
    }
  });
});

// 📝 FORM SUBMISSION
reviewForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('reviewer-name').value.trim();
  const text = document.getElementById('review-text').value.trim();

  if (!name || !text || currentRating === 0) {
    alert('Please fill in your name, review, and select a star rating.');
    return;
  }

  const reviewDiv = document.createElement('div');
  reviewDiv.classList.add('review');
  reviewDiv.innerHTML = `
    <strong>${name}</strong>
    <div class="stars">${'★'.repeat(currentRating)}${'☆'.repeat(5 - currentRating)}</div>
    <p>${text}</p>
  `;

  // Remove "no reviews" message if it exists
  const noReviews = reviewsList.querySelector('.no-reviews');
  if (noReviews) noReviews.remove();

  reviewsList.prepend(reviewDiv);

  // Reset form
  reviewForm.reset();
  stars.forEach(s => s.classList.remove('selected'));
  currentRating = 0;
});

function goBack() {
    window.history.back();
  }

