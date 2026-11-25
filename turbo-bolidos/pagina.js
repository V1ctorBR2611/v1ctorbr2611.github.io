// Página do Turbo Bólidos GP: abas de modos, pistas por copa, vitrine da garagem, itens e navegação das seções.
// Os dados (copas, pistas, itens, carros) vêm de dados.js, gerado do jogo por ferramentas/kart-midia.mjs.
(function () {
  var D = window.TURBO || { copas: [], itens: [], carros: [] };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  function el(tag, attrs, filhos) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) {
      if (k === 'texto') e.textContent = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    (filhos || []).forEach(function (f) { e.appendChild(f); });
    return e;
  }

  // ---------- Modos ----------
  var MODOS = [
    { img: 'img/modos/gp.webp', nome: 'Grande Prêmio', txt: 'Dispute as copas pista após pista. Os pontos de cada corrida se somam e o pódio final vale troféu.' },
    { img: 'img/modos/rapida.webp', nome: 'Corrida Rápida', txt: 'Escolha a pista, a cilindrada e acelere. Uma corrida só, do jeito que você quiser.' },
    { img: 'img/modos/tempo.webp', nome: 'Contra-relógio', txt: 'Pista vazia, só você contra o seu recorde ou contra os fantasmas de bronze, prata e ouro. Cada décimo conta.' },
    { img: 'img/modos/eliminacao.webp', nome: 'Eliminação', txt: 'De tempos em tempos, o último colocado sai da corrida. Fique longe do fim do pelotão!' },
    { img: 'img/modos/moedas.webp', nome: 'Caça-moedas', txt: 'Sozinho na pista e contra o relógio: junte o máximo de moedas antes do tempo acabar.' },
  ];
  var painel = $('.tb-modo-painel');
  $$('.tb-modos-lista button').forEach(function (b) {
    b.addEventListener('click', function () {
      var m = MODOS[+b.dataset.modo];
      $$('.tb-modos-lista button').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
      $('img', painel).src = m.img;
      $('h3', painel).textContent = m.nome;
      $('p', painel).textContent = m.txt;
      painel.classList.remove('troca'); void painel.offsetWidth; painel.classList.add('troca');
    });
  });

  // ---------- Pistas por copa ----------
  var copaAtual = 0;
  var abasCopa = $('.tb-copas');
  D.copas.forEach(function (c, i) {
    var b = el('button', { role: 'tab', type: 'button', texto: c.nome.replace(/^Copa /, '') });
    b.addEventListener('click', function () { mostrarCopa(i); });
    abasCopa.appendChild(b);
  });
  function mostrarCopa(i) {
    if (!D.copas.length) return;
    copaAtual = (i + D.copas.length) % D.copas.length;
    var c = D.copas[copaAtual];
    $$('button', abasCopa).forEach(function (b, k) { b.setAttribute('aria-selected', k === copaAtual ? 'true' : 'false'); });
    var ativa = $$('button', abasCopa)[copaAtual];
    if (ativa && abasCopa.scrollWidth > abasCopa.clientWidth) abasCopa.scrollTo({ left: ativa.offsetLeft - 20, behavior: 'smooth' });
    $('.tb-copa-nome').textContent = c.nome;
    $('.tb-copa-sub').textContent = c.sub;
    var grade = $('.tb-pistas-grade');
    grade.replaceChildren();
    c.pistas.forEach(function (p) {
      var dif = el('div', { class: 'tb-dificuldade', 'aria-label': 'Dificuldade ' + p.dificuldade + ' de 5' });
      for (var k = 1; k <= 5; k++) dif.appendChild(el('i', { class: k <= p.dificuldade ? 'on' : '' }));
      grade.appendChild(el('figure', { class: 'tb-pista' }, [
        el('img', { src: 'img/pistas/' + p.id + '.webp', alt: 'Pista ' + p.nome, loading: 'lazy' }),
        el('figcaption', { class: 'tb-pista-info' }, [el('strong', { texto: p.nome }), dif]),
      ]));
    });
    grade.scrollLeft = 0;
  }
  $$('.tb-copa-cabeca .tb-seta').forEach(function (b) { b.addEventListener('click', function () { mostrarCopa(copaAtual + (+b.dataset.dir)); }); });
  mostrarCopa(0);

  // ---------- Garagem ----------
  var carroAtual = 0;
  var mini = $('.tb-vitrine-miniaturas');
  var imgCarro = $('.tb-vitrine-carro');
  var src = function (c) { return 'img/carros/' + c.id + '-' + c.cor + '.webp'; };
  D.carros.forEach(function (c, i) {
    var b = el('button', { role: 'tab', type: 'button', 'aria-label': c.nome }, [el('img', { src: src(c), alt: '', loading: 'lazy' })]);
    b.addEventListener('click', function () { mostrarCarro(i, i > carroAtual ? 1 : -1); });
    mini.appendChild(b);
    new Image().src = src(c); // pré-carrega para a troca não piscar
  });
  function mostrarCarro(i, dir) {
    if (!D.carros.length) return;
    carroAtual = (i + D.carros.length) % D.carros.length;
    var c = D.carros[carroAtual];
    imgCarro.style.setProperty('--de', (dir || 1) * 30 + '%');
    imgCarro.src = src(c);
    imgCarro.alt = c.nome;
    imgCarro.classList.remove('troca'); void imgCarro.offsetWidth; imgCarro.classList.add('troca');
    $('.tb-vitrine-nome').textContent = c.nome;
    $('.tb-vitrine-frase').textContent = c.frase;
    $$('button', mini).forEach(function (b, k) { b.setAttribute('aria-selected', k === carroAtual ? 'true' : 'false'); });
  }
  $$('.tb-vitrine > .tb-seta').forEach(function (b) { b.addEventListener('click', function () { mostrarCarro(carroAtual + (+b.dataset.dir), +b.dataset.dir); }); });
  // Deslize na vitrine (celular)
  var x0 = null;
  var palco = $('.tb-vitrine-palco');
  palco.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  palco.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) mostrarCarro(carroAtual + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    x0 = null;
  });
  mostrarCarro(0);
  imgCarro.classList.remove('troca');

  // ---------- Itens ----------
  var grade = $('.tb-itens-grade');
  D.itens.forEach(function (it) {
    grade.appendChild(el('div', { class: 'tb-item surge' }, [
      el('div', { class: 'tb-item-ficha' }, [el('img', { src: 'img/icones/item-' + it.id + '.svg', alt: '', loading: 'lazy' })]),
      el('div', {}, [el('strong', { texto: it.nome }), el('p', { texto: it.desc })]),
    ]));
  });

  // ---------- Navegação das seções ----------
  var subnav = $('.tb-subnav');
  var topo = $('.topo');
  var abas = $$('.tb-abas a');
  var secoes = abas.map(function (a) { return $(a.getAttribute('href')); });
  function aoRolar() {
    var r = subnav.getBoundingClientRect();
    if (topo) topo.classList.toggle('escondido', r.top <= 1);
    var y = r.bottom + 40, atual = -1;
    secoes.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= y) atual = i; });
    abas.forEach(function (a, i) { a.classList.toggle('ativa', i === atual); });
  }
  window.addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();
  // Os itens são criados depois do site.js: liga a animação de entrada neles.
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visivel'); obs.unobserve(e.target); } }); }, { threshold: 0.1 });
    $$('.tb-item.surge').forEach(function (e) { obs.observe(e); });
  } else $$('.tb-item.surge').forEach(function (e) { e.classList.add('visivel'); });
})();
