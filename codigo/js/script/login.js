const formulario = document.getElementById('form-login');

async function buscarListaUsuarios(usuario){
  const bases = ['http://localhost:3000', 'http://localhost:5501'];
  for (const base of bases){
    try {
      const resposta = await fetch(base + '/usuarios?usuario=' + encodeURIComponent(usuario), { headers: { 'Accept': 'application/json' } });
      if (resposta.ok) return await resposta.json();
    } catch {}
  }
  return null;
}

async function validarLogin(usuario, senha){
  const lista = await buscarListaUsuarios(usuario);
  if (!lista || !Array.isArray(lista)) return false;
  const usuarioEncontrado = lista.find(u => String(u.usuario) === String(usuario) && String(u.senha) === String(senha));
  if (!usuarioEncontrado) return false;
  localStorage.setItem('usuarioAutenticado', JSON.stringify({ id: usuarioEncontrado.id, usuario: usuarioEncontrado.usuario, nome: usuarioEncontrado.nome }));
  return true;
}

if (formulario) {
  formulario.addEventListener('submit', function (evento){
    evento.preventDefault();
    const usuario = document.getElementById('usuario').value || '';
    const senha = document.getElementById('senha').value || '';
    validarLogin(usuario, senha).then(function (valido){
      if (valido) {
        window.location.href = 'index.html';
      } else {
        alert('Usuário ou senha inválidos');
      }
    });
  });
}
