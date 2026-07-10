/**
 * site.js — electricalconverters.com
 * Shared, cached, deferred site chrome: footer year, mobile nav, result tick.
 * Loaded on every page. No page-specific logic lives here.
 */
(function () {
  'use strict';

  /* ── Footer year ──────────────────────────────────────────── */
  var yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Mobile navigation ────────────────────────────────────── */
  var navToggle = document.querySelector('.nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');
  var navClose = document.querySelector('.nav-close');

  function openNav() {
    if (!mobileNav) return;
    mobileNav.classList.add('is-open');
    mobileNav.removeAttribute('aria-hidden');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove('is-open');
    mobileNav.setAttribute('aria-hidden', 'true');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (navToggle) navToggle.addEventListener('click', openNav);
  if (navClose) navClose.addEventListener('click', closeNav);
  if (mobileNav) {
    mobileNav.addEventListener('click', function (e) {
      if (e.target === mobileNav) closeNav();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  /* ── Mark active nav link based on current path ───────────── */
  var here = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(function (link) {
    if (link.getAttribute('href') === here) link.classList.add('active');
  });

  /* ── Result readout tick (honours reduced-motion) ─────────── */
  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.animateResultTick = function (id) {
    if (reduce) return;
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('tick');
    /* force reflow so re-adding the class restarts the animation */
    void el.offsetWidth;
    el.classList.add('tick');
  };

  /* Back-compat shim: some legacy inline calls expected initPage(). */
  window.initPage = function () {};
})();
