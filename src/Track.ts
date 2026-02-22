/**
 * @file Track.ts
 * @fileoverview implementation of class Track
 * @author Elia
 */

import type { FilePath } from  "./types";

export class Track {
	path: FilePath;
	dir: string;
	artist: string;
	name: string;
	ext: string;

	constructor(dir: string, base: string) {
		this.path = `${dir}/${base}` as FilePath;
		this.dir = dir;
		const dotIndex = base.lastIndexOf(".");
		this.ext = dotIndex >= 0 ? base.slice(dotIndex+1) : "";
		const name = dotIndex >= 0 ? base.slice(0, dotIndex) : base;

		const [artist, ...trackParts] = name.split(" - ");
		this.artist = artist;
		this.name = trackParts.join(" - ");
	}

	toString(): string {
		return `${this.artist} - ${this.name}`;
	}
}
