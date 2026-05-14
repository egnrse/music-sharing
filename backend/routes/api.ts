/**
 * @file routes/api.ts
 * @fileoverview manage the /api endpoint
 */ 

import { Router } from "express";
import fs from "fs";
import path from "path";

import { PROJECT_ROOT,PUBLIC_PATH,FILES_PATH,FILE_TYPES,DB_FILE } from "../globals.js";
import { log, loadDB } from  "../globals.js";
import Song from "../Song.js";
import type { SongInterface, SongKey } from "../shared.js"


/// VAR/CONST
const router = Router();
let dataCache: Record<string, Song> | null = null;


/// FUNCTIONS
/**  */
function saveLoadDB(dataCache: Record<string, Song>|null): Record<string, Song> {
	if (!dataCache) {
		try {
			dataCache = loadDB(DB_FILE);
		} catch (err: any) {
			console.error(`[ERR] loadDB: ${err}`)
			dataCache = {}
		}
	}
	return dataCache;
}

/** prepare a /api/files entry (showing only specific columns) */
function createEntry(song: Song, columns: SongKey[]): Partial<Record<SongKey,any>> {
	const idKey = "id";
	const filesKey = "files";
	
	let entry: Partial<Record<SongKey,any>> = {};
	entry[idKey] = song[idKey];	// always add 'id'
	const sJSON = song.toJSON();
	for (const col of columns) {
		// handle 'files' recursively
		if (col == filesKey) {
			let filesList: Partial<Record<SongKey,any>>[] = [];
			for (const file of song.files) {
				filesList.push(createEntry(file, columns));
			}
			if (filesList.length > 0) entry[filesKey] = filesList;
		}
		// handle all other fields
		else if (col in sJSON)
			entry[col] = sJSON[col];
	}
	return entry;
}


/// GET /api/files \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
const filesParam = "col"
const defaultCol: SongKey[] = ["path", "name", "artist", "releaseDate", "files"]
router.get("/files", (req, res) => {
	log(`GET ${req.originalUrl}`, 3);
	try {
		// get param
		const raw = req.query[filesParam];
		let param: SongKey[];
		if (!raw) param = defaultCol;
		else if (Array.isArray(raw)) param = raw.map(String) as SongKey[];
		else param = [String(raw) as SongKey];
		log(`param(${filesParam}): [${param}]`, 6);
		
		dataCache = saveLoadDB(dataCache);
		
		let response: Set<Partial<Record<SongKey,any>>> = new Set();
		for (const s of Object.values(dataCache)) {
			const entry = createEntry(s, param);
			response.add(entry);
		}
		
		const sending = [...response];
		log(JSON.stringify(sending, null, "  "), 7);
		res.json([...sending]);
	} catch (err) {
		res.status(500).json({ error: "failed to read files" });
		console.error(`[ERROR] ${err}`)
	}
});
router.get("/files.php", (req, res) => {
	console.warn(`[DEPRECATED] redirect '/api/files.php' to '/api/files' (used by '${req.ip}')`);
	// redirect permanently (301) or temporarily (302)
	const url = "/api/files?" + new URLSearchParams(req.query as any).toString();
	res.redirect(302, url);
});


/// GET /api/details \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
const detailsParam = "path"
router.get("/details", (req, res) => {
	log(`GET ${req.originalUrl}`, 3);
	try {
		// get param
		const raw = req.query[detailsParam];
		if (!raw) {
			return res.status(400).json({
				error: "missing parameter",
				detail: `${detailsParam} is required`
			});
		}
		
		let param: string[];
		if (Array.isArray(raw)) {
			param = raw.map(String);
		} else {
			param = [String(raw)];
		}
		log(`param(${detailsParam}): [${param}]`, 6);
		
		dataCache = saveLoadDB(dataCache);
		
		const response: Set<SongInterface> = new Set();
		//const id = param;
		for (const id of param) {
			let song: Song|null = null;
			
			// get song with id
			if (id in dataCache) {
				song = dataCache[id] ?? null;
			} else {
				for (const s of Object.values(dataCache)) {
					const result = s.getSong(id);
					if (result) {
						song = result;
						break;
					}
				}
			}
			if (song == null) {
				return res.status(404).json({
					error: `id not found`,
					detail: `${detailsParam}: '${id}'`
				});
			}
			response.add(song.toJSON());
		}
		const sending = [...response];
		log(JSON.stringify(sending, null, "  "), 7);
		res.json([...sending]);
	} catch (err: any) {
		res.status(500).json({ error: "internal error" });
		console.error(`[ERROR] ${err.message}`)
	}
});
router.get("/file.php", (req, res) => {
	console.warn(`[DEPRECATED] redirect '/api/file.php' to '/api/details' (used by '${req.ip}')`);
	// redirect permanently (301) or temporarily (302)
	const url = "/api/details?" + new URLSearchParams(req.query as any).toString();
	res.redirect(302, url);
});
export default router;
