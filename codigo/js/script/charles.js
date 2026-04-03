//pegar a data atual
const dataAtual = new Date();

//constante para ter o link do servidor 
const API_BASE_URL = 'http://localhost:3000/producao';

//contantes para acesso facil a locais da tabelaPMP
const tbodyPMP = document.querySelector('.tabela-pmp tbody');
const tabelaPMP = document.querySelector('.tabela-pmp');

//botoes de ação
const btnAbrirCriar = document.getElementById('btn-abrir-modal-criar');
const btnAbrirEditar = document.getElementById('btn-abrir-modal-info');
const btnCriar = document.getElementById('btn-criar-modal-1');
const btnEditar = document.getElementById('btn-editar-modal-1');
const btnDeletar = document.getElementById('btn-deletar-modal-info');
const btnInfoEditar = document.getElementById('btn-info-editar');

//filtros para imprimir na tela as metas desejadas
const filtroAno = document.getElementById('filtro-selec-ano');
const filtroMes = document.getElementById('filtro-selec-mes');

//local para mudar nome do modal criar e editar
const tituloModalCriarEditar = document.getElementById('exampleModalLabel');

//locais para imprimir os dados da meta especifica
const impMetaInfo = document.getElementById('nome-meta-editar');
const impPeriodoInfo = document.getElementById('paragrafo-periodo-info');
const impAnoInfo = document.getElementById('paragrafo-ano-info');
const impMesInfo = document.getElementById('paragrafo-mes-info');
const impDemandaInfo = document.getElementById('paragrafo-demanda-info');
const impAtualInfo = document.getElementById('paragrafo-atual-info');

//Dados para criar nova meta de producao
const nomeProducao = document.getElementById('nome-meta-producao');
const anoProducao = document.getElementById('ano-meta-producao');
const mesProducao = document.getElementById('mes-meta-producao');
const diaInicioProducao = document.getElementById('dia-inicio-meta-producao');
const diaFinalProducao = document.getElementById('dia-final-meta-producao');
const metaProducao = document.getElementById('meta-meta-producao');
const atualProducao = document.getElementById('atual-meta-producao');

//constante para alterar o status da producao
const statusCor = document.getElementById('status-meta-producao');

//variavel global para guardar id 
let metaIdParaEdicao = null;


// função para ocultar o botao no modal e mostrar o botao de editar ou criar
function configurarModal(modo) {
    if (modo === 'criar') {
        // Modo CRIAR 
        metaIdParaEdicao = null;
        btnCriar.style.display = 'inline-block';
        btnEditar.style.display = 'none';
        tituloModalCriarEditar.innerHTML = 'Criar meta de produção';
    } else if (modo === 'editar') {
        // Modo EDITAR
        btnCriar.style.display = 'none';
        btnEditar.style.display = 'inline-block';
        tituloModalCriarEditar.innerHTML = 'Editar meta de produção';
    }
}

async function carregarMetaPorId(id) {

    //if para verificar e informar se existe id
    if (!id) return console.error("ID não fornecido para carregar informações.");

    try {

        //guardar URL de pesquisa de id
        const urlCompleta = `${API_BASE_URL}/${id}`;
        const resposta = await fetch(urlCompleta);

        //verificar se encontrou o item 
        if (!resposta.ok) {
            throw new Error(`Dados do item ${id} não encontrados. Status: ${resposta.status}`);
        }

        const meta = await resposta.json();
        
        //envia os dados para preencher o modal
        preencherModalInfo(meta);
        
        // verificar se tem erro no processo
    } catch (erro) {
        console.error('Falha ao carregar as informações da meta:', erro);
        alert(`Erro ao carregar dados: ${erro.message}`);
    }
}

