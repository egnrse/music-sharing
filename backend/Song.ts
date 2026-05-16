/**
 * @fileoverview implementation of the Song class
 * @author Elia
 */

import path from "path";
import fs from "fs";

import { log } from  "./globals.js";
import BaseSong from "./shared/BaseSong.js"
import type { SongInterface, SongKey } from "./shared/BaseSong.js"


export default class Song extends BaseSong {
	override files: Song[] = [];

	constructor(filePath: string, name?: string, artist?: string) {
		super(filePath, name, artist);
		if (this.name.length == 0) {
			const SEPERATOR = " - ";
			const base = path.basename(filePath, path.extname(filePath));
			const parts = base.split(SEPERATOR).map(s => s.trim());
			this.name = parts.slice(1).join(SEPERATOR) ?? "";
			this.artist = parts[0] ?? "";
		}
	}

	/** automatically fill some fields of this */
	async populate(recursive = true) {
		// length
		try {
			const { parseFile } = await import("music-metadata");
			const metadata = await parseFile(this.path);
			this.length = metadata.format.duration ?? -1;
		} catch (err) {
			log(`failed to get song length: ${err}`, 4);
		}
		// size
		try {
			const stat = fs.statSync(this.path);
			this.size = stat.size;
		} catch (err) {
			log(`failed to get file size: ${err}`, 4);
		}

		// recursion in parallel
		if (recursive && this.files?.length) {
			await Promise.all(
				this.files.map((s) => s.populate(true))
			);
		}
		//if (recursive) {
		//	for (const s of this.files ?? []) {
		//		s.populate(recursive);
		//	}
		//}
	}
}

