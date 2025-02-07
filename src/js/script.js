const swiper = new Swiper('.swiper', {
    loop: false,
    spaceBetween: 30,
    slidesPerView: 1,
    pagination: {
        el: '.swiper-pagination',
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },

    scrollbar: {
        el: '.swiper-scrollbar',
    },
});
setTimeout(() => {
    swiper.update();
}, 100);
// swiper.on('slideNextTransitionEnd', function () {
    
// });
swiper.on('slideChangeTransitionEnd',function(){
    const card = document.querySelector('.swiper-slide-active');
    if (card.dataset.loaded) {
        getGradientFromImage(card.querySelector('.card-poster img'))
    }
})
const colorThief = new ColorThief();

const swiperContainer = document.querySelector('.swiper');
let API_KEY;
let debounceTimeout;
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
    // spinner_container.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
}
function removeSpinner(card) {
    if (card.querySelector('#loading-spinner')) card.querySelector('#loading-spinner').remove();
}
function createCard(movie) {
    // const swiper = document.createElement('div');
    // swiper.classList.add('swiper-slide');
    const card = document.createElement('div');
    card.dataset['id'] = '';
    card.dataset['genres'] = '';
    card.classList.add('swiper-slide');
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
    // img.src = '';
    poster.appendChild(img);
    card.appendChild(poster);
    return card;
}

function addCards(cards) {
    return new Promise((resolve) => {
        let index = 0;
        const container = document.querySelector('.swiper-wrapper');
        function addNextChunk() {
            const fragment = document.createDocumentFragment();
            for (let i = 0; index < cards.length; i++) {
                const card = createCard(cards[index]);
                fragment.appendChild(card);
                index++;
                // if(index <=1 ) loadMoviePoster(card, cards[index - 1]);
            }
            container.prepend(fragment);
            container.childNodes.forEach((card, i) => {
                const img = card.querySelector('.card-poster img');

                // Если картинка еще не загружена
                if (!img.src || img.src === '' || img.src === 'http://movies/') {
                    createSpinner(card.querySelector('.card-poster'));
                    document.body.style.setProperty('--b', 'linear-gradient(45deg,rgb(255, 107, 107),rgb(247, 209, 71),rgb(107, 155, 255),rgb(31, 139, 136))'); //default animated gradient before card image loaded
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                clearTimeout(debounceTimeout);
                                debounceTimeout = setTimeout(() => {
                                    loadMoviePoster(card, cards[i]);
                                    card.dataset.loaded = true;
                                    observer.disconnect(); // Останавливаем наблюдателя после загрузки
                                }, 500);
                            }
                        });
                    }, { threshold: 0.1 }); // Загрузить, когда карточка хотя бы на 10% видна
                    observer.observe(card);
                }
            })
            if (index >= cards.length) resolve();
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
            img.crossOrigin = "Anonymous";
            // img.src = response['docs'][0]['poster']['url'];
            img.onerror = function () {
                img.alt = 'Здесь должен быть постер';
            }
            // img.scr = card.dataset.loaded ? response : response['docs'][0]['poster']['url'];
            if (!response['docs']) img.src = response
            else img.src = response['docs'][0]['poster']['url'];

            // img.src = response['docs'][0]['poster']['url'] || response;
            // img.src = response;      //test
            img.onload = function () {
                removeSpinner(card);
                getGradientFromImage(img)
            }

            // function toHex(color) {
            //     let r = color[0];
            //     let g = color[1];
            //     let b = color[2];
            //     return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase();
            // }

            let genres = response['docs'][0]['genres'];      //real
            card.dataset['genres'] = genres.map(item => item.name).join(', ');
            card.dataset['description'] = response['docs'][0]['description'] || '';
            updateMovieInfo();
        })
        .catch(error => {
            console.error('Ошибка загрузки изображения:', error);
        })
        .finally(() => {
            // updateMarquee();
        })
}
function getGradientFromImage(img) {
    const dominantColor = colorThief.getColor(img);
    const rgbColor = `rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]})`;
    const palette = colorThief.getPalette(img, 4);
    // const gradientToHex = `linear-gradient(45deg, ${toHex(palette[0])}, ${toHex(palette[1])}, ${toHex(palette[2])},${toHex(palette[3])}`;
    const gradient = `linear-gradient(45deg,rgb(${format(palette[0])}),rgb(${format(palette[1])}),rgb(${format(palette[2])}),rgb(${format(palette[3])}))`;
    //document.body.style.setProperty('--b',gradient); //------------------------------------------------------
    animateGradientChange(document.body.style.getPropertyValue('--b'), gradient, 2000);
    function format(color) {
        return `${color[0]}, ${color[1]}, ${color[2]}`;
    }
}
function updateMovieInfo() {
    const activeCard = document.querySelector('.swiper-slide-active');
    if (!activeCard) return;
    const genre = activeCard.dataset.genres || '';
    const description = activeCard.dataset.description || '';
    document.getElementById('movie-genre').textContent = genre;
    document.getElementById('movie-description').textContent = description;
    checkDescriptionTextOverflow();
}
function checkDescriptionTextOverflow() {
    const description = document.getElementById('movie-description');
    const showMoreBtn = document.querySelector('.show-more');

    if (description.scrollHeight > description.clientHeight) {
        showMoreBtn.style.display = 'inline';
    }
}
function fetchMovieImage(card, movie) {
    return new Promise((resolve, reject) => {
        const img = card.querySelector('.card-poster img');
        if (img.scr !== '' && img.src && img.scr !== 'http://movies/') { //img is already loaded
            resolve(img.src.trim())
        }
        const container = card.querySelector('.card-poster');
        const apiUrl = `https://api.kinopoisk.dev/v1.4/movie/search?query=${encodeURIComponent(movie.name)}`; //real
        // const apiUrl = '';       //test
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
                    // resolve('https://image.openmoviedb.com/kinopoisk-images/1704946/e0eb0512-5180-41d4-8788-f22d77b79501/orig');         //test
                    reject('Ошибка при парсинге ответа от API');
                }
            } else {
                // resolve('https://image.openmoviedb.com/kinopoisk-images/1704946/e0eb0512-5180-41d4-8788-f22d77b79501/orig');         //test
                reject('Ошибка при запросе изображения');
            }
        };
        xhr.onerror = function () {
            reject('Ошибка при запросе');
        };

    });
}
// function updateMarquee() {
//     document.querySelectorAll(".movie-card").forEach(card => {
//         const text = card.querySelector(".card-header span");
//         const header = card.querySelector(".card-header");
//         const headerWidth = header.clientWidth - (parseFloat(getComputedStyle(header).paddingLeft)) * 4;
//         if (text && header && text.scrollWidth > headerWidth) {
//             card.addEventListener("mouseenter", () => {
//                 text.classList.add("marquee");
//             });