async function lerMetas() {
    //guardando as datas atual para listagem
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth() + 1;

    //guardar os dados para filtrar quais metas de produção quer ver
    const anoSelec = filtroAno.value;
    const mesSelec = filtroMes.value;

    const params = new URLSearchParams();

    // Adiciona o ano ao parâmetro se um valor válido for selecionado
    if (anoSelec && anoSelec !== 'Ano') { 
        params.append('ano', anoSelec);

    }else{
        //filtra para o ano atual caso não tenha selecioando o ano
        params.append('ano', ano);
    }
    
    // Adiciona o mês ao parâmetro se um valor válido for selecionado
    if (mesSelec && mesSelec !== 'Mes') { 
     
        params.append('mes', mesSelec);
        
    }else{
        //filtra para o mes atual caso não tenha mes selecionado
        params.append('mes', mes);
    }

    // guardar a URL para pesquisa especifica 
    const urlComFiltro = `${API_BASE_URL}?${params.toString()}`;


    try{

        const resposta = await fetch(urlComFiltro);

        // verificar se existe erro
        if(!resposta.ok){

            throw new Error(`Erro ao buscar dados. Status: ${resposta.status}`);
        }

        //guardar os dados para enviar 
        const listaMetasProducao = await resposta.json();

        //chamar função que cria a tabela na pagian inicial
        criarTabela(listaMetasProducao);

    }
    catch(erro){
        console.error('Falha ao ler o banco de dados:', erro);
        tbodyPMP.innerHTML = `<tr><td colspan="5">Erro ao carregar os dados: ${erro.message}</td></tr>`;
    }
    
}

function calcularStatusMeta(meta) {
    const ano = parseInt(meta.ano, 10);
    const mes = parseInt(meta.mes, 10);
    const inicio = parseInt(meta.periodo_inicio, 10);
    const fim = parseInt(meta.periodo_final, 10);
    const demanda = Number(meta.demanda) || 0;
    const producao = Number(meta.producao) || 0;

    let totalDias = (Number.isFinite(fim) && Number.isFinite(inicio) && fim >= inicio) ? (fim - inicio + 1) : 0;
    if (totalDias <= 0 || demanda <= 0) {
        const texto = producao >= demanda ? 'OK' : 'CRÍTICO';
        const className = producao >= demanda ? 'status-ok' : 'status-critico';
        return { className, texto };
    }

    const hoje = new Date();
    const anoHoje = hoje.getFullYear();
    const mesHoje = hoje.getMonth() + 1;
    const diaHoje = hoje.getDate();

    let diasDecorridos = 0;
    if (ano === anoHoje && mes === mesHoje) {
        if (diaHoje < inicio) diasDecorridos = 0;
        else if (diaHoje > fim) diasDecorridos = totalDias;
        else diasDecorridos = (diaHoje - inicio + 1);
    } else if (ano < anoHoje || (ano === anoHoje && mes < mesHoje)) {
        diasDecorridos = totalDias;
    } else {
        diasDecorridos = 0;
    }

    const pctTempo = totalDias ? diasDecorridos / totalDias : 0;
    const pctExecucao = demanda ? producao / demanda : 0;
    const delta = pctExecucao - pctTempo;

    let className;
    let texto;
    if (pctExecucao >= 1) {
        className = 'status-ok';
        texto = 'OK';
    } else if (ano === anoHoje && mes === mesHoje && diaHoje > fim && pctExecucao < 1) {
        className = 'status-critico';
        texto = 'CRÍTICO';
    } else if (delta >= 0.10) {
        className = 'status-ok';
        texto = 'OK';
    } else if (delta >= -0.05) {
        className = 'status-apertado';
        texto = 'APERTADO';
    } else {
        className = 'status-critico';
        texto = 'CRÍTICO';
    }

    return { className, texto };
}

function criarTabela(metas) {
    //limpa o corpo da tabela para evitar duplicidade de dados
    tbodyPMP.innerHTML = ''; 

    if (metas.length === 0) {
        tbodyPMP.innerHTML = `<tr><td colspan="5">Nenhuma meta de produção cadastrada.</td></tr>`;
        return;
    }

    // verificar os dados de meta
    metas.forEach(meta => {
        const calc = calcularStatusMeta(meta);
        
        //Cria o elemento de linha
        const novaLinha = document.createElement('tr');
        
        //criar a linha da tabela para cada item existente
        //data-meta-id armazena o ID 
        novaLinha.innerHTML = `
            <td>${meta.periodo_inicio} a ${meta.periodo_final}</td>
            <td>${meta.demanda}k</td>
            <td>${meta.producao}k</td>
            <td><span class="status-dot ${calc.className}" title="${calc.texto}" aria-label="${calc.texto}"></span></td>
            <td>
                <button 
                    id="btn-info-editar",
                    class="operacao-editar" 
                    aria-label="Editar meta" 
                    title="Editar"
                    data-bs-toggle="modal" 
                    data-bs-target="#modal-info-meta"
                    data-meta-id="${meta.id || meta._id}" 
                >
                    <span class="material-symbols-outlined" aria-hidden="true">edit</span>
                </button>
            </td>
        `;

        //Adiciona a linha ao corpo da tabela
        tbodyPMP.appendChild(novaLinha);
    });
}

