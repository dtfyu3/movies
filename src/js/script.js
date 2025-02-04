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
                addCards(data).then(updateMarquee)
            }
            catch (e) {
                console.error('Error parsing JSON:', e);
            }
        }
    }
}

function createCard(movie) {
    const card = document.createElement('div');
    card.dataset['id'] = '';
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
    getMoviesNames();
});