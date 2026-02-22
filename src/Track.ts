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

	constructor(path: FilePath) {
		this.path = path;
		const parts = path.split("/");
		this.dir = parts.slice(0, -1).join("/");	// everything except last
		const base = parts[parts.length - 1];		// artist - track.extension

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
