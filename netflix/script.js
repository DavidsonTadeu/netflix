document.addEventListener('DOMContentLoaded', () => {

    const carouselsSection = document.querySelector('.carousels');
    const modal = document.getElementById('movieModal');
    const modalCloseBtn = document.querySelector('.modal-close-btn');
    const searchInput = document.getElementById('searchInput');
    const searchIcon = document.querySelector('.search-icon');

    // Variável para armazenar todos os dados carregados do JSON
    let allMoviesData = {};
    // Variável para armazenar uma lista plana de todos os filmes para a busca
    let allMoviesFlat = [];

    // Mapeamento de chaves da API para títulos de carrossel
    const carouselTitles = {
        trending: "Tendências",
        newReleases: "Lançamentos",
        myList: "Minha Lista"
    };

    /**
     * Carrega os dados do arquivo JSON e renderiza os carrosséis.
     */
    async function fetchMoviesAndRenderCarousels() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error('Erro ao carregar os dados. Verifique o caminho do arquivo.');
            }
            allMoviesData = await response.json();
            
            // Cria uma lista única de todos os filmes para a busca
            allMoviesFlat = Object.values(allMoviesData).flat();
            
            renderAllCarousels();
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * Limpa e renderiza todos os carrosséis baseados em `allMoviesData`.
     */
    function renderAllCarousels() {
        carouselsSection.innerHTML = ''; // Limpa o conteúdo existente
        for (const category in allMoviesData) {
            if (allMoviesData.hasOwnProperty(category)) {
                createCarousel(carouselTitles[category], allMoviesData[category]);
            }
        }
    }

    /**
     * Filtra e renderiza os filmes com base no termo de busca.
     * @param {string} searchTerm O termo de busca.
     */
    function filterAndRenderMovies(searchTerm) {
        carouselsSection.innerHTML = ''; // Limpa o conteúdo existente
        
        if (searchTerm.trim() === '') {
            renderAllCarousels(); // Se a busca estiver vazia, exibe todos os carrosséis
            return;
        }

        const filteredMovies = allMoviesFlat.filter(movie =>
            movie.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filteredMovies.length > 0) {
            createCarousel(`Resultados para "${searchTerm}"`, filteredMovies);
        } else {
            carouselsSection.innerHTML = `<h2 class="carousel-title">Nenhum resultado encontrado para "${searchTerm}"</h2>`;
        }
    }

    /**
     * Cria e injeta um carrossel na página.
     * @param {string} title O título do carrossel.
     * @param {Array<Object>} items A lista de filmes/séries para o carrossel.
     */
    function createCarousel(title, items) {
        const carouselSection = document.createElement('section');
        carouselSection.classList.add('carousel-section');

        const isSearchResult = title.includes('Resultados para');

        carouselSection.innerHTML = `
            <h2 class="carousel-title">${title}</h2>
            <div class="carousel-container">
                <button class="carousel-btn left" style="display: ${isSearchResult ? 'none' : 'block'};"><i class="fa-solid fa-chevron-left"></i></button>
                <div class="carousel-list">
                    </div>
                <button class="carousel-btn right" style="display: ${isSearchResult ? 'none' : 'block'};"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
        `;

        const carouselList = carouselSection.querySelector('.carousel-list');
        items.forEach(item => {
            const carouselItem = document.createElement('div');
            carouselItem.classList.add('carousel-item');
            // Adicionando um atributo de dado para armazenar o ID do filme
            carouselItem.dataset.id = item.id;
            carouselItem.innerHTML = `
                <img src="${item.thumbnail}" alt="${item.title}">
                <div class="carousel-item__title">${item.title}</div>
            `;
            carouselList.appendChild(carouselItem);
        });

        carouselsSection.appendChild(carouselSection);

        // Adiciona a funcionalidade de navegação ao carrossel
        if (!isSearchResult) {
            addCarouselNavigation(carouselSection);
        }
        // Adiciona a funcionalidade de clique para abrir o modal
        addModalFunctionality(carouselSection);
    }

    /**
     * Adiciona a funcionalidade de rolagem aos botões do carrossel.
     * @param {HTMLElement} carouselSection O elemento da seção do carrossel.
     */
    function addCarouselNavigation(carouselSection) {
        const leftBtn = carouselSection.querySelector('.carousel-btn.left');
        const rightBtn = carouselSection.querySelector('.carousel-btn.right');
        const carouselList = carouselSection.querySelector('.carousel-list');

        const scrollAmount = 600;

        leftBtn.addEventListener('click', () => {
            carouselList.scrollLeft -= scrollAmount;
        });

        rightBtn.addEventListener('click', () => {
            carouselList.scrollLeft += scrollAmount;
        });
    }

    /**
     * Adiciona a funcionalidade de abrir o modal ao clicar em um item do carrossel.
     * @param {HTMLElement} carouselSection O elemento da seção do carrossel.
     */
    function addModalFunctionality(carouselSection) {
        const carouselItems = carouselSection.querySelectorAll('.carousel-item');
        carouselItems.forEach(item => {
            item.addEventListener('click', () => {
                const movieId = parseInt(item.dataset.id);
                const movie = findMovieById(movieId);
                if (movie) {
                    populateModal(movie);
                    openModal();
                }
            });
        });
    }

    /**
     * Busca um filme/série por ID em todos os dados.
     * @param {number} id O ID do filme a ser encontrado.
     * @returns {Object|null} O objeto do filme ou null se não for encontrado.
     */
    function findMovieById(id) {
        for (const category in allMoviesData) {
            const foundMovie = allMoviesData[category].find(movie => movie.id === id);
            if (foundMovie) {
                return foundMovie;
            }
        }
        return null;
    }

    /**
     * Preenche o modal com os dados do filme/série.
     * @param {Object} movie O objeto do filme/série.
     */
    function populateModal(movie) {
        document.getElementById('modalThumbnail').src = movie.thumbnail;
        document.getElementById('modalTitle').textContent = movie.title;
        document.getElementById('modalDescription').textContent = movie.description;
        document.getElementById('modalDirector').textContent = `Diretor: ${movie.director}`;
    }

    /**
     * Abre o modal.
     */
    function openModal() {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden'; // Evita a rolagem do corpo da página
    }

    /**
     * Fecha o modal.
     */
    function closeModal() {
        modal.classList.remove('open');
        document.body.style.overflow = ''; // Restaura a rolagem do corpo da página
    }

    // Adiciona o evento de clique para a barra de pesquisa
    searchIcon.addEventListener('click', () => {
        searchInput.classList.toggle('active');
        searchInput.focus();
    });

    searchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value;
        filterAndRenderMovies(searchTerm);
    });


    // Inicia o carregamento dos dados e a renderização
    fetchMoviesAndRenderCarousels();

});