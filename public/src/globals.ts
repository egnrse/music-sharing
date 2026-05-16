/**
 * @file globals.ts
 * @fileoverview some custom global constants/functions/types
 * @author Elia
 */

import FrontSong from "./FrontSong.js";


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

/** a storage of possible table columns */
export const COLUMN_REC: Record<string, Column> = {
	play: {
		label: "Play",
		noUpdate: true,
		width: "5%",
		render: (song: FrontSong) => 
			`<button class='play-btn' data-src='${song.savePath}'>Play</button>`
	},
	name: {
		label: "Name",
		width: "35%",
		sortable: true,
		type: "string",
		render: (song: FrontSong) => `${song.name}`
	},
	artist: {
		label: "Artist",
		width: "25%",
		sortable: true,
		type: "string",
		render: (song: FrontSong) => `${song.artist}`
	},
	file: {
		label: "File",
		width: "5%",
		sortable: true,
		type: "string",
		render: (song: FrontSong) =>
			`<a href='${song.savePath}' download>${song.ext}</a>`
	},
	duration: {
		label: "Length",
		width: "5%",
		textAlign: "right",
		sortable: true,
		type: "string",
		render: (song: FrontSong) => `${song.length}`
	},
	releaseDate: {
		label: "Released",
		width: "10%",
		sortable: true,
		type: "string",
		render: (song: FrontSong) => `${song.releaseDate}`
	},
};
/** default active/visible columns */
const c = COLUMN_REC;	// helper
export const DEFAULT_COLUMNS:Column[] = [c.play,c.name,c.artist,c.file];
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


/// OTHER
/** object to store info about a table columns */
export type Column = {
	label: string;		// name at the top (header)
	noUpdate?: boolean;	// do not update the cell on song changes (default=false)
	sortable?: boolean;	// data-sortable= (if the column is sortable, default=false)
	type?: string;		// data-type=
	width?: string;		// colgroup.style.*
	textAlign?: string;	// supports 'right' (implemented using css, default=left)
	render: (song: FrontSong) => string;	// innerHTML= (how to render this column )
};
/** playmode states */
export enum PlayMode {
	Norm = 0,	// normal (stops after current song)
	Loop = 1,	// loop
	Rand = 2	// random
}
