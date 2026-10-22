// Sticky header: hairline once the page scrolls, the current section on the home page, and the phone menu.
(() => {
  const site = document.querySelector('.site'), menu = document.getElementById('menu'), menuBtn = document.querySelector('.menu-btn');
  if (!site || !menu) return;
  const onScroll = () => site.classList.toggle('scrolled', window.scrollY > 4);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // On the home page, light up the link for the section in view. Other pages mark their link in the template.
  const linked = [...menu.querySelectorAll('a[data-sec]')].filter(a => document.getElementById(a.dataset.sec));
  if (linked.length && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      for (const en of entries) if (en.isIntersecting) linked.forEach(a => a.setAttribute('aria-current', a.dataset.sec === en.target.id ? 'true' : 'false'));
    }, { rootMargin: '-40% 0px -55% 0px' });
    linked.forEach(a => obs.observe(document.getElementById(a.dataset.sec)));
  }

  function setMenu(open) { menu.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', open); }
  menuBtn.addEventListener('click', e => { e.stopPropagation(); setMenu(!menu.classList.contains('open')); });
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('click', e => { if (!menu.contains(e.target)) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
})();
