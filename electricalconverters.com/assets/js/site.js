/**
 * site.js — electricalconverters.com
 * Shared, cached, deferred site chrome: footer year, mobile nav,
 * desktop disclosure dropdowns, active-link marking, result tick.
 * Loaded on every page. No page-specific logic lives here.
 */
(function () {
  'use strict';

  /* ── Footer year ──────────────────────────────────────────── */
  var yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Mobile navigation (full-screen overlay) ──────────────── */
  var navToggle = document.querySelector('.nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');
  var navClose = document.querySelector('.nav-close');

  function openNav() {
    if (!mobileNav) return;
    mobileNav.classList.add('is-open');
    mobileNav.removeAttribute('aria-hidden');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    var first = mobileNav.querySelector('a, button');
    if (first) first.focus();
  }

  function closeNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove('is-open');
    mobileNav.setAttribute('aria-hidden', 'true');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (navToggle) navToggle.addEventListener('click', openNav);
  if (navClose) navClose.addEventListener('click', function () {
    closeNav();
    if (navToggle) navToggle.focus();
  });
  if (mobileNav) {
    mobileNav.addEventListener('click', function (e) {
      if (e.target === mobileNav) closeNav();
    });
  }

  /* ── Desktop disclosure dropdowns (category bar) ──────────── */
  var groups = Array.prototype.slice.call(document.querySelectorAll('.nav-group'));
  var hoverCapable = window.matchMedia &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function closeGroup(group) {
    var trigger = group.querySelector('.nav-trigger');
    var panel = group.querySelector('.nav-panel');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (panel) panel.classList.remove('is-open');
  }

  function closeAllGroups(except) {
    groups.forEach(function (g) { if (g !== except) closeGroup(g); });
  }

  function openGroup(group) {
    closeAllGroups(group);
    var trigger = group.querySelector('.nav-trigger');
    var panel = group.querySelector('.nav-panel');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    if (panel) panel.classList.add('is-open');
  }

  groups.forEach(function (group) {
    var trigger = group.querySelector('.nav-trigger');
    var panel = group.querySelector('.nav-panel');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', function () {
      var isOpen = trigger.getAttribute('aria-expanded') === 'true';
      if (isOpen) { closeGroup(group); } else { openGroup(group); }
    });

    /* Pointer-capable devices: open on hover, close when the pointer
       leaves the whole group. */
    if (hoverCapable) {
      group.addEventListener('mouseenter', function () { openGroup(group); });
      group.addEventListener('mouseleave', function () { closeGroup(group); });
    }

    /* Close the group once focus moves outside it (keyboard tab-out). */
    group.addEventListener('focusout', function (e) {
      if (!group.contains(e.relatedTarget)) closeGroup(group);
    });
  });

  /* Click anywhere outside the category bar closes open dropdowns. */
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-group')) closeAllGroups(null);
  });

  /* Escape closes both the mobile overlay and any open dropdown. */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeNav();
    var openGroupEl = document.querySelector('.nav-trigger[aria-expanded="true"]');
    closeAllGroups(null);
    if (openGroupEl) openGroupEl.focus();
  });

  /* ── Mark the active nav item based on the current path ────── */
  var here = window.location.pathname;

  /* Mobile flat links + any desktop panel links */
  document.querySelectorAll('.nav-link, .nav-panel__link').forEach(function (link) {
    if (link.getAttribute('href') === here) link.classList.add('active');
  });

  /* Highlight the category trigger whose panel holds the current page */
  groups.forEach(function (group) {
    var trigger = group.querySelector('.nav-trigger');
    var match = group.querySelector('.nav-panel a[href="' + here + '"]');
    if (trigger && match) trigger.classList.add('active');
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
