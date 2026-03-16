/**
 * @file globals.ts
 * @fileoverview some custom global types/functions
 * @author Elia
 */

/** add extra parameters to global */
declare global {
	interface Window {
		VERBOSE: number;
	}
}

/// CONST
/**
 * how verbose to be (bigger means more)
 * can be overwritten in the borwser console with 'VERBOSE=n'
 */
window.VERBOSE = 3;


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
 * @param input - the string to esccape
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
export type FilePath = string & { __brand: "FilePath" };
export interface singleFile {
	name: string;
	folder: string;
}
/** playmode states */
export enum PlayMode {
	Norm = 0,	// normal (stops after current song)
	Loop = 1,	// loop
	Rand = 2	// random
}
