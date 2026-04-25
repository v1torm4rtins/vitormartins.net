import { loadComponents } from './components.js';
import { initSkills } from './inicio.js';

const initSite = async () => {
    try {
        // 1. Carrega o que é global (header/footer)
        await loadComponents();

        // 2. Carrega o que é específico da página atual
        if (document.querySelector('.software-skill-level')) {
            initSkills();
        }

    } catch (err) {
        console.error('Erro na inicialização:', err);
    } finally {
        document.body.classList.add('loaded');
    }
};

window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    header.classList.toggle('header-compact', window.scrollY > 50);
});

// Dispara quando o HTML básico estiver pronto
document.addEventListener('DOMContentLoaded', initSite);