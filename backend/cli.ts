#!/usr/bin/env ts-node

import fs from "fs";
import path from "path";
import enquirer from "enquirer";

import { PROJECT_ROOT,PUBLIC_PATH,FILES_PATH,FILE_TYPES,DB_FILE } from "./globals.js";
import { log, loadDB } from  "./globals.js";
import DateString from "./shared/DateString.js";
import Song from "./Song.js";


/// FUNCTIONS
function saveDB(file: string, db: Record<string, Song>) {
	log(`saveDB: ${file}`, 5);
	fs.writeFileSync(file, JSON.stringify(db, null, 2))
}

// recursively get all files within 'directory' (with a certain type ([] returns every type))
// returns a list of relative paths (towards 'root')
function getFiles(directory: string, types?: string[], root?: string): string[] {
	const fileTypes = types ?? [];
	const rootDir = root ?? directory;
	log(`getFiles: ${directory} ${fileTypes.length ? `(${fileTypes})`: ""}`, 5);
	function walk(directory: string): string[] {
		const entries = fs.readdirSync(directory, { withFileTypes: true });

		return entries.flatMap((entry) => {
			const full = path.join(directory, entry.name);
			if(entry.isDirectory())
				return walk(full);
			// check for file type
			const ext = path.extname(entry.name).slice(1);
			if(fileTypes.length < 1 || fileTypes.includes(ext)) {
				return path.relative(rootDir, full);
			}
			return [];
		});
	}
	return walk(directory);
}

// check file paths in allFiles
function checkMissingPaths(list:string[], allFiles:string[]) {
	const missingPaths: string[] = [];
	for (const file of list) {
		if (!allFiles.includes(file)) {
			missingPaths.push(file);
		}
	}
	return missingPaths;
}

/*
// group by filename without extension
function groupFiles(files: string[]) {
	const map: Record<string, string[]> = {}

	for (const file of files) {
		const ext = path.extname(file)
		const base = file.replace(ext, "")

		if (!map[base]) map[base] = []
		map[base].push(file)
	}

	return map
}

*/

// interactively edit a songs fields
// returns the edited song
async function editSong(song: Song): Promise<Song> {
	const edit = new (enquirer as any).Form({
		name: "song",
		message: "edit song",
		choices: [
			{ name: "artist", message: "artist", initial: song.artist },
			{ name: "name", message: "song name", initial: song.name },
			{ name: "releaseDate", message: "release date", initial: song.releaseDate.toString() },
			{ name: "notes", message: "notes", initial: song.notes },
		],
	});
	try {
		const edited = await edit.run();

		song.name = edited.name;
		song.artist = edited.artist;
		try { song.releaseDate = new DateString(edited.releaseDate);}
		catch (err) { log(`${err} (expected: yyyy-mm-dd)`,3);}
		song.notes = edited.notes;
	} catch (err) {
		log(`edit aborted (${err})`, 5);
	}
	return song;
}

// interactively select a song from a list
// returns the key of the selected song (or "")
async function selectSong(songs: Record<string, Song>): Promise<string> {
	if (Object.keys(songs).length <= 0) { return ""; }
	const select = new (enquirer as any).Select({
		name: "song",
		message: "select song to edit",
		choices: Object.entries(songs).map(([key, s]) => ({
			name: key,	// internal value
			message: `${s}`,	// UI
		})),
	});
	return select.run();
}

/// MAIN
async function main() {
	let db: Record<string, Song> = {};
	try { db = loadDB(DB_FILE); }
	catch (err) { console.warn(`[WARN] ${err}`); }
	const allFiles: string[] = getFiles(FILES_PATH, FILE_TYPES, PROJECT_ROOT);
	log(`read files:\n${allFiles.map(p => `\t- ${p}`).join("\n")}`, 6);

	const allDbFiles = new Set(Object.values(db).flatMap(song => song.getPaths()));
	log(`files in DB:\n${Array.from(allDbFiles).map(p => `\t- ${p}`).join("\n")}`, 6);

	const notInDbFiles = allFiles.filter(f => !allDbFiles.has(f));
	log(`files not in DB:\n${notInDbFiles.map(p => `\t- ${p}`).join("\n")}`, 5);

	// check file paths in allFiles
	const missingPaths = checkMissingPaths(Array.from(allDbFiles), allFiles);
	if (missingPaths.length > 0) {
		console.log(`Missing files:\n${missingPaths.map(p => `\t- ${p}`).join("\n")}`, 1);
		const removeAsk = new (enquirer as any).Confirm({
			name: "remove",
			message: "Do you want to remove these from the DB?",
		});
		const remove = await removeAsk.run();
		if (remove) {
			for (const p of missingPaths) {
				delete db[p];
			}
		}
	}

	// new songs
	const newSongs: Record<string, Song> = {}
	for (const file of notInDbFiles) {
		// TODO: try auto grouping
		//
		const song = new Song(file);
		await song.populate();
		newSongs[song.id] = song;
		//log(`${newSongs.at(-1)?.artist} - ${newSongs.at(-1)?.name}`);
	}
	if (Object.entries(newSongs).length > 0) {
		console.log("Adding new Songs:")
		for (const [key,song] of Object.entries(newSongs)) {
			console.log(key);
			console.log(`  ${song}`)
		}
		let loop = true;
		try {
			while (loop) {
				const confirm = new (enquirer as any).Confirm({
					name: "edit",
					message: "Do you want to edit these songs?",
				});
				const edit = await confirm.run();
				if (edit) {
					try {
						const key = await selectSong(newSongs);
						const song = newSongs[key]!;
						const edited = await editSong(song);
						Object.assign(song, edited);
					} catch (err) { log(`edit aborted (${err})`, 5);}
				}
				else loop = false;
			}
			// save new songs to db
			for (const [key,song] of Object.entries(newSongs)) {
				if (!(key in db)) {
					db[key] = song;
					log(`saved '${key}' to db`, 5);
				} else {
					console.warn(`key collision in db with '${key}'`);
				}
			}
		} catch (err) { log(`adding new songs aborted (${err})`, 3);}
	}

	// edit loop
	let loop = true;
	while (loop) {
		
		const action = await new (enquirer as any).Select({
			name: "action",
			message: "What do you want to do?",
			choices: [
				{name: "save", message: "Save DB"},
				{name: "list", message: "List Songs"},
				{name: "edit", message: "Edit Songs"},
				{name: "cancel", message: "Cancel"}],
		}).run();
		//console.log(action);
		switch(action) {
			case "save":
				saveDB(DB_FILE, db);
				loop = false;
				break;
			case "list":
				for (const [key,song] of Object.entries(db)) {
					console.log(key);
					console.log(`  ${song}`)
				}
				break;
			case "edit":
				try {
					const key = await selectSong(db);
					const song = db[key];
					if (!song) { throw new Error(`song not found (key: ${key})`);}
					const edited = await editSong(song);
					db[key] = edited;
				} catch (err) { log(`edit aborted (${err})`, 5);}
				break;
			case "cancel":
				loop = false;
				break;
			default:
				log(`error: invalid action: ${action}`, 3);
				loop = false;
		}
		//console.log("\n");
	}

	console.log("done.")
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});
