async function carregarProjeto() {
    const urlParams = new URLSearchParams(window.location.search);
    const projetoId = urlParams.get('id');

    const response = await fetch('./dados-projetos.json');
    const projetos = await response.json();
    const projeto = projetos.find(p => p.id === projetoId);

    if (projeto) {
        document.getElementById('projeto-titulo').textContent = projeto.titulo;
        document.getElementById('projeto-descricao').textContent = projeto.descricao;

        // Ícones de Tecnologia
        const containerTecs = document.getElementById('projeto-tecs');
        containerTecs.innerHTML = projeto.tecnologias.map(tec => `
            <img src="svg/${tec}-icon.svg" title="${tec}" alt="${tec}">
        `).join('');

        // Lógica de Carregamento baseada no formato
        const containerCarrossel = document.getElementById('container-carrossel');

        if (projeto.formato === "carrossel" && projeto.imagensGaleria) {
            containerCarrossel.innerHTML = projeto.imagensGaleria.map(img => `
                <img src="${img}" alt="Arte do projeto">
            `).join('');
            iniciarControlesCarrossel();
        } else if (projeto.formato === "scroll") {
            const containerImagem = document.getElementById('container-imagem-scroll');
            if (containerImagem) {
                containerImagem.innerHTML = `<img src="${projeto.imagemFull}" alt="${projeto.titulo}">`;
            }
        }

        // CARREGA OS RELACIONADOS AQUI
        renderizarRelacionados(projetos, projeto);
    }
}

// Função para filtrar e mostrar os 3 projetos relacionados
function renderizarRelacionados(todosProjetos, projetoAtual) {
    const container = document.getElementById('lista-relacionados');
    if (!container) return;

    // Filtra pela mesma categoria (tipo) e remove o projeto atual da lista
    let filtrados = todosProjetos.filter(p => p.tipo === projetoAtual.tipo && p.id !== projetoAtual.id);

    // Embaralha a lista para ser aleatório
    filtrados = shuffleArray(filtrados);

    // Pega os 3 primeiros
    const selecionados = filtrados.slice(0, 3);

    container.innerHTML = selecionados.map(p => `
        <div class="card-projeto">
            <a href="projeto-${p.tipo}.html?id=${p.id}" class="card-link">
                <div class="card-content">
                    <div class="thumb-wrapper">
                        <img src="${p.thumb}" alt="${p.titulo}">
                    </div>
                    <div class="card-text">
                        <h3>${p.titulo}</h3>
                    </div>
                </div>
            </a>
        </div>
    `).join('');
}

// Função auxiliar para embaralhar
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Lógica de navegação do carrossel
function iniciarControlesCarrossel() {
    const container = document.getElementById('container-carrossel');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    let index = 0;

    if (!nextBtn || !prevBtn) return;

    nextBtn.addEventListener('click', () => {
        const totalImagens = container.querySelectorAll('img').length;
        if (index < totalImagens - 1) {
            index++;
            container.style.transform = `translateX(-${index * 100}%)`;
        } else {
            index = 0;
            container.style.transform = `translateX(0)`;
        }
    });

    prevBtn.addEventListener('click', () => {
        if (index > 0) {
            index--;
            container.style.transform = `translateX(-${index * 100}%)`;
        }
    });
}

carregarProjeto();