console.log('Custom JavaScript loaded.');

const xhttp = new XMLHttpRequest();
const asynchronous = true;

let totalComics;
let currentComic = 1;
const history = [];

let initialImageLoaded = false;

let xkcdContainerOpen = false;

let xkcdContainerEl;
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
	xkcdContainerEl = document.getElementById('xkcd-container');
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

function setXkcdContainerOpen() {}

function setImageButtonsEnabled(enabled) {
	imageButtons.forEach((b) => b.disabled = !enabled);
}

function setOverlayVisible(visible) {
	overlayEl.style.display = visible ? 'block' : 'none';
}

function resizeAltTextHeader() {
	const width = imageEl.width;

	altEl.parentElement.width = width;
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
	dateEl.innerText = `(${date})`;

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

			const comicDate = new Date(response.year, response.month - 1, response.day)
				.toDateString()
				.slice(4)
				.replace(/(?<=\s\d{2})\s/, ', ');

			setXKCD(response.img, response.alt, response.title, currentComic, comicDate);
		}
	};

	xhttp.open('GET', 'https://xkcd.now.sh/' + number, asynchronous);
	xhttp.send();
}

function random() {
	let rand = Math.ceil(Math.random() * totalComics);

	while (isInHistory(rand)) {
		++rand;
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

// Fetch the latest comic, TODO - make it a random one some of the time
fetchComic();
