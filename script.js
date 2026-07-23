// Sa7ne shared interactivity

// Mobile nav toggle
const navEl = document.querySelector('nav');
const navToggle = document.querySelector('.nav-toggle');
if (navEl && navToggle) {
  navToggle.addEventListener('click', () => {
    const open = navEl.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  // Close the menu after tapping a link
  navEl.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navEl.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

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
    const cfc = submitBtn.closest('.cfc');
    if (cfc) {
      const name = cfc.querySelector('input[type="text"].fi')?.value || '';
      const email = cfc.querySelector('input[type="email"].fi')?.value || '';
      const whatsapp = cfc.querySelector('input[type="tel"].fi')?.value || '';
      const selects = cfc.querySelectorAll('select.fs');
      const occasion = selects[0]?.value || '';
      const collection = selects[1]?.value || '';
      const quantity = selects[2]?.value || '';
      const budget = selects[3]?.value || '';
      const message = cfc.querySelector('textarea.fi')?.value || '';

      const subject = 'New Custom Order Request — Sa7ne Website';
      const body =
        'Name: ' + name + '\n' +
        'Email: ' + email + '\n' +
        'WhatsApp: ' + whatsapp + '\n' +
        'Occasion: ' + occasion + '\n' +
        'Base Collection: ' + collection + '\n' +
        'Quantity: ' + quantity + '\n' +
        'Budget (AED): ' + budget + '\n\n' +
        'Order Details:\n' + message;

      window.location.href = 'mailto:hellosa7ne@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    }
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

// Add to cart button feedback
document.querySelectorAll('.pd-actions .btn-p, .padd').forEach(btn => {
  btn.addEventListener('click', (e) => {
    if (btn.tagName === 'A' && btn.getAttribute('href') && btn.getAttribute('href') !== '#') return;
    e.preventDefault();
    const original = btn.textContent;
    btn.textContent = btn.classList.contains('padd') ? '✓' : '✓ Added to Cart';
    setTimeout(() => { btn.textContent = original; }, 1800);
  });
});
