const carrosselStates = {
    'carrossel-fe': 0,
    'carrossel-dg': 0
};

async function carregarCarrosseis() {
    const response = await fetch('./dados-projetos.json');
    const projetos = await response.json();

    renderizarCards(projetos, 'front-end', 'carrossel-fe');
    renderizarCards(projetos, 'design', 'carrossel-dg');
}

function renderizarCards(dados, categoria, elementId) {
    const container = document.getElementById(elementId);
    if (!container) return;

    const filtrados = dados.filter(p => p.tipo === categoria);

    container.innerHTML = filtrados.map(p => `
        <div class="card-projeto-home">
            <a href="projeto-${p.tipo}.html?id=${p.id}" class="card-content">
                <div class="thumb-wrapper">
                    <img src="${p.thumb}" alt="${p.titulo}">
                </div>
                <div class="card-text">
                    <h3>${p.titulo}</h3>
                </div>
            </a>
        </div>
    `).join('');

    atualizarFoco(elementId);
}

function moveCarrossel(id, direcao) {
    const track = document.getElementById(id);
    const cards = track.querySelectorAll('.card-projeto-home');

    if (cards.length === 0) return;

    carrosselStates[id] += direcao;

    // Limites
    if (carrosselStates[id] < 0) carrosselStates[id] = 0;
    if (carrosselStates[id] > cards.length - 2) carrosselStates[id] = cards.length - 2;

    // Cálculo: 520 (card) + 40 (gap) = 560
    const moveAmount = 560 * carrosselStates[id];

    track.style.transform = `translateX(-${moveAmount}px)`;
    atualizarFoco(id);
}

function atualizarFoco(id) {
    const track = document.getElementById(id);
    if (!track) return;

    const cards = track.querySelectorAll('.card-projeto-home');
    const index = carrosselStates[id];

    cards.forEach((card, i) => {
        card.classList.remove('active');
        if (i === index || i === index + 1) {
            card.classList.add('active');
        }
    });
}

carregarCarrosseis();

window.moveCarrossel = moveCarrossel;