/**
 * @file globals.ts
 * @fileoverview some custom global constants/functions/types
 * @author Elia
 */

import { Track } from "./Track.js";

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
		render: (track: Track) => 
			`<button class='play-btn' data-src='${track.savePath}'>Play</button>`
	},
	track: {
		label: "Track",
		width: "35%",
		sortable: true,
		type: "string",
		render: (track: Track) => `${track.name}`
	},
	artist: {
		label: "Artist",
		width: "25%",
		sortable: true,
		type: "string",
		render: (track: Track) => `${track.artist}`
	},
	file: {
		label: "File",
		width: "5%",
		sortable: true,
		type: "string",
		render: (track: Track) =>
			`<a href='${track.savePath}' download>${track.ext}</a>`
	},
	duration: {
		label: "Length",
		width: "5%",
		textAlign: "right",
		sortable: true,
		type: "string",
		render: (track: Track) => `${track.duration}`
	},
	releaseDate: {
		label: "Released",
		width: "10%",
		sortable: true,
		type: "string",
		render: (track: Track) => `${track.releaseDate}`
	},
};
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
	noUpdate?: boolean;	// do not update the cell on track changes (default=false)
	sortable?: boolean;	// data-sortable= (if the column is sortable, default=false)
	type?: string;		// data-type=
	width?: string;		// colgroup.style.*
	textAlign?: string;	// supports 'right' (implemented using css, default=left)
	render: (track:Track) => string;	// innerHTML= (how to render this column )
};
/** a string that holds a (server) filepath */
export type FilePath = string & { __brand: "FilePath" };
/** /api/files.php returns a list of this */
export interface singleFile {
	name: string;
	folder: string;
}
/** /api/file.php?path=files/file.mp3 returns this */
export interface detailsFile {
	name: string;
	folder: string;
	path: FilePath;
	filename: string;
	extension: string;
	size: number;
	duration: string;
	releaseDate: string;
	tags: string[];
}
/** playmode states */
export enum PlayMode {
	Norm = 0,	// normal (stops after current song)
	Loop = 1,	// loop
	Rand = 2	// random
}
