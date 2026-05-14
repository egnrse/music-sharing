/**
 * @file globals.ts
 * @fileoverview some custom global constants/functions/types
 * @author Elia
 */

import path from 'path';


/// CONST
/**
 * how verbose the custom log function is (bigger means more)
 * can be overwritten in the environment with 'VERBOSE=n'
 */
const VERBOSE = parseInt(process.env.VERBOSE ?? "3", 10);

export const PROJECT_ROOT = path.resolve(process.cwd());			// root of the project
export const PUBLIC_PATH = path.resolve(PROJECT_ROOT, 'public');	// path to the frontend
export const FILES_PATH = path.resolve(PROJECT_ROOT, 'files');		// path to the media files
export const FILE_TYPES = ["mp3", "wav", "flac"];					// media types to search for
export const DB_FILE = path.join(PROJECT_ROOT, "./files/data.json")	// media file database

/// FUNCTIONS
/**
 * custom log function
 * @param text - the text to log
 * @param level - the log level (default 1)
 */
export function log(text: string, level = 1) {
	if (VERBOSE >= level){
		const out = `L${level}: ${text}`;
		console.log(out);
	}
}

