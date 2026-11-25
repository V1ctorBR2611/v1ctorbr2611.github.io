// Apresentação de slides da página inicial: troca automática, setas, pontos, teclado, deslize no
// celular e paralaxe das camadas com o mouse.
(function () {
  var raiz = document.querySelector('.slides');
  if (!raiz) return;
  var slides = [].slice.call(raiz.querySelectorAll('.slide'));
  var pontos = [].slice.call(raiz.querySelectorAll('.slides-pontos button'));
  var TEMPO = 7000;
  var atual = 0, timer = null, pausado = false;
  var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ir(n) {
    n = (n + slides.length) % slides.length;
    slides.forEach(function (s, i) {
      var ativo = i === n;
      s.classList.toggle('ativo', ativo);
      s.setAttribute('aria-hidden', ativo ? 'false' : 'true');
      s.querySelectorAll('a').forEach(function (a) { a.tabIndex = ativo ? 0 : -1; });
    });
    pontos.forEach(function (p, i) {
      p.classList.toggle('ativo', i === n);
      p.setAttribute('aria-current', i === n ? 'true' : 'false');
      // reinicia a barra de progresso
      var barra = p.querySelector('.progresso');
      if (barra) { barra.style.animation = 'none'; void barra.offsetWidth; barra.style.animation = ''; }
    });
    raiz.style.setProperty('--cor-slide', slides[n].dataset.cor || '#4fb3ff');
    atual = n;
    agendar();
  }
  function agendar() {
    clearTimeout(timer);
    if (pausado || reduz) return;
    timer = setTimeout(function () { ir(atual + 1); }, TEMPO);
  }
  function pausar(v) {
    pausado = v;
    raiz.classList.toggle('pausado', v);
    agendar();
  }

  raiz.querySelector('.seta.ant').addEventListener('click', function () { ir(atual - 1); });
  raiz.querySelector('.seta.prox').addEventListener('click', function () { ir(atual + 1); });
  pontos.forEach(function (p, i) { p.addEventListener('click', function () { ir(i); }); });
  raiz.addEventListener('mouseenter', function () { pausar(true); });
  raiz.addEventListener('mouseleave', function () { pausar(false); });
  raiz.addEventListener('focusin', function () { pausar(true); });
  raiz.addEventListener('focusout', function () { pausar(false); });
  raiz.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') ir(atual - 1);
    if (e.key === 'ArrowRight') ir(atual + 1);
  });
  document.addEventListener('visibilitychange', function () { pausar(document.hidden); });

  // Deslize no celular
  var x0 = null, y0 = null;
  raiz.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  raiz.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) ir(atual + (dx < 0 ? 1 : -1));
    x0 = y0 = null;
  });

  // Paralaxe: cada camada com data-prof se move proporcionalmente à posição do mouse.
  if (!reduz && window.matchMedia('(hover: hover)').matches) {
    var alvo = { x: 0, y: 0 }, pos = { x: 0, y: 0 }, rodando = false;
    raiz.addEventListener('mousemove', function (e) {
      var r = raiz.getBoundingClientRect();
      alvo.x = (e.clientX - r.left) / r.width - 0.5;
      alvo.y = (e.clientY - r.top) / r.height - 0.5;
      if (!rodando) { rodando = true; requestAnimationFrame(passo); }
    });
    raiz.addEventListener('mouseleave', function () { alvo.x = 0; alvo.y = 0; });
    var passo = function () {
      pos.x += (alvo.x - pos.x) * 0.08;
      pos.y += (alvo.y - pos.y) * 0.08;
      var s = slides[atual];
      s.querySelectorAll('[data-prof]').forEach(function (el) {
        var p = parseFloat(el.dataset.prof);
        el.style.setProperty('--px', (-pos.x * p).toFixed(2) + 'px');
        el.style.setProperty('--py', (-pos.y * p).toFixed(2) + 'px');
      });
      if (Math.abs(alvo.x - pos.x) > 0.001 || Math.abs(alvo.y - pos.y) > 0.001) requestAnimationFrame(passo);
      else rodando = false;
    };
  }

  ir(0);
})();
