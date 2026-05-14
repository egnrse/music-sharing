#!/usr/bin/env ts-node

import fs from "fs"
import path from "path"
import enquirer from "enquirer"
//import { parseFile } from "music-metadata"

import { log } from  "./globals.js"
import Song from "./Song.js"

const PROJECT_ROOT = path.resolve(process.cwd());
const SEARCH_DIR = path.join(PROJECT_ROOT, "files")
const FILE_TYPES = ["mp3", "wav", "flac"];
const DB_FILE = path.join(PROJECT_ROOT, "./files/data.json")


/// FUNCTIONS
function loadDB(file: string): Record<string, Song> {
	log(`loadDB: ${file}`, 5);
	if (!fs.existsSync(file)) return {}
	const raw = JSON.parse(fs.readFileSync(file, "utf-8"));
	const db: Record<string, Song> = {};
	for (const [id, value] of Object.entries(raw)) {
		db[id] = Song.from(value);
	}
	return db;
}
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

// extract basic metadata
async function getMetadata(file: string) {
	try {
		const meta = await parseFile(file)
		return {
			duration: meta.format.duration ?? 0,
			artist: meta.common.artist ?? "",
			name: meta.common.title ?? ""
		}
	} catch {
		const name = path.basename(file)
		const match = name.match(/^(.*?)\s*-\s*(.*)$/)
		if(!match) {
			return { duration: 0, artist: "", name: "", }
		}
		return { duration: 0, artist: match[1].trim(), name: match[2].trim(), }
	}
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
			{ name: "releaseDate", message: "release date", initial: song.releaseDate },
			{ name: "notes", message: "notes", initial: song.notes },
		],
	});
	try {
		const edited = await edit.run();
		const result: Song = {
			...song,
			...edited,
		};
		if (Song.validate(result)) return result;
		else throw new Error(`'result' is not a valid Song`);
	} catch (err) {
		log(`edit aborted (${err})`, 5);
		return song;
	}
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
	const db: Record<string, Song> = loadDB(DB_FILE);
	const allFiles: string[] = getFiles(SEARCH_DIR, FILE_TYPES, PROJECT_ROOT);
	log(`read files:\n${allFiles.map(p => `\t- ${p}`).join("\n")}`, 6);

	const allDbFiles = new Set(Object.values(db).flatMap(song => song.getPaths()));
	log(`files in DB:\n${Array.from(allDbFiles).map(p => `\t- ${p}`).join("\n")}`, 6);

	const notInDbFiles = allFiles.filter(f => !allDbFiles.has(f));
	log(`files not in DB:\n${notInDbFiles.map(p => `\t- ${p}`).join("\n")}`, 5);

	const newSongs: Record<string, Song> = {}
	for (const file of notInDbFiles) {
		// TODO: try auto grouping
		//
		const song = new Song(file);
		newSongs[song.id] = song;
		//log(`${newSongs.at(-1)?.artist} - ${newSongs.at(-1)?.name}`);
	}

	// new songs
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
