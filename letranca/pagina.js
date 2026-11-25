// Página do Letrança: monta a colcha com os retalhos do próprio jogo (nome, cores e estampa SVG de
// src/lugares.js, exportados para dados.js por ferramentas/letranca-midia.mjs).
(function () {
  var D = window.LETRANCA || { lugares: [] };
  var caixa = document.querySelector('.lt-retalhos');
  if (!caixa) return;
  D.lugares.forEach(function (l) {
    var r = document.createElement('div');
    r.className = 'lt-retalho';
    r.setAttribute('role', 'listitem');
    r.tabIndex = 0;
    r.style.setProperty('--b', l.base);
    r.style.setProperty('--e', l.estampa);
    r.style.setProperty('--k', l.escuro);
    var n = document.createElement('strong');
    n.textContent = l.nome;
    r.appendChild(n);
    caixa.appendChild(r);
  });
})();
