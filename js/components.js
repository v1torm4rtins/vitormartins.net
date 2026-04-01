export const loadComponents = async () => {
    const [headerRes, footerRes] = await Promise.all([
        fetch('header.html'),
        fetch('footer.html')
    ]);

    const headerHtml = await headerRes.text();
    const footerHtml = await footerRes.text();

    document.getElementById('header-placeholder').innerHTML = headerHtml;
    document.getElementById('footer-placeholder').innerHTML = footerHtml;

    // Atualiza o ano no footer após carregar
    const yearElement = document.getElementById("ano-atual");
    if (yearElement) yearElement.textContent = new Date().getFullYear();
};