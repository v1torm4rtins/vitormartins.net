// 1. Função para carregar os dados do JSON
async function carregarProjetos() {
    const response = await fetch('./dados-projetos.json');
    const projetos = await response.json();
    return projetos;
}

// 2. Função para renderizar os cards na listagem (Páginas Front-end e Design)
function renderizarCards(projetos, containerId, filtroTipo) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Filtra pelo tipo (front ou design)
    const filtrados = projetos.filter(p => p.tipo === filtroTipo);

    container.innerHTML = filtrados.map(projeto => `
        <div class="card-projeto card-${projeto.tipo}" data-categoria="${projeto.categoria}">
            <a href="projeto-${projeto.tipo}.html?id=${projeto.id}">
                <div class="thumb-wrapper">
                    <img src="${projeto.thumb}" alt="${projeto.titulo}">
                </div>
                <h3>${projeto.titulo}</h3>
            </a>
        </div>
    `).join('');
}

// 3. Lógica dos Filtros (clicar e esconder)
function configurarFiltros() {
    const botoes = document.querySelectorAll('.btn-filtro');
    botoes.forEach(btn => {
        btn.addEventListener('click', () => {
            const filtro = btn.getAttribute('data-filter');
            const cards = document.querySelectorAll('.card-projeto');

            cards.forEach(card => {
                if (filtro === 'all' || card.getAttribute('data-categoria') === filtro) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Iniciar tudo ao carregar a página
carregarProjetos().then(projetos => {
    // Se estiver na página de front-end
    renderizarCards(projetos, 'lista-projetos-front', 'front-end');
    // Se estiver na página de design
    renderizarCards(projetos, 'lista-projetos-design', 'design');
    
    configurarFiltros();
});