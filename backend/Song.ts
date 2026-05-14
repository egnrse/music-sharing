/**
 * @fileoverview implementation of the Song class
 * @author Elia
 */

import path from "path"

import { log } from  "./globals.js"
import DateString from "./DateString.js"

export default class Song {
	id: string;
	name: string;	// title of this Song
	path: string;	// path to the play file
	ext: string;	// extension of the play file
	
	// Optional fields:
	artist: string = "";
	releaseDate: DateString = new DateString(null, true);
	files: Song[] = [];

	length: number = -1;	// in seconds
	notes: string = "";
	tags: string[] = [];


	constructor(filePath: string, name?: string, artist?: string) {
		this.id = filePath;
		this.path = filePath;
		this.ext = path.extname(filePath).slice(1);
		
		this.name = name ?? "";
		this.artist = artist ?? "";
		if (this.name.length == 0) {
			const SEPERATOR = " - ";
			const base = path.basename(filePath, path.extname(filePath));
			const parts = base.split(SEPERATOR).map(s => s.trim());
			this.name = parts.slice(1).join(SEPERATOR) ?? "";
			this.artist = parts[0] ?? "";
		}
	}

	/** automatically fill some fields of this */
	async populate() {
		try {
			const { parseFile } = await import("music-metadata");
			const metadata = await parseFile(this.path);
			this.length = metadata.format.duration ?? -1;
		} catch (err) {
			log(`failed to get song lenght: ${err}`, 5);
		}
	}

	/** fetches a list of paths recursively */
	getPaths(): string[] {
		const paths = new Set<string>();
		paths.add(this.path);
		for (const s of this.files ?? []) {
			for (const p of s.getPaths()) paths.add(p);
		}
		//paths.add(...s.getPath());
		return [...paths];
	}

	/** print a nice name of the current song */
	showName(): string {
		if (this.name.length > 0) {
			if (this.artist.length > 0) return `${this.artist} - ${this.name}`;
			else return `${this.name}`;
		} else {
			return `${this.path}`
		}
	}

	toString(): string {
		return `Song: ${this.showName()}`;
	}
	toJSON(): any {
		const obj = { ...this };

		return {
			...obj,
			releaseDate: this.releaseDate.toString(),
		};
	}
	equals(other: unknown): boolean {
		if (!(other instanceof Song)) return false;
		if (this.id !== other.id) return false;
		if (this.name != other.name) return false;
		if (this.path != other.path) return false;
		if (this.ext != other.ext) return false;
		
		//if (this.artist != other.artist) return false;
		//if (this.files.length !== other.files.length) return false;

		const a = this.files.map(f => f.id).sort();
		const b = other.files.map(f => f.id).sort();
		for (let i = 0; i < a.length; i++) {
			if (a[i] !== b[i]) return false;
		}
		return true;
	}

	/** create a Song obj from data */
	static from(data: any): Song {
		if (!Song.validate(data)) throw new Error("invalid song data");

		const song = new Song(data.path, data.name);
		const { files, ...rest } = data;
		// merge data into the song obj
		Object.assign(
			song,
			rest
		);
		// handle recursion
		song.files = (data.files ?? []).map((f: any) => Song.from(f));

		return song;
	}

	/** test if data has the minimum fields to be a Song */
	static validate(data: any): boolean {
		if (!data) { log(`invalid data`, 6); return false;}
		if (typeof data !== "object") { log(`'data' is not of type 'object'`, 6); return false;}
		if (typeof data.id !== "string") { log(`'data.id' is not of type 'string' (${data.id})`, 6); return false;}
		if (typeof data.name !== "string") { log(`'data.name' is not of type 'string' (${data.name})`, 6); return false;}
		if (typeof data.path !== "string") { log(`'data.path' is not of type 'string' (${data.path})`, 6); return false;}
		if (typeof data.ext !== "string") { log(`'data.ext' is not of type 'string' (${data.ext})`, 6); return false;}

		// allowed Song fields
		const allowed = new Set([
			"id","name","path","ext",
			"artist","releaseDate","files",
			"length","notes","tags"
		]);
		for (const key of Object.keys(data)) {
			if (!allowed.has(key)) {
				log(`unexpected field: ${key}`, 6);
				return false;
			}
		}

		return true;
	}
}
