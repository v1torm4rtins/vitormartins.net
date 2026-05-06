async function carregarProjeto() {
    const urlParams = new URLSearchParams(window.location.search);
    const projetoId = urlParams.get('id');

    const response = await fetch('./dados-projetos.json');
    const projetos = await response.json();
    const projeto = projetos.find(p => p.id === projetoId);

    if (projeto) {
        document.getElementById('projeto-titulo').textContent = projeto.titulo;
        document.getElementById('projeto-descricao').textContent = projeto.descricao;

        // --- CORREÇÃO DO BOTÃO ACESSAR SITE ONLINE ---
        const btnLink = document.getElementById('btn-link-projeto');
        if (btnLink) {
            if (projeto.linkOnline) {
                btnLink.href = projeto.linkOnline;
                btnLink.style.display = 'flex';
            } else {
                btnLink.style.display = 'none';
            }
        }

        const containerTecs = document.getElementById('projeto-tecs');
        if (containerTecs) {
            containerTecs.innerHTML = projeto.tecnologias.map(tec => `
                <img src="svg/${tec}-icon.svg" title="${tec}" alt="${tec}">
            `).join('');
        }

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
        renderizarRelacionados(projetos, projeto);
    }
}

function renderizarRelacionados(todosProjetos, projetoAtual) {
    const container = document.getElementById('lista-relacionados');
    if (!container) return;
    let filtrados = todosProjetos.filter(p => p.tipo === projetoAtual.tipo && p.id !== projetoAtual.id);
    filtrados = shuffleArray(filtrados).slice(0, 3);
    container.innerHTML = filtrados.map(p => `
        <div class="card-projeto">
            <a href="projeto-${p.tipo}.html?id=${p.id}" class="card-link">
                <div class="card-content">
                    <div class="thumb-wrapper">
                        <img src="${p.thumb}" alt="${p.titulo}">
                    </div>
                    <div class="card-text"><h3>${p.titulo}</h3></div>
                </div>
            </a>
        </div>
    `).join('');
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function iniciarControlesCarrossel() {
    const container = document.getElementById('container-carrossel');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    let index = 0;
    if (!container || !nextBtn || !prevBtn) return;
    container.style.transition = 'transform 0.5s ease-in-out';
    nextBtn.addEventListener('click', () => {
        const total = container.querySelectorAll('img').length;
        index = (index < total - 1) ? index + 1 : 0;
        container.style.transform = `translateX(-${index * 100}%)`;
    });
    prevBtn.addEventListener('click', () => {
        if (index > 0) {
            index--;
            container.style.transform = `translateX(-${index * 100}%)`;
        }
    });
}
carregarProjeto();