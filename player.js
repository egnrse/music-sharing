/// audio player
const rows = document.querySelectorAll('#playlist tbody tr');
const player = document.getElementById('player');
const currentTrackLabel = document.getElementById('current-track');

const artistColumn = 2;
const trackColumn = 1;

function playTrack(track) {
	player.src = track;
	player.play();
}
function setCurrentlyPlaying(row) {
	const artist = row.cells[artistColumn].textContent;
	const track = row.cells[trackColumn].textContent;
	currentTrackLabel.textContent = `${artist} - ${track}`;
	// update browser tab title
	document.title = `${artist} - ${track} | My Music`;
}

rows.forEach(row => {
	// double-click to play the track
	const playBtn = row.querySelector('.play-btn');
	row.addEventListener('dblclick', () => {
		if (playBtn) {
			playTrack(playBtn.dataset.src);
			
			// show currently playing
			setCurrentlyPlaying(row)
		}
	});
	// click play button to play the track
	playBtn.addEventListener('click', () => {
		playTrack(playBtn.dataset.src);

		const row = playBtn.closest('tr');
		setCurrentlyPlaying(row)
	});
});


/// playback modes
const modeBtn = document.getElementById('play-mode-btn');

const MODE_NORMAL = 0;
const MODE_LOOP = 1;
const MODE_RANDOM = 2;

let currentMode = MODE_NORMAL;
updateMode()	// set initial mode text/title

//update mode-button text/title
function updateMode(){
	if (currentMode === MODE_NORMAL) {
		modeBtn.textContent = 'Norm';
		modeBtn.title = 'Normal: Playback stops after the song';
	}
	else if (currentMode === MODE_LOOP) {
		modeBtn.textContent = 'Loop';
		modeBtn.title = 'Loop: Repeat the current song';
	}
	else {
		modeBtn.textContent = 'Rand';
		modeBtn.title = 'Random: Play a random song next';
	}
}
// play random row
function playRandom() {
	const randomIndex = Math.floor(Math.random() * rows.length);
	const row = rows[randomIndex];
	const playBtn = row.querySelector('.play-btn');

	playTrack(playBtn.dataset.src);
	setCurrentlyPlaying(row);
}
function playNext() {
	if (currentMode === MODE_LOOP) {
		player.currentTime = 0;
		player.play();
	}
	else if (currentMode === MODE_RANDOM) {
		playRandom();
	}
	// normal = do nothing
}

modeBtn.addEventListener('click', () => {
	currentMode = (currentMode + 1) % 3;
	updateMode();
});
// when track ends
player.addEventListener('ended', () => {
	playNext();
});


/// handle media buttons
if ("mediaSession" in navigator) {
	/*
	// seems to be handled automatically
	navigator.mediaSession.setActionHandler("play", () => {
	});
	navigator.mediaSession.setActionHandler("pause", () => {
	});
	*/
	navigator.mediaSession.setActionHandler("nexttrack", () => {
		playNext();
	});
	navigator.mediaSession.setActionHandler("previoustrack", () => {
		player.currentTime = 0;
		player.play();
	});
}
