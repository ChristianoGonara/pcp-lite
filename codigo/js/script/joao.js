// Config API
const API_BASE = 'http://localhost:3000';
const API_LOTES = `${API_BASE}/lotes`;

// Var Global
let lotes = [];
let loteParaExcluir = null;

// Inicializar
document.addEventListener('DOMContentLoaded', async function() {
    await carregarLotes();
    configurarEventos();
});

// Carregar Lotes
async function carregarLotes() {
    try {
        const resposta = await fetch(API_LOTES);
        if (!resposta.ok) {
            throw new Error('Erro ao buscar lotes');
        }
        lotes = await resposta.json();
        console.log('✅ Lotes carregados:', lotes);
        renderizarLotes();
    } catch (erro) {
        console.error('❌ Erro ao carregar lotes:', erro);
        mostrarMensagem('Erro ao carregar lotes. Verifique se o JSON Server está rodando na porta 3000.', 'danger');
    }
}

// Renderizar
function renderizarLotes() {
    const container = document.querySelector('.lotes-de-producao .lotes-list') || document.querySelector('.lotes-de-producao');
    const botaoDiv = document.querySelector('.lotes-de-producao .botao');

    // Remove lotes existentes
    const lotesAntigos = container.querySelectorAll('.linha');
    lotesAntigos.forEach(lote => lote.remove());
    
    // Encontra onde inserir (fim da lista)
    
    // Se nao houver lotes
    if (lotes.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <span class="material-symbols-outlined">inbox</span>
            <p>Nenhum lote cadastrado</p>
            <p class="text-muted">Clique no botão + para adicionar um novo lote</p>
        `;
        container.insertAdjacentElement('beforeend', emptyState);
        atualizarEstadoBotoes();
        return;
    }
    
    // Renderiza cada lote
    lotes.forEach(lote => {
        const loteHTML = criarLoteHTML(lote);
        container.insertAdjacentHTML('beforeend', loteHTML);
    });
    
    // Re-configurar eventos dos novos elementos
    configurarEventosLotes();
    atualizarEstadoBotoes();
}

function criarLoteHTML(lote) {
    return `
        <div class="linha" data-lote-id="${lote.id}">
            <!-- CheckBox -->
            <input type="checkbox" id="lote${lote.id}" class="lote-checkbox">

            <!-- Lotes Box-->
            <label class="lotes-box" for="lote${lote.id}">

                <!-- Lotes Informacoes-->
                <div class="lotes-box-info">
                    <p class="fw-bold">Lote ${lote.id}</p>
                    <p>${lote.produto}</p>
                    <p>${lote.quantidade}</p>
                    <p>${lote.linha}</p>
                    ${lote.dataInicio ? `<p class="text-muted"><small>Início: ${formatarData(lote.dataInicio)}</small></p>` : ''}
                </div>

                <!-- Lotes Btn -->
                <div class="lotes-box-indicador">
                    <!-- Lotes Btn Status-->
                    <p class="status btn-${obterCorStatus(lote.status)}">${lote.status}</p>

                    <!-- Lotes Btn Excluir-->
                    <button class="btn-excluir" 
                            data-lote-id="${lote.id}" 
                            aria-label="Excluir Lote ${lote.id}"
                            type="button">
                        <span class="material-symbols-outlined" aria-hidden="true">delete</span>
                    </button>
                </div>
            </label>
        </div>
    `;
}

function obterCorStatus(status) {
    const cores = {
        'aguardando': 'warning',
        'liberado': 'primary',
        'em produção': 'info',
        'concluído': 'success',
        'pausado': 'secondary'
    };
    return cores[status] || 'secondary';
}

function formatarData(dataISO) {
    if (!dataISO) return '';
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR');
}

// Config de Eventos
function configurarEventos() {
    // Btn de salvar no modal de cadastro
    const btnSalvarCadastro = document.querySelector('#cadastroModal .btn-primary');
    if (btnSalvarCadastro) {
        btnSalvarCadastro.addEventListener('click', cadastrarLote);
    }
    
    // Btn Salvar Programacao
    const btnSalvarProgramacao = document.querySelector('#programarModal .btn-primary');
    if (btnSalvarProgramacao) {
        btnSalvarProgramacao.addEventListener('click', programarLotes);
    }
    
    // Confirmar Liberacao
    const btnConfirmarLiberacao = document.getElementById('confirmarLiberacao');
    if (btnConfirmarLiberacao) {
        btnConfirmarLiberacao.addEventListener('click', liberarLotes);
    }
    
    // Confirmar Exclusao
    const btnConfirmarExclusao = document.querySelector('#excluirModal .btn-danger');
    if (btnConfirmarExclusao) {
        btnConfirmarExclusao.addEventListener('click', confirmarExclusao);
    }
    
    // Limpar Formulario
    const modalCadastro = document.getElementById('cadastroModal');
    if (modalCadastro) {
        modalCadastro.addEventListener('show.bs.modal', limparFormularioCadastro);
    }
}

function configurarEventosLotes() {
    // Checkboxes
    const checkboxes = document.querySelectorAll('.lote-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', atualizarEstadoBotoes);
    });
    
    // Botoes de Excluir
    const botoesExcluir = document.querySelectorAll('.btn-excluir');
    botoesExcluir.forEach(botao => {
        botao.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const loteId = this.getAttribute('data-lote-id');
            prepararExclusao(loteId);
        });
    });
}

// Cadastro Lote
async function cadastrarLote() {
    const produto = document.getElementById('campoArtefato').value.trim();
    const quantidade = parseInt(document.getElementById('campoQuantidade').value);
    const linha = document.getElementById('campoLinha').value;
    
    // Validação
    if (!produto) {
        mostrarMensagem('Por favor, informe o produto!', 'warning');
        return;
    }
    
    if (!quantidade || quantidade <= 0) {
        mostrarMensagem('Por favor, informe uma quantidade válida!', 'warning');
        return;
    }
    
    if (!linha) {
        mostrarMensagem('Por favor, selecione uma linha de operação!', 'warning');
        return;
    }
    
    // Criar novo lote
    const novoLote = {
        produto: produto,
        quantidade: quantidade,
        linha: linha,
        status: 'aguardando',
        dataInicio: null
    };
    
    try {
        // Enviar para o servidor
        const resposta = await fetch(API_LOTES, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novoLote)
        });
        
        if (!resposta.ok) {
            throw new Error('Erro ao cadastrar lote');
        }
        
        const loteCriado = await resposta.json();
        
        // Adicionar ao array local
        lotes.push(loteCriado);
        
        // Renderizar novamente
        renderizarLotes();
        
        // Fechar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('cadastroModal'));
        if (modal) {
            modal.hide();
        }
        
        mostrarMensagem('Lote cadastrado com sucesso!', 'success');
        
    } catch (erro) {
        console.error('❌ Erro ao cadastrar lote:', erro);
        mostrarMensagem('Erro ao cadastrar lote. Verifique o console.', 'danger');
    }
}

function limparFormularioCadastro() {
    document.getElementById('campoArtefato').value = '';
    document.getElementById('campoQuantidade').value = '';
    document.getElementById('campoLinha').value = '';
}

// Programar Lotes
async function programarLotes() {
    const dataInicio = document.getElementById('campoHorario').value;
    
    if (!dataInicio) {
        mostrarMensagem('Por favor, informe a data de início!', 'warning');
        return;
    }
    
    // Obter lotes selecionados
    const lotesSelecionados = obterLotesSelecionados();
    
    if (lotesSelecionados.length === 0) {
        mostrarMensagem('Selecione pelo menos um lote para programar!', 'warning');
        return;
    }
    
    try {
        // Atualizar cada lote no servidor
        const promessas = lotesSelecionados.map(async (id) => {
            const lote = lotes.find(l => l.id == id);
            if (lote) {
                const loteAtualizado = {
                    ...lote,
                    dataInicio: dataInicio
                };
                
                const resposta = await fetch(`${API_LOTES}/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(loteAtualizado)
                });
                
                if (!resposta.ok) {
                    throw new Error(`Erro ao programar lote ${id}`);
                }
                
                return resposta.json();
            }
        });
        
        await Promise.all(promessas);
        
        // Recarregar lotes
        await carregarLotes();
        
        // Fechar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('programarModal'));
        if (modal) {
            modal.hide();
        }
        
        // Limpar campo de data
        document.getElementById('campoHorario').value = '';
        
        mostrarMensagem('Lotes programados com sucesso!', 'info');
        
    } catch (erro) {
        console.error('❌ Erro ao programar lotes:', erro);
        mostrarMensagem('Erro ao programar lotes. Verifique o console.', 'danger');
    }
}

