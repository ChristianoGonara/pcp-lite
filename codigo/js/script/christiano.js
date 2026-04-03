var graficoEstoqueInstance = null;

// monta a tabela com base no historico do produto
function atualizarTabelaHistorico(produto) {
    const corpo = document.querySelector(".tabela-analise tbody");
    if (!corpo || !produto || !Array.isArray(produto.historico)) return;

    corpo.innerHTML = "";

    produto.historico.forEach((h) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${h.periodo}</td>
        <td>${h.vendas}</td>
        <td>${h.estoque}</td>
        <td>${h.capacidade}%</td>
    `;
    corpo.appendChild(tr);
    });
}

function montarRelatorioEstoque() {
    const box = document.getElementById("conteudo-relatorio-estoque");
    if (!box) return;

    const itens = document.querySelectorAll(".item-estoque");
    if (!itens.length) {
        box.innerHTML = "<p>Nenhum dado de estoque disponível.</p>";
        return;
    }

    let html = "<ul>";
    itens.forEach((item) => {
        const nome = item.querySelector("h3")?.textContent.trim() || "";
        const atual = item.querySelector(".nivel-atual")?.textContent.trim() || "";
        const minmax = item.querySelector(".niveis-minmax")?.textContent.trim() || "";
        const status = item.querySelector(".status-estoque")?.textContent.trim() || "";

        html += `<li><strong>${nome}</strong><br>${atual} | ${minmax} | Status: ${status}</li>`;
    });
    html += "</ul>";

    box.innerHTML = html;
}


// Função para criar/atualizar gráfico para o produto selecionado
function gerarGraficoEstoqueProduto(produtoId) {
    fetch("http://localhost:3000/produtos")
    .then((res) => res.json())
    .then((produtos) => {
        var produto = produtos.find((p) => p.id === produtoId);
        if (!produto || !produto.historico) return;


      // atualiza tabela junto com o gráfico
        atualizarTabelaHistorico(produto);

        var labels = produto.historico.map((h) => h.periodo);
        var estoques = produto.historico.map((h) => h.estoque);

        var ctx = document.getElementById("graficoEstoqueHistorico");
        if (!ctx) return;

        if (graficoEstoqueInstance) {
        graficoEstoqueInstance.destroy();
        }

        graficoEstoqueInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
            {
                label: "Estoque (item)",
                data: estoques,
                borderColor: "#195392",
                backgroundColor: "rgba(25, 83, 146, 0.15)",
                fill: true,
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: "#195392"
            }
            ]
        },
        options: {
            responsive: true,
            plugins: {
            legend: { display: false }
            },
            scales: {
            x: {
                title: { display: true, text: "Trimestre" }
            },
            y: {
                title: { display: true, text: "Estoque (item)" },
                beginAtZero: true
            }
            }
        }
        });
    });
}

// Quando a página carregar, configura o select e o gráfico
document.addEventListener("DOMContentLoaded", function () {
    const seletor = document.getElementById("select-produto-historico");
    const ctx = document.getElementById("graficoEstoqueHistorico");

    if (!seletor || !ctx) return;

    const produtoInicial = seletor.value || "placa-mae";
    gerarGraficoEstoqueProduto(produtoInicial);

    seletor.addEventListener("change", function (e) {
    gerarGraficoEstoqueProduto(e.target.value);
    });


    const btnRelatorioEstoque = document.getElementById("btn-abrir-relatorio-estoque");
    if (btnRelatorioEstoque) {
        btnRelatorioEstoque.addEventListener("click", function () {
            montarRelatorioEstoque();
            // o atributo data-bs-toggle já cuida de abrir o modal
        });
    }
});
