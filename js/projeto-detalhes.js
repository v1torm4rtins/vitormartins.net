async function carregarProjeto() {
    const urlParams = new URLSearchParams(window.location.search);
    const projetoId = urlParams.get('id');

    const response = await fetch('./dados-projetos.json');
    const projetos = await response.json();
    const projeto = projetos.find(p => p.id === projetoId);

    if (projeto) {
        document.getElementById('projeto-titulo').textContent = projeto.titulo;
        document.getElementById('projeto-descricao').textContent = projeto.descricao;

        // Ícones de Tecnologia com o seu filtro de cor #dad3cd
        const containerTecs = document.getElementById('projeto-tecs');
        containerTecs.innerHTML = projeto.tecnologias.map(tec => `
            <img src="svg/${tec}-icon.svg" title="${tec}" alt="${tec}">
        `).join('');

        // Lógica de Carregamento baseada no formato (Design ou Front-end)
        const containerCarrossel = document.getElementById('container-carrossel');
        
        if (projeto.formato === "carrossel" && projeto.imagensGaleria) {
            // Injeta todas as imagens da galeria
            containerCarrossel.innerHTML = projeto.imagensGaleria.map(img => `
                <img src="${img}" alt="Arte do projeto">
            `).join('');

            // Ativa os botões do carrossel
            iniciarControlesCarrossel();
        } else if (projeto.formato === "scroll") {
            // Fallback para caso queira usar o mesmo JS no front-end
            const containerImagem = document.getElementById('container-imagem-scroll');
            if (containerImagem) {
                containerImagem.innerHTML = `<img src="${projeto.imagemFull}" alt="${projeto.titulo}">`;
            }
        }
    }
}

// Lógica de navegação do carrossel
function iniciarControlesCarrossel() {
    const container = document.getElementById('container-carrossel');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    let index = 0;

    nextBtn.addEventListener('click', () => {
        const totalImagens = container.querySelectorAll('img').length;
        if (index < totalImagens - 1) {
            index++;
            container.style.transform = `translateX(-${index * 100}%)`;
        } else {
            index = 0; // Volta ao início
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