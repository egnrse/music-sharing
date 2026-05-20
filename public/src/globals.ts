/**
 * @file globals.ts
 * @fileoverview some custom global constants/functions/types
 * @author Elia
 */

import type { SongKey } from "./shared/BaseSong.js"
import FrontSong from "./FrontSong.js";
import { logConfig } from  "./shared/shared.js";


/** add extra parameters to global */
declare global {
	interface Window {
		VERBOSE: number;	// verbosity of the custom log function
	}
}


/// CONST
/**
 * how verbose the custom log function is (bigger means more)
 * can be overwritten in the browser console with 'VERBOSE=n'
 */
window.VERBOSE = 3;
// connect logConfig.VERBOSE to window,VERBOSE
Object.defineProperty(logConfig, "VERBOSE", {
	get() { return window.VERBOSE; }
});

/** a storage of possible table columns */
export const COLUMN_REC: Record<string, Column> = {
	// meta columns
	play: {
		label: "",
		noUpdate: true,
		width: "2%",
		content: "path",
		render: (song: FrontSong) => 
			`<button class='play-btn' data-src='${song.savePath}'>▶</button>`
	},
	options: {
		label: "",
		noUpdate: true,
		width: "2%",
		content: "path",
		render: (song: FrontSong) => 
			`<button class='options-btn' data-src='${song.savePath}'><b>⋯</b></button>`
	},
	// columns
	name: {
		label: "Name",
		width: "35%",
		sortable: true,
		type: "string",
		content: "name"
	},
	artist: {
		label: "Artist",
		width: "25%",
		sortable: true,
		type: "string",
		content: "artist"
	},
	file: {
		label: "File",
		width: "5%",
		sortable: true,
		type: "string",
		content: ["ext","path"],
		render: (song: FrontSong) =>
			`<a href='${song.savePath}' download>${song.ext}</a>`
	},
	length: {
		label: "Length",
		width: "5%",
		textAlign: "right",
		sortable: true,
		type: "string",
		content: "length",
		render: (song: FrontSong) => `${formatDuration(song.length)}`
	},
	releaseDate: {
		label: "Released",
		width: "10%",
		sortable: true,
		type: "string",
		content: "releaseDate"
	},
};
/** default active/visible columns */
const c = COLUMN_REC;	// helper
export const DEFAULT_COLUMNS:Column[] = [c.play,c.name,c.artist,c.releaseDate,c.options];
/** special data values */
export const FIELD_VALUES = {
	NOTLOADED: "(...)",	// data not loaded yet
	EMPTY: "(empty)"			// missing or empty data 
}


/// FUNCTIONS
/**
 * custom log function
 * @param text - the text to log
 * @param level - the log level (default 1)
 */
export function log(text: string, level = 1) {
	if (window.VERBOSE >= level){
		const out = `L${level}: ${text}`;
		console.log(out);
	}
}
/**
 * make a string html save, by escapeing dangerous characters
 * @param input - the string to escape
 * @return the escaped string
 */
export function escapeHtml(input: string): string {
	return input
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}
/**
 * format a duration into a nice human readable string (mm:ss/h:mm:ss)
 * @param seconds - the length in seconds
 * @param hour - if to split into hours too
 * @return the formated string
 */
export function formatDuration(seconds: number, hour = false): string {
	if (seconds < 0) log(`formatDuration(): input is below 0 (${seconds})`, 4);
	const h = Math.floor(seconds / 3600);
	const hm = Math.floor((seconds % 3600) / 60);	// minutes with hours removed
	const m = Math.floor(seconds / 60);				// minutes ignoring hours
	const s = Math.floor(seconds % 60);

	if (hour && h > 0)
		return `${h}:${hm.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
	else return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}


/// OTHER
/** object to store info about a table columns */
export type Column = {
	label: string;		// name at the top (header)
	noUpdate?: boolean;	// do not update the cell on song changes (default=false)
	sortable?: boolean;	// data-sortable= (if the column is sortable, default=false)
	type?: string;		// data-type=
	width?: string;		// colgroup.style.*
	textAlign?: string;	// supports 'right' (implemented using css, default=left)
	content?: SongKey[]|SongKey;	// what fields to fetch from the server (default render output string)
	render?: (song: FrontSong) => string;	// innerHTML= (how to render this column; if not given shows this.content[0])
};
/** playmode states */
export enum PlayMode {
	Norm = 0,	// normal (stops after current song)
	Loop = 1,	// loop
	Rand = 2	// random
}
