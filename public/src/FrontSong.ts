/**
 * @file FrontSong.ts
 * @fileoverview implementation of the FrontSong class
 * @author Elia
 */

import type { SongInterface, SongKey } from "./shared/BaseSong.js"
import type { detailsAPI } from "./shared/shared.js"
import { log, escapeHtml, FIELD_VALUES } from  "./globals.js";
import BaseSong from "./shared/BaseSong.js"


export default class FrontSong extends BaseSong {
	override files: FrontSong[] = [];

	private listeners: (() => void)[] = []			// functions to call on field changes

	constructor(filePath: string, name?: string, artist?: string) {
		super(filePath, name, artist);
		//this.fetchData();
	}

	/** returns a html escaped path */
	get savePath(): string {
		return escapeHtml(this.path);
	}

	/** fetch more data about this song from the server */
	private async fetchData() {
		const raw:detailsAPI[] = await fetch(`api/details?path=${encodeURIComponent(this.path)}`).then(r => r.json());
		log(`FrontSong: loaded ${JSON.stringify(raw,null,2)}`, 5);

		//const [hms] = data.duration.split(".");	// HH:MM:SS.ms (removes the .ms)
		//const [h,m,s] = hms.split(":")
		//if (Number(h) > 0) this.duration = `${Number(h)}:${m}:${s}`;
		//else this.duration = `${m}:${s}`;

		try {
			const newData = FrontSong.from(raw[0]);

			Object.assign(
				this,
				newData
			);
			this.notify();	// update subscribers
		} catch (err) {
			log(`FrontSong(fetchData): ${err}`, 3);
		}

	}

	/** add a function as a listener (which will get called on field changes) */
	subscribe(fn: () => void) {
		this.listeners.push(fn)
	}
	/** notify subscribers of a field change */
	private notify() {
		this.listeners.forEach(fn => fn())
	}
}

