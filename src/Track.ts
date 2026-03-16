/**
 * @file Track.ts
 * @fileoverview implementation of class Track
 * @author Elia
 */

import type { FilePath } from  "./globals";

export function escapeHtml(input: string): string {
	return input
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

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

		this.savePath = escapeHtml(this.path) as FilePath;
	}

	toString(): string {
		return `${this.artist} - ${this.name}`;
	}
}
