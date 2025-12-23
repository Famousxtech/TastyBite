/* ---------------- element refs ---------------- */
const modalOverlay = document.querySelector('.modal-overlay');
const modalImage = document.querySelector('.modal-img');
const modalName = document.querySelector('.modal-details h2');
const modalPrice = document.querySelector('.modal-price');
const modalIngredients = document.querySelector('.modal-ingredients');
const modalSize = document.querySelector('#modal-size');
const modalQty = document.querySelector('.modal-qty');
const orderBtn = document.querySelector('.modal-order-btn');
const closeBtn = document.querySelector('.close-btn');

const chopCards = document.querySelectorAll('.chop-card');

let activeCard = null;

/* ---------- helper: format currency ---------- */
function formatNaira(n){
  if (isNaN(n)) return '₦0';
  return '₦' + Number(n).toLocaleString();
}

/* ---------- populate size select depending on group ---------- */
function buildSizeOptions(card){
  // remove existing
  modalSize.innerHTML = '';

  const group = card.getAttribute('data-group');

  if(group === 'pastry' || group === 'fried'){ 
    // use priceSingle, priceSmall, priceMedium, priceParty
    const mappings = [
      {label:'Single Pack (x3)', key:'priceSingle'},
      {label:'Small Tray', key:'priceSmall'},
      {label:'Medium Tray', key:'priceMedium'},
      {label:'Party / Large Tray', key:'priceParty'}
    ];
    mappings.forEach(m=>{
      // only add option if the data attribute exists on card
      if(card.dataset[m.key] !== undefined){
        const opt = document.createElement('option');
        opt.value = m.key;
        opt.textContent = `${m.label} — ${formatNaira(card.dataset[m.key])}`;
        modalSize.appendChild(opt);
      }
    });
  } else if(group === 'pastry-mix' || group === 'fried-mix'){
    const mappings = [
      {label:'Small Tray', key:'priceSmall'},
      {label:'Medium Tray', key:'priceMedium'},
      {label:'Party / Large Tray', key:'priceParty'}
    ];
    mappings.forEach(m=>{
      if(card.dataset[m.key] !== undefined){
        const opt = document.createElement('option');
        opt.value = m.key;
        opt.textContent = `${m.label} — ${formatNaira(card.dataset[m.key])}`;
        modalSize.appendChild(opt);
      }
    });
  } else if(group === 'shawarma'){
    const mappings = [
      {label:'Single Wrap', key:'priceSinglewrap'},
      {label:'Combo Bowl', key:'priceCombobowl'},
      {label:'Party Tray', key:'priceParty'}
    ];
    mappings.forEach(m=>{
      if(card.dataset[m.key] !== undefined){
        const opt = document.createElement('option');
        opt.value = m.key;
        opt.textContent = `${m.label} — ${formatNaira(card.dataset[m.key])}`;
        modalSize.appendChild(opt);
      }
    });
  } else {
    // fallback — show any price-related data attributes found
    const keys = Object.keys(card.dataset);
    keys.forEach(k=>{
      if(k.toLowerCase().includes('price')){
        const opt = document.createElement('option');
        opt.value = k;
        opt.textContent = `${k} — ${formatNaira(card.dataset[k])}`;
        modalSize.appendChild(opt);
      }
    });
  }

  // select first option by default
  if(modalSize.options.length) modalSize.selectedIndex = 0;
}

/* ---------- open modal ---------- */
function openModal(card){
  activeCard = card;
  // highlight active (optional)
  document.querySelectorAll('.chop-card').forEach(c=>c.classList.remove('active'));
  card.classList.add('active');

  // fill modal
  const name = card.getAttribute('data-name') || card.querySelector('h3').innerText;
  const ingredients = card.getAttribute('data-ingredients') || '';
  modalName.textContent = name;
  modalIngredients.innerHTML = `<strong>Ingredients</strong><p style="margin-top:6px">${ingredients}</p>`;
  // image
  const img = card.querySelector('img');
  modalImage.src = img ? img.src : 'placeholder.jpg';
  // sizes (populate select)
  buildSizeOptions(card);

  // qty default
  modalQty.value = 1;

  // update price
  updatePrice();

  // show overlay
  modalOverlay.classList.remove('hidden');
  // prevent background scroll while modal open
  document.documentElement.style.overflow = 'hidden';
}