//função para preencher os modals apos clicar em editar meta de producao
function preencherModalInfo(meta) {
    //limpa o formulario para usos futuros
    limparForm();

    //guardar id
    metaIdParaEdicao = meta.id || meta._id;

    //if's para preencher o modal de informaçoes sobre a meta de produção

    //nome
    if (impMetaInfo) {
        
        impMetaInfo.textContent = `${meta.nome}`; 
    }

    //periodo
    if (impPeriodoInfo) {
        
        impPeriodoInfo.textContent = `${meta.periodo_inicio} a ${meta.periodo_final}`; 
    }
    
    // Ano
    if (impAnoInfo) {
        impAnoInfo.textContent = meta.ano || 'N/A';
    }
    
    // Mês
    if (impMesInfo) {
        impMesInfo.textContent = meta.mes || 'N/A'; // Assumindo que o JSON já tem o nome abreviado (Fev)
    }
    
    // Demanda 
    if (impDemandaInfo) {
        
        impDemandaInfo.textContent = `${(meta.demanda || 0).toLocaleString('pt-BR')}k`; 
    }

    // Produção atual 
    if (impAtualInfo) {
        impAtualInfo.textContent = `${(meta.producao || 0).toLocaleString('pt-BR')}k`;
    }

    //---------------------------------------------------------------------------------------------------------

    // preencher o modal de edição de metas de producao
    //nome
    if (nomeProducao){ 

        nomeProducao.value = meta.nome || '';

    };

    //ano
    if (anoProducao){ 

        anoProducao.value = meta.ano || '';

    };

    //mes
    if (mesProducao){ 

        mesProducao.value = meta.mes || '';

    };

    //peridodo inicio
    if (diaInicioProducao){ 

        diaInicioProducao.value = meta.periodo_inicio || '';

    };

    //perido final
    if (diaFinalProducao){ 

        diaFinalProducao.value = meta.periodo_final || '';

    };

    //demanda
    if (metaProducao){ 

        metaProducao.value = meta.demanda || 0;

    };

    //producao atual
    if (atualProducao){ 

        atualProducao.value = meta.producao || 0;

    };

    
}
    
//função que salva a nova meta de produção
async function salvarMetaProducao(){ 
    
    //guardar os dados para enviar
    const novaProducao = {
        nome: nomeProducao.value,
        ano: anoProducao.value,
        mes: mesProducao.value,
        periodo_inicio: diaInicioProducao.value,
        periodo_final: diaFinalProducao.value,
        demanda: metaProducao.value,
        producao: atualProducao.value,
        status: "ok"
    }

    const calc = calcularStatusMeta(novaProducao);
    novaProducao.status = (calc.texto || 'OK').toLowerCase();

    
    let url;
    let method;
    let acao;
    const isEdicao = metaIdParaEdicao !== null;

    if (isEdicao) {
        // Se metaIdParaEdicao NÃO for nulo, estamos EDITANDO (PUT)
        url = `${API_BASE_URL}/${metaIdParaEdicao}`;
        method = 'PUT';
        acao = 'Editada';
    } else {
        // Se metaIdParaEdicao for nulo, estamos CRIANDO (POST)
        url = API_BASE_URL;
        method = 'POST';
        acao = 'cadastrada';
    }

    try{
        
        const resposta = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novaProducao)
        });

        if (!resposta.ok) { 
            throw new Error(`Erro ao ${isEdicao ? 'editar' : 'salvar'}. Status: ${resposta.status}`);
        }

        const producaoSalva = await resposta.json();
        console.log(`Dados ${acao}:`, producaoSalva); 
        alert(`Meta de Produção ${acao} com sucesso!`); 
        
        // Recarrega a tabela para mostrar o item atualizado/criado
        lerMetas();
        
        // Limpa o formulário apenas se foi criado um novo, pois o editar já fecha o modal.
        if (!isEdicao) {
            limparForm();
        }

    }
    catch(erro){
        console.error(`Falha ao ${isEdicao ? 'editar' : 'salvar'} a meta de produção:`, erro);
        alert(`Erro ao ${isEdicao ? 'editar' : 'salvar'} a meta: ${erro.message}`);
    }
}

