async function carregarProjetos() {
    const response = await fetch('./dados-projetos.json');
    const projetos = await response.json();
    return projetos;
}

function renderizarCards(projetos, containerId, filtroTipo) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const filtrados = projetos.filter(p => p.tipo === filtroTipo);

    container.innerHTML = filtrados.map(projeto => `
        <div class="card-projeto" data-categoria='${JSON.stringify(projeto.categoria)}'>
            <a href="projeto-${projeto.tipo}.html?id=${projeto.id}" class="card-link">
                <div class="card-content">
                    <div class="thumb-wrapper">
                        <img src="${projeto.thumb}" alt="${projeto.titulo}">
                    </div>
                    <div class="card-text">
                        <h3>${projeto.titulo}</h3>
                    </div>
                </div>
            </a>
        </div>
    `).join('');
}

function configurarFiltros() {
    const botoes = document.querySelectorAll('.btn-filtro');
    botoes.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active apenas do grupo de botões atual
            const pai = btn.parentElement;
            pai.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filtro = btn.getAttribute('data-filter');
            // Seleciona os cards pertencentes à seção desse grupo de filtros
            const secao = btn.closest('section');
            const cards = secao.querySelectorAll('.card-projeto');

            cards.forEach(card => {
                const categoriasDoCard = JSON.parse(card.getAttribute('data-categoria'));

                if (filtro === 'all' || categoriasDoCard.includes(filtro)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

carregarProjetos().then(projetos => {
    renderizarCards(projetos, 'lista-projetos-websites', 'websites');
    renderizarCards(projetos, 'lista-projetos-designs', 'designs');
    configurarFiltros();
}).catch(erro => {
    console.error("Erro ao inicializar portfólio:", erro);
});