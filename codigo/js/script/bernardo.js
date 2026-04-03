

//funcao post para adicionar maquina 

const API_MAQUINAS = 'http://localhost:5501/maquinas';



const formAdicionar = document.getElementById('form-adicionar-maquina');
const inputNome = document.getElementById('maquina-nome');
const inputHorario = document.getElementById('hora-operacao');
const selectStatus = document.getElementById('status-maquina');
const selectLinha = document.getElementById('linha-operacao');


//funcoes post com parametro das maquinas em linha
formAdicionar.addEventListener('submit', async function (evento) {
  evento.preventDefault();

  const novaMaquina = {
    nome: inputNome.value,
    status: selectStatus.value,
    horario: inputHorario.value,
    linha: selectLinha ? selectLinha.value : 'Linha SMT'
  };

  try {
    const resposta = await fetch(API_MAQUINAS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(novaMaquina)
    });

    const maquinaCriada = await resposta.json();
    alert('Máquina cadastrada com sucesso!');
    
    adicionarMaquinaNaUI(maquinaCriada);
    formAdicionar.reset();
  } catch (erro) {
    console.error('Erro ao cadastrar máquina:', erro);
    alert('Erro ao cadastrar máquina. Veja o console.');
  }
}); 

// inserir o html com o js direto no db
function adicionarMaquinaNaUI(maquina) {
  const container = document.querySelector('.maquinas-operacoes');
  if (!container) return;
  const linha = document.createElement('div');
  linha.className = 'operacao-linha';
  linha.innerHTML = `
    <div class="operacao">
      <div class="operacao-info">
        <strong>${maquina.nome || 'Nova Máquina'}</strong>
        <small>${maquina.linha || ''}</small><br>
        <small>${maquina.horario || ''}</small>
      </div>
    </div>
    <div class="operacao-andamento">${maquina.status || ''}</div>
    <button class="operacao-editar" aria-label="Editar máquina" title="Editar" data-bs-toggle="modal" data-bs-target="#modalEdicao">
      <span class="material-symbols-outlined" aria-hidden="true">edit</span>
    </button>
    <button class="operacao-excluir" aria-label="Excluir máquina" title="Excluir" data-bs-toggle="modal" data-bs-target="#modalExclusao" data-maquina-id="${maquina.id}" data-maquina-nome="${maquina.nome}">
      <span class="material-symbols-outlined" aria-hidden="true">delete</span>
    </button>
  `;
  container.prepend(linha);
}



//toda a funcao de delete do json server

let maquinaSelecionadaId = null
let elementoSelecionado = null


document.addEventListener('click', function (event) { 
  const botao = event.target.closest('.operacao-excluir');

  if (botao) {
    
    maquinaSelecionadaId = botao.getAttribute('data-maquina-id');
    const nome = botao.getAttribute('data-maquina-nome');

    // guarda a linha inteira para remover da tela depois
    elementoSelecionado = botao.closest('.operacao-linha');

    // atualiza o texto do modal de confirmação
    const texto = document.getElementById('textoConfirmacaoExclusao');
    if (texto) {
      texto.textContent = `Tem certeza que deseja excluir a máquina "${nome}"?`;
    }
  }
});


const btnConfirmarExclusao = document.getElementById('btn-confirmar-exclusao');

btnConfirmarExclusao.addEventListener('click', async function () {
  if (!maquinaSelecionadaId) {
    alert('Nenhuma máquina selecionada para exclusão.');
    return;
  }

  try {
    const resposta = await fetch(`${API_MAQUINAS}/${maquinaSelecionadaId}`, {
      method: 'DELETE'
    });

    if (!resposta.ok) {
      throw new Error('Erro ao excluir no servidor');
    }

    // remove a linha da interface (apos exclusao no servidor)
    if (elementoSelecionado) {
      elementoSelecionado.remove();
    }

    alert('Máquina excluída com sucesso!');

    
    maquinaSelecionadaId = null;
    elementoSelecionado = null;
  } catch (erro) {
    console.error('Erro ao excluir máquina:', erro);
    alert('Erro ao excluir máquina. Veja o console.');
  }
});


