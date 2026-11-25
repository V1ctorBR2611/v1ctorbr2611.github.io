// Página do Kibo Player: o robô do herói reage ao toque (expressão + fala de verdade, sintetizada pela voz do
// app) e acompanha o mouse; emoções e visuais trocam a imagem do robô. Dados em dados.js
// (ferramentas/kibo-midia.mjs).
(function () {
  var D = window.KIBO || { expressoes: [], visuais: [], falas: [] };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var temExpr = {};
  D.expressoes.forEach(function (e) { temExpr[e.id] = true; });
  function reanimar(e, c) { e.classList.remove(c); void e.offsetWidth; e.classList.add(c); }
  // Pré-carrega as imagens do robô para a troca não piscar.
  D.expressoes.forEach(function (e) { new Image().src = 'img/robo/expr-' + e.id + '.webp'; });

  // ---------- Voz: as falas do app, tocadas por WebAudio (só depois do primeiro toque) ----------
  var ctx = null, buffers = {};
  function audio() {
    if (!ctx) { var AC = window.AudioContext || window.webkitAudioContext; if (AC) ctx = new AC(); }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tocar(chave) {
    var c = audio(); if (!c) return;
    var go = function (b) { var s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(); };
    if (buffers[chave]) return go(buffers[chave]);
    fetch('sons/' + chave + '.wav').then(function (r) { return r.arrayBuffer(); })
      .then(function (a) { return c.decodeAudioData(a); })
      .then(function (b) { buffers[chave] = b; go(b); }).catch(function () {});
  }

  // ---------- Herói ----------
  var robo = $('.kb-robo'), img = $('.kb-robo-img'), balao = $('.kb-balao');
  var falas = D.falas.filter(function (f) { return f.expressao && temExpr[f.expressao]; });
  var ultima = -1, tBalao = null, tVolta = null, toques = 0;
  robo.addEventListener('click', function () {
    toques++;
    if (!falas.length) return;
    var i; do { i = Math.floor(Math.random() * falas.length); } while (falas.length > 1 && i === ultima);
    ultima = i;
    var f = falas[i];
    // A cada 5 toques ele dança (como faz com a música no app).
    if (toques % 5 === 0) {
      img.src = 'img/robo/expr-feliz.webp';
      reanimar(robo, 'dancando');
      balao.textContent = '♪ ♫ ♪';
      tocar('alegre');
    } else {
      img.src = 'img/robo/expr-' + f.expressao + '.webp';
      robo.classList.remove('dancando');
      reanimar(robo, 'cutucado');
      balao.textContent = f.nome.replace(/\s*\(.*\)$/, '');
      tocar(f.chave);
    }
    balao.classList.add('ver');
    clearTimeout(tBalao); clearTimeout(tVolta);
    tBalao = setTimeout(function () { balao.classList.remove('ver'); }, 1600);
    tVolta = setTimeout(function () { img.src = 'img/robo/expr-feliz.webp'; robo.classList.remove('dancando'); }, 2600);
  });
  // O robô inclina na direção do mouse; a luz do painel de LED segue o mouse.
  var heroi = $('.kb-heroi'), fundo = $('.kb-led-fundo', heroi);
  if (!reduz && window.matchMedia('(hover: hover)').matches) {
    heroi.addEventListener('mousemove', function (e) {
      var r = robo.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth, dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
      robo.style.setProperty('--ry', (dx * 22).toFixed(2) + 'deg');
      robo.style.setProperty('--rx', (-dy * 16).toFixed(2) + 'deg');
      var h = heroi.getBoundingClientRect();
      fundo.style.setProperty('--lx', ((e.clientX - h.left) / h.width * 100).toFixed(1) + '%');
      fundo.style.setProperty('--ly', ((e.clientY - h.top) / h.height * 100).toFixed(1) + '%');
    });
    heroi.addEventListener('mouseleave', function () { robo.style.setProperty('--ry', '0deg'); robo.style.setProperty('--rx', '0deg'); });
  }

  // ---------- Sentimentos ----------
  var caixa = $('.kb-emocoes'), eImg = $('.kb-emocao-img'), eNome = $('.kb-emocao-nome');
  var falaDe = {};
  D.falas.forEach(function (f) { if (f.expressao && !falaDe[f.expressao]) falaDe[f.expressao] = f.chave; });
  D.expressoes.forEach(function (e, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.textContent = e.nome; b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    b.addEventListener('click', function () {
      $$('button', caixa).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      eImg.src = 'img/robo/expr-' + e.id + '.webp';
      eImg.alt = 'Kibo ' + e.nome.toLowerCase();
      eNome.textContent = e.nome;
      reanimar(eImg, 'troca');
      if (falaDe[e.id]) tocar(falaDe[e.id]);
    });
    caixa.appendChild(b);
  });

  // ---------- Personalize ----------
  var NOMES = { gamer: 'Gamer', dj: 'DJ', gatinho: 'Gatinho', steampunk: 'Steampunk', dragao: 'Dragão', gelo: 'Gelo', synthwave: 'Synthwave',
    abelha: 'Abelhinha', jardim: 'Jardim', realeza: 'Realeza', pixel: 'Pixel', aviador: 'Aviador' };
  var lista = $('.kb-vitrine-lista'), vImg = $('.kb-vitrine-img'), vNome = $('.kb-vitrine-nome');
  D.visuais.forEach(function (v, i) {
    var src = 'img/robo/visual-' + v.fone + '.webp';
    var b = document.createElement('button');
    b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    b.setAttribute('aria-label', 'Fone ' + (NOMES[v.fone] || v.fone));
    var im = document.createElement('img'); im.src = src; im.alt = ''; im.loading = 'lazy'; b.appendChild(im);
    b.addEventListener('click', function () {
      $$('button', lista).forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
      vImg.src = src; vNome.textContent = 'Fone ' + (NOMES[v.fone] || v.fone);
      reanimar(vImg, 'troca');
    });
    lista.appendChild(b);
  });
})();
