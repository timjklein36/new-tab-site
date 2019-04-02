console.log('Custom JavaScript loaded.');

class Tab {
	container;
	open;
	toggleButton;
	toggleIcon;
	title;
	titleElement;
	highlight;
	highlightText;
	highlightElement;

	constructor(containerId, title, highlightText, highlight) {
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

		this.title = title;

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
		this.highlight = highlight;
	}
}

class XKCDTab extends Tab {
	currentComic;

	constructor() {
		super('xkcd-container', 'XKCD', 'NEW', false);
	}

	setCurrentComic(comic) {

	}

	highlightNew(date) {
		if (date.valueOf() === new Date(Date.now()).setHours(0, 0, 0, 0)) {
			this.setHighlight(true);
		} else {
			this.setHighlight(false);
		}
	}
}

const xhttp = new XMLHttpRequest();
const asynchronous = true;

let totalComics;
let currentComic = 1;
const history = [];

let initialImageLoaded = false;

let xkcdContainerEl;
let xkcdToggleIconEl;
let xkcdNew;
let imageEl;
let overlayEl;
let titleEl;
let altEl;
let numEl;
let dateEl;

let prevButtonEl;
let nextButtonEl;
let randButtonEl;

let imageButtons;

function domLoaded() {
	const testTab = new Tab('test-container', 'Test', 'DEV', true);
	const xkcdTab = new XKCDTab();

	xkcdContainerEl = document.getElementById('xkcd-container');
	xkcdToggleIconEl = document.getElementById('xkcd-toggle-icon');
	xkcdNew = document.getElementById('xkcd-new');
	imageEl = document.getElementById('xkcd-img');
	overlayEl = document.getElementById('img-overlay');
	titleEl = document.getElementById('xkcd-title');
	altEl = document.getElementById('xkcd-alt');
	numEl = document.getElementById('xkcd-num');
	dateEl = document.getElementById('xkcd-date');
	prevButtonEl = document.getElementById('prev-button');
	nextButtonEl = document.getElementById('next-button');
	randButtonEl = document.getElementById('rand-button');
	imageButtons = [prevButtonEl, nextButtonEl, randButtonEl];
}

function setImageButtonsEnabled(enabled) {
	imageButtons.forEach((b) => b.disabled = !enabled);
}

function setOverlayVisible(visible) {
	overlayEl.style.display = visible ? 'block' : 'none';
}

function resizeAltTextHeader() {
	altEl.parentElement.style.width = imageEl.width;
}

function loadingComic(loading) {
	if (document.readyState === 'complete') {
		setImageButtonsEnabled(!loading);
		setOverlayVisible(loading);
	}
}

function imageLoaded() {
	if (!initialImageLoaded) {
		imageEl.parentElement.classList.remove('d-none');
		imageEl.parentElement.classList.add('d-flex');
		initialImageLoaded = true;
	}

	resizeAltTextHeader();
	loadingComic(false);
}

function setXKCD(sourceURL, altText, title, number, date) {
	console.log(`Setting XKCD Comic Source: ${sourceURL}\nCurrent Comic: ${currentComic}`);

	imageEl.src = sourceURL;
	imageEl.alt = altText;

	titleEl.innerText = `"${title}"`;
	altEl.innerText = altText;
	numEl.innerText = `#${number} -`;

	// TODO - highlightNew(date); // once moved to class

	const displayDate = date
		.toDateString()
		.slice(4)
		.replace(/(?<=\s\d{2})\s/, ', ');

	dateEl.innerText = `(${displayDate})`;

	// Testing something out...
	altEl.width = imageEl.innerWidth;
}

function isInHistory(number) {
	return history.includes(number);
}

function addToHistory(number) {
	if (!isInHistory(number)) {
		history.push(number);
	}
}

function fetchComic(number) {
	loadingComic(true);

	if (!number) {
		number = '';
	}

	xhttp.onreadystatechange = function() {
		if (this.readyState === 4 && this.status === 200) {
			const response = JSON.parse(this.responseText);

			currentComic = response.num;

			if (!number) {
				totalComics = currentComic;
			}

			addToHistory(currentComic);

			const comicDate = new Date(response.year, response.month - 1, response.day);

			setXKCD(response.img, response.alt, response.title, currentComic, comicDate);
		}
	};

	xhttp.open('GET', 'https://xkcd.now.sh/' + number, asynchronous);
	xhttp.send();
}

function resetHistory() {
    history.length = 0;
}

function random() {
	let rand = Math.ceil(Math.random() * totalComics);

    let count = 0;

	while (isInHistory(rand)) {
	    if (++count > totalComics) {
	        resetHistory();
        }

		if (++rand > totalComics) {
		    rand = 1;
        }
	}

	fetchComic(rand);
}

function next() {
	if (currentComic < totalComics) {
		fetchComic(currentComic + 1);
	} else {
		fetchComic(1);
	}
}

function previous() {
	if (currentComic > 1) {
		fetchComic(currentComic - 1);
	} else {
		fetchComic(totalComics);
	}
}

// Fetch the latest comic
fetchComic();
