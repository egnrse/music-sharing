/**
 * @file FrontSong.ts
 * @fileoverview implementation of the FrontSong class
 * @author Elia
 */

import type { SongInterface, SongKey } from "./shared/BaseSong.js"
import type { detailsAPI } from "./shared/shared.js"
import { log, escapeHtml, formatDuration, FIELD_VALUES } from  "./globals.js";
import BaseSong from "./shared/BaseSong.js"


export default class FrontSong extends BaseSong {
	override files: FrontSong[] = [];

	private listeners: Set<(() => void)> = new Set();	// functions to call on field changes
	private fetched: boolean = false;			// if all data was fetched from the server

	constructor(filePath: string, name?: string, artist?: string) {
		super(filePath, name, artist);
	}

	/** returns a html escaped path */
	get savePath(): string {
		return escapeHtml(this.path);
	}

	/** fetch more data about this song from the server */
	private async fetchData() {
		if (this.fetched) return;	// check if data is already fetched

		const raw: detailsAPI = await fetch(`api/details?path=${encodeURIComponent(this.path)}`).then(r => r.json());
		log(`FrontSong(fetchData): loaded ${JSON.stringify(raw,null,2)}`, 5);

		try {
			const newData = FrontSong.from(raw[0]);
			if (newData.id !== this.id) throw new Error(`ids do not match ('${newData.id}' != '${this.id}')`);
			const { id, path, listeners, fetched, ...safeData } = newData;	// dont overwrite some fields
			Object.assign(
				this,
				safeData
			);
			this.fetched = true;
			this.notify();	// update subscribers
		} catch (err) {
			log(`FrontSong(fetchData): ${err}`, 3);
		}
	}

	/** add a function as a listener (which will get called on field changes) */
	subscribe(fn: () => void) {
		this.listeners.add(fn)
	}
	/** notify subscribers of a field change */
	private notify() {
		log(`FrontSong(notify): ${this.listeners.size}`, 5);
		this.listeners.forEach(fn => fn())
	}

	/** return a html table row */
	private row(label: string, value: string|any): string {
		return `<tr><th>${label}</th><td>${String(value) || "-"}</td></tr>`
	}
	/** shows a detailed view of this (in a dialog popup) */
	showDetails() {
		this.fetchData();	// fetch data from the server

		// fetch html elements
		const dialog = document.getElementById("song-details") as HTMLDialogElement;
		if (!(dialog instanceof HTMLDialogElement)) throw new Error("FrontSong(showDetails): missing '#song-details' DialogElement");
		const header = document.getElementById("song-details-header") as HTMLDivElement
		if (!(header instanceof HTMLDivElement)) throw new Error("FrontSong(showDetails): missing '#song-details-header' DivElement");
		const content = document.getElementById("song-details-content") as HTMLDivElement
		if (!(content instanceof HTMLDivElement)) throw new Error("FrontSong(showDetails): missing '#song-details-content' DivElement");
		const closeBtn = document.getElementById("song-details-close-btn") as HTMLButtonElement
		if (!(closeBtn instanceof HTMLButtonElement)) throw new Error("FrontSong(showDetails): missing '#song-details-close-btn' ButtonElement");

		// connect close button
		if (closeBtn.dataset.hasListener !== 'true') {
			closeBtn.addEventListener('click', () => {
				dialog.close();
			});
			closeBtn.dataset.hasListener = 'true';
		}

		// the function to call on song changes (renders the popup content)
		const updatePopup = () => {
			// header
			header.innerHTML = `<h3>${this.showName()}</h3>`;

			// content
			const ext = `<a href='${this.savePath}' download>${this.ext}</a>`
			const size = this.size > 0 ? `${(this.size / 1024 / 1024).toFixed(2)} MB` : "-";	// bytes -> MB
			const files: string[] = [];
			this.getPaths().forEach((path) => {
				files.push(`<a href='${path}'>${path}</a>`)
			});

			const html = `
			<table class="song-table">
				${window.VERBOSE > 3 ? this.row("ID", this.id) : ""}
				${this.row("Name", this.name)}
				${this.row("Artist", this.artist)}
				${this.row("Path", this.path)}
				${this.row("Extension", ext)}
				${this.row("Length", formatDuration(this.length))}
				${this.row("Size", size)}
				${this.row("Release Date", this.releaseDate)}
				${this.row("Tags", this.tags.join(", "))}
				${this.row("Notes", this.notes)}
				${this.row("Files", files.join(", "))}
			</table>
			`;
			content.innerHTML = html;
			log(`FrontSong(updatePopup): ${html}`, 5);
		}
		this.subscribe(updatePopup);
		updatePopup();

		// show the popup
		dialog.showModal();
	}
}

