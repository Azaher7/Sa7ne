/* =========================================================
   Sa7ne — interactions
   ========================================================= */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky header shadow ---------- */
  const header = $(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const toggle = $(".nav-toggle");
  const menu = $("#mobile-menu");
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    menu.hidden = !open;
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  };
  toggle?.addEventListener("click", () => setMenu(menu.hidden));
  $$(".m-link, .m-cta", menu).forEach((a) =>
    a.addEventListener("click", () => setMenu(false))
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) { setMenu(false); toggle.focus(); }
  });

  /* ---------- Smooth in-page links (respects reduced motion) ---------- */
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id.length < 2) return;
      const target = document.getElementById(id.slice(1));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", id);
    });
  });

  /* ---------- Scroll reveal + stagger ---------- */
  const revealEls = $$(".reveal");
  // assign stagger index within parent groups
  $$(".product-grid, .steps, .quote-grid, .gallery-grid").forEach((grid) => {
    $$(":scope > .reveal", grid).forEach((el, i) => el.style.setProperty("--i", i));
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Active nav link (deterministic scroll-spy) ---------- */
  const navLinks = $$(".nav-link");
  const sections = navLinks
    .map((l) => document.getElementById(l.getAttribute("href").slice(1)))
    .filter(Boolean);
  if (sections.length) {
    const spyOffset = 140; // header height + breathing room
    let spyTicking = false;
    const updateActiveNav = () => {
      spyTicking = false;
      let currentId = sections[0].id;
      for (const s of sections) {
        // live measurement — robust to lazy-load layout shifts
        if (s.getBoundingClientRect().top <= spyOffset) currentId = s.id;
      }
      // near page bottom, force the last section active
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
        currentId = sections[sections.length - 1].id;
      }
      navLinks.forEach((l) =>
        l.classList.toggle("active", l.getAttribute("href") === "#" + currentId)
      );
    };
    const onSpyScroll = () => {
      if (!spyTicking) { spyTicking = true; requestAnimationFrame(updateActiveNav); }
    };
    window.addEventListener("scroll", onSpyScroll, { passive: true });
    window.addEventListener("resize", onSpyScroll, { passive: true });
    updateActiveNav();
  }

  /* ---------- Lightbox ---------- */
  const lightbox = $("#lightbox");
  const lbImage = $("#lbImage");
  const lbCaption = $("#lbCaption");
  const items = $$(".g-item");
  let current = 0;
  let lastFocused = null;

  const showItem = (index) => {
    current = (index + items.length) % items.length;
    const el = items[current];
    const full = el.getAttribute("href");
    const cap = el.getAttribute("data-caption") || "";
    const img = $("img", el);
    lbImage.src = full;
    lbImage.alt = img ? img.alt : "";
    lbCaption.textContent = cap;
  };

  const openLightbox = (index) => {
    lastFocused = document.activeElement;
    showItem(index);
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    $(".lb-close", lightbox).focus();
  };

  const closeLightbox = () => {
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lbImage.src = "";
    if (lastFocused) lastFocused.focus();
  };

  items.forEach((el, i) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      openLightbox(i);
    });
  });

  lightbox?.addEventListener("click", (e) => {
    const t = e.target;
    if (t.hasAttribute("data-close")) closeLightbox();
    else if (t.hasAttribute("data-next")) showItem(current + 1);
    else if (t.hasAttribute("data-prev")) showItem(current - 1);
  });

  document.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowRight") showItem(current + 1);
    else if (e.key === "ArrowLeft") showItem(current - 1);
    else if (e.key === "Tab") {
      // simple focus trap among lightbox buttons
      const focusables = $$("button", lightbox);
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Contact form ---------- */
  const form = $("#contactForm");
  const status = $("#formStatus");

  const validators = {
    "cf-name": (v) => v.trim().length >= 2 || "Please enter your name.",
    "cf-email": (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Please enter a valid email address.",
    "cf-message": (v) => v.trim().length >= 10 || "Please add a few more details (10+ characters).",
  };

  const setError = (id, msg) => {
    const field = document.getElementById(id).closest(".field");
    const errEl = $(`.error[data-for="${id}"]`);
    if (msg === true || msg === undefined) {
      field.classList.remove("invalid");
      if (errEl) errEl.textContent = "";
    } else {
      field.classList.add("invalid");
      if (errEl) errEl.textContent = msg;
    }
  };

  // live-clear errors as the user types
  Object.keys(validators).forEach((id) => {
    const el = document.getElementById(id);
    el?.addEventListener("input", () => {
      if (el.closest(".field").classList.contains("invalid")) {
        setError(id, validators[id](el.value));
      }
    });
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    // honeypot — silently succeed-ignore bots
    if (form.company && form.company.value) return;

    let ok = true;
    let firstInvalid = null;
    Object.keys(validators).forEach((id) => {
      const el = document.getElementById(id);
      const res = validators[id](el.value);
      setError(id, res);
      if (res !== true) { ok = false; if (!firstInvalid) firstInvalid = el; }
    });

    if (!ok) {
      status.hidden = false;
      status.className = "form-status error";
      status.textContent = "Please check the highlighted fields and try again.";
      firstInvalid?.focus();
      return;
    }

    const name = document.getElementById("cf-name").value.trim().split(" ")[0];
    status.hidden = false;
    status.className = "form-status success";
    status.textContent = `Thank you, ${name}! Your message is on its way — we'll be in touch within two working days.`;
    form.reset();
    status.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  });

  /* ---------- Gallery horizontal scroller ---------- */
  const track = $("#galleryTrack");
  if (track) {
    const prevBtn = $("#galPrev");
    const nextBtn = $("#galNext");
    const progress = $("#galleryProgress");
    const hint = $("#galleryHint");
    const cards = $$(".g-item", track);

    const maxScroll = () => track.scrollWidth - track.clientWidth;
    const stepSize = () => {
      const card = cards[0];
      const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 24;
      return card ? card.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
    };

    let hintHidden = false;
    const hideHint = () => {
      if (hintHidden || !hint) return;
      hintHidden = true;
      hint.classList.add("is-hidden");
    };

    let rafPending = false;
    const render = () => {
      rafPending = false;
      const max = maxScroll();
      const p = max > 0 ? track.scrollLeft / max : 0;
      if (progress) progress.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`;
      if (prevBtn) prevBtn.disabled = track.scrollLeft <= 2;
      if (nextBtn) nextBtn.disabled = track.scrollLeft >= max - 2;
    };
    const onScroll = () => {
      if (!rafPending) { rafPending = true; requestAnimationFrame(render); }
      hideHint();
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", render, { passive: true });

    const go = (dir) =>
      track.scrollBy({ left: dir * stepSize(), behavior: reduceMotion ? "auto" : "smooth" });
    prevBtn?.addEventListener("click", () => go(-1));
    nextBtn?.addEventListener("click", () => go(1));

    // Keyboard when the track itself is focused
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    });

    // Mouse wheel -> horizontal; pass through to the page at the track's edges
    track.addEventListener("wheel", (e) => {
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // pinch or native horizontal
      const max = maxScroll();
      const down = e.deltaY > 0;
      if ((down && track.scrollLeft >= max - 1) || (!down && track.scrollLeft <= 0)) return;
      e.preventDefault();
      track.scrollLeft += e.deltaY;
      hideHint();
    }, { passive: false });

    // Click-and-drag with the mouse (touch uses native momentum scrolling).
    // Mouse events are used rather than pointer events because a scroll
    // container fires pointercancel when it takes over, which would abort the
    // drag. Listeners live on window so the drag continues outside the track.
    let dragging = false, startX = 0, startScroll = 0, moved = 0;
    track.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      dragging = true; moved = 0;
      startX = e.clientX; startScroll = track.scrollLeft;
      e.preventDefault(); // avoid text/image selection while dragging
    });
    window.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (!track.classList.contains("is-dragging") && Math.abs(dx) > 4) {
        track.classList.add("is-dragging");  // flip to "grabbing" once moving
      }
      moved = Math.max(moved, Math.abs(dx));
      track.scrollLeft = startScroll - dx;
    });
    window.addEventListener("mouseup", () => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove("is-dragging");
    });
    // Suppress the click (which opens the lightbox) if it was actually a drag
    track.addEventListener("click", (e) => {
      if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; }
    }, true);

    render();
  }
})();
