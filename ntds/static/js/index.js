const quotes = [
    "I don't paint dreams, I paint snacks. — Salvador Dalí",
    "Every morning I break my eggs, then rearrange them into art. — Pablo Picasso",
    "If you hear a voice within you saying, 'You cannot draw,' then for heaven's sake, draw it anyway! — Vincent van Gogh",
    "Give me a paintbrush and a sandwich, and I'll give you a masterpiece by lunchtime. — Claude Monet",
    "Art is just another way to say, 'Oops, I spilled something again.' — Jackson Pollock",
    "The world without bacon is like a painting without color. — Wassily Kandinsky",
    "I found the meaning of life in the bottom of my coffee cup. — Leonardo da Vinci",
    "I dream my painting, then I eat a croissant. — Paul Cézanne",
    "Inspiration exists, but it better bring snacks. — Pablo Picasso",
    "The purpose of art is to make you wonder, 'Why is there glitter in my hair?' — Andy Warhol"
];

function displayRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quoteElement = document.getElementById('quote');
    quoteElement.textContent = quotes[randomIndex];
}

window.onload = displayRandomQuote;

let currentPage = 1;
let hasNextPage = true;


function loadMoreImages() {
    if (!hasNextPage) return;

    currentPage++;

    fetch(`/load-drawings/?page=${currentPage}`)
        .then(response => response.json())
        .then(data => {

            const grid = document.getElementById('grid');
            data.data.forEach(image => {
                const gridItem = document.createElement('div');
                gridItem.classList.add('grid-item');
                gridItem.setAttribute('data-aos', 'fade-up');
                gridItem.setAttribute('data-aos-duration', '800');
                
                gridItem.innerHTML = `
                    <div class="card">
                        <div class="card-image">
                            <a href="/draw/${image.pagelink}">
                                <img src="${image.imglink}" alt="${image.title}">
                            </a>
                        </div>
                        <div class="card-content">
                            <div class="card-header">
                                <h3 class="card-title">${image.title}</h3>
                            </div>
                        </div>
                    </div>
                `;
                grid.appendChild(gridItem);
            });

            hasNextPage = data.has_next;
            AOS.refresh();
        })
        .catch(error => {
            console.error('Error loading more images:', error);
        });
}

window.addEventListener('scroll', _.throttle(function() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
        loadMoreImages();
    }
}, 300));