// Liberar Lotes
async function liberarLotes() {
    const lotesSelecionados = obterLotesSelecionados();
    
    if (lotesSelecionados.length === 0) {
        mostrarMensagem('Selecione pelo menos um lote para liberar!', 'warning');
        return;
    }
    
    try {
        // Atualizar cada lote no servidor
        const promessas = lotesSelecionados.map(async (id) => {
            const lote = lotes.find(l => l.id == id);
            if (lote) {
                const loteAtualizado = {
                    ...lote,
                    status: 'em produção'
                };
                
                const resposta = await fetch(`${API_LOTES}/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(loteAtualizado)
                });
                
                if (!resposta.ok) {
                    throw new Error(`Erro ao liberar lote ${id}`);
                }
                
                return resposta.json();
            }
        });
        
        await Promise.all(promessas);
        
        // Recarregar lotes
        await carregarLotes();
        
        // Fechar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('liberarModal'));
        if (modal) {
            modal.hide();
        }
        
        mostrarMensagem('Lotes liberados para produção!', 'success');
        
    } catch (erro) {
        console.error('❌ Erro ao liberar lotes:', erro);
        mostrarMensagem('Erro ao liberar lotes. Verifique o console.', 'danger');
    }
}

// Excluir Lote
function prepararExclusao(loteId) {
    loteParaExcluir = loteId;
    
    // Atualizar texto do modal com informações do lote
    const lote = lotes.find(l => l.id == loteId);
    if (lote) {
        const modalBody = document.querySelector('#excluirModal .modal-body');
        modalBody.innerHTML = `
            <p>Tem certeza que deseja excluir o <strong>Lote ${lote.id}</strong>?</p>
            <p class="text-muted">Produto: ${lote.produto} | Quantidade: ${lote.quantidade}</p>
        `;
    }
    
    // Abrir modal
    const modal = new bootstrap.Modal(document.getElementById('excluirModal'));
    modal.show();
}

async function confirmarExclusao() {
    if (loteParaExcluir === null) {
        mostrarMensagem('Nenhum lote selecionado para exclusão.', 'warning');
        return;
    }
    
    try {
        // Excluir no servidor
        const resposta = await fetch(`${API_LOTES}/${loteParaExcluir}`, {
            method: 'DELETE'
        });
        
        if (!resposta.ok) {
            throw new Error('Erro ao excluir no servidor');
        }
        
        // Remover do array local
        lotes = lotes.filter(lote => lote.id != loteParaExcluir);
        
        // Renderizar novamente
        renderizarLotes();
        
        // Fechar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('excluirModal'));
        if (modal) {
            modal.hide();
        }
        
        mostrarMensagem('Lote excluído com sucesso!', 'danger');
        
        // Reset var
        loteParaExcluir = null;
        
    } catch (erro) {
        console.error('❌ Erro ao excluir lote:', erro);
        mostrarMensagem('Erro ao excluir lote. Verifique o console.', 'danger');
    }
}

// Auxiliar
function obterLotesSelecionados() {
    const checkboxes = document.querySelectorAll('.lote-checkbox:checked');
    return Array.from(checkboxes).map(cb => {
        const linha = cb.closest('.linha');
        return linha.getAttribute('data-lote-id');
    });
}

function atualizarEstadoBotoes() {
    const btnLiberar = document.getElementById('btn-liberar');
    const checkboxes = document.querySelectorAll('.lote-checkbox');
    const algumSelecionado = Array.from(checkboxes).some(cb => cb.checked);
    
    if (btnLiberar) {
        btnLiberar.disabled = !algumSelecionado;
        btnLiberar.style.opacity = algumSelecionado ? '1' : '0.6';
        btnLiberar.style.cursor = algumSelecionado ? 'pointer' : 'not-allowed';
    }
}

function mostrarMensagem(mensagem, tipo = 'info') {
    // Criar elemento de alerta
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`;
    alerta.style.cssText = 'top: 80px; right: 20px; z-index: 9999; min-width: 300px; max-width: 500px;';
    alerta.innerHTML = `
        ${mensagem}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alerta);
    
    // Remover após 3 segundos
    setTimeout(() => {
        alerta.remove();
    }, 3000);
}

