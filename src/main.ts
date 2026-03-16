/**
 * @file main.ts 
 * @fileoverview main function, managing other parts
 * @author Elia
 */

import type { singleFile } from  "./globals";
import { Track } from "./Track.js";
import { Table } from "./Table.js";
import { playTrack } from "./player.js";	//dev


/// VAR/CONST
let table:Table;

let fileListRaw:singleFile[] = [];
let trackList:Track[] = [];


/// FUNCTIONS
/**
 *	fetches the file list
 */
async function fetchFileList(): Promise<singleFile[]> {
	//const data: singleFile[] = await fetch(`list_files.php?offset=${offset}&limit=${limit}`).then(r => r.json());
	const data: singleFile[] = await fetch(`files.php`).then(r => r.json());
	//totalFiles = data.total;
	return data;
}


/// MAIN
async function main() {
	// autoload song (preparations)
	const params = new URLSearchParams(window.location.search);
	const pathParam = params.get('path');

	// manage tracks data-struct
	fileListRaw = [];
	const data = await fetchFileList();
	fileListRaw.push(...data);
	for (const f of fileListRaw) {
		const track = new Track(f.folder, f.name);
		trackList.push(track);

		// autoload song
		if (pathParam && track.path === pathParam) {
			playTrack(track, true);
		}
	}
	

	// load table
	//  (init hidden Track values)
	table = new Table(playTrack);
	table.update(trackList);

	// load player
	// -> give tracks data-struct?

	// load search
	// -> give tracks?
}

// defer all things until the page has loaded
document.addEventListener("DOMContentLoaded", () => {
	main()
});
