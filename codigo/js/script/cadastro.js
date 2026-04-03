const formulario = document.getElementById('form-cadastro');

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

function validarDados(nome, usuario, senha, confirmar){
  if (!nome || nome.trim().length < 2) return 'Informe um nome válido';
  if (!usuario || usuario.trim().length < 3) return 'Informe um usuário com ao menos 3 caracteres';
  if (!senha || senha.length < 6) return 'A senha deve ter ao menos 6 caracteres';
  if (senha !== confirmar) return 'As senhas não conferem';
  return null;
}

function gerarId(){
  return Math.random().toString(16).slice(2,6);
}

async function criarUsuario(nome, usuario, senha){
  const bases = ['http://localhost:3000', 'http://localhost:5501'];
  const corpo = { id: gerarId(), nome: String(nome), usuario: String(usuario), senha: String(senha) };
  for (const base of bases){
    try {
      const resposta = await fetch(base + '/usuarios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
      if (resposta.ok) return await resposta.json();
    } catch {}
  }
  return null;
}

if (formulario){
  formulario.addEventListener('submit', function(evento){
    evento.preventDefault();
    const nome = document.getElementById('nome').value || '';
    const usuario = document.getElementById('usuario').value || '';
    const senha = document.getElementById('senha').value || '';
    const confirmar = document.getElementById('confirmar').value || '';
    const erro = validarDados(nome, usuario, senha, confirmar);
    if (erro) return alert(erro);
    buscarListaUsuarios(usuario).then(function(lista){
      const existente = Array.isArray(lista) ? lista.find(u => String(u.usuario) === String(usuario)) : null;
      if (existente) return alert('Usuário já existe');
      criarUsuario(nome, usuario, senha).then(function(novo){
        if (novo && novo.usuario){
          localStorage.setItem('usuarioAutenticado', JSON.stringify({ id: novo.id, usuario: novo.usuario, nome: novo.nome }));
          window.location.href = 'index.html';
        } else {
          alert('Falha ao cadastrar');
        }
      });
    });
  });
}
