const botaoEst = document.getElementById('menu-estrategico');
const botaoTat = document.getElementById('menu-tatico');
const botaoOpe = document.getElementById('menu-operacional');

function go(href){ window.location.href = href; }

if (botaoEst) {
  botaoEst.addEventListener('click', function(e){ e.preventDefault(); go('estrategico.html'); });
  botaoEst.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go('estrategico.html'); } });
}
if (botaoTat) {
  botaoTat.addEventListener('click', function(e){ e.preventDefault(); go('tatico.html'); });
  botaoTat.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go('tatico.html'); } });
}
if (botaoOpe) {
  botaoOpe.addEventListener('click', function(e){ e.preventDefault(); go('operacional.html'); });
  botaoOpe.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go('operacional.html'); } });
}
