//criação de cabeçalho nas paginas que precisam de um 
function insereHeader(){
    //constante que grarda o cabeçalho das paginas
    const codHeader = `<nav id="navbar">
            <div id="menu-desktop">
                <div id="cont-menu" class="logo-texto-menu" tabindex="0">
                    <img id="logo-menu" src="../img/logo_preto.png" alt="logo">
                    <p id="nome-empresa-menu">PCP Lite</p>
                </div>
                <ul id="lista-itens-menu">
                    <li id="identificacao" class="itens-menu">
                        <p>Usuário</p>
                    </li>
                    <li class="itens-menu">
                        <a class="botao-menu" href="login.html">
                            <span class="material-symbols-outlined">logout</span>
                            <span>Sair</span>
                        </a>
                    </li>
                </ul>
                <details class="header-actions">
                    <summary class="actions-toggle" aria-label="Abrir ações">
                        <span class="material-symbols-outlined">more_vert</span>
                    </summary>
                    <div class="actions-menu">
                        <button class="botao-menu" type="button" data-action="user">
                            <span class="material-symbols-outlined">person</span>
                            <span id="action-user-label">Usuário</span>
                        </button>
                        <a class="botao-menu" href="login.html">
                            <span class="material-symbols-outlined">logout</span>
                            <span>Sair</span>
                        </a>
                    </div>
                </details>
            </div>
        </nav>`;

    //criação do array com os id's dos headers que vou enviar o menu
    const idsDestino = [
        'header-index',
        'header-charles', 
        'header-operacional', 
        'header-tatico',
        'header-matheus',
        'header-christiano',
        'header-thiago',
        'header-dire',
        'header-joao'
    ];

    //itera sobre o array e insere o código em cada elemento
    idsDestino.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) { 
            elemento.innerHTML = codHeader;
        }
    });

    try {
        const dado = localStorage.getItem('usuarioAutenticado');
        const usuario = dado ? JSON.parse(dado) : null;
        const p = document.querySelector('#identificacao p');
        if (p && usuario && usuario.nome) p.textContent = usuario.nome;
        const lbl = document.getElementById('action-user-label');
        if (lbl && usuario && usuario.nome) lbl.textContent = usuario.nome;
    } catch {}

}

//função para inserir o menu em cada pagina
function insereMenu(){

    // não exibe menu em index nem em login
    const isIndex = !!document.getElementById('header-index');
    const isLogin = !!document.getElementById('header-login');
    if (isIndex || isLogin) {
        const existing = document.getElementById('menu-container');
        if (existing) {
            existing.innerHTML = '';
            existing.style.display = 'none';
        }
        document.body.classList.remove('has-menu');
        return;
    }

    const codMenu = `
            <nav id="nav-bar" aria-label="Menu lateral">
                <div id="nav-header">
                    <a id="nav-title" href="index.html" aria-label="Ir para início">
                        <img class="nav-logo" src="../img/logo_preto.png" alt="PCP Lite">
                        <span class="brand-text">PCP Lite</span>
                    </a>
                    <label for="menu-toggle" class="nav-toggle" aria-label="Alternar exibição do menu" aria-controls="nav-content" aria-expanded="true" role="button">
                        <span id="nav-burger"></span>
                    </label>
                </div>
                <div id="nav-content" role="navigation">
                    <a class="nav-button" href="estrategico.html">
                        <span class="material-symbols-outlined">finance</span>
                        <span class="nav-label">Estratégico</span>
                    </a>
                    <a class="nav-button" href="tatico.html">
                        <span class="material-symbols-outlined">timeline</span>
                        <span class="nav-label">Tático</span>
                    </a>
                    <a class="nav-button" href="operacional.html">
                        <span class="material-symbols-outlined">build</span>
                        <span class="nav-label">Operacional</span>
                    </a>
                    <hr>
                    <a class="nav-button" href="#">
                        <span class="material-symbols-outlined">person</span>
                        <span id="nav-user-label" class="nav-label">Usuário</span>
                    </a>
                </div>
            </nav>`;

    ensureMenuToggle();
    ensureFloatingToggle();
    const container = ensureMenuContainer();
    const savedCollapsed = localStorage.getItem('menuCollapsed') === 'true';
    document.body.classList.toggle('menu-collapsed', !!savedCollapsed);
    document.body.classList.toggle('menu-expanded', !savedCollapsed);
    if (savedCollapsed) container.classList.add('collapsed');
    container.innerHTML = codMenu;
    document.body.classList.add('has-menu');
    applyMenuCollapsedStateFromStorage();
    attachNavToggleHandler();

    const atual = window.location.pathname.split('/').pop();
    const links = container.querySelectorAll('.nav-button, .botoes-dashboard');
    links.forEach(link => {
        if (link.getAttribute('href') === atual) {
            link.classList.add('ativo');
            link.setAttribute('aria-current', 'page');
        }
    });

    try {
        const dado = localStorage.getItem('usuarioAutenticado');
        const usuario = dado ? JSON.parse(dado) : null;
        const navLbl = container.querySelector('#nav-user-label');
        if (navLbl && usuario && usuario.nome) navLbl.textContent = usuario.nome;
    } catch {}
}

