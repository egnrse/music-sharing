/**
 * @file main.ts 
 * @fileoverview main function, managing other parts
 * @author Elia
 */

import type { filesAPI } from "./shared/shared.js"
import { log } from  "./globals.js";
import Table from "./Table.js";
import Player from "./Player.js";
import FrontSong from "./FrontSong.js";


/// VAR/CONST
let table: Table;
let player: Player;

let fileListRaw: filesAPI = [];
let songList: FrontSong[] = [];


/// FUNCTIONS
/**
 *	fetches the file list
 */
async function fetchFileList(): Promise<filesAPI> {
	log(`fetch: files.php`, 3);
	//const data: singleFile[] = await fetch(`list_files.php?offset=${offset}&limit=${limit}`).then(r => r.json());
	const data: filesAPI = await fetch(`api/files`).then(r => r.json());
	//totalFiles = data.total;
	return data;
}
/** 
 * forwards the call to player.playSong
 * @param args - allow arguments of player.playSong
 */
function playSong(...args:Parameters<typeof player.playSong>) {
	player.playSong(...args);
}


async function main() {
	// autoload song (preparations)
	const params = new URLSearchParams(window.location.search);
	const pathParam = params.get('path');
	if (pathParam) log(`autoload: '${pathParam}'`, 3);
	else log(`autoload: no param 'path' found`, 3);

	// manage song data-struct
	fileListRaw = [];
	const data = await fetchFileList();
	fileListRaw.push(...data);
	for (const f of fileListRaw) {
		const song = new FrontSong(f.path, f.name, f.artist);
		songList.push(song);

		// autoload song
		if (pathParam && song.path === pathParam) {
			playSong(song, true);
		}
	}
	

	// load table
	//  (init hidden Song values)
	table.update(songList);

	// load search
	// -> give tracks?
}


/// MAIN
table = new Table(playSong);
player = new Player(songList);

// defer all other things until the page has loaded
document.addEventListener("DOMContentLoaded", () => {
	main()
});
