/**
 * @file Player.ts 
 * @fileoverview audioplayer
 * @author Elia
 */

import { log, PlayMode } from  "./globals.js";
import FrontSong from "./FrontSong.js";


/// VAR/CONST
const playHistoryMaxLength = 500;	/// maximum number of items in the play history to remember
const prevTrackThreshold = 15;		/// when already playing a song, when to go to the beginning and when to go to the previous track (time in sec)

export default class Player {
	// html elements
	private player: HTMLAudioElement;
	private currentTrackLabel: HTMLElement;
	private modeBtn: HTMLButtonElement;

	private songList: FrontSong[];		// list of all possible tracks
	private playHistory: FrontSong[];	// list of played tracks
	private currentMode: PlayMode;
	/**
	 * the constructor of Player
	 * @param songList - a list of all possible songs (gets updated externally)
	 */
	constructor(songList: FrontSong[]) {
		this.songList = songList;
		this.playHistory = [];
		
		//const player-container = document.getElementById('player-container');
		this.player = document.getElementById('player') as HTMLAudioElement;
		this.currentTrackLabel = document.getElementById('current-track') as HTMLElement;
		this.modeBtn = document.getElementById('play-mode-btn') as HTMLButtonElement;
		if (!this.player) throw new Error("Player: missing 'player' AudioElement");
		if (!this.currentTrackLabel) throw new Error("Player: missing 'currentTrackLabel' element");
		if (!this.modeBtn) throw new Error("Player: missing 'modeBtn' ButtonElement");
		
		// when track ends
		this.player.addEventListener('ended', () => {
			this.playNext();
		});

		// player mode
		const savedMode = localStorage.getItem("playMode");
		if (savedMode !== null) {
			this.currentMode = Number(savedMode) as PlayMode;
			log(`Player: localStorage load 'playMode=${savedMode}'`, 3);
		}
		else this.currentMode = PlayMode.Norm;
		this.modeBtn.addEventListener('click', () => {
			this.currentMode = (this.currentMode + 1) % 3;
			this.updateMode();
		});
		this.updateMode()	// set initial mode text/title

		this.handle_mediaSession()
	}

	/** 
	 * plays a song and updates currently playing
	 * @param song - the song object to play
	 * @param onlyLoad - only loads the track, does not start playback (default false)
	 */
	 playSong(song: FrontSong, onlyLoad = false) {
		this.player.src = song.path;
		if (!onlyLoad) {
			log(`Player: playing '${song}'`, 2);
			this.player.play();
		}
		else log(`Player: loading '${song}'`, 2);

		this.playHistory.push(song);
		while (this.playHistory.length > playHistoryMaxLength) {
			this.playHistory.shift;
		}

		// update currently playing
		this.currentTrackLabel.textContent = song.showName();
		// browser tab title
		document.title = `${song.name} | My Music`;
		// add to url
		const url = new URL(window.location.href);
		url.searchParams.set('path', song.path);
		window.history.replaceState({}, '', url);
		// OS media session
		if ("mediaSession" in navigator) {
			navigator.mediaSession.metadata = new MediaMetadata({
				title:  song.name,
				artist:  song.artist,
				//album: "The Ultimate Collection (Remastered)",
				//artwork: [
				//	{
				//		src: "https://dummyimage.com/96x96",
				//		sizes: "96x96",
				//		type: "image/png",
				//	},
				//],
			});
			navigator.mediaSession.playbackState = onlyLoad ? "paused" : "playing";
		}
	}
	/**
	 * play the next track
	 * @param force - force switch song
	 */
	private playNext(force = false) {
		if (force) {
			this.playRandom();
			return;
		}
		switch (this.currentMode) {
			case PlayMode.Loop:
				this.player.currentTime = 0;
				this.player.play();
				break;
			case PlayMode.Rand:
				this.playRandom();
				break;
			case PlayMode.Norm:
				// do nothing
				break;
		}
	}
	/**
	 * play a track from a list
	 * @param list - list from which to choose from
	 */
	private playRandom(list = this.songList) {
		if (list.length === 0) {
			log("no songs to select from randomly");
			return;
		}

		const randomIndex = Math.floor(Math.random() * list.length);
		this.playSong(list[randomIndex]);
	}

	/** 
	 * update play-mode button text/title
	 */
	updateMode() {
		switch (this.currentMode) {
			case PlayMode.Norm:
				this.modeBtn.textContent = "Norm";
				this.modeBtn.title = "Normal: Playback stops after the song";
				break;

			case PlayMode.Loop:
				this.modeBtn.textContent = "Loop";
				this.modeBtn.title = "Loop: Repeat the current song";
				break;

			case PlayMode.Rand:
				this.modeBtn.textContent = "Rand";
				this.modeBtn.title = "Random: Play a random song next";
				break;
		}
		localStorage.setItem("playMode", String(this.currentMode));
	}

	/**
	 * setup mediaSession action handlers
	 */
	private handle_mediaSession() {
		// handle media buttons
		if ("mediaSession" in navigator) {
			navigator.mediaSession.setActionHandler("play", () => {
				this.player.play();
			});
			navigator.mediaSession.setActionHandler("pause", () => {
				this.player.pause();
				navigator.mediaSession.playbackState = "paused";
			});
			navigator.mediaSession.setActionHandler("nexttrack", () => {
				this.playNext(true);
			});
			navigator.mediaSession.setActionHandler("previoustrack", () => {
				if (this.player.currentTime > prevTrackThreshold) {
					this.player.currentTime = 0;
					this.player.play();
				}
				else {
					let _ = this.playHistory.pop(); // current song
					let prevTrack = this.playHistory.pop();
					if (prevTrack) this.playSong(prevTrack);
					else log("no previous song");
				}
			});
		}
	}
}
