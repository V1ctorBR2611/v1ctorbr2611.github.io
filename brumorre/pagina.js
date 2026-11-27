// Página do Brumorre. Dados e retratos 3D tirados do próprio jogo por ferramentas/brumorre-midia.mjs
// (window.BRUMORRE: regiões, torres, criaturas, chefes e poderes).
(function () {
  'use strict';
  var D = window.BRUMORRE;
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function trocar(img, src, cls) { img.classList.remove(cls); void img.offsetWidth; img.src = src; img.classList.add(cls); }

  // ---------------- Pólen dourado no céu do herói ----------------
  var polen = document.querySelector('.br-polen');
  for (var i = 0; i < (reduz ? 10 : 34); i++) {
    var p = el('i');
    p.style.cssText = 'left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 90) + '%;--s:' + (2 + Math.random() * 4).toFixed(1) + 'px;--o:' + (0.3 + Math.random() * 0.6).toFixed(2) +
      ';--t:' + (8 + Math.random() * 10).toFixed(1) + 's;--d:' + (-Math.random() * 12).toFixed(1) + 's';
    polen.appendChild(p);
  }

  // ---------------- Oficina das torres ----------------
  var ACENTO = { balestra: '#d9573f', bombarda: '#c98a3a', prisma: '#5ff0f0', sino: '#9fe8ff', bobina: '#e09a4f', lanterna: '#ffc94d' };
  var lista = document.querySelector('.br-oficina-lista'), palco = document.querySelector('.br-oficina-palco');
  var img = palco.querySelector('.br-oficina-img'), nome = palco.querySelector('.br-oficina-nome'), nivelEl = palco.querySelector('.br-oficina-nivel');
  var desc = palco.querySelector('.br-oficina-desc'), tags = palco.querySelector('.br-oficina-tags'), niveis = palco.querySelector('.br-niveis');
  var atual = 0, variante = 0, girando = null;
  D.torres.forEach(function (t, k) {
    var b = el('button', '', '<img src="img/torre-' + t.id + '-0.webp" alt=""><span>' + esc(t.nome) + '</span>');
    b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-label', t.nome);
    b.addEventListener('click', function () { parar(); escolher(k, 0); });
    lista.appendChild(b);
  });
  function rotulos(t) { return [['Nível 1', ''], ['Nível 2', ''], ['Nível 3', ''], [t.espec[0], 'Especialização'], [t.espec[1], 'Especialização']]; }
  function escolher(k, v, sem) {
    var t = D.torres[k], mudouTorre = k !== atual || !niveis.children.length;
    atual = k; variante = v;
    palco.style.setProperty('--acento', ACENTO[t.id]);
    Array.prototype.forEach.call(lista.children, function (b, j) { b.setAttribute('aria-selected', String(j === k)); });
    if (mudouTorre) {
      niveis.innerHTML = '';
      rotulos(t).forEach(function (r, j) {
        var b = el('button', '', (r[1] ? '<small>' + r[1] + '</small>' : '') + esc(r[0]));
        b.type = 'button';
        b.addEventListener('click', function () { parar(); escolher(atual, j); });
        niveis.appendChild(b);
      });
      nome.textContent = t.nome;
      desc.textContent = t.desc;
      tags.innerHTML = (t.terra ? '<span>Acerta terra</span>' : '') + (t.ar ? '<span>Acerta ar</span>' : '') + (!t.terra && !t.ar ? '<span>Suporte</span>' : '');
    }
    Array.prototype.forEach.call(niveis.children, function (b, j) { b.setAttribute('aria-pressed', String(j === v)); });
    nivelEl.textContent = v < 3 ? 'Nível ' + (v + 1) : 'Especialização · ' + t.espec[v - 3];
    img.alt = t.nome + (v < 3 ? ', nível ' + (v + 1) : ', ' + t.espec[v - 3]);
    if (sem) img.src = 'img/torre-' + t.id + '-' + v + '.webp'; else trocar(img, 'img/torre-' + t.id + '-' + v + '.webp', 'troca');
  }
  // as imagens de todas as variantes já baixadas: a troca fica instantânea
  D.torres.forEach(function (t) { for (var v = 0; v < 5; v++) { var im = new Image(); im.src = 'img/torre-' + t.id + '-' + v + '.webp'; } });
  escolher(0, 0, true);
  // enquanto ninguém mexe, a torre "evolui" sozinha quando a seção está à vista
  function parar() { if (girando) { clearInterval(girando); girando = null; } }
  if (!reduz && 'IntersectionObserver' in window) {
    var parado = true;
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && parado) { parado = false; girando = setInterval(function () { escolher(atual, (variante + 1) % 5); }, 1800); }
        else if (!e.isIntersecting && girando) { parar(); parado = true; }
      });
    }, { threshold: 0.4 }).observe(palco);
    palco.addEventListener('pointerdown', function () { parar(); parado = false; });
  }

  // ---------------- Bestiário ----------------
  var best = document.querySelector('.br-bestiario');
  D.inimigos.forEach(function (b) {
    var c = el('article', 'br-bicho surge', '<img src="img/inimigo-' + b.id + '.webp" alt="" loading="lazy"><strong>' + esc(b.nome) + '</strong><span class="papel">' + esc(b.papel) + '</span><p>' + esc(b.desc) + '</p>');
    best.appendChild(c);
  });

  // ---------------- Chefes ----------------
  var cImg = document.querySelector('.br-chefe-img'), cNome = document.querySelector('.br-chefe-nome'), cDesc = document.querySelector('.br-chefe-desc'), cReg = document.querySelector('.br-chefe-regiao');
  var cLista = document.querySelector('.br-chefe-lista');
  var regiaoDoChefe = {};
  D.regioes.forEach(function (r, k) { regiaoDoChefe[r.chefe] = { r: r, k: k }; });
  function chefe(k, sem) {
    var c = D.chefes[k], rg = regiaoDoChefe[c.id];
    if (sem) cImg.src = 'img/inimigo-' + c.id + '.webp'; else trocar(cImg, 'img/inimigo-' + c.id + '.webp', 'troca');
    cImg.alt = c.nome;
    cNome.textContent = c.nome.toUpperCase();
    if (!sem) { cNome.classList.remove('troca'); void cNome.offsetWidth; cNome.classList.add('troca'); }
    cDesc.textContent = c.desc;
    cReg.textContent = rg ? 'Região ' + (rg.k + 1) + ' · ' + rg.r.nome : '';
    Array.prototype.forEach.call(cLista.children, function (b, j) { b.setAttribute('aria-selected', String(j === k)); });
  }
  D.chefes.forEach(function (c, k) {
    var b = el('button', '', '<img src="img/inimigo-' + c.id + '.webp" alt="">');
    b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-label', c.nome); b.title = c.nome;
    b.addEventListener('click', function () { chefe(k); });
    cLista.appendChild(b);
  });
  chefe(0, true);

  // ---------------- Regiões ----------------
  var CORES = {
    prados: ['#ffb36b', '#5f9a3e'], bosque: ['#e07a8f', '#a33a2e'], picos: ['#9a86e8', '#5b6688'],
    desfiladeiro: ['#ff8f5a', '#8e3f2c'], cidadela: ['#7d55c9', '#1b1638'],
  };
  var arq = document.querySelector('.br-arquipelago');
  D.regioes.forEach(function (r, k) {
    var c = CORES[r.tema] || ['#c76b8f', '#2b2a5c'];
    var ch = D.chefes.filter(function (x) { return x.id === r.chefe; })[0];
    var a = el('article', 'br-ilha surge',
      '<span class="br-ilha-num">Região ' + (k + 1) + ' · ' + r.fases + ' fases</span><h3>' + esc(r.nome) + '</h3>' +
      '<img class="br-ilha-chefe" src="img/inimigo-' + r.chefe + '.webp" alt="" loading="lazy" style="--d:-' + k + 's">' +
      '<div class="br-ilha-info"><b>Chefe: ' + esc(ch ? ch.nome : '') + '</b><span><b>' + esc(r.especial) + ':</b> ' + esc(r.regra) + '</span></div>');
    a.style.setProperty('--c1', c[0]); a.style.setProperty('--c2', c[1]);
    arq.appendChild(a);
  });
  document.querySelector('.br-regioes-resumo').textContent = 'Hoje são ' + D.totalFases + ' fases em ' + D.regioes.length + ' regiões, cada uma com céu, cenário, música, um chefe e uma fase especial com regra própria.';
})();
