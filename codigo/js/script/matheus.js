const API_URL_PRODUTOS = "http://localhost:3000/produtos-B_O_M";
const API_URL_BOM = "http://localhost:3000/B_O_M";

const listaProdutos = document.querySelector(".lista-produtos");
const painelBom = document.querySelector(".painel-bom");
const painelCadastro = document.querySelector(".cadastro-container");
const formCadastro = document.getElementById("form-cadastro-produto");

if (listaProdutos && painelBom && formCadastro) {
  const mensagemSelecao = painelBom.querySelector(".mensagem-selecao");
  const conteudoBom = painelBom.querySelector(".conteudo-bom");
  const submitButton = formCadastro.querySelector("button[type='submit']");

  let produtoEditandoId = null;

  function formatarMoeda(valor) {
    return "R$ " + Number(valor || 0).toFixed(2).replace(".", ",");
  }

  function limparBOM() {
    mensagemSelecao.textContent = "Selecione um produto";
    conteudoBom.innerHTML = "";
  }

  async function buscarBOMPorCodigo(codigoProduto) {
    try {
      const res = await fetch(
        API_URL_BOM + "?codigoProduto=" + encodeURIComponent(codigoProduto)
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data[0];
      }
      return null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async function renderizarBOM(codigoProduto, nomeProduto) {
    conteudoBom.innerHTML = "";
    const registro = await buscarBOMPorCodigo(codigoProduto);

    if (
      !registro ||
      !Array.isArray(registro.materiais) ||
      registro.materiais.length === 0
    ) {
      mensagemSelecao.textContent =
        "Nenhuma lista de materiais cadastrada para " +
        nomeProduto +
        " (" +
        codigoProduto +
        ").";
      return;
    }

    mensagemSelecao.textContent =
      "Materiais de " + nomeProduto + " (" + codigoProduto + ")";

    let total = 0;

    registro.materiais.forEach((item) => {
      const linha = document.createElement("div");
      linha.className = "bom-item";

      const info = document.createElement("div");
      info.innerHTML =
        "<strong>" + (item.codigo || "") + "</strong> - " + (item.nome || "");

      const tagQtd = document.createElement("span");
      tagQtd.className = "tag";
      tagQtd.textContent = (item.qtd || 0) + " un.";

      const preco = document.createElement("span");
      if (typeof item.custo === "number") {
        const subtotal = item.custo * (item.qtd || 0);
        total += subtotal;
        preco.textContent = formatarMoeda(subtotal);
      } else {
        preco.textContent = "–";
      }

      linha.appendChild(info);
      linha.appendChild(tagQtd);
      linha.appendChild(preco);
      conteudoBom.appendChild(linha);
    });

    const totalDiv = document.createElement("div");
    totalDiv.className = "total-bom";
    const lbl = document.createElement("span");
    lbl.textContent = "Custo total estimado";
    const val = document.createElement("span");
    val.textContent = total > 0 ? formatarMoeda(total) : "–";
    totalDiv.appendChild(lbl);
    totalDiv.appendChild(val);
    conteudoBom.appendChild(totalDiv);
  }

  function criarCardProduto(produto) {
    const card = document.createElement("div");
    card.className = "produto-card";
    card.dataset.id = produto.id;
    card.dataset.codigo = produto.codigo || "";
    card.dataset.nome = produto.nome || "";
    card.dataset.categoria = produto.categoria || "";
    card.dataset.preco = produto.preco || 0;
    card.dataset.leadtime = produto.leadtime || 0;

    card.innerHTML =
      '<span class="produto-codigo badge text-bg-secondary">' +
      (produto.codigo || "") +
      "</span>" +
      '<span class="produto-categoria small text-muted d-block">' +
      (produto.categoria || "") +
      "</span>" +
      '<h3 class="produto-nome h6 mt-1 mb-2">' +
      (produto.nome || "") +
      "</h3>" +
      '<p class="produto-preco fw-semibold mb-1">' +
      formatarMoeda(produto.preco) +
      "</p>" +
      '<p class="produto-leadtime text-muted small mb-2">' +
      (produto.leadtime || 0) +
      "d</p>" +
      '<div class="acoes-produto d-flex gap-2 mt-2">' +
      '<button type="button" class="btn btn-sm btn-outline-warning btn-editar">Editar</button>' +
      '<button type="button" class="btn btn-sm btn-outline-danger btn-excluir">Excluir</button>' +
      "</div>";

    return card;
  }

  function renderizarLista(produtos) {
    listaProdutos.innerHTML = "";
    produtos.forEach((p) => {
      const card = criarCardProduto(p);
      listaProdutos.appendChild(card);
    });
  }

  async function carregarProdutos() {
    try {
      const resposta = await fetch(API_URL_PRODUTOS);
      const dados = await resposta.json();
      renderizarLista(dados);
      limparBOM();
    } catch (e) {
      console.error(e);
    }
  }

  function preencherFormularioComCard(card) {
    const codigoInput = formCadastro.querySelector("[name='codigo']");
    const nomeInput = formCadastro.querySelector("[name='nome']");
    const categoriaInput = formCadastro.querySelector("[name='categoria']");
    const precoInput = formCadastro.querySelector("[name='preco']");
    const leadtimeInput = formCadastro.querySelector("[name='leadtime']");

    if (codigoInput) codigoInput.value = card.dataset.codigo || "";
    if (nomeInput) nomeInput.value = card.dataset.nome || "";
    if (categoriaInput)
      categoriaInput.value = card.dataset.categoria || "";
    if (precoInput) precoInput.value = card.dataset.preco || "";
    if (leadtimeInput) leadtimeInput.value = card.dataset.leadtime || "";

    if (submitButton) submitButton.textContent = "Atualizar produto";

    if (painelCadastro) {
      painelCadastro.open = true;
      painelCadastro.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function resetarFormulario() {
    formCadastro.reset();
    produtoEditandoId = null;
    if (submitButton) submitButton.textContent = "Adicionar ao Catálogo";
    for (let i = 1; i <= 5; i++) {
      const cod = formCadastro.querySelector(
        "[name='peca_codigo_" + i + "']"
      );
      const qtd = formCadastro.querySelector(
        "[name='peca_qtd_" + i + "']"
      );
      if (cod) cod.value = "";
      if (qtd) qtd.value = "";
    }
  }

  function buscarNomeProdutoPorCodigo(codigo) {
    const cards = listaProdutos.querySelectorAll(".produto-card");
    for (const card of cards) {
      const cod =
        card.dataset.codigo ||
        card.querySelector(".produto-codigo")?.textContent.trim();
      if (cod === codigo) {
        const nome =
          card.dataset.nome ||
          card.querySelector(".produto-nome")?.textContent.trim();
        return nome || "";
      }
    }
    return "";
  }

  function buscarPrecoProdutoPorCodigo(codigo) {
    const cards = listaProdutos.querySelectorAll(".produto-card");
    for (const card of cards) {
      const cod =
        card.dataset.codigo ||
        card.querySelector(".produto-codigo")?.textContent.trim();
      if (cod === codigo) {
        const preco = card.dataset.preco;
        if (preco !== undefined) return Number(preco);
        const texto =
          card
            .querySelector(".produto-preco")
            ?.textContent.replace("R$", "")
            .replace(".", "")
            .replace(",", ".") || "0";
        return Number(texto) || 0;
      }
    }
    return 0;
  }

  async function carregarBOMNoFormulario(codigoProduto) {
    const registro = await buscarBOMPorCodigo(codigoProduto);
    for (let i = 1; i <= 5; i++) {
      const codInput = formCadastro.querySelector(
        "[name='peca_codigo_" + i + "']"
      );
      const qtdInput = formCadastro.querySelector(
        "[name='peca_qtd_" + i + "']"
      );
      if (!codInput || !qtdInput) continue;
      codInput.value = "";
      qtdInput.value = "";
    }
    if (!registro || !Array.isArray(registro.materiais)) return;
    registro.materiais.forEach((item, index) => {
      const pos = index + 1;
      if (pos > 5) return;
      const codInput = formCadastro.querySelector(
        "[name='peca_codigo_" + pos + "']"
      );
      const qtdInput = formCadastro.querySelector(
        "[name='peca_qtd_" + pos + "']"
      );
      if (codInput) codInput.value = item.codigo || "";
      if (qtdInput) qtdInput.value = item.qtd || "";
    });
  }

  async function salvarBOM(codigoProduto) {
    const materiais = [];

    for (let i = 1; i <= 5; i++) {
      const codInput = formCadastro.querySelector(
        "[name='peca_codigo_" + i + "']"
      );
      const qtdInput = formCadastro.querySelector(
        "[name='peca_qtd_" + i + "']"
      );
      if (!codInput || !qtdInput) continue;

      const codigo = codInput.value.trim();
      const qtd = parseFloat(qtdInput.value.trim() || "0");

      if (!codigo || qtd <= 0) continue;

      const nome =
        buscarNomeProdutoPorCodigo(codigo) || "Peça " + codigo;
      const custo = buscarPrecoProdutoPorCodigo(codigo);

      materiais.push({
        codigo,
        nome,
        qtd,
        custo,
      });
    }

    const registro = {
      codigoProduto,
      materiais,
    };

    try {
      const existente = await buscarBOMPorCodigo(codigoProduto);
      if (existente && existente.id !== undefined) {
        await fetch(API_URL_BOM + "/" + existente.id, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: existente.id,
            ...registro,
          }),
        });
      } else {
        await fetch(API_URL_BOM, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(registro),
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function excluirBOM(codigoProduto) {
    try {
      const existente = await buscarBOMPorCodigo(codigoProduto);
      if (existente && existente.id !== undefined) {
        await fetch(API_URL_BOM + "/" + existente.id, {
          method: "DELETE",
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  listaProdutos.addEventListener("click", async (evento) => {
    const card = evento.target.closest(".produto-card");
    if (!card) return;

    if (evento.target.classList.contains("btn-editar")) {
      produtoEditandoId = card.dataset.id;
      preencherFormularioComCard(card);
      await carregarBOMNoFormulario(card.dataset.codigo || "");
      return;
    }

    if (evento.target.classList.contains("btn-excluir")) {
      const id = card.dataset.id;
      const codigoProduto = card.dataset.codigo || "";
      const confirmar = window.confirm(
        "Deseja realmente excluir este produto?"
      );
      if (!confirmar) return;
      try {
        await fetch(API_URL_PRODUTOS + "/" + id, { method: "DELETE" });
        if (codigoProduto) {
          await excluirBOM(codigoProduto);
        }
        await carregarProdutos();
      } catch (e) {
        console.error(e);
      }
      return;
    }

    const codigo =
      card.dataset.codigo ||
      card.querySelector(".produto-codigo")?.textContent.trim();
    const nome =
      card.dataset.nome ||
      card.querySelector(".produto-nome")?.textContent.trim();
    if (!codigo || !nome) return;
    renderizarBOM(codigo, nome);
  });

  formCadastro.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const dados = new FormData(formCadastro);

    const codigo = (dados.get("codigo") || "").toString().trim();
    const nome = (dados.get("nome") || "").toString().trim();
    const categoria = (dados.get("categoria") || "").toString().trim();
    const precoNum = parseFloat(dados.get("preco") || "0");
    const leadtimeNum = parseInt(dados.get("leadtime") || "0", 10);

    if (!codigo || !nome) {
      return;
    }

    const produtoPayload = {
      codigo,
      nome,
      categoria,
      preco: isNaN(precoNum) ? 0 : precoNum,
      leadtime: isNaN(leadtimeNum) ? 0 : leadtimeNum,
    };

    try {
      if (produtoEditandoId) {
        await fetch(API_URL_PRODUTOS + "/" + produtoEditandoId, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: Number(produtoEditandoId),
            ...produtoPayload,
          }),
        });
      } else {
        await fetch(API_URL_PRODUTOS, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(produtoPayload),
        });
      }

      await salvarBOM(codigo);
      resetarFormulario();
      await carregarProdutos();
    } catch (e) {
      console.error(e);
    }
  });

  carregarProdutos();
}