//             card.addEventListener("mouseleave", () => {
//                 text.classList.remove("marquee");
//             });
//         }
//     });
// }
function toggleDescription() {
    const infoBlock = document.querySelector('.movie-info');
    infoBlock.classList.toggle('expanded');

    const btn = document.querySelector('.show-more');
    btn.textContent = infoBlock.classList.contains('expanded') ? 'Скрыть' : 'Показать полностью';
}
function animateGradientChange(startGradient, endGradient, duration) {
    const startTime = performance.now();

    function updateGradient(time) {
        const elapsedTime = time - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        // Вычисляем промежуточное значение градиента
        const intermediateGradient = interpolateGradients(startGradient, endGradient, progress);
        document.body.style.setProperty('--b', intermediateGradient);

        // Продолжаем анимацию, если еще не завершена
        if (progress < 1) {
            requestAnimationFrame(updateGradient);
        }
    }

    // Стартуем анимацию
    requestAnimationFrame(updateGradient);
}

// Функция для интерполяции градиентов (плавное изменение)
function interpolateGradients(startGradient, endGradient, progress) {
    const startColors = extractGradientColors(startGradient);
    const endColors = extractGradientColors(endGradient);

    const interpolatedColors = startColors.map((startColor, index) => {
        return interpolateColor(startColor, endColors[index], progress);
    });

    // Собираем градиент с промежуточными цветами
    return `linear-gradient(45deg, ${interpolatedColors.join(', ')})`;
}

// Функция для извлечения цветов из градиента
function extractGradientColors(gradient) {
    const regex = /rgb\((\d+), (\d+), (\d+)\)/g;
    let match;
    const colors = [];

    while (match = regex.exec(gradient)) {
        // Извлекаем r, g, b компоненты как числа
        colors.push([parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]);
    }

    return colors;
}

// Функция для интерполяции цветов
function interpolateColor(startColor, endColor, progress) {
    const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * progress);
    const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * progress);
    const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * progress);

    return `rgb(${r}, ${g}, ${b})`;
}

// Функция для преобразования HEX в RGB
function hexToRgb(hex) {
    const match = /^#([0-9A-Fa-f]{6})$/.exec(hex);
    if (!match) return null;
    const r = parseInt(match[1].slice(0, 2), 16);
    const g = parseInt(match[1].slice(2, 4), 16);
    const b = parseInt(match[1].slice(4, 6), 16);
    return { r, g, b };
}
document.addEventListener("DOMContentLoaded", function () {
    getMyAPIKey();
    getMoviesNames();

});