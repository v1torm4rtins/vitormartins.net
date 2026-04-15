const carrosselStates = {
    'carrossel-fe': 0,
    'carrossel-dg': 0
};

let isDragging = false;
let startX = 0;
let currentTrackId = null;
let foiArrastado = false;

async function carregarCarrosseis() {
    try {
        const response = await fetch('./dados-projetos.json');
        const projetos = await response.json();

        renderizarCards(projetos, 'front-end', 'carrossel-fe');
        renderizarCards(projetos, 'design', 'carrossel-dg');

        configurarDrag('carrossel-fe');
        configurarDrag('carrossel-dg');
    } catch (e) {
        console.error("Erro ao carregar os projetos:", e);
    }
}

function renderizarCards(dados, categoria, elementId) {
    const container = document.getElementById(elementId);
    if (!container) return;

    const filtrados = dados.filter(p => p.tipo === categoria);

    container.innerHTML = filtrados.map((p, index) => `
        <div class="card-projeto-home" data-index="${index}">
            <a href="projeto-${p.tipo}.html?id=${p.id}" class="card-content" draggable="false">
                <div class="thumb-wrapper">
                    <img src="${p.thumb}" alt="${p.titulo}" draggable="false">
                </div>
                <div class="card-text">
                    <h3>${p.titulo}</h3>
                </div>
            </a>
        </div>
    `).join('');

    atualizarFoco(elementId);
    configurarInteracaoCards(elementId);
}

function configurarInteracaoCards(id) {
    const track = document.getElementById(id);
    const wrapper = track.closest('.wrapper-carrossel-home');
    const btnPrev = wrapper.querySelector('.nav-home.prev');
    const btnNext = wrapper.querySelector('.nav-home.next');
    const cards = track.querySelectorAll('.card-projeto-home');

    cards.forEach((card, index) => {
        card.addEventListener('mouseenter', () => {
            if (card.classList.contains('active')) return;
            const indexAtivo = carrosselStates[id];
            if (index < indexAtivo) btnPrev.classList.add('highlight-red');
            else if (index > indexAtivo + 1) btnNext.classList.add('highlight-red');
        });

        card.addEventListener('mouseleave', () => {
            btnPrev.classList.remove('highlight-red');
            btnNext.classList.remove('highlight-red');
        });

        card.addEventListener('click', (e) => {
            if (foiArrastado) {
                e.preventDefault();
                return;
            }

            if (!card.classList.contains('active')) {
                e.preventDefault();
                const indexAtivo = carrosselStates[id];
                if (index < indexAtivo) moveCarrossel(id, -1);
                else if (index > indexAtivo + 1) moveCarrossel(id, 1);
            }
        });
    });
}

function moveCarrossel(id, direcao) {
    const track = document.getElementById(id);
    const cards = track.querySelectorAll('.card-projeto-home');
    if (cards.length === 0) return;

    carrosselStates[id] += direcao;

    if (carrosselStates[id] < 0) carrosselStates[id] = 0;
    if (carrosselStates[id] > cards.length - 2) carrosselStates[id] = cards.length - 2;

    const moveAmount = 560 * carrosselStates[id];
    track.style.transition = 'transform 0.6s cubic-bezier(0.2, 1, 0.3, 1)';
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

    const wrapper = track.closest('.wrapper-carrossel-home');
    if (wrapper) {
        const btnPrev = wrapper.querySelector('.nav-home.prev');
        const btnNext = wrapper.querySelector('.nav-home.next');
        if (index === 0) btnPrev.classList.add('disabled');
        else btnPrev.classList.remove('disabled');
        if (index >= cards.length - 2) btnNext.classList.add('disabled');
        else btnNext.classList.remove('disabled');
    }
}

function configurarDrag(id) {
    const track = document.getElementById(id);
    const mask = track.closest('.track-mask');
    if (!track || !mask) return;

    mask.addEventListener('mousedown', (e) => {
        isDragging = true;
        foiArrastado = false;
        currentTrackId = id;
        startX = e.pageX;
        mask.classList.add('is-dragging');
        track.style.transition = 'none';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging || currentTrackId !== id) return;

        const x = e.pageX;
        const walk = (startX - x);
        const cards = track.querySelectorAll('.card-projeto-home');

        if (Math.abs(walk) > 10) foiArrastado = true;

        if (foiArrastado) {
            e.preventDefault();
            const baseMove = 560 * carrosselStates[id];
            let finalMove = baseMove + walk;
            const maxLimit = 560 * (cards.length - 2);

            // LOGICA CORRIGIDA DO CHICOTE
            if (finalMove < 0) {
                // Puxando para a direita no começo (finalMove fica negativo)
                // Usamos 0.3 de resistência para permitir o movimento
                finalMove = finalMove * 0.3;
            } else if (finalMove > maxLimit) {
                // Puxando para a esquerda no final
                const excesso = finalMove - maxLimit;
                finalMove = maxLimit + (excesso * 0.3);
            }

            track.style.transform = `translateX(${-finalMove}px)`;
        }
    });

    const finalizarArrasto = (e) => {
        if (!isDragging || currentTrackId !== id) return;

        isDragging = false;
        mask.classList.remove('is-dragging');
        track.style.transition = 'transform 0.6s cubic-bezier(0.2, 1, 0.3, 1)';

        if (foiArrastado) {
            const endX = e.pageX || startX;
            const diff = startX - endX;

            if (diff > 100) moveCarrossel(id, 1);
            else if (diff < -100) moveCarrossel(id, -1);
            else moveCarrossel(id, 0);
        }

        setTimeout(() => {
            foiArrastado = false;
            currentTrackId = null;
        }, 50);
    };

    window.addEventListener('mouseup', finalizarArrasto);
    window.addEventListener('mouseleave', finalizarArrasto);

    track.addEventListener('click', (e) => {
        if (foiArrastado) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);
}

carregarCarrosseis();
window.moveCarrossel = moveCarrossel;