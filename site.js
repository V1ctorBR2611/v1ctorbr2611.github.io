// Topo com fundo ao rolar + animação de entrada das seções.
(function () {
  var topo = document.querySelector('.topo');
  function rolou() { if (topo) topo.classList.toggle('rolou', window.scrollY > 40); }
  window.addEventListener('scroll', rolou, { passive: true });
  rolou();

  var itens = document.querySelectorAll('.surge');
  if (!('IntersectionObserver' in window)) { itens.forEach(function (e) { e.classList.add('visivel'); }); return; }
  var obs = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visivel'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  itens.forEach(function (e) { obs.observe(e); });
})();
