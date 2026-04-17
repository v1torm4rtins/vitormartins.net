document.addEventListener('DOMContentLoaded', () => {

    // 1. LÓGICA DO ACCORDION (FECHAR TODOS OS OUTROS AO ABRIR UM)
    const headers = document.querySelectorAll('.accordion-header');

    headers.forEach(header => {
        header.addEventListener('click', () => {
            const currentItem = header.parentElement;
            const isOpen = currentItem.classList.contains('active');

            // Primeiro: Fecha todos os itens da página (de ambas as colunas)
            document.querySelectorAll('.accordion-item').forEach(item => {
                item.classList.remove('active');
            });

            // Segundo: Se o item que você clicou não estava aberto, ele abre agora
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
            }, 500); // Meio segundo de delay só para o usuário ver o movimento
        }
    });

});