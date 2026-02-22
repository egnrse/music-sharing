/**
 * @file player.ts 
 * @fileoverview main audioplayer functionality
 * @author Elia
 */
import { Track } from "./Track.js";
import type { FilePath } from  "./types";

/// VAR/CONST
/** playmode states */
enum PlayMode {
	Norm = 0,	// normal (stops after current song)
	Loop = 1,	// loop
	Rand = 2	// random
}

/** how verbose to be (bigger means more) */
const verbose: number = 1;

const player = document.getElementById('player') as HTMLAudioElement;
const currentTrackLabel = document.getElementById('current-track') as HTMLElement;
const modeBtn = document.getElementById('play-mode-btn') as HTMLButtonElement;
const rows = document.querySelectorAll('#playlist tbody tr');

if (!player) throw new Error("missing 'player' AudioElement");
if (!currentTrackLabel) throw new Error("missing 'currentTrackLabel' element");
if (!modeBtn) throw new Error("missing 'modeBtn' ButtonElement");
if (!rows) throw new Error("missing '#playlist tbody tr' element");

let currentMode: PlayMode = PlayMode.Norm;


/// FUNCTIONS
/**
 * custom log function
 * @param text - the text to log
 * @param level - the log level (default 1)
 */
function log(text: string, level = 1) {
	if (verbose >= level){
		const out = `L${level}: ${text}`;
		console.log(out);
	}
}
/** 
 * plays a track and updates currently playing
 * @param track - the track object to play
 * @param onlyLoad - only loads the track, does not start playback (default false)
 */
function playTrack(track: Track, onlyLoad = false) {
	player.src = track.path;
	if (!onlyLoad) {
		log(`playing '${track}'`, 1);
		player.play();
	}
	else {
		log(`loading '${track}'`, 1);
	}

	// update currently playing
	currentTrackLabel.textContent = `${track.artist} - ${track.name}`;
	// browser tab title
	document.title = `${track.name} | My Music`;
	// add to url
	const url = new URL(window.location.href);
	url.searchParams.set('path', track.path);
	window.history.replaceState({}, '', url);
}
/**
 * creates a Track from the given path and plays it
 * @param path - path to the music file
 * @param onlyLoad - only loads the track, does not start playback (default false)
 * @return - the created Track object
 */
function playPath(path: FilePath, onlyLoad = false) {
	const track = new Track(path);
	playTrack(track, onlyLoad);
	return track;
}

/**
 * play the track of a random row
 */
function playRandom() {
	if (rows.length === 0) return;

	const randomIndex = Math.floor(Math.random() * rows.length);
	const row = rows[randomIndex];
	const playBtn = row.querySelector<HTMLButtonElement>('.play-btn');
	if (!playBtn) throw new Error("missing '.play-btn' ButtonElement");

	playPath(playBtn.dataset.src as FilePath);
}
/**
 * play the next track
 */
function playNext() {
	switch (currentMode) {
		case PlayMode.Loop:
			player.currentTime = 0;
			player.play();
			break;
		case PlayMode.Rand:
			playRandom();
			break;
		case PlayMode.Norm:
			// do nothing
			break;
	}
}

/** 
 * update play-mode button text/title
 */
function updateMode() {
	switch (currentMode) {
		case PlayMode.Norm:
			modeBtn.textContent = "Norm";
			modeBtn.title = "Normal: Playback stops after the song";
			break;

		case PlayMode.Loop:
			modeBtn.textContent = "Loop";
			modeBtn.title = "Loop: Repeat the current song";
			break;

		case PlayMode.Rand:
			modeBtn.textContent = "Rand";
			modeBtn.title = "Random: Play a random song next";
			break;
	}
}


/// MAIN

rows.forEach(row => {
	// double-click to play the track
	const playBtn = row.querySelector<HTMLButtonElement>('.play-btn');
	if (!playBtn) throw new Error("missing '.play-btn' ButtonElement");
	row.addEventListener('dblclick', () => {
		if (playBtn) {
			playPath(playBtn.dataset.src as FilePath);
		}
	});
	// click play button to play the track
	playBtn.addEventListener('click', () => {
		playPath(playBtn.dataset.src as FilePath);
	});
});



// auto load song on page load
window.addEventListener('DOMContentLoaded', () => {
	const params = new URLSearchParams(window.location.search);
	const pathParam = params.get('path');

	if (!pathParam) return;

	rows.forEach(row => {
		const playBtn = row.querySelector<HTMLButtonElement>('.play-btn');
		if (!playBtn) return;

		if (playBtn.dataset.src === pathParam) {
			playPath(playBtn.dataset.src as FilePath, true);
			return;
		}
	});
});


// playback modes
updateMode()	// set initial mode text/title

modeBtn.addEventListener('click', () => {
	currentMode = (currentMode + 1) % 3;
	updateMode();
});
// when track ends
player.addEventListener('ended', () => {
	playNext();
});


// handle media buttons
if ("mediaSession" in navigator) {
	navigator.mediaSession.setActionHandler("play", () => {
		player.play();
	});
	navigator.mediaSession.setActionHandler("pause", () => {
		player.pause();
	});
	navigator.mediaSession.setActionHandler("nexttrack", () => {
		playNext();
	});
	navigator.mediaSession.setActionHandler("previoustrack", () => {
		player.currentTime = 0;
		player.play();
	});
}
