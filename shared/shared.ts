/**
 * @fileoverview shared types/intefaces between front/backend
 * @author Elia
 */

import type { SongInterface, SongKey } from  "./BaseSong.js";


/// CONST
/**
 * how verbose the custom log function is (bigger means more)
 */
export const logConfig = {
	VERBOSE: 3
};


/// TYPES
/** api interface */
export type filesAPI = Partial<Record<SongKey,any>>[];
export type detailsAPI = SongInterface[];


/// FUNCTIONS
/**
 * custom log function
 * @param text - the text to log
 * @param level - the log level (default 1)
 */
export function log(text: string, level = 1) {
	if (logConfig.VERBOSE >= level){
		const out = `L${level}: ${text}`;
		console.log(out);
	}
}


