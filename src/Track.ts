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

	duration: string = FIELD_VALUES.NOTLOADED;
	releaseDate: string = FIELD_VALUES.NOTLOADED;
	tags: string[] = [FIELD_VALUES.NOTLOADED];

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
