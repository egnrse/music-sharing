/**
 * @file Track.ts
 * @fileoverview implementation of class Track
 * @author Elia
 */

import type { FilePath, detailsFile } from  "./globals.js";
import { log, escapeHtml, FIELD_VALUES } from  "./globals.js";

export class Track {
	path: FilePath;
	savePath: FilePath;	// html save file path
	dir: string;		// directory where to find the file
	artist: string;		// artist names
	name: string;		// track title
	ext: string;		// file extension

	duration: string = FIELD_VALUES.NOTLOADED;		// duration of track
	releaseDate: string = FIELD_VALUES.NOTLOADED;	// release date of the track
	tags: string[] = [FIELD_VALUES.NOTLOADED];		//dev unused

	private listeners: (() => void)[] = []			// functions to call on field changes

	constructor(dir: string, base: string) {
		this.path = `${dir}/${base}`.replace(/\/{2,}/g, '/') as FilePath;
		this.dir = dir;
		const dotIndex = base.lastIndexOf(".");
		this.ext = dotIndex >= 0 ? base.slice(dotIndex+1) : "";
		const name = dotIndex >= 0 ? base.slice(0, dotIndex) : base;

		const [artist, ...trackParts] = name.split(" - ");
		this.artist = artist;
		this.name = trackParts.join(" - ");
		if (this.name.length < 1) {
			log(`Track: no artist: '${this.showName()}'`, 3);
			this.name = this.artist;
			this.artist = '';
		}

		this.savePath = escapeHtml(this.path) as FilePath;
		this.fetchData();
	}
	/** fetch more data about this track from the server */
	private async fetchData() {
		const data:detailsFile = await fetch(`api/file.php?path=${this.path}`).then(r => r.json());
		log(`Track: loaded ${JSON.stringify(data,null,2)}`, 5);

		const [hms] = data.duration.split(".");	// HH:MM:SS.ms (removes the .ms)
		const [h,m,s] = hms.split(":")
		if (Number(h) > 0) this.duration = `${Number(h)}:${m}:${s}`;
		else this.duration = `${m}:${s}`;

		this.releaseDate = data.releaseDate;
		this.tags = data.tags;

		this.notify();	// update subscribers
	}

	/** add a function as a listener (which will get called on field changes) */
	subscribe(fn: () => void) {
		this.listeners.push(fn)
	}
	/** notify subscribers of a field change */
	private notify() {
		this.listeners.forEach(fn => fn())
	}

	/**
	 * print a nice name of the current song
	 */
	showName(): string {
		if (this.artist.length > 0) return `${this.artist} - ${this.name}`;
		else return `${this.name}`;
	}

	toString(): string {
		return `Track: ${this.showName()}`;
	}
	equals(other: unknown): boolean {
		if (!(other instanceof Track)) return false;
		return this.artist == other.artist && this.name == other.name;
	}
}
