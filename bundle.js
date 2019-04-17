class Tab {
    constructor(containerId, title, highlightText, highlight) {
        this.open = false;
        this.title = title;

        this.container = document.getElementById(containerId);
        this.container.classList.add(
            'd-flex',
            'justify-content-center',
            'position-relative',
            'mt-3',
            'pt-5',
            'px-4',
            'border',
            'rounded',
            'shadow-sm',
            'overflow-hidden'
        );
        this.container.style.height = '0';

        const toggleContainer = document.createElement('div');
        toggleContainer.classList.add('m-2', 'position-absolute');
        toggleContainer.style.top = '0';
        toggleContainer.style.left = '0';
        this.container.appendChild(toggleContainer);

        this.toggleButton = document.createElement('button');
        this.toggleButton.classList.add('toggle', 'btn', 'btn-primary', 'btn-sm');
        this.toggleButton.onclick = () => this.toggleOpen();

        this.toggleIcon = document.createElement('i');
        this.toggleIcon.classList.add('toggle-icon', 'fas', 'fa-chevron-down', 'fa-lg');
        this.toggleButton.appendChild(this.toggleIcon);
        toggleContainer.appendChild(this.toggleButton);

        this.titleElement = document.createElement('p');
        this.titleElement.classList.add('d-inline-block', 'ml-3', 'font-weight-bold');
        this.titleElement.innerText = this.title;

        this.highlightElement = document.createElement('i');
        this.highlightElement.classList.add('d-inline-block', 'text-danger');
        this.setHighlight(highlight);
        this.highlightElement.style.fontSize = '60%';
        this.highlightElement.style.transform = 'translateY(-50%)';
        this.highlightText = highlightText;
        this.highlightElement.innerText = this.highlightText;

        this.titleElement.appendChild(this.highlightElement);
        toggleContainer.appendChild(this.titleElement);
    }

    toggleOpen() {
        this.setOpen(!this.open);
    }

    setOpen(open) {
        this.container.style.height = open ? 'auto' : '0';
        this.open = open;
        this.toggleIcon.classList.replace(
            open ? 'fa-chevron-down' : 'fa-chevron-up',
            open ? 'fa-chevron-up' : 'fa-chevron-down'
        );
    }

    setHighlight(highlight) {
        this.highlightElement.style.visibility = highlight ? 'visible' : 'hidden';
    }
}

class XKCDTab extends Tab {
    constructor() {
        super('xkcd-container', 'XKCD', 'NEW', false);

        this.totalComics = 0;
        this.currentComic = 1;
        this.comicHistory = [];
        this.buttonElements = {};

        this.initialImageLoaded = false;

        this.request = new XMLHttpRequest();

        this.buttonElements.previous = document.getElementById('prev-xkcd');
        this.buttonElements.next = document.getElementById('next-xkcd');
        this.buttonElements.random = document.getElementById('rand-xkcd');

        this.buttonElements.previous.addEventListener('click', this.previous.bind(this));
        this.buttonElements.next.addEventListener('click', this.next.bind(this));
        this.buttonElements.random.addEventListener('click', this.random.bind(this));


        this.imageElement = document.getElementById('xkcd-img');
        this.imageElement.addEventListener('load', this.imageLoaded.bind(this));

        this.imageOverlayElement = document.getElementById('xkcd-img-overlay');
        this.imageTitleElement = document.getElementById('xkcd-title');
        this.imageAltTextElement = document.getElementById('xkcd-alt');
        this.imageNumberElement = document.getElementById('xkcd-num');
        this.imageDateElement = document.getElementById('xkcd-date');

        this.fetchComic();
    }

    fetchComic(number) {
        this.loadingComic(true);

        if (!number) {
            number = '';
        }

        this.request.onreadystatechange = () => {
            if (this.request.readyState === 4 && this.request.status === 200) {
                const response = JSON.parse(this.request.responseText);

                this.currentComic = response.num;

                if (!number) {
                    this.totalComics = this.currentComic;
                }

                this.addToHistory(this.currentComic);

                const comicDate = new Date(response.year, response.month - 1, response.day);

                this.setComicImage(response.img, response.alt, response.title, this.currentComic, comicDate);
            }
        };

        this.request.open('GET', 'https://xkcd.now.sh/' + number, true);
        this.request.send();
    }

    setComicImage(sourceURL, altText, title, number, date) {
        this.imageElement.src = sourceURL;
        this.imageElement.alt = altText;

        this.imageTitleElement.innerText = `"${title}"`;
        this.imageAltTextElement.innerText = altText;
        this.imageNumberElement.innerText = `#${number} -`;

        this.highlightNew(date);

        const displayDate = date
            .toDateString()
            .slice(4)
            .replace(/(?<=\s\d{2})\s/, ', ');

        this.imageDateElement.innerText = `(${displayDate})`;

        // Testing something out...
        this.imageAltTextElement.width = this.imageElement.innerWidth;
    }

    loadingComic(loading) {
        if (document.readyState === 'complete') {
            this.setImageButtonsEnabled(!loading);
            this.setOverlayVisible(loading);
        }
    }

    imageLoaded() {
        if (!this.initialImageLoaded) {
            this.imageElement.parentElement.classList.remove('d-none');
            this.imageElement.parentElement.classList.add('d-flex');
            this.initialImageLoaded = true;
        }

        this.resizeAltTextHeader();
        this.loadingComic(false);
    }

    isInHistory(number) {
        return this.comicHistory.includes(number);
    }

    addToHistory(number) {
        if (!this.isInHistory(number)) {
            this.comicHistory.push(number);
        }
    }

    resetHistory() {
        this.comicHistory.length = 0;
    }

    random() {
        let rand = Math.ceil(Math.random() * this.totalComics);

        let count = 0;

        while (this.isInHistory(rand)) {
            if (++count > this.totalComics) {
                this.resetHistory();
            }

            if (++rand > this.totalComics) {
                rand = 1;
            }
        }

        this.fetchComic(rand);
    }

    next() {
        if (this.currentComic < this.totalComics) {
            this.fetchComic(this.currentComic + 1);
        } else {
            this.fetchComic(1);
        }
    }

    previous() {
        if (this.currentComic > 1) {
            this.fetchComic(this.currentComic - 1);
        } else {
            this.fetchComic(this.totalComics);
        }
    }

    highlightNew(date) {
        if (date.valueOf() === new Date(Date.now()).setHours(0, 0, 0, 0)) {
            this.setHighlight(true);
        } else {
            this.setHighlight(false);
        }
    }

    setImageButtonsEnabled(enabled) {
        Object.values(this.buttonElements).forEach((b) => b.disabled = !enabled);
    }

    setOverlayVisible(visible) {
        this.imageOverlayElement.style.display = visible ? 'block' : 'none';
    }

    resizeAltTextHeader() {
        this.imageAltTextElement.parentElement.style.width = this.imageElement.width;
    }
}

function domLoaded() {
    new Tab('test-container', 'Test', 'DEV', true);
    new XKCDTab();
}

window.addEventListener('DOMContentLoaded', domLoaded);
