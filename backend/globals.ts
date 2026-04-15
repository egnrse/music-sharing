/**
 * @file globals.ts
 * @fileoverview some custom global constants/functions/types
 * @author Elia
 */

/// CONST
/**
 * how verbose the custom log function is (bigger means more)
 * can be overwritten in the environment with 'VERBOSE=n'
 */
const VERBOSE = parseInt(process.env.VERBOSE ?? "3", 10);

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

