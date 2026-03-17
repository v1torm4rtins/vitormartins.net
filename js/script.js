const initSite = async () => {
  try {
    // 1. Dispara os carregamentos simultâneos
    const [headerRes, footerRes] = await Promise.all([
      fetch('header.html'),
      fetch('footer.html')
    ]);

    // 2. Extrai o conteúdo
    const headerHtml = await headerRes.text();
    const footerHtml = await footerRes.text();

    // 3. Injeta nos placeholders
    const hPlaceholder = document.getElementById('header-placeholder');
    const fPlaceholder = document.getElementById('footer-placeholder');

    if (hPlaceholder) hPlaceholder.innerHTML = headerHtml;
    if (fPlaceholder) fPlaceholder.innerHTML = footerHtml;

    // 4. Atualiza o ano (só agora que o footer existe no DOM)
    const yearElement = document.getElementById("ano-atual");
    if (yearElement) yearElement.textContent = new Date().getFullYear();

  } catch (err) {
    console.error('Erro ao montar a página:', err);
  } finally {
    // 5. O toque final: revela o site (seja com 0s ou 0.3s de fade)
    document.body.classList.add('loaded');
  }
};

document.addEventListener('DOMContentLoaded', initSite);