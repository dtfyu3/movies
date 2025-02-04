let API_KEY;
function getMyAPIKey() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '../../api/api.php?get_action=getMyAPIKey', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({}));
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const data = JSON.parse(xhr.response);
                API_KEY = data['API_KEY'];
            }
            catch (e) {
                console.error('Error parsing JSON:', e);
            }
        }
    }
}
function getMoviesNames() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '../../api/api.php?get_action=getMoviesNames', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({}));
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const response = JSON.parse(xhr.response);
                const data = response['data'];
                addCards(data)
            }
            catch (e) {
                console.error('Error parsing JSON:', e);
            }
        }
    }
}
function createSpinner(container) {
    const spinner_container = document.createElement("div");
    spinner_container.id = 'loading-spinner';
    const spinner = document.createElement("div");
    spinner.classList.add('spinner');
    spinner_container.appendChild(spinner);
    container.prepend(spinner_container);
    spinner_container.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
}
function removeSpinner() {
    if (document.getElementById('loading-spinner')) document.getElementById('loading-spinner').remove();
}
function createCard(movie) {
    const card = document.createElement('div');
    card.dataset['id'] = '';
    card.dataset['genres'] = '';
    card.classList.add('movie-card');
    const header = document.createElement('div');
    header.classList.add('card-header');
    const span = document.createElement('span');
    span.classList.add('movie-name');
    span.innerText = movie.name;
    header.appendChild(span);
    card.appendChild(header);
    const poster = document.createElement('div');
    poster.classList.add('card-poster');
    const img = document.createElement('img');
    img.src = '';
    img.alt = 'Здесь должен быть постер';
    poster.appendChild(img);
    card.appendChild(poster);
    return card;
}

function addCards(cards) {
    return new Promise((resolve) => {
        let index = 0;
        const container = document.querySelector('.movies-grid');
        function addNextChunk() {
            const fragment = document.createDocumentFragment();
            for (let i = 0; index < cards.length; i++) {
                const card = createCard(cards[index]);
                fragment.appendChild(card);
                index++;
                loadMoviePoster(card, cards[index - 1]);
            }
            if (index >= cards.length) resolve();
            container.prepend(fragment);
            if (index < cards.length) {
                requestAnimationFrame(addNextChunk);
            } else {

            }
        }
        requestAnimationFrame(addNextChunk);
    });
}
function loadMoviePoster(card, movie) {
    fetchMovieImage(card, movie)
        .then(response => {
            const img = card.querySelector('.card-poster img');
            img.src = response['docs'][0]['poster']['url'];
            img.onload = function () {
                removeSpinner();
            }
            let genres = response['docs'][0]['genres'];
            card.dataset['genres'] = genres.map(item => item.name).join(', ');
        })
        .catch(error => {
            console.error('Ошибка загрузки изображения:', error);
        })
        .finally(()=>{
            updateMarquee();
        })
}
function fetchMovieImage(card, movie) {
    return new Promise((resolve, reject) => {
        const container = card.querySelector('.card-poster');
        createSpinner(container);
        const apiUrl = `https://api.kinopoisk.dev/v1.4/movie/search?query=${encodeURIComponent(movie.name)}`;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', apiUrl, true);
        xhr.setRequestHeader('X-API-KEY', API_KEY);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send();
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.response);
                    resolve(response);
                } catch (e) {
                    reject('Ошибка при парсинге ответа от API');
                }
            } else {
                reject('Ошибка при запросе изображения');
            }
        };
        xhr.onerror = function () {
            reject('Ошибка при запросе');
        };

    });
}
function updateMarquee() {
    document.querySelectorAll(".movie-card").forEach(card => {
        const text = card.querySelector(".card-header span");
        const header = card.querySelector(".card-header");
        const headerWidth = header.clientWidth - (parseFloat(getComputedStyle(header).paddingLeft)) * 4;
        if (text && header && text.scrollWidth > headerWidth) {
            card.addEventListener("mouseenter", () => {
                text.classList.add("marquee");
            });

            card.addEventListener("mouseleave", () => {
                text.classList.remove("marquee");
            });
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    // document.querySelectorAll(".movie-card").forEach(card => {
    //     const text = card.querySelector(".card-header span");
    //     const header = card.querySelector("card-header");

    //     if (text.scrollWidth > header.clientWidth) {
    //         card.addEventListener("mouseenter", () => {
    //             text.classList.add("marquee");
    //         });

    //         card.addEventListener("mouseleave", () => {
    //             text.classList.remove("marquee");
    //         });
    //     }
    // });
    getMyAPIKey();
    getMoviesNames();
});