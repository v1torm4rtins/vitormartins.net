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
        
        // Ativa a sincronização de hover
        configurarHoverSincronizado('carrossel-fe');
        configurarHoverSincronizado('carrossel-dg');
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
    atualizarEstadoVisual(elementId);
}

function moveCarrossel(id, direcao) {
    const track = document.getElementById(id);
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
    const maxIndex = cards.length - qtdAtiva;
    const currentIndex = carrosselStates[id];

    cards.forEach((card, i) => {
        card.classList.remove('active');
        card.classList.remove('force-hover'); // Limpa hover forçado ao mover
        if (i >= currentIndex && i < currentIndex + qtdAtiva) {
            card.classList.add('active');
        }
    });

    const prevBtn = document.querySelector(`.nav-home.prev[onclick*="${id}"]`);
    const nextBtn = document.querySelector(`.nav-home.next[onclick*="${id}"]`);
    if (prevBtn) prevBtn.style.display = currentIndex <= 0 ? 'none' : 'flex';
    if (nextBtn) nextBtn.style.display = currentIndex >= maxIndex ? 'none' : 'flex';
}

// --- NOVA FUNÇÃO DE SINCRONIZAÇÃO DE HOVER ---
function configurarHoverSincronizado(id) {
    const track = document.getElementById(id);
    const prevBtn = document.querySelector(`.nav-home.prev[onclick*="${id}"]`);
    const nextBtn = document.querySelector(`.nav-home.next[onclick*="${id}"]`);

    const toggleHover = (btn, direcao, state) => {
        if (!btn) return;
        const isMobile = window.innerWidth < 768;
        const targetIndex = direcao === 'next' 
            ? carrosselStates[id] + (isMobile ? 1 : 2) 
            : carrosselStates[id] - 1;

        const targetCard = track.querySelector(`.card-projeto-home[data-index="${targetIndex}"]`);
        
        if (state === 'on') {
            btn.classList.add('force-hover');
            if (targetCard) targetCard.classList.add('force-hover');
        } else {
            btn.classList.remove('force-hover');
            if (targetCard) targetCard.classList.remove('force-hover');
        }
    };

    // Hover nas Setas -> Afeta os Cards
    if (nextBtn) {
        nextBtn.addEventListener('mouseenter', () => toggleHover(nextBtn, 'next', 'on'));
        nextBtn.addEventListener('mouseleave', () => toggleHover(nextBtn, 'next', 'off'));
    }
    if (prevBtn) {
        prevBtn.addEventListener('mouseenter', () => toggleHover(prevBtn, 'prev', 'on'));
        prevBtn.addEventListener('mouseleave', () => toggleHover(prevBtn, 'prev', 'off'));
    }

    // Hover nos Cards com Blur -> Afeta as Setas
    track.addEventListener('mouseover', (e) => {
        const card = e.target.closest('.card-projeto-home');
        if (card && !card.classList.contains('active')) {
            const index = parseInt(card.getAttribute('data-index'));
            if (index > carrosselStates[id]) {
                toggleHover(nextBtn, 'next', 'on');
            } else {
                toggleHover(prevBtn, 'prev', 'on');
            }
        }
    });

    track.addEventListener('mouseout', (e) => {
        const card = e.target.closest('.card-projeto-home');
        if (card) {
            toggleHover(nextBtn, 'next', 'off');
            toggleHover(prevBtn, 'prev', 'off');
        }
    });
}

function configurarDrag(id) {
    const track = document.getElementById(id);
    const mask = track.parentElement;

    const iniciarArrasto = (e) => {
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
        const y = e.type.includes('mouse') ? e.pageY : e.touches[0].clientY;
        const walkX = x - startX;
        const walkY = y - startY;

        if (e.type.includes('touch') && Math.abs(walkY) > Math.abs(walkX)) {
            isDragging = false;
            return;
        }

        if (Math.abs(walkX) > 5) {
            if (e.cancelable) e.preventDefault(); 
            foiArrastado = true;
            const card = track.querySelector('.card-projeto-home');
            const cardWidth = card.offsetWidth;
            const gap = 30;
            const currentMove = carrosselStates[id] * (cardWidth + gap);
            let finalMove = currentMove - walkX;
            const maxLimit = (track.querySelectorAll('.card-projeto-home').length - (window.innerWidth < 768 ? 1 : 2)) * (cardWidth + gap);
            
            if (finalMove < 0) finalMove = finalMove * 0.3;
            else if (finalMove > maxLimit) finalMove = maxLimit + ((finalMove - maxLimit) * 0.3);

            track.style.transform = `translateX(${-finalMove}px)`;
        }
    };

    const finalizarArrasto = (e) => {
        if (!isDragging || currentTrackId !== id) return;
        isDragging = false;
        mask.classList.remove('is-dragging');
        track.style.transition = 'transform 0.6s cubic-bezier(0.2, 1, 0.3, 1)';
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
        const link = e.target.closest('a.card-content');
        if (!link) return;
        const card = link.closest('.card-projeto-home');
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