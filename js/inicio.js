export const initSkills = () => {
    const barras = document.querySelectorAll('.software-skill-level');

    setTimeout(() => {
        barras.forEach(barra => {
            const porcentagem = barra.getAttribute('data-level');
            if (porcentagem) barra.style.width = porcentagem;
        });
    }, 100);
};