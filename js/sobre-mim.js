document.addEventListener('DOMContentLoaded', () => {

    // 1. LÓGICA DO ACCORDION (FECHAR TODOS OS OUTROS AO ABRIR UM)
    // Selecionamos tanto o .accordion-header quanto o .accordion-card (gatilhos)
    const gatilhos = document.querySelectorAll('.accordion-header, .accordion-card');

    gatilhos.forEach(gatilho => {
        gatilho.addEventListener('click', () => {
            // Encontra o pai correto (seja ele de skill ou de experiência)
            const currentItem = gatilho.closest('.accordion-item, .accordion-simple-item');
            const isOpen = currentItem.classList.contains('active');

            // Primeiro: Fecha absolutamente todos os itens da página
            document.querySelectorAll('.accordion-item, .accordion-simple-item').forEach(item => {
                item.classList.remove('active');
            });

            // Segundo: Se o item clicado não estava aberto, abre ele
            if (!isOpen) {
                currentItem.classList.add('active');
            }
        });
    });

    // 2. ANIMAÇÃO DAS BARRAS (CARREGA JUNTO COM A PÁGINA)
    document.querySelectorAll('.software-skill-level').forEach(barra => {
        const porcentagem = barra.getAttribute('data-level');
        if (porcentagem) {
            setTimeout(() => {
                barra.style.width = porcentagem;
            }, 500);
        }
    });

});