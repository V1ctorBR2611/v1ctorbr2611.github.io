// Página do Ondalume. Usa os dados tirados do próprio jogo por ferramentas/ondalume-midia.mjs:
//   window.ONDALUME      zonas, Lume (SVG + CSS das animações), ícones e gradientes
//   window.ONDALUME_DEMO palavras comuns, valores e pesos das letras (tabuleiro de demonstração)
(function () {
  'use strict';
  var D = window.ONDALUME;
  var raiz = document.body;
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------- Lume e ícones ----------------
  var css = document.createElement('style');
  css.textContent = D.lumeCSS;
  document.head.appendChild(css);
  var defs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  defs.setAttribute('aria-hidden', 'true');
  defs.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
  defs.innerHTML = '<defs>' + D.defs + '</defs>';
  document.body.prepend(defs);
  function preencher(escopo) {
    escopo.querySelectorAll('[data-lume]').forEach(function (el) { el.innerHTML = D.lume[el.dataset.lume] || ''; });
    escopo.querySelectorAll('[data-ic]').forEach(function (el) { el.innerHTML = D.icones[el.dataset.ic] || ''; });
  }

  // ---------------- O mar: plâncton ----------------
  var pl = document.querySelector('.ol-plancton');
  for (var i = 0; i < (reduz ? 14 : 42); i++) {
    var p = document.createElement('i');
    var s = 2 + Math.random() * 4;
    p.style.cssText = 'left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 100) + '%;width:' + s + 'px;height:' + s + 'px;--o:' + (0.2 + Math.random() * 0.5).toFixed(2) +
      ';--t:' + (12 + Math.random() * 16).toFixed(1) + 's;--d:' + (-Math.random() * 20).toFixed(1) + 's;--c:' + (Math.random() < 0.75 ? '#bffff8' : '#c9aaff');
    pl.appendChild(p);
  }

  // ---------------- A descida (zonas) ----------------
  var Z = D.zonas;
  var TELA_ZONA = { kelp: 'tela-especiais' };
  var lista = document.querySelector('.ol-zonas');
  var fmt = function (n) { return n.toLocaleString('pt-BR'); };
  Z.forEach(function (z, k) {
    var li = document.createElement('li');
    li.className = 'ol-zona surge';
    li.style.cssText = '--a:' + z.a + ';--b:' + z.b + ';--br:' + z.brilho + ';--raios-z:' + (0.15 + z.raios * 0.85);
    var img = TELA_ZONA[z.chave] || ('jogo-' + z.chave);
    li.innerHTML = '<div class="ol-zona-cartao"><span class="ol-zona-num">Zona ' + (k + 1) + ' · fases ' + (z.de + 1) + '–' + (z.ate + 1) + '</span>' +
      '<h3>' + z.nome + '</h3><p>' + z.descricao + '</p>' +
      '<span class="ol-zona-prof">' + fmt(z.metros[0]) + '–' + fmt(z.metros[1]) + ' m <small>de profundidade</small></span></div>' +
      '<div class="ol-celular ol-zona-cel"><img src="img/' + img + '.webp" alt="Partida na zona ' + z.nome + '" loading="lazy"></div>';
    lista.appendChild(li);
  });
  document.querySelector('.ol-descida-resumo').textContent = fmt(D.fases) + ' fases em ' + Z.length + ' zonas, até ' + fmt(Z[Z.length - 1].metros[1]) + ' metros de profundidade.';

  // ---------------- Profundidade conforme a rolagem ----------------
  var ancoras = Array.prototype.slice.call(document.querySelectorAll('[data-prof]'));
  var prof = document.querySelector('.ol-prof');
  var profM = prof.querySelector('.ol-prof-m'), profZ = prof.querySelector('.ol-prof-z'), profB = prof.querySelector('.ol-prof-trilho b');
  function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
  function mistura(a, b, t) { var x = hex(a), y = hex(b); return 'rgb(' + x.map(function (v, i) { return Math.round(v + (y[i] - v) * t); }).join(',') + ')'; }
  var pendente = false;
  function atualizarMar() {
    pendente = false;
    var centro = window.scrollY + window.innerHeight * 0.55;
    var m = 0;
    for (var i = 0; i < ancoras.length; i++) {
      var a = ancoras[i], topo = a.getBoundingClientRect().top + window.scrollY;
      var prox = ancoras[i + 1];
      if (!prox) { if (centro >= topo) m = +a.dataset.prof; break; }
      var topo2 = prox.getBoundingClientRect().top + window.scrollY;
      if (centro < topo) { if (i === 0) m = 0; break; }
      if (centro < topo2) { m = +a.dataset.prof + (+prox.dataset.prof - +a.dataset.prof) * ((centro - topo) / (topo2 - topo)); break; }
    }
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) m = +ancoras[ancoras.length - 1].dataset.prof;
    var zi = 0;
    while (zi < Z.length - 1 && m >= Z[zi].metros[1]) zi++;
    var z = Z[zi], t = Math.min(1, Math.max(0, (m - z.metros[0]) / (z.metros[1] - z.metros[0])));
    var n = Z[Math.min(zi + 1, Z.length - 1)];
    // mistura com a próxima zona só na metade final (cada zona tem a sua cara por um tempo)
    var tm = Math.max(0, (t - 0.5) * 2);
    raiz.style.setProperty('--za', mistura(z.a, n.a, tm));
    raiz.style.setProperty('--zb', mistura(z.b, n.b, tm));
    raiz.style.setProperty('--zbrilho', mistura(z.brilho, n.brilho, tm));
    raiz.style.setProperty('--raios', (z.raios + (n.raios - z.raios) * tm).toFixed(3));
    profM.textContent = '−' + fmt(Math.round(m)) + ' m';
    profZ.textContent = z.nome;
    profB.style.setProperty('--p', ((zi + t) / Z.length * 100).toFixed(2) + '%');
    var perto = window.innerWidth <= 900 && document.documentElement.scrollHeight - (window.scrollY + window.innerHeight) < 1100;
    prof.classList.toggle('on', window.scrollY > window.innerHeight * 0.35 && !perto);
  }
  function pedir() { if (!pendente) { pendente = true; requestAnimationFrame(atualizarMar); } }
  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);
  atualizarMar();

  // ---------------- Peças especiais: mini tabuleiros animados ----------------
  var LETRAS_MINI = ['MARES', 'ONDAS', 'PEIXE'];
  document.querySelectorAll('.ol-esp').forEach(function (card) {
    var ef = card.dataset.efeito, mini = card.querySelector('.ol-esp-mini'), T = 44;
    for (var y = 0; y < 3; y++) for (var x = 0; x < 5; x++) {
      var l = LETRAS_MINI[y][x], el = document.createElement('span');
      el.className = 'ol-peca';
      el.textContent = l;
      var alvo = false, fonte = false, dd = 0;
      if (ef === 'linha') { alvo = y === 1; fonte = y === 1 && x === 2; dd = Math.abs(x - 2) * 0.05; }
      else if (ef === 'area') { alvo = Math.abs(x - 2) <= 1; fonte = y === 1 && x === 2; dd = (Math.abs(x - 2) + Math.abs(y - 1)) * 0.06; }
      else { alvo = y === 1; fonte = y === 1 && x === 3; dd = x * 0.08; if (fonte) el.textContent = '★'; }
      if (alvo) { el.classList.add('alvo'); el.style.setProperty('--dd', dd + 's'); }
      if (fonte) el.classList.add('fonte');
      mini.appendChild(el);
    }
    var r = document.createElement('i');
    r.className = 'ol-raio';
    if (ef === 'linha') r.style.cssText = 'left:-6px;right:-6px;top:' + (T - 6) + 'px;height:' + (T + 12) + 'px';
    else if (ef === 'area') r.style.cssText = 'left:calc(50% - ' + (T * 1.5 + 8) + 'px);width:' + (T * 3 + 16) + 'px;top:-8px;height:' + (T * 3 + 16) + 'px';
    else r.style.cssText = 'left:-6px;right:-6px;top:' + (T - 6) + 'px;height:' + (T + 12) + 'px';
    mini.appendChild(r);
  });

  preencher(document);

  // ---------------- Som (WebAudio, timbre aquático) ----------------
  var ctx = null, somLigado = true;
  var PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
  function audio() {
    if (!somLigado) return null;
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function nota(freq, quando, dur, vol, tipo) {
    var c = audio(); if (!c) return;
    var o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime + (quando || 0);
    o.type = tipo || 'sine'; o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + (dur || 0.4));
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + (dur || 0.4) + 0.05);
  }
  function somLetra(k) { var f = 523.25 * Math.pow(2, PENTA[Math.min(k, PENTA.length - 1)] / 12); nota(f, 0, 0.35, 0.1); nota(f * 2, 0, 0.18, 0.025, 'triangle'); }
  function somPalavra(n) { [0, 4, 7, 12].forEach(function (s, k) { nota(392 * Math.pow(2, s / 12), k * 0.06, 0.6, 0.08); }); for (var k = 0; k < Math.min(n, 6); k++) bolhaSom(0.1 + k * 0.05); }
  function bolhaSom(q) { var c = audio(); if (!c) return; var o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime + q;
    o.frequency.setValueAtTime(300 + Math.random() * 300, t0); o.frequency.exponentialRampToValueAtTime(1200 + Math.random() * 500, t0 + 0.09);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.05, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.1);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + 0.12); }
  function somErro() { nota(180, 0, 0.3, 0.12); nota(140, 0.08, 0.35, 0.1); }
  function somEspecial() { nota(880, 0, 0.5, 0.06, 'triangle'); nota(1318, 0.05, 0.6, 0.05); nota(1760, 0.1, 0.7, 0.04); }
  var btSom = document.querySelector('.ol-som');
  btSom.addEventListener('click', function () {
    somLigado = !somLigado;
    btSom.setAttribute('aria-pressed', String(somLigado));
    btSom.setAttribute('aria-label', somLigado ? 'Som ligado' : 'Som desligado');
  });

  // ---------------- Tabuleiro de demonstração ----------------
  var P = window.ONDALUME_DEMO;
  var DIC = new Set(P.palavras.split(' '));
  var PREF = new Set();
  DIC.forEach(function (w) { for (var k = 1; k < w.length; k++) PREF.add(w.slice(0, k)); });
  var VAL = P.valores, VOG = P.vogais, CONS = P.consoantes;
  var MAX = { Z: 1, J: 1, X: 1, H: 1, F: 2, B: 2, G: 2, V: 2 };
  var MULT = { 3: 1, 4: 1.5, 5: 2, 6: 3, 7: 4 };
  var ELOGIO = { 4: 'Boa!', 5: 'Ótimo!', 6: 'Incrível!', 7: 'Lendário!' };
  var COLS = 6, LIN = 6, AR = 15;

  var jogo = document.querySelector('.ol-demo-jogo');
  var tab = jogo.querySelector('.ol-tab'), camada = tab.querySelector('.ol-tab-pecas'), linha = tab.querySelector('polyline');
  var txt = jogo.querySelector('.ol-palavra-txt'), arEl = jogo.querySelector('.ol-ar'), ptsEl = jogo.querySelector('.ol-pontos');
  var fim = tab.querySelector('.ol-fim'), elogio = tab.querySelector('.ol-elogio');
  var grade = [], sel = [], arrastando = false, ocupado = false, ar = AR, pontos = 0, melhor = null, seq = 0;

  function sortearDe(pesos, aceita) {
    var total = 0, l;
    for (l in pesos) if (aceita(l)) total += pesos[l];
    var r = Math.random() * total;
    for (l in pesos) if (aceita(l)) { r -= pesos[l]; if (r <= 0) return l; }
    return 'A';
  }
  function contar() {
    var c = { _v: 0, _n: 0 };
    grade.forEach(function (lin) { lin.forEach(function (p) { if (!p) return; c[p.l] = (c[p.l] || 0) + 1; c._n++; if (VOG[p.l]) c._v++; }); });
    return c;
  }
  function novaLetra() {
    var c = contar(), f = c._n ? c._v / c._n : 0.45;
    var vogal = f < 0.42 ? true : f > 0.48 ? false : Math.random() < 0.45;
    return sortearDe(vogal ? VOG : CONS, function (l) { return !MAX[l] || (c[l] || 0) < MAX[l]; });
  }
  function novaPeca(l) {
    var el = document.createElement('div');
    el.className = 'ol-peca';
    var p = { id: ++seq, l: l, esp: null, el: el, x: 0, y: 0 };
    desenharPeca(p);
    return p;
  }
  function desenharPeca(p) { p.el.innerHTML = p.l + '<i>' + VAL[p.l] + '</i>'; if (p.esp) p.el.dataset.esp = p.esp; else delete p.el.dataset.esp; }
  function posicionar(p) { p.el.style.setProperty('--x', p.x); p.el.style.setProperty('--y', p.y); }

  function resolver() {
    var achadas = new Map();
    function dfs(x, y, usadas, w, cam) {
      var nw = w + grade[y][x].l;
      if (nw.length >= 3 && DIC.has(nw) && !achadas.has(nw)) achadas.set(nw, cam.slice());
      if (nw.length >= 7 || !PREF.has(nw)) return;
      for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
        var nx = x + dx, ny = y + dy;
        if ((dx || dy) && nx >= 0 && ny >= 0 && nx < COLS && ny < LIN && !usadas[ny * COLS + nx]) {
          usadas[ny * COLS + nx] = 1; cam.push([nx, ny]);
          dfs(nx, ny, usadas, nw, cam);
          usadas[ny * COLS + nx] = 0; cam.pop();
        }
      }
    }
    for (var y = 0; y < LIN; y++) for (var x = 0; x < COLS; x++) { var u = {}; u[y * COLS + x] = 1; dfs(x, y, u, '', [[x, y]]); }
    var res = [];
    achadas.forEach(function (cam, w) { res.push({ w: w, cam: cam, pts: valor(w) }); });
    return res.sort(function (a, b) { return b.w.length - a.w.length || b.pts - a.pts; });
  }
  function valor(w) { var s = 0; for (var k = 0; k < w.length; k++) s += VAL[w[k]] || 0; return Math.round(s * (MULT[Math.min(w.length, 7)] || 1) * 10); }

  function montar() {
    camada.innerHTML = '';
    var tentativa = 0, sol;
    do {
      grade = [];
      for (var y = 0; y < LIN; y++) { grade.push([]); for (var x = 0; x < COLS; x++) grade[y].push(null); }
      for (y = 0; y < LIN; y++) for (x = 0; x < COLS; x++) grade[y][x] = { l: novaLetra() };
      sol = resolver();
    } while ((sol.length < 14 || sol[0].w.length < 5) && ++tentativa < 40);
    for (y = 0; y < LIN; y++) for (x = 0; x < COLS; x++) {
      var p = novaPeca(grade[y][x].l); p.x = x; p.y = y - LIN - 1;
      grade[y][x] = p; posicionar(p); camada.appendChild(p.el);
    }
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      for (var y = 0; y < LIN; y++) for (var x = 0; x < COLS; x++) { var p = grade[y][x]; p.y = y; p.el.style.transitionDelay = ((LIN - y) * 0.04 + x * 0.015) + 's'; posicionar(p); }
      setTimeout(function () { camada.querySelectorAll('.ol-peca').forEach(function (e) { e.style.transitionDelay = ''; }); }, 900);
    }); });
    ar = AR; pontos = 0; melhor = null; sel = []; ocupado = false;
    arEl.textContent = ar; arEl.parentNode.classList.remove('pouco'); ptsEl.textContent = '0';
    fim.hidden = true; mostrarPalavra();
  }

  // ---- gestos ----
  function tamanho() { return tab.getBoundingClientRect().width / COLS; }
  function casa(ev, raio) {
    var r = tab.getBoundingClientRect(), t = r.width / COLS;
    var fx = (ev.clientX - r.left) / t, fy = (ev.clientY - r.top) / t;
    var x = Math.floor(fx), y = Math.floor(fy);
    if (x < 0 || y < 0 || x >= COLS || y >= LIN) return null;
    if (Math.hypot(fx - x - 0.5, fy - y - 0.5) > raio) return null;
    return grade[y][x];
  }
  function palavraSel() { return sel.map(function (p) { return p.l; }).join(''); }
  function mostrarPalavra(estado) {
    var w = palavraSel();
    txt.className = 'ol-palavra-txt' + (estado ? ' ' + estado : (w.length >= 3 && DIC.has(w) ? ' ativa' : ''));
    if (!w) { txt.innerHTML = '&nbsp;'; return; }
    txt.textContent = w;
    if (w.length >= 3 && DIC.has(w) && !estado) { var s = document.createElement('small'); s.textContent = '+' + valor(w); txt.appendChild(s); }
  }
  function desenharLinha() {
    var t = tamanho();
    linha.setAttribute('points', sel.map(function (p) { return ((p.x + 0.5) * t) + ',' + ((p.y + 0.5) * t); }).join(' '));
  }
  function marcar() {
    camada.querySelectorAll('.sel').forEach(function (e) { e.classList.remove('sel'); });
    sel.forEach(function (p) { p.el.classList.add('sel'); });
    desenharLinha(); mostrarPalavra();
  }
  tab.addEventListener('pointerdown', function (ev) {
    if (ocupado || !fim.hidden) return;
    var p = casa(ev, 0.6); if (!p) return;
    ev.preventDefault();
    arrastando = true; sel = [p];
    try { tab.setPointerCapture(ev.pointerId); } catch (e) {}
    somLetra(0); marcar();
  });
  tab.addEventListener('pointermove', function (ev) {
    if (!arrastando) return;
    var p = casa(ev, 0.42); if (!p) return;
    var ult = sel[sel.length - 1];
    if (p === ult) return;
    if (sel.length > 1 && p === sel[sel.length - 2]) { sel.pop(); marcar(); return; }
    if (sel.indexOf(p) >= 0) return;
    if (Math.abs(p.x - ult.x) > 1 || Math.abs(p.y - ult.y) > 1) return;
    sel.push(p); somLetra(sel.length - 1); marcar();
  });
  function soltar() {
    if (!arrastando) return;
    arrastando = false;
    var w = palavraSel();
    if (w.length >= 3 && DIC.has(w)) jogar(sel.slice());
    else if (w.length >= 2) {
      sel.forEach(function (p) { p.el.classList.remove('treme'); void p.el.offsetWidth; p.el.classList.add('treme'); });
      mostrarPalavra('erro'); somErro();
      setTimeout(limparSel, 380);
    } else limparSel();
  }
  tab.addEventListener('pointerup', soltar);
  tab.addEventListener('pointercancel', soltar);
  function limparSel() {
    sel.forEach(function (p) { p.el.classList.remove('sel', 'treme'); });
    sel = []; linha.setAttribute('points', ''); mostrarPalavra();
  }

  // ---- jogada ----
  function bolhas(p, n) {
    var t = tamanho();
    for (var k = 0; k < n; k++) {
      var b = document.createElement('span');
      b.className = 'ol-bolha-sobe';
      var s = 6 + Math.random() * 14;
      b.style.cssText = 'left:' + ((p.x + 0.2 + Math.random() * 0.6) * t) + 'px;top:' + ((p.y + 0.3 + Math.random() * 0.4) * t) + 'px;--s:' + s + 'px;--dx:' + ((Math.random() - 0.5) * 40) + 'px;--dur:' + (0.7 + Math.random() * 0.6) + 's';
      tab.appendChild(b);
      setTimeout(b.remove.bind(b), 1400);
    }
  }
  function flash(x0, y0, w, h, cor) {
    var t = tamanho(), f = document.createElement('span');
    f.className = 'ol-flash';
    f.style.cssText = 'left:' + (x0 * t) + 'px;top:' + (y0 * t) + 'px;width:' + (w * t) + 'px;height:' + (h * t) + 'px;--c:' + cor;
    tab.appendChild(f); setTimeout(f.remove.bind(f), 600);
  }
  function jogar(caminho) {
    ocupado = true;
    var w = caminho.map(function (p) { return p.l; }).join(''), ganho = valor(w);
    var some = new Set(caminho);
    // especiais usadas disparam (em cadeia)
    var fila = caminho.filter(function (p) { return p.esp; }), feitos = new Set(), extra = 0;
    while (fila.length) {
      var e = fila.shift(); if (feitos.has(e)) continue; feitos.add(e);
      var alvo = [];
      if (e.esp === 'agua') { for (var x = 0; x < COLS; x++) alvo.push(grade[e.y][x]); flash(0, e.y, COLS, 1, '#b48cff'); }
      else { for (var yy = e.y - 1; yy <= e.y + 1; yy++) for (var xx = e.x - 1; xx <= e.x + 1; xx++) if (yy >= 0 && xx >= 0 && yy < LIN && xx < COLS) alvo.push(grade[yy][xx]); flash(Math.max(0, e.x - 1), Math.max(0, e.y - 1), 3, 3, '#ff8a7a'); }
      alvo.forEach(function (q) { if (!some.has(q)) { some.add(q); extra += VAL[q.l] * 10; } if (q.esp && !feitos.has(q)) fila.push(q); });
      somEspecial();
    }
    ganho += extra;
    // palavra longa: a última peça vira especial (fica no lugar)
    var ultima = caminho[caminho.length - 1], nasce = w.length >= 6 ? 'ourico' : w.length >= 5 ? 'agua' : null;
    if (nasce) some.delete(ultima);
    pontos += ganho; ar--;
    if (!melhor || ganho > melhor.pts) melhor = { w: w, pts: ganho };
    animarNumero(ptsEl, pontos);
    arEl.textContent = ar; arEl.parentNode.classList.toggle('pouco', ar <= 3);
    mostrarPalavra('ok'); txt.textContent = w; var sm = document.createElement('small'); sm.textContent = '+' + ganho; txt.appendChild(sm);
    somPalavra(w.length);
    if (ELOGIO[Math.min(w.length, 7)]) { elogio.textContent = ELOGIO[Math.min(w.length, 7)]; elogio.classList.remove('mostra'); void elogio.offsetWidth; elogio.classList.add('mostra'); }
    linha.setAttribute('points', '');
    caminho.forEach(function (p) { p.el.classList.remove('sel'); });
    some.forEach(function (p) { p.el.classList.add('estoura'); bolhas(p, 3); });
    if (nasce) { ultima.esp = nasce; desenharPeca(ultima); }
    setTimeout(function () {
      some.forEach(function (p) { p.el.remove(); grade[p.y][p.x] = null; });
      cair();
      setTimeout(function () {
        sel = []; mostrarPalavra(); ocupado = false;
        if (ar <= 0) { terminar(); return; }
        if (!resolver().length) mare(true);
      }, 520);
    }, 380);
  }
  function cair() {
    for (var x = 0; x < COLS; x++) {
      var col = [];
      for (var y = LIN - 1; y >= 0; y--) if (grade[y][x]) col.push(grade[y][x]);
      var faltam = LIN - col.length;
      for (var k = 0; k < faltam; k++) {
        var p = novaPeca(' '); grade[0][x] = null;
        p.x = x; p.y = -1 - k; posicionar(p); camada.appendChild(p.el); col.push(p);
      }
      for (y = 0; y < LIN; y++) grade[y][x] = null;
      col.forEach(function (p, i) { grade[LIN - 1 - i][x] = p; });
    }
    // letras novas sorteadas com o tabuleiro já arrumado (equilíbrio de vogais)
    for (var yy = 0; yy < LIN; yy++) for (var xx = 0; xx < COLS; xx++) { var q = grade[yy][xx]; if (q.l === ' ') { q.l = null; } }
    for (yy = 0; yy < LIN; yy++) for (xx = 0; xx < COLS; xx++) { q = grade[yy][xx]; if (!q.l) { q.l = novaLetraSemNulos(); desenharPeca(q); } }
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      for (var y = 0; y < LIN; y++) for (var x = 0; x < COLS; x++) { var p = grade[y][x]; p.x = x; p.y = y; posicionar(p); }
    }); });
  }
  function novaLetraSemNulos() {
    var c = { _v: 0, _n: 0 };
    grade.forEach(function (lin) { lin.forEach(function (p) { if (!p || !p.l) return; c[p.l] = (c[p.l] || 0) + 1; c._n++; if (VOG[p.l]) c._v++; }); });
    var f = c._n ? c._v / c._n : 0.45;
    var vogal = f < 0.42 ? true : f > 0.48 ? false : Math.random() < 0.45;
    return sortearDe(vogal ? VOG : CONS, function (l) { return !MAX[l] || (c[l] || 0) < MAX[l]; });
  }
  function mare(auto) {
    if (ocupado) return;
    var todas = [];
    grade.forEach(function (lin) { lin.forEach(function (p) { todas.push(p); }); });
    var tent = 0;
    do {
      for (var k = todas.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)); var t = todas[k]; todas[k] = todas[j]; todas[j] = t; }
      todas.forEach(function (p, i) { grade[Math.floor(i / COLS)][i % COLS] = p; p.x = i % COLS; p.y = Math.floor(i / COLS); });
    } while (resolver().length < 6 && ++tent < 20);
    todas.forEach(posicionar);
    bolhaSom(0); bolhaSom(0.08); bolhaSom(0.16);
    if (auto) { txt.className = 'ol-palavra-txt ativa'; txt.textContent = 'Maré automática!'; setTimeout(function () { mostrarPalavra(); }, 1200); }
  }
  function lanterna() {
    if (ocupado) return;
    var sol = resolver(); if (!sol.length) return;
    var b = sol[Math.min(sol.length - 1, Math.floor(Math.random() * Math.min(3, sol.length)))];
    b.cam.forEach(function (c, k) { var el = grade[c[1]][c[0]].el; el.classList.remove('dica'); void el.offsetWidth; el.style.animationDelay = (k * 0.08) + 's'; el.classList.add('dica'); setTimeout(function () { el.classList.remove('dica'); el.style.animationDelay = ''; }, 3600); });
    nota(1046, 0, 0.6, 0.06, 'triangle');
  }
  function terminar() {
    fim.querySelector('.ol-fim-pontos').textContent = fmt(pontos) + ' pontos';
    fim.querySelector('.ol-fim-melhor').textContent = melhor ? 'Melhor palavra: ' + melhor.w + ' (+' + melhor.pts + ')' : '';
    fim.hidden = false;
    [0, 4, 7, 12, 16].forEach(function (s, k) { nota(523 * Math.pow(2, s / 12), k * 0.1, 0.7, 0.07); });
  }
  function animarNumero(el, alvo) {
    var de = +el.dataset.v || 0, t0 = performance.now();
    el.dataset.v = alvo;
    (function passo(t) { var k = Math.min(1, (t - t0) / 500); el.textContent = fmt(Math.round(de + (alvo - de) * k)); if (k < 1) requestAnimationFrame(passo); })(t0);
  }
  jogo.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-acao]'); if (!b) return;
    var a = b.dataset.acao;
    if (a === 'novo') { ptsEl.dataset.v = 0; montar(); }
    else if (a === 'mare') mare(false);
    else if (a === 'lanterna') lanterna();
  });
  window.addEventListener('resize', desenharLinha);
  montar();
})();
