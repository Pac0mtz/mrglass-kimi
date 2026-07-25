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
      data.forEach(function (v, k) { if (v) lines.push(k + ': ' + v); });
      var body = encodeURIComponent(lines.join('\n'));
      window.location.href = 'mailto:info@mrglasschicago.com?subject=' +
        encodeURIComponent('Free Estimate Request — ' + (data.get('Name') || 'Website')) + '&body=' + body;
      var note = form.querySelector('.form-note');
      if (note) note.textContent = 'Opening your email app… You can also call us at (773) 526-0013 for immediate help.';
    });
  }

  /* Current year */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
