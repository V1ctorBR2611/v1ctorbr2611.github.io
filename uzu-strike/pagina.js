// Página do UZU STRIKE: seleção de strikers, cut-in dos Kamis, carrossel de Kamis, piões da montagem,
// entradas "slam" e navegação das seções. Os dados (strikers, Kamis, cores) vêm de dados.js, gerado do jogo
// por ferramentas/uzu-midia.mjs.
(function () {
  var D = window.UZU || { strikers: [] };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  function el(tag, attrs, filhos) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) { if (k === 'texto') e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); }
    (filhos || []).forEach(function (f) { e.appendChild(f); });
    return e;
  }
  var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var S = D.strikers;
  var destaques = S.filter(function (s) { return s.destaque; });

  // ---------- Seleção de strikers ----------
  var secao = $('.uz-strikers');
  var grade = $('.uz-sel-grade');
  var pers = $('.uz-sel-pers'), kami = $('.uz-sel-kami'), piao = $('.uz-sel-piao'), info = $('.uz-sel-info');
  var atual = -1;
  var lista = S.filter(function (s) { return s.temKami; });
  lista.forEach(function (s, i) {
    var b = el('button', { type: 'button', role: 'tab', 'aria-label': s.nome, style: '--bc:' + s.cor + ';--bc2:' + s.claro },
      [el('img', { src: 'img/strikers/' + s.id + '-1.webp', alt: '', loading: 'lazy' })]);
    b.addEventListener('click', function () { escolher(i, true); });
    b.addEventListener('mouseenter', function () { new Image().src = 'img/strikers/' + s.id + '-3.webp'; });
    grade.appendChild(b);
  });
  function reanimar(e) { e.classList.remove('troca'); void e.offsetWidth; e.classList.add('troca'); }
  function escolher(i, doUsuario) {
    if (!lista.length || i === atual) return;
    atual = i;
    var s = lista[i];
    secao.style.setProperty('--c', s.cor);
    secao.style.setProperty('--c2', s.claro);
    // O striker escolhido aparece numa pose só (a de grito, a mesma da seleção do jogo), sem troca depois.
    pers.src = 'img/strikers/' + s.id + '-3.webp';
    pers.alt = s.nome;
    kami.src = 'img/kamis/' + s.kamiArq + '.webp';
    piao.style.display = s.temPiao ? '' : 'none';
    if (s.temPiao) piao.src = 'img/pioes/' + s.id + '.webp';
    $('.uz-sel-frase', info).textContent = s.frase;
    $('.uz-sel-nome', info).textContent = s.nome;
    $('.uz-sel-kaminome b', info).textContent = s.kami;
    reanimar(pers); reanimar(kami); reanimar(info);
    $$('button', grade).forEach(function (b, k) { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
  }
  escolher(0, false);
  [pers, kami, info].forEach(function (e) { e.classList.remove('troca'); });

  // ---------- Carrossel de Kamis (duas voltas para o laço contínuo) ----------
  var trilho = $('.uz-kamis-trilho');
  var kamis = S.filter(function (s) { return s.temKami; });
  [0, 1].forEach(function (volta) {
    kamis.forEach(function (s) {
      trilho.appendChild(el('div', { class: 'uz-kami', style: '--k:' + s.claro, 'aria-hidden': volta ? 'true' : 'false' }, [
        el('img', { src: 'img/kamis/' + s.kamiArq + '.webp', alt: volta ? '' : 'Kami ' + s.kami, loading: 'lazy' }),
        el('strong', { texto: s.kami }),
        el('span', { texto: 'Kami de ' + s.nome }),
      ]));
    });
  });

  // ---------- Cut-in: troca de striker a cada vez que a faixa entra na tela ----------
  var cutin = $('.uz-cutin');
  var ordemCut = (destaques.length ? destaques : S).filter(function (s) { return s.temKami; });
  var iCut = 0;
  function prepararCut() {
    var s = ordemCut[iCut % ordemCut.length];
    $('.uz-cutin-pers', cutin).src = 'img/strikers/' + s.id + '-3.webp';
    $('.uz-cutin-kami', cutin).src = 'img/kamis/' + s.kamiArq + '.webp';
    $('.uz-cutin-faixa', cutin).style.background =
      'repeating-linear-gradient(90deg, ' + s.cor + ' 0 2px, transparent 2px 40px), linear-gradient(90deg, ' + s.cor + ', ' + s.claro + ')';
    iCut++;
  }
  prepararCut();

  // ---------- Piões da montagem ----------
  var orbita = $('.uz-pioes-orbita');
  ['hayato', 'koji', 'akane'].forEach(function (id) {
    if (S.some(function (s) { return s.id === id && s.temPiao; })) orbita.appendChild(el('img', { src: 'img/pioes/' + id + '.webp', alt: '', loading: 'lazy' }));
  });

  // ---------- Entradas e cut-in ao rolar ----------
  if ('IntersectionObserver' in window && !reduz) {
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visivel'); obs.unobserve(e.target); } });
    }, { threshold: 0.15 });
    $$('.revela').forEach(function (e) { obs.observe(e); });
    var obsCut = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) cutin.classList.add('ativo');
        else if (cutin.classList.contains('ativo')) { cutin.classList.remove('ativo'); setTimeout(prepararCut, 500); }
      });
    }, { threshold: 0.45 });
    obsCut.observe(cutin);
  } else {
    $$('.revela').forEach(function (e) { e.classList.add('visivel'); });
    cutin.classList.add('ativo');
  }

  // ---------- Navegação das seções ----------
  var subnav = $('.uz-subnav'), topo = $('.topo');
  var abas = $$('.uz-abas a');
  var secoes = abas.map(function (a) { return $(a.getAttribute('href')); });
  function aoRolar() {
    var r = subnav.getBoundingClientRect();
    if (topo) topo.classList.toggle('escondido', r.top <= 1);
    var y = r.bottom + 40, at = -1;
    secoes.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= y) at = i; });
    abas.forEach(function (a, i) { a.classList.toggle('ativa', i === at); });
  }
  window.addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();
})();