/* ---------- close modal ---------- */
function closeModal(){
  modalOverlay.classList.add('hidden');
  document.documentElement.style.overflow = '';
  activeCard = null;
  // remove active style
  document.querySelectorAll('.chop-card').forEach(c=>c.classList.remove('active'));
}

/* ---------- get unit price from active card and selected size ---------- */
function getUnitPrice(){
  if(!activeCard) return 0;
  const key = modalSize.value; // e.g., priceSingle, priceSmall, priceMedium, priceParty, priceSinglewrap...
  if(!key) return 0;
  // dataset keys are camelCase in JS
  const ds = activeCard.dataset[key];
  if(!ds) return 0;
  const n = parseInt(ds,10);
  return isNaN(n) ? 0 : n;
}

/* ---------- update price display ---------- */
function updatePrice(){
  const qty = parseInt(modalQty.value) || 1;
  const unit = getUnitPrice();
  const total = unit * qty;
  modalPrice.textContent = formatNaira(total);
}

/* ---------- wire up card buttons ---------- */
document.querySelectorAll('.select-option').forEach(btn=>{
  btn.addEventListener('click', e=>{
    const card = e.target.closest('.chop-card');
    openModal(card);
  });
  // also open on click image/title if you want:
});

/* ---------- close control ---------- */
closeBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e)=>{
  if(e.target === modalOverlay) closeModal();
});

/* ---------- size/qty change ---------- */
modalSize.addEventListener('change', updatePrice);
modalQty.addEventListener('input', ()=>{
  if(modalQty.value < 1) modalQty.value = 1;
  updatePrice();
});

/* ---------- qty buttons ---------- */
document.addEventListener('click', function(e){
  if(e.target.classList.contains('qty-btn')){
    const isPlus = e.target.classList.contains('plus');
    let current = parseInt(modalQty.value) || 1;
    if(isPlus){ modalQty.value = current + 1; }
    else { if(current>1) modalQty.value = current - 1; }
    updatePrice();
  }
});

/* ---------- WhatsApp order ---------- */
orderBtn.addEventListener('click', ()=>{
  if(!activeCard) return;
  const name = modalName.textContent;
  const sizeLabel = modalSize.options[modalSize.selectedIndex]?.text || modalSize.value;
  const qty = modalQty.value;
  const price = modalPrice.textContent;
  const message = `Hello, I’d like to order ${qty} × ${sizeLabel} of ${name} (${price}).`;
  const encoded = encodeURIComponent(message);
  const phone = "2349076929934";
  window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
});

/* ---------- prevent negative qty on blur ---------- */
modalQty.addEventListener('blur', ()=>{
  if(parseInt(modalQty.value) < 1 || isNaN(parseInt(modalQty.value))) modalQty.value = 1;
});

/* ---------- REVIEW SYSTEM (keeps same behavior) ---------- */
let currentRating = 0;
const stars = document.querySelectorAll('.star');
const reviewForm = document.getElementById('review-form');
const reviewsList = document.getElementById('reviews-list');

stars.forEach(star=>{
  star.addEventListener('click', ()=>{
    currentRating = Number(star.dataset.value);
    stars.forEach(s=>s.classList.remove('selected'));
    // highlight up to clicked
    for(let i=0;i<currentRating;i++){
      stars[i].classList.add('selected');
    }
  });
});

if(reviewForm){
  reviewForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = document.getElementById('reviewer-name').value.trim();
    const text = document.getElementById('review-text').value.trim();
    if(!name || !text || currentRating === 0){
      alert('Please fill name, review and select a star rating.');
      return;
    }
    const div = document.createElement('div');
    div.className = 'review';
    div.innerHTML = `<strong>${name}</strong><div class="stars">${'★'.repeat(currentRating)}${'☆'.repeat(5-currentRating)}</div><p style="margin-top:6px">${text}</p>`;
    const noRev = reviewsList.querySelector('.no-reviews');
    if(noRev) noRev.remove();
    reviewsList.prepend(div);
    // reset
    document.getElementById('reviewer-name').value = '';
    document.getElementById('review-text').value = '';
    stars.forEach(s=>s.classList.remove('selected'));
    currentRating = 0;
  });
}

function goBack() {
    window.history.back();
  }