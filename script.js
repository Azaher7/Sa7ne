// Sa7ne shared interactivity

// Occasion tag selector (custom orders page)
document.querySelectorAll('.otag').forEach(t=>{
  t.addEventListener('click',()=>{
    document.querySelectorAll('.otag').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
  });
});

// Custom order form submit
const submitBtn = document.getElementById('submitBtn');
if (submitBtn) {
  submitBtn.addEventListener('click', () => {
    submitBtn.textContent = "✓ Request Sent! We'll be in touch.";
    submitBtn.style.background = 'var(--powder-light)';
    setTimeout(() => {
      submitBtn.textContent = 'Send My Request ✦';
      submitBtn.style.background = '';
    }, 3200);
  });
}

// Newsletter subscribe
const nlBtn = document.getElementById('nlBtn');
if (nlBtn) {
  nlBtn.addEventListener('click', () => {
    nlBtn.textContent = '✓ Subscribed!';
    setTimeout(() => { nlBtn.textContent = 'Subscribe ✦'; }, 2500);
  });
}

// Product detail gallery thumbnails
document.querySelectorAll('.pd-thumb').forEach(thumb => {
  thumb.addEventListener('click', () => {
    const src = thumb.querySelector('img').src;
    const main = document.querySelector('.pd-main-img img');
    if (main) main.src = src;
    document.querySelectorAll('.pd-thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
  });
});

// Color swatch selector
document.querySelectorAll('.color-swatches').forEach(group => {
  group.querySelectorAll('.swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      group.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
      sw.classList.add('active');
    });
  });
});

// Add to cart button feedback.
// Delegated from document so it also works on product cards that cms.js
// renders from the CMS content after this script has run.
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.pd-actions .btn-p, .padd');
  if (!btn) return;
  if (btn.tagName === 'A' && btn.getAttribute('href') && btn.getAttribute('href') !== '#') return;
  e.preventDefault();
  const original = btn.textContent;
  btn.textContent = btn.classList.contains('padd') ? '✓' : '✓ Added to Cart';
  setTimeout(() => { btn.textContent = original; }, 1800);
});
