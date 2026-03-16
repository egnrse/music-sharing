/**
 * @file main.ts 
 * @fileoverview main function, managing other parts
 * @author Elia
 */

import type { singleFile } from  "./globals.js";
import { log } from  "./globals.js";
import { Track } from "./Track.js";
import { Table } from "./Table.js";
import { Player } from "./Player.js";


/// VAR/CONST
let table:Table;
let player:Player;

let fileListRaw:singleFile[] = [];
let trackList:Track[] = [];


/// FUNCTIONS
/**
 *	fetches the file list
 */
async function fetchFileList(): Promise<singleFile[]> {
	log(`fetch: files.php`, 3);
	//const data: singleFile[] = await fetch(`list_files.php?offset=${offset}&limit=${limit}`).then(r => r.json());
	const data: singleFile[] = await fetch(`files.php`).then(r => r.json());
	//totalFiles = data.total;
	return data;
}
/** 
 * forwards the call to player.playTrack
 * @param args - allow arguments of player.playTrack
 */
function playTrack(...args:Parameters<typeof player.playTrack>) {
	player.playTrack(...args);
}


async function main() {
	// autoload song (preparations)
	const params = new URLSearchParams(window.location.search);
	const pathParam = params.get('path');
	if (pathParam) log(`autoload: '${pathParam}'`, 3);
	else log(`autoload: no param 'path' found`, 3);

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
	table.update(trackList);

	// load search
	// -> give tracks?
}


/// MAIN
table = new Table(playTrack);
player = new Player(trackList);

// defer all other things until the page has loaded
document.addEventListener("DOMContentLoaded", () => {
	main()
});