//função de deletar meta de producao
async function deletarMetaProducao() {

    // ver se existe id
    if (!metaIdParaEdicao) {
        alert("Erro: ID da meta não encontrado para exclusão.");
        return;
    }

    // Confirmação de segurança antes de deletar
    if (!confirm("Tem certeza que deseja DELETAR permanentemente esta meta de produção?")) {
        return;
    }

    try {
        // juntar a URL para excluir 
        const urlCompleta = `${API_BASE_URL}/${metaIdParaEdicao}`;
        const resposta = await fetch(urlCompleta, {
            method: 'DELETE'
        });

        if (!resposta.ok) {
            throw new Error(`Erro ao deletar. Status: ${resposta.status}`);
        }
        
        alert('Meta de Produção deletada com sucesso!');
        
        // Limpa o ID e recarrega a tabela
        metaIdParaEdicao = null; 
        lerMetas();

    } catch (erro) {
        console.error('Falha ao deletar a meta:', erro);
        alert(`Erro ao deletar a meta: ${erro.message}`);
    }
}

//função para limpar o formulario para uso futuro
function limparForm(){

    nomeProducao.value = "";
    anoProducao.value = "Ano";
    mesProducao.value = "Mes";
    diaInicioProducao.value = "Dia inicial";
    diaFinalProducao.value = "Dia Final";
    metaProducao.value = "";
    atualProducao.value = "";

}

//função para listar os anos de acordo com o ano atual
//pois não é possivel criar metas no passado
function preencherAno(){

    let anoHoje = dataAtual.getFullYear(); 

    let optionHTM = `<option selected>Ano</option>`;

    for (let i = 0; i < 3; i++) {

        optionHTM += `<option value="${anoHoje}">${anoHoje}</option>`;

        anoHoje++;
    }
    
    anoProducao.innerHTML = optionHTM;
    filtroAno.innerHTML = optionHTM;

}

//ATENÇÂO criar função para deletar altomaticamente metas que não ja
//passaram algum tempo (ainda não definido)

//verificar os clics da tela 
tabelaPMP.addEventListener('click', (event) => {
    //verificar se o clique foi no seu botão de edição
    const btnInfoEditar = event.target.closest('.operacao-editar');
    
    if (btnInfoEditar) {
        //pegar o id do botão clicado
        const id = btnInfoEditar.getAttribute('data-meta-id');
        
        //configura o modal para o modo 'editar' antes de carregar
        configurarModal('editar');
        
        //chama a função que busca os dados e preenche o modal
        carregarMetaPorId(id);
    }
});

// Evento de abrir o modal para CRIAR
btnAbrirCriar.addEventListener('click', () => {
    limparForm();
    
    configurarModal('criar');
    
    preencherAno();
    
});

// Evento de abrir o modal para EDITAR
btnAbrirEditar.addEventListener('click', () => {
    preencherAno();

    configurarModal('editar');

});

// Evento de criar nova meta de produção
btnCriar.addEventListener('click', () => {
    salvarMetaProducao();
    
});

// Evento de editar meta de produção
btnEditar.addEventListener('click', () => {
    salvarMetaProducao();

});

// enento de deletar meta de producao
btnDeletar.addEventListener('click', () => {

    deletarMetaProducao();

});

//evento para listar apenas os itens de acordo com o filtro de ano
filtroAno.addEventListener('change', () => {
    
    lerMetas();
});

//evento para listar apenas os itens de acordo com o filtro de mes
filtroMes.addEventListener('change', () => {
    
    lerMetas();
});

document.addEventListener('DOMContentLoaded', function() {
    
    
    lerMetas();

    preencherAno();
    
});
