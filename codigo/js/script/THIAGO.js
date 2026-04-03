document.addEventListener('DOMContentLoaded', function() {
  // Persistência local
  var LS_KEY_THIAGO = 'fornecedores-thiago';
  // Comentario para ver se funciona
  var fornecedoresSalvos;
  try {
    fornecedoresSalvos = JSON.parse(localStorage.getItem(LS_KEY_THIAGO));
  } catch (e) {
    fornecedoresSalvos = null;
  }
  let fornecedores = Array.isArray(fornecedoresSalvos) && fornecedoresSalvos.length > 0 ? fornecedoresSalvos : [
    { id: 1, nome: "Foxconn", status: "enviado", item: "Placa-mãe", unidade: 200, data: "2024-09-25" },
    { id: 2, nome: "Samsung", status: "pendente", item: "Displays OLED", unidade: 500, data: "2024-09-24" }
  ];

  function salvarFornecedores() {
    try {
      localStorage.setItem(LS_KEY_THIAGO, JSON.stringify(fornecedores));
    } catch (e) {
      // Se o armazenamento falhar (quota, privacidade), apenas segue sem quebrar a UI
      console.warn('Não foi possível salvar fornecedores em localStorage:', e);
    }
  }

  // Função para renderizar a lista dinâmica
  function renderizarLista() {
    const container = document.getElementById('lista-fornecedores-thiago');
    if (!container) return;
    container.innerHTML = '';

    fornecedores.forEach(function(fornecedor) {
      const item = document.createElement('div');
      item.className = 'item-thiago';
      item.setAttribute('tabindex', '0');
      item.setAttribute('data-bs-toggle', 'popover');
      item.setAttribute('data-bs-trigger', 'hover');
      item.setAttribute('data-bs-placement', 'right');
      item.setAttribute('data-bs-title', `Detalhes: ${fornecedor.nome}`);
      item.setAttribute('data-bs-content', `<p><strong>Item:</strong> ${fornecedor.item}</p><p><strong>Unidades:</strong> ${fornecedor.unidade}</p><p><strong>Data:</strong> ${fornecedor.data}</p>`);
      item.setAttribute('data-bs-html', 'true');

      item.innerHTML = `
        <div class="item-top">
          <div class="item-title">${fornecedor.nome}</div>
          <span class="badge ${fornecedor.status}" aria-label="${fornecedor.status}">${fornecedor.status}</span>
        </div>
        <div class="item-meta">${fornecedor.unidade} unidades • ${fornecedor.data}</div>
        <div class="item-actions">
          <button type="button" class="operacao-editar btn-edit-thiago" data-id="${fornecedor.id}" aria-label="Editar" title="Editar">
            <span class="material-symbols-outlined" aria-hidden="true">edit</span>
          </button>
          <button type="button" class="btn-excluir btn-delete-thiago" data-id="${fornecedor.id}" aria-label="Excluir">
            <span class="material-symbols-outlined" aria-hidden="true">delete</span>
          </button>
        </div>
      `;

      container.appendChild(item);
    });

    // Inicializa popovers após inserir os itens
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
      return new bootstrap.Popover(popoverTriggerEl, { html: true });
    });

    // Listeners de edição
    document.querySelectorAll('.btn-edit-thiago').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const id = parseInt(this.getAttribute('data-id'), 10);
        const f = fornecedores.find(function(x) { return x.id === id; });
        if (!f) return;
        editingId = id;
        document.getElementById('nome-thiago').value = f.nome;
        document.getElementById('status-thiago').value = f.status;
        document.getElementById('item-thiago').value = f.item;
        document.getElementById('unidade-thiago').value = f.unidade;
        document.getElementById('data-thiago').value = f.data;
        const titleEl = document.getElementById('cadastroModalThiagoLabel');
        if (titleEl) titleEl.textContent = 'Editar Fornecedor';
        const cadastroModal = new bootstrap.Modal(document.getElementById('cadastro-modal-thiago'));
        cadastroModal.show();
      });
    });

    // Listeners de exclusão
    document.querySelectorAll('.btn-delete-thiago').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const id = parseInt(this.getAttribute('data-id'), 10);
        const f = fornecedores.find(function(x) { return x.id === id; });
        if (!f) return;
        const ok = confirm(`Deseja excluir o fornecedor "${f.nome}"?`);
        if (!ok) return;
        fornecedores = fornecedores.filter(function(x) { return x.id !== id; });
        salvarFornecedores();
        if (editingId === id) {
          editingId = null;
          const cadastroModal = bootstrap.Modal.getInstance(document.getElementById('cadastro-modal-thiago'));
          cadastroModal && cadastroModal.hide();
          const titleEl = document.getElementById('cadastroModalThiagoLabel');
          if (titleEl) titleEl.textContent = 'Cadastrar Fornecedor';
          const form = document.getElementById('form-cadastro-thiago');
          form && form.reset();
        }
        renderizarLista();
      });
    });
  }

  // Botão para abrir o modal de reenvio
  const reenviarBtn = document.getElementById('reenviarBtn');
  if (reenviarBtn) {
    reenviarBtn.addEventListener('click', function() {
      const reenvioModal = new bootstrap.Modal(document.getElementById('reenvioModal'));
      reenvioModal.show();
    });
  }

  // Botão para confirmar o reenvio
  const confirmarReenvio = document.getElementById('confirmarReenvio');
  if (confirmarReenvio) {
    confirmarReenvio.addEventListener('click', function() {
      alert('Reenvio disparado para itens pendentes.');
      const reenvioModal = bootstrap.Modal.getInstance(document.getElementById('reenvioModal'));
      reenvioModal && reenvioModal.hide();
    });
  }

  // Abrir modal de cadastro
  const cadastrarBtn = document.getElementById('cadastrar-btn-thiago');
  if (cadastrarBtn) {
    cadastrarBtn.addEventListener('click', function() {
      const titleEl = document.getElementById('cadastroModalThiagoLabel');
      if (titleEl) titleEl.textContent = 'Cadastrar Fornecedor';
      const cadastroModal = new bootstrap.Modal(document.getElementById('cadastro-modal-thiago'));
      cadastroModal.show();
    });
  }

  // Controle de edição/cadastro
  let editingId = null;

  // Salvar fornecedor (novo ou edição)
  const salvarCadastro = document.getElementById('salvar-cadastro-thiago');
  if (salvarCadastro) {
    salvarCadastro.addEventListener('click', function() {
      const nome = document.getElementById('nome-thiago').value.trim();
      const status = document.getElementById('status-thiago').value;
      const itemNome = document.getElementById('item-thiago').value.trim();
      const unidade = parseInt(document.getElementById('unidade-thiago').value, 10) || 0;
      const data = document.getElementById('data-thiago').value;

      if (editingId !== null) {
        const idx = fornecedores.findIndex(function(x) { return x.id === editingId; });
        if (idx !== -1) {
          fornecedores[idx] = { id: editingId, nome: nome, status: status, item: itemNome, unidade: unidade, data: data };
        }
      } else {
        const novoId = fornecedores.length ? Math.max(...fornecedores.map(function(f) { return f.id; })) + 1 : 1;
        const novoFornecedor = { id: novoId, nome: nome, status: status, item: itemNome, unidade: unidade, data: data };
        fornecedores.push(novoFornecedor);
      }

      // Persistir alterações
      salvarFornecedores();

      // Limpar formulário e fechar modal
      document.getElementById('form-cadastro-thiago').reset();
      const cadastroModalEl = document.getElementById('cadastro-modal-thiago');
      const cadastroModal = bootstrap.Modal.getInstance(cadastroModalEl);
      cadastroModal && cadastroModal.hide();
      editingId = null;
      const titleEl = document.getElementById('cadastroModalThiagoLabel');
      if (titleEl) titleEl.textContent = 'Cadastrar Fornecedor';

      // Atualizar lista
      renderizarLista();
    });
  }

  // Reset ao fechar o modal
  const cadastroModalEl = document.getElementById('cadastro-modal-thiago');
  if (cadastroModalEl) {
    cadastroModalEl.addEventListener('hidden.bs.modal', function() {
      editingId = null;
      const titleEl = document.getElementById('cadastroModalThiagoLabel');
      if (titleEl) titleEl.textContent = 'Cadastrar Fornecedor';
      document.getElementById('form-cadastro-thiago').reset();
    });
  }

  // Inicialização da lista ao carregar
  renderizarLista();
  // Garante sincronização inicial com storage (salva os dados de fallback na primeira carga)
  salvarFornecedores();
});
