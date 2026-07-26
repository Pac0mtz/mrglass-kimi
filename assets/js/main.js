/* Mr. Glass Chicago — interactions */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* Header shadow on scroll */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile nav */
  var burger = document.querySelector('.hamburger');
  var navLinks = document.querySelector('.nav-links');
  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      burger.classList.toggle('open');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });
    navLinks.querySelectorAll('.has-drop > a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (window.innerWidth <= 820) {
          e.preventDefault();
          a.parentElement.classList.toggle('open');
        }
      });
    });
    navLinks.querySelectorAll('a[href]').forEach(function (a) {
      a.addEventListener('click', function () {
        if (!a.parentElement.classList.contains('has-drop') || a.getAttribute('href') !== '#') {
          burger.classList.remove('open');
          navLinks.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    });
  }

  /* Scroll reveal */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }
  /* safety: never leave content hidden if IO misbehaves */
  setTimeout(function () {
    revealEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 1.2) el.classList.add('in');
    });
  }, 1200);

  /* Animated counters */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        var el = en.target;
        var target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        var dur = 1800, start = null;
        function tick(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString() + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* Before / After slider */
  document.querySelectorAll('.ba-slider').forEach(function (slider) {
    function setBA(x) {
      var r = slider.getBoundingClientRect();
      var pct = Math.max(2, Math.min(98, ((x - r.left) / r.width) * 100));
      slider.style.setProperty('--ba', pct + '%');
    }
    var dragging = false;
    slider.addEventListener('pointerdown', function (e) { dragging = true; slider.setPointerCapture(e.pointerId); setBA(e.clientX); });
    slider.addEventListener('pointermove', function (e) { if (dragging) setBA(e.clientX); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
      slider.addEventListener(ev, function () { dragging = false; });
    });
    /* gentle intro sway */
    var sway = 0;
    var iv = setInterval(function () {
      if (dragging) { clearInterval(iv); return; }
      sway += 0.05;
      var pct = 50 + Math.sin(sway) * 12;
      slider.style.setProperty('--ba', pct + '%');
      if (sway > 6.4) clearInterval(iv);
    }, 40);
  });

  /* Lightbox gallery */
  var lb = document.querySelector('.lightbox');
  var galItems = Array.prototype.slice.call(document.querySelectorAll('.gal-item img'));
  if (lb && galItems.length) {
    var lbImg = lb.querySelector('img');
    var idx = 0;
    function open(i) {
      idx = (i + galItems.length) % galItems.length;
      lbImg.src = galItems[idx].src;
      lbImg.alt = galItems[idx].alt;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function close() { lb.classList.remove('open'); document.body.style.overflow = ''; }
    galItems.forEach(function (img, i) {
      img.parentElement.addEventListener('click', function () { open(i); });
    });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function (e) { e.stopPropagation(); open(idx - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function (e) { e.stopPropagation(); open(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') open(idx - 1);
      if (e.key === 'ArrowRight') open(idx + 1);
    });
  }

  /* FAQ accordion */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (o) {
        o.classList.remove('open');
        o.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* Reviews carousel — manual arrows + drag */
  var vp = document.querySelector('.rev-viewport');
  if (vp) {
    var track = vp.querySelector('.rev-track');
    var prevB = document.querySelector('.rev-prev');
    var nextB = document.querySelector('.rev-next');
    function cardStep() {
      var card = track.querySelector('.rev-m-card');
      if (!card) return 370;
      var gap = parseFloat(getComputedStyle(track).gap) || 20;
      return card.getBoundingClientRect().width + gap;
    }
    function updateArrows() {
      var max = vp.scrollWidth - vp.clientWidth - 4;
      if (prevB) prevB.disabled = vp.scrollLeft <= 4;
      if (nextB) nextB.disabled = vp.scrollLeft >= max;
    }
    if (prevB) prevB.addEventListener('click', function () { vp.scrollBy({ left: -cardStep(), behavior: 'smooth' }); });
    if (nextB) nextB.addEventListener('click', function () { vp.scrollBy({ left: cardStep(), behavior: 'smooth' }); });
    vp.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    updateArrows();
    var isDown = false, startX = 0, startL = 0, moved = false;
    vp.addEventListener('pointerdown', function (e) {
      isDown = true; moved = false; startX = e.clientX; startL = vp.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!isDown) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 6 && !moved) { moved = true; vp.classList.add('dragging'); }
      if (moved) vp.scrollLeft = startL - dx;
    });
    window.addEventListener('pointerup', function () {
      isDown = false;
      setTimeout(function () { vp.classList.remove('dragging'); }, 30);
    });
  }

  /* Quote form (front-end only, mailto fallback) */
  var form = document.querySelector('#quote-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var lines = [];
      if (typeof selectedParts !== 'undefined' && selectedParts.length) {
        lines.push('Selected glass: ' + selectedParts.map(function (id) { return (PART_NAMES[id] || id); }).join(', '));
      }
      var vinEl = document.getElementById('car-vin');
      if (vinEl && vinEl.value) lines.push('VIN: ' + vinEl.value);
      data.forEach(function (v, k) { if (v) lines.push(k + ': ' + v); });
      var body = encodeURIComponent(lines.join('\n'));
      window.location.href = 'mailto:info@mrglasschicago.com?subject=' +
        encodeURIComponent('Free Estimate Request — ' + (data.get('Name') || 'Website')) + '&body=' + body;
      var note = form.querySelector('.form-note');
      if (note) note.textContent = 'Opening your email app… You can also call us at (773) 526-0013 for immediate help.';
      if (typeof toast === 'function') toast('Opening your email app — request ready to send!', 'success');
    });
  }

  /* ---------- Toast notifications ---------- */
  var toastStack = document.createElement('div');
  toastStack.className = 'toast-stack';
  document.body.appendChild(toastStack);
  function toast(msg, type) {
    var t = document.createElement('div');
    t.className = 'toast ' + (type || 'info');
    t.innerHTML = '<span class="t-ico">' + (type === 'success' ? '✓' : 'i') + '</span><span>' + msg + '</span>';
    toastStack.appendChild(t);
    setTimeout(function () {
      t.classList.add('out');
      setTimeout(function () { t.remove(); }, 320);
    }, 3200);
  }

  /* ---------- Modal helpers ---------- */
  function openModal(el) {
    el.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(el) {
    el.classList.remove('open');
    document.body.style.overflow = '';
  }
  function wireModalClose(el) {
    el.querySelector('.modal-x').addEventListener('click', function () { closeModal(el); });
    el.addEventListener('click', function (e) { if (e.target === el) closeModal(el); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && el.classList.contains('open')) closeModal(el); });
  }

  /* ---------- Glass parts registry ---------- */
  var PART_NAMES = {
    'windshield': 'Windshield',
    'rear-windshield': 'Rear Windshield',
    'driver-front': 'Driver Front Window',
    'driver-rear': 'Driver Rear Window',
    'passenger-front': 'Passenger Front Window',
    'passenger-rear': 'Passenger Rear Window',
    'driver-quarter': 'Driver Quarter Glass',
    'passenger-quarter': 'Passenger Quarter Glass',
    'sunroof': 'Sunroof / Moonroof'
  };
  var selectedParts = [];

  function partsSummary() {
    return selectedParts.map(function (id) { return PART_NAMES[id] || id; }).join(', ');
  }

  function renderChips(container) {
    container.innerHTML = '';
    if (!selectedParts.length) {
      container.innerHTML = '<span class="sel-empty" id="sel-empty">No glass selected yet — tap the car.</span>';
      return;
    }
    selectedParts.forEach(function (id) {
      var chip = document.createElement('span');
      chip.className = 'sel-chip';
      chip.innerHTML = PART_NAMES[id] || id;
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Remove ' + PART_NAMES[id]);
      b.textContent = '✕';
      b.addEventListener('click', function () { togglePart(id, true); });
      chip.appendChild(b);
      container.appendChild(chip);
    });
  }

  /* ---------- Scroll-triggered promo modal (once per session) ---------- */
  var smSeen = false;
  try { smSeen = sessionStorage.getItem('mrg_sm') === '1'; } catch (err) {}
  if (!smSeen) {
    var smModal = document.createElement('div');
    smModal.className = 'modal-overlay';
    smModal.setAttribute('role', 'dialog');
    smModal.setAttribute('aria-label', 'Free estimate offer');
    smModal.innerHTML =
      '<div class="modal-card scroll-modal-card">' +
        '<button class="modal-x" aria-label="Close">✕</button>' +
        '<span class="sm-badge">Free Estimate</span>' +
        '<h3>Cracked or shattered glass?</h3>' +
        '<p>Don\'t wait for it to spread. Tap your broken glass, get a free estimate — and we\'ll come to you anywhere in Chicagoland.</p>' +
        '<div class="btn-row">' +
          '<button class="btn btn-primary" id="sm-est">Get My Free Estimate</button>' +
          '<a class="btn btn-light" href="tel:7735260013">Call (773) 526-0013</a>' +
        '</div>' +
      '</div>';
    document.body.appendChild(smModal);
    wireModalClose(smModal);
    smModal.querySelector('#sm-est').addEventListener('click', function () {
      closeModal(smModal);
      var target = document.getElementById('estimator') || document.getElementById('car-estimator');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        toast('Tap your broken glass on the car', 'info');
      } else {
        window.location.href = 'contact.html#car-estimator';
      }
    });
    var smShown = false;
    function onScrollModal() {
      if (smShown) return;
      var scrolled = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (scrolled > 0.55) {
        smShown = true;
        openModal(smModal);
        try { sessionStorage.setItem('mrg_sm', '1'); } catch (err) {}
        window.removeEventListener('scroll', onScrollModal);
      }
    }
    window.addEventListener('scroll', onScrollModal, { passive: true });
  }

  /* ---------- Interactive car glass selector ---------- */
  var glassParts = document.querySelectorAll('.glass-part');
  var selChipsBox = document.getElementById('sel-chips');

  function syncSelectorUI() {
    if (selChipsBox) renderChips(selChipsBox);
  }

  function togglePart(id, silent) {
    var el = document.querySelector('.glass-part[data-part="' + id + '"]');
    var i = selectedParts.indexOf(id);
    if (i > -1) {
      selectedParts.splice(i, 1);
      if (el) el.classList.remove('selected');
      if (!silent) toast(PART_NAMES[id] + ' removed', 'info');
    } else {
      selectedParts.push(id);
      if (el) el.classList.add('selected');
      if (!silent) toast(PART_NAMES[id] + ' added to your estimate', 'success');
    }
    syncSelectorUI();
  }

  if (glassParts.length) {
    glassParts.forEach(function (el) {
      el.addEventListener('click', function () { togglePart(el.getAttribute('data-part')); });
    });
  }
  /* Inline estimator form (home) — interactive always visible, no modal */
  var estInline = document.getElementById('est-inline-form');
  if (estInline) {
    estInline.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!selectedParts.length) {
        toast('Tap your broken glass on the car first', 'info');
        var stage = document.querySelector('.car-stage');
        if (stage) {
          stage.classList.remove('shake');
          void stage.offsetWidth;
          stage.classList.add('shake');
        }
        return;
      }
      var data = new FormData(estInline);
      var lines = ['Selected glass: ' + partsSummary()];
      data.forEach(function (v, k) { if (v) lines.push(k + ': ' + v); });
      window.location.href = 'mailto:info@mrglasschicago.com?subject=' +
        encodeURIComponent('Estimate Request — ' + partsSummary()) +
        '&body=' + encodeURIComponent(lines.join('\n'));
      toast('Opening your email app — request ready to send!', 'success');
      estInline.reset();
    });
  }

  /* Current year */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
