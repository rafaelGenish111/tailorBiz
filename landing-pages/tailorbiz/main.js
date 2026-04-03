/* TaylorBiz Landing Page - main.js */

(function () {
  'use strict';

  /* ===== FORM HANDLING ===== */
  function handleFormSubmit(e) {
    e.preventDefault();
    var form = e.target;
    var btn = form.querySelector('button[type="submit"]');
    var originalText = btn.textContent;

    btn.textContent = 'שולח...';
    btn.disabled = true;

    // Simulate API call - replace with real endpoint
    setTimeout(function () {
      form.innerHTML =
        '<div class="success-state">' +
        '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#1AE879" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="20" cy="20" r="18"/>' +
        '<path d="M12 20l6 6 10-12"/>' +
        '</svg>' +
        '<h3>מעולה! נחזור אליך תוך שעה.</h3>' +
        '<p>בינתיים, אפשר לכתוב לנו ב-WhatsApp.</p>' +
        '</div>';
    }, 1200);
  }

  var forms = document.querySelectorAll('.lp-form');
  for (var i = 0; i < forms.length; i++) {
    forms[i].addEventListener('submit', handleFormSubmit);
  }

  /* ===== SCROLL FADE-IN ===== */
  var fadeSections = document.querySelectorAll('.fade-section');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        for (var j = 0; j < entries.length; j++) {
          if (entries[j].isIntersecting) {
            entries[j].target.classList.add('visible');
            observer.unobserve(entries[j].target);
          }
        }
      },
      { threshold: 0.15 }
    );

    for (var k = 0; k < fadeSections.length; k++) {
      observer.observe(fadeSections[k]);
    }
  } else {
    // Fallback: show all immediately
    for (var m = 0; m < fadeSections.length; m++) {
      fadeSections[m].classList.add('visible');
    }
  }

  /* ===== SMOOTH SCROLL FOR NAV CTA ===== */
  var navCta = document.querySelector('.btn-nav');
  if (navCta) {
    navCta.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.querySelector(navCta.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
})();
