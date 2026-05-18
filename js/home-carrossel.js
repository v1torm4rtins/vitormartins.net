const carrosselStates = {
    'carrossel-fe': 0,
    'carrossel-dg': 0
};

let isDragging = false;
let startX = 0;
let startY = 0;
let currentTrackId = null;
let foiArrastado = false;

window.moveCarrossel = moveCarrossel;

async function carregarCarrosseis() {
    try {
        const response = await fetch('./dados-projetos.json');
        const projetos = await response.json();

        renderizarCards(projetos, 'front-end', 'carrossel-fe');
        renderizarCards(projetos, 'design', 'carrossel-dg');

        configurarDrag('carrossel-fe');
        configurarDrag('carrossel-dg');

        configurarHoverSincronizado('carrossel-fe');
        configurarHoverSincronizado('carrossel-dg');
    } catch (e) {
        console.error("Erro ao carregar os projetos:", e);
    }
}

function renderizarCards(dados, categoria, elementId) {
    const container = document.getElementById(elementId);
    if (!container) return;

    // 1. Filtra pela categoria (front-end ou design)
    const filtrados = dados.filter(p => p.tipo === categoria);

    // 2. Limita a no máximo 10 itens mantendo a ordem original do JSON
    const limitados = filtrados.slice(0, 10);

    // 3. Renderiza apenas os 10 selecionados
    container.innerHTML = limitados.map((p, index) => `
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

    setTimeout(() => {
        atualizarEstadoVisual(elementId);
    }, 50);
}

function moveCarrossel(id, direcao) {
    const track = document.getElementById(id);
    if (!track) return;

    track.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';

    const isMobile = window.innerWidth < 768;
    const cardsPorVez = isMobile ? 1 : 2;
    carrosselStates[id] += direcao;
    const totalCards = track.querySelectorAll('.card-projeto-home').length;
    const maxIndex = totalCards - cardsPorVez;

    if (carrosselStates[id] < 0) carrosselStates[id] = 0;
    if (carrosselStates[id] > maxIndex) carrosselStates[id] = maxIndex;

    const card = track.querySelector('.card-projeto-home');
    if (card) {
        const cardWidth = card.offsetWidth;
        const gap = 30;
        const moveX = carrosselStates[id] * (cardWidth + gap);
        track.style.transform = `translateX(${-moveX}px)`;
    }
    atualizarEstadoVisual(id);
}

function atualizarEstadoVisual(id) {
    const track = document.getElementById(id);
    if (!track) return;
    const cards = track.querySelectorAll('.card-projeto-home');
    const isMobile = window.innerWidth < 768;
    const qtdAtiva = isMobile ? 1 : 2;
    const currentIndex = carrosselStates[id];

    cards.forEach((card, i) => {
        card.classList.remove('active', 'force-hover');
        if (i >= currentIndex && i < currentIndex + qtdAtiva) {
            card.classList.add('active');
        }
    });

    const prevBtn = document.querySelector(`.nav-home.prev[onclick*="${id}"]`);
    const nextBtn = document.querySelector(`.nav-home.next[onclick*="${id}"]`);

    if (prevBtn) {
        prevBtn.style.display = currentIndex <= 0 ? 'none' : 'flex';
        prevBtn.classList.remove('force-hover');
    }
    if (nextBtn) {
        const maxIndex = cards.length - qtdAtiva;
        nextBtn.style.display = currentIndex >= maxIndex ? 'none' : 'flex';
        nextBtn.classList.remove('force-hover');
    }
}

function configurarHoverSincronizado(id) {
    const track = document.getElementById(id);
    const prevBtn = document.querySelector(`.nav-home.prev[onclick*="${id}"]`);
    const nextBtn = document.querySelector(`.nav-home.next[onclick*="${id}"]`);

    const toggle = (direcao, ligar) => {
        const isMobile = window.innerWidth < 768;
        const index = carrosselStates[id];
        const targetIdx = (direcao === 'next') ? index + (isMobile ? 1 : 2) : index - 1;
        const card = track.querySelector(`.card-projeto-home[data-index="${targetIdx}"]`);
        const btn = (direcao === 'next') ? nextBtn : prevBtn;

        if (ligar) {
            if (btn) btn.classList.add('force-hover');
            if (card) card.classList.add('force-hover');
        } else {
            if (btn) btn.classList.remove('force-hover');
            if (card) card.classList.remove('force-hover');
        }
    };

    if (nextBtn) {
        nextBtn.addEventListener('mouseenter', () => toggle('next', true));
        nextBtn.addEventListener('mouseleave', () => toggle('next', false));
    }
    if (prevBtn) {
        prevBtn.addEventListener('mouseenter', () => toggle('prev', true));
        prevBtn.addEventListener('mouseleave', () => toggle('prev', false));
    }

    track.addEventListener('mouseover', (e) => {
        const card = e.target.closest('.card-projeto-home');
        if (card && !card.classList.contains('active')) {
            const idx = parseInt(card.getAttribute('data-index'));
            toggle(idx > carrosselStates[id] ? 'next' : 'prev', true);
        }
    });

    track.addEventListener('mouseout', () => {
        if (nextBtn) nextBtn.classList.remove('force-hover');
        if (prevBtn) prevBtn.classList.remove('force-hover');
        track.querySelectorAll('.card-projeto-home').forEach(c => c.classList.remove('force-hover'));
    });
}

function configurarDrag(id) {
    const track = document.getElementById(id);
    const mask = track.parentElement;

    const iniciarArrasto = (e) => {
        if (e.target.closest('.nav-home')) return;
        isDragging = true;
        currentTrackId = id;
        startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        startY = e.type.includes('mouse') ? e.pageY : e.touches[0].clientY;
        track.style.transition = 'none';
        foiArrastado = false;
        mask.classList.add('is-dragging');
    };

    const duranteArrasto = (e) => {
        if (!isDragging || currentTrackId !== id) return;
        const x = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        const walkX = x - startX;

        if (Math.abs(walkX) > 5) {
            if (e.cancelable) e.preventDefault();
            foiArrastado = true;
            const cardWidth = track.querySelector('.card-projeto-home').offsetWidth;
            const gap = 30;
            const currentMove = carrosselStates[id] * (cardWidth + gap);
            let finalMove = currentMove - walkX;
            track.style.transform = `translateX(${-finalMove}px)`;
        }
    };

    const finalizarArrasto = (e) => {
        if (!isDragging || currentTrackId !== id) return;
        isDragging = false;
        mask.classList.remove('is-dragging');
        track.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
        if (foiArrastado) {
            const endX = e.type.includes('mouse') ? e.pageX : (e.changedTouches ? e.changedTouches[0].clientX : startX);
            const diff = startX - endX;
            if (diff > 50) moveCarrossel(id, 1);
            else if (diff < -50) moveCarrossel(id, -1);
            else moveCarrossel(id, 0);
        }
        setTimeout(() => { foiArrastado = false; currentTrackId = null; }, 50);
    };

    mask.addEventListener('mousedown', iniciarArrasto);
    window.addEventListener('mousemove', duranteArrasto);
    window.addEventListener('mouseup', finalizarArrasto);
    mask.addEventListener('touchstart', iniciarArrasto, { passive: true });
    window.addEventListener('touchmove', duranteArrasto, { passive: false });
    window.addEventListener('touchend', finalizarArrasto);

    track.addEventListener('click', (e) => {
        if (foiArrastado) { e.preventDefault(); return; }
        const card = e.target.closest('.card-projeto-home');
        if (card && !card.classList.contains('active')) {
            e.preventDefault();
            const clickedIndex = parseInt(card.getAttribute('data-index'));
            moveCarrossel(id, clickedIndex > carrosselStates[id] ? 1 : -1);
        }
    });
}

carregarCarrosseis();

window.addEventListener('resize', () => {
    moveCarrossel('carrossel-fe', 0);
    moveCarrossel('carrossel-dg', 0);
});