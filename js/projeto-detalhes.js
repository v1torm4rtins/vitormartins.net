// Variáveis Globais do Lightbox para a Galeria
let lightboxImagesArray = [];
let currentLightboxIndex = 0;

window.fecharLightbox = fecharLightbox;
window.mudarImagemLightbox = mudarImagemLightbox;
window.abrirLightbox = abrirLightbox;

// Função auxiliar para converter qualquer link do YouTube (Normal ou Shorts) em Embed válido
function obterEmbedYoutube(url) {
    if (!url) return '';
    let videoId = '';

    if (url.includes('/shorts/')) {
        videoId = url.split('/shorts/')[1].split(/[?#]/)[0];
    } else if (url.includes('v=')) {
        videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split(/[?#]/)[0];
    } else if (url.includes('/embed/')) {
        return url;
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

async function carregarProjeto() {
    const urlParams = new URLSearchParams(window.location.search);
    const projetoId = urlParams.get('id');

    if (!projetoId) {
        console.error("ID do projeto não encontrado na URL.");
        return;
    }

    // Configura o Worker do PDF.js (CDN JsDelivr)
    if (typeof window !== 'undefined' && 'pdfjsLib' in window) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    }

    try {
        const response = await fetch('./dados-projetos.json');
        const projetos = await response.json();
        const projeto = projetos.find(p => p.id === projetoId);

        if (projeto) {
            // Título e Descrição
            const txtTitulo = document.getElementById('projeto-titulo');
            const txtDescricao = document.getElementById('projeto-descricao');
            if (txtTitulo) txtTitulo.textContent = projeto.titulo;
            if (txtDescricao) txtDescricao.textContent = projeto.descricao;

            // Botão de acesso ao site online
            const btnLink = document.querySelector('.button-open-site') || document.getElementById('btn-link-projeto');
            if (btnLink) {
                if (projeto.linkOnline) {
                    btnLink.href = projeto.linkOnline;
                    btnLink.style.display = 'inline-flex';
                    btnLink.style.width = 'max-content'; // Impede o botão de esticar a tela inteira
                } else {
                    btnLink.style.display = 'none';
                }
            }

            // ERRO 1 CORRIGIDO: Tecnologias (Removido o 'logo-' que estava quebrando o caminho)
            const containerTecnologias = document.querySelector('.icones-tecnologias');
            if (containerTecnologias && projeto.tecnologias) {
                containerTecnologias.innerHTML = projeto.tecnologias.map(tec => `
                    <img src="svg/${tec}-icon.svg" alt="${tec}" title="${tec.toUpperCase()}">
                `).join('');
            }

            // Renderização de Mídia
            const moldura = document.querySelector('.moldura-pc');
            const containerMosaico = document.getElementById('container-mosaico-pdf');

            // --- FORMATO 1: SCROLL ---
            if (projeto.formato === 'scroll') {
                if (moldura && projeto.imagemFull) {
                    moldura.style.display = 'block';
                    moldura.style.overflowY = 'scroll';
                    moldura.innerHTML = `<img src="${projeto.imagemFull}" alt="${projeto.titulo}" style="width: 100%; height: auto; display: block;">`;
                }
                if (containerMosaico) containerMosaico.style.display = 'none';
            }

            // --- FORMATO 2: VÍDEO ---
            else if (projeto.formato === 'video') {
                if (moldura && projeto.videoUrl) {
                    moldura.style.display = 'flex';
                    moldura.style.backgroundColor = 'var(--black-color)';
                    moldura.style.overflow = 'hidden';

                    const embedUrl = obterEmbedYoutube(projeto.videoUrl);

                    moldura.innerHTML = `
                        <iframe src="${embedUrl}" title="${projeto.titulo}" frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            allowfullscreen style="aspect-ratio: 16/9; width: 100%; max-height: 100%; border: none;">
                        </iframe>`;
                }
                if (containerMosaico) containerMosaico.style.display = 'none';
            }

            // --- FORMATO 3: MOSAICO ---
            else if (projeto.formato === 'pdf') {
                if (moldura) moldura.style.display = 'none';

                if (containerMosaico && projeto.pdfUrl) {
                    containerMosaico.style.display = 'grid';
                    containerMosaico.innerHTML = '<p class="loading-pdf">Carregando páginas do PDF...</p>';

                    window.pdfjsLib.getDocument(projeto.pdfUrl).promise.then(async (pdf) => {
                        lightboxImagesArray = [];
                        containerMosaico.innerHTML = '';

                        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                            const page = await pdf.getPage(pageNum);
                            const viewport = page.getViewport({ scale: 2.0 });

                            const canvas = document.createElement('canvas');
                            const context = canvas.getContext('2d');
                            canvas.height = viewport.height;
                            canvas.width = viewport.width;

                            await page.render({ canvasContext: context, viewport: viewport }).promise;

                            const imgDataUrl = canvas.toDataURL('image/png');
                            lightboxImagesArray.push(imgDataUrl);

                            const pageIdx = pageNum - 1;
                            const pageDiv = document.createElement('div');

                            const isHorizontal = viewport.width > viewport.height;
                            pageDiv.className = isHorizontal ? 'page-horizontal' : 'page-vertical-quadrada';

                            pageDiv.innerHTML = `
                                <div class="pdf-page-wrapper" style="position: relative; width: 100%;">
                                    <img src="${imgDataUrl}" alt="Página ${pageNum}" onclick="abrirLightbox(${pageIdx})" class="img-mosaico-pdf" style="width: 100%; height: auto; cursor: pointer;">
                                </div>
                            `;
                            containerMosaico.appendChild(pageDiv);
                        }
                    }).catch(err => {
                        console.error("Erro ao carregar ou processar o PDF:", err);
                        containerMosaico.innerHTML = '<p class="erro-pdf">Ocorreu um erro ao carregar as páginas do projeto.</p>';
                    });
                }
            }

            // --- FORMATO 4: GALERIA DE IMAGENS ---
            else if (projeto.imagens) {
                if (moldura) moldura.style.display = 'none';

                if (containerMosaico) {
                    containerMosaico.style.display = 'grid';
                    containerMosaico.innerHTML = ''; // Limpa o container para receber as imagens

                    lightboxImagesArray = projeto.imagens;

                    projeto.imagens.forEach((imgUrl, index) => {
                        const itemWrapper = document.createElement('div');
                        // Inicia com classe padrão, atualizamos quando carregar a imagem real
                        itemWrapper.className = 'page-vertical-quadrada';

                        const img = document.createElement('img');
                        img.src = imgUrl;
                        img.alt = `Imagem ${index + 1} de ${projeto.titulo}`;
                        img.className = 'img-mosaico-pdf';
                        img.style.width = '100%';
                        img.style.height = 'auto';
                        img.style.cursor = 'pointer';

                        // Checa as dimensões da imagem para adaptar o mosaico responsivo
                        img.onload = () => {
                            if (img.naturalWidth > img.naturalHeight) {
                                itemWrapper.className = 'page-horizontal';
                            } else {
                                itemWrapper.className = 'page-vertical-quadrada';
                            }
                        };

                        // Clique para o lightbox
                        img.addEventListener('click', () => {
                            abrirLightbox(index);
                        });

                        const innerWrapper = document.createElement('div');
                        innerWrapper.className = 'pdf-page-wrapper';
                        innerWrapper.style.position = 'relative';
                        innerWrapper.style.width = '100%';

                        innerWrapper.appendChild(img);
                        itemWrapper.appendChild(innerWrapper);
                        containerMosaico.appendChild(itemWrapper);
                    });
                }
            }

            // Renderiza projetos relacionados
            renderizarRelacionados(projetos, projeto);

        } else {
            console.error("Projeto correspondente ao ID não foi localizado.");
        }
    } catch (error) {
        console.error("Erro ao carregar o arquivo JSON de dados:", error);
    }
}

// === FUNÇÕES DO LIGHTBOX ===
function abrirLightbox(index) {
    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-img');
    if (modal && img && lightboxImagesArray[index]) {
        currentLightboxIndex = index;
        img.src = lightboxImagesArray[index];
        modal.style.display = 'flex';
    }
}

function fecharLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function mudarImagemLightbox(direcao) {
    currentLightboxIndex += direcao;

    if (currentLightboxIndex < 0) {
        currentLightboxIndex = lightboxImagesArray.length - 1;
    } else if (currentLightboxIndex >= lightboxImagesArray.length) {
        currentLightboxIndex = 0;
    }

    const img = document.getElementById('lightbox-img');
    if (img && lightboxImagesArray[currentLightboxIndex]) {
        img.src = lightboxImagesArray[currentLightboxIndex];
    }
}

// === FUNÇÃO DE PROJETOS RELACIONADOS ===
function renderizarRelacionados(todosProjetos, projetoAtual) {
    const container = document.getElementById('lista-relacionados');
    if (!container) return;

    // Filtra pelo mesmo tipo (websites, designs, etc), removendo o próprio projeto aberto
    let filtrados = todosProjetos.filter(p => p.tipo === projetoAtual.tipo && p.id !== projetoAtual.id);

    // Embaralha aleatoriamente (Algoritmo Fisher-Yates)
    for (let i = filtrados.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filtrados[i], filtrados[j]] = [filtrados[j], filtrados[i]];
    }

    // Limita a exibição de 3 projetos no máximo
    filtrados = filtrados.slice(0, 3);

    // Cria o HTML e adiciona na tela
    container.innerHTML = filtrados.map(p => `
        <div class="card-projeto">
            <a href="projeto-${p.tipo}.html?id=${p.id}" class="card-link">
                <div class="card-content">
                    <div class="thumb-wrapper">
                        <img src="${p.thumb}" alt="${p.titulo}">
                    </div>
                    <div class="card-text">
                        <h3>${p.titulo}</h3>
                    </div>
                </div>
            </a>
        </div>
    `).join('');
}

// === INICIALIZAÇÃO ===
document.addEventListener('DOMContentLoaded', () => {
    carregarProjeto();

    // Fechar lightbox ao clicar fora da imagem
    const modal = document.getElementById('lightbox-modal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target !== document.getElementById('lightbox-img') &&
                !e.target.classList.contains('lightbox-prev') &&
                !e.target.classList.contains('lightbox-next')) {
                fecharLightbox();
            }
        });
    }
});