// garante que exista um contêiner para o menu e  cria se faltar
function ensureMenuContainer(){
    let container = document.getElementById('menu-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'menu-container';
        container.className = 'content';
        const header = document.querySelector('header');
        if (header) {
            header.insertAdjacentElement('afterend', container);
        } else {
            document.body.prepend(container);
        }
    }
    return container;
}

// garante o checkbox de toggle do menu (para controle puramente via CSS em mobile)
function ensureMenuToggle(){
    let toggle = document.getElementById('menu-toggle');
    if (!toggle){
        toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.id = 'menu-toggle';
        toggle.className = 'menu-toggle';
        document.body.prepend(toggle);
    }
}

function ensureFloatingToggle(){
    let floatToggle = document.getElementById('menu-floating-toggle');
    if (!floatToggle){
        floatToggle = document.createElement('label');
        floatToggle.id = 'menu-floating-toggle';
        floatToggle.className = 'menu-floating-toggle';
        floatToggle.setAttribute('for','menu-toggle');
        floatToggle.setAttribute('aria-label','Abrir menu');
        const icon = document.createElement('span');
        icon.className = 'material-symbols-outlined';
        icon.textContent = 'menu';
        floatToggle.appendChild(icon);
        document.body.prepend(floatToggle);
    }
}

function getIsDesktop(){
    return window.innerWidth >= 993;
}

function applyMenuCollapsedStateFromStorage(){
    const saved = localStorage.getItem('menuCollapsed');
    const collapsed = saved === 'true';
    setMenuCollapsed(collapsed, true);
}

function setMenuCollapsed(collapsed, initial){
    const container = document.getElementById('menu-container');
    if (!container) return;
    const navBar = container.querySelector('#nav-bar');
    const label = container.querySelector('.nav-toggle');
    if (getIsDesktop()){
        navBar.classList.toggle('collapsed', !!collapsed);
        container.classList.toggle('collapsed', !!collapsed);
        document.body.classList.toggle('menu-collapsed', !!collapsed);
        document.body.classList.toggle('menu-expanded', !collapsed);
        if (label) label.setAttribute('aria-expanded', (!collapsed).toString());
        if (!initial) localStorage.setItem('menuCollapsed', (!!collapsed).toString());
    } else {
        navBar.classList.remove('collapsed');
        container.classList.remove('collapsed');
        document.body.classList.remove('menu-collapsed');
        document.body.classList.remove('menu-expanded');
    }
}

function attachNavToggleHandler(){
    const container = document.getElementById('menu-container');
    if (!container) return;
    const label = container.querySelector('.nav-toggle');
    const checkbox = document.getElementById('menu-toggle');
    function onClick(e){
        if (getIsDesktop()){
            e.preventDefault();
            const current = localStorage.getItem('menuCollapsed') === 'true';
            setMenuCollapsed(!current);
        } else {
            if (checkbox) checkbox.checked = !checkbox.checked;
            const expanded = checkbox && checkbox.checked;
            if (label) label.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        }
    }
    if (label) label.addEventListener('click', onClick);
    window.addEventListener('resize', function(){
        applyMenuCollapsedStateFromStorage();
    });
}

//direciona para a pagina de menu qunado clicar na logo
document.addEventListener('click', function(event){
    const t = event.target;
    // Define os IDs que você quer que funcionem
    const idsPermitidos = ['logo-menu', 'nome-empresa-menu', 'identificacao'];
    
    // Verifica se existe um alvo e se a lista de IDs permitidos inclui o ID do alvo
    if (t && idsPermitidos.includes(t.id)) {
        if (t.id === 'identificacao') {
            try { localStorage.removeItem('usuarioAutenticado'); } catch {}
            window.location.href = 'login.html';
        } else {
            window.location.href = 'index.html';
        }
    }
    // delega para botões com data-action
    const btn = t.closest && t.closest('[data-action]');
    if (btn) {
        const action = btn.getAttribute('data-action');
        if (action === 'logout') {
            try { localStorage.removeItem('usuarioAutenticado'); } catch {}
            window.location.href = 'login.html';
        } else if (action === 'user') {
            try { localStorage.removeItem('usuarioAutenticado'); } catch {}
            window.location.href = 'login.html';
        }
    }

    const anchorLogout = t.closest && t.closest('a.botao-menu[href="login.html"]');
    if (anchorLogout) {
        try { localStorage.removeItem('usuarioAutenticado'); } catch {}
    }
});

//chamar função de inserir o cabeçalho em todas as paginas
document.addEventListener('DOMContentLoaded', insereHeader);
document.addEventListener('DOMContentLoaded', insereMenu);
