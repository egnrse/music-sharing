/**
 * @file globals.ts
 * @fileoverview some custom global constants/functions/types
 * @author Elia
 */

import fs from "fs";
import path from 'path';

import Song from './Song.js';


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

/**
  *	load/instantiate the database
  *	@param file - the database file
  *	@return the db or an error
  */
export function loadDB(file: string): Record<string, Song> {
	log(`loadDB: ${file}`, 5);
	if (!fs.existsSync(file)) return {}
	let raw;
	try {
		raw = JSON.parse(fs.readFileSync(file, "utf-8"));
	} catch (err: any) {
		throw new Error(`failed to parse database file (${err})`)
	}
	const db: Record<string, Song> = {};
	try {
		for (const [id, value] of Object.entries(raw)) {
			db[id] = Song.from(value);
		}
	} catch (err: any) {
		throw new Error(`failed to instantiate database (${err})`)
	}
	return db;
}
