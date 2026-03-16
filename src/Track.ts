/**
 * @file Track.ts
 * @fileoverview implementation of class Track
 * @author Elia
 */

import type { FilePath } from  "./globals.js";
import { log, escapeHtml } from  "./globals.js";

export class Track {
	path: FilePath;
	savePath: FilePath;
	dir: string;	// directory where to find the file
	artist: string;	// artist names
	name: string;	// track title
	ext: string;	// file extension

	constructor(dir: string, base: string) {
		this.path = `${dir}/${base}` as FilePath;
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
