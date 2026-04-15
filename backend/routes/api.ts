/**
 * @file routes/api.ts
 * @fileoverview manage the /api endpoint
 */ 

import { Router } from "express";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

import { log } from  "../globals.js";

/// VAR/CONST
const PROJECT_ROOT = path.resolve(process.cwd());
const router = Router();
let dataCache: Record<string, any> | null = null;

// files
const SEARCH_DIR = "files";
const FILE_TYPES = ["mp3", "wav", "flac"];
// details
const DB_PATH = path.join(PROJECT_ROOT, "files/data.json");;


/// FUNCTIONS
// recursively collect files
function getFiles(folder: string, baseDir: string): { name: string; folder: string }[] {
	let files: { name: string; folder: string }[] = [];

	const entries = fs.readdirSync(folder);

	for (const entry of entries) {
		if (entry === "." || entry === "..") continue;

		const fullPath = path.join(folder, entry);
		const stat = fs.statSync(fullPath);

		if (stat.isDirectory()) {
			// recurse into subfolder
			files = files.concat(getFiles(fullPath, baseDir));
		} else {
			const ext = path.extname(entry).toLowerCase().replace(".", "");

			if (FILE_TYPES.includes(ext)) {
				const relative = path.relative(baseDir, folder)
				files.push({
					name: entry,
					folder: relative,
				});
			}
		}
	}

	return files;
}

// get duration via ffmpeg
function getDuration(filePath: string): string {
	try {
		const cmd = `ffmpeg -i ${JSON.stringify(filePath)} 2>&1 | grep 'Duration' | cut -d ' ' -f 4 | sed s/,//`;
		return execSync(cmd).toString().trim();
	} catch {
		return "";
	}
}

/// GET /api/files \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
router.get("/files", (req, res) => {
	log(`GET ${req.originalUrl}`, 5);
	try {
		const basePath = path.join(PROJECT_ROOT, SEARCH_DIR);
		const files = getFiles(basePath, PROJECT_ROOT);

		res.json(files);
	} catch (err) {
		res.status(500).json({ error: "failed to read files" });
	}
});
router.get("/files.php", (req, res) => {
	console.warn(`[DEPRECATED] redirect '/api/files.php' to '/api/files' (used by '${req.ip}')`);
	// redirect permanently (301) or temporarily (302)
	res.redirect(302, "/api/files");
});


/// GET /api/details \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
const detailsParam = "path"
const savePath = path.resolve(PROJECT_ROOT, SEARCH_DIR)
router.get("/details", (req, res) => {
	log(`GET ${req.originalUrl}`, 5);
	try {
		// get param
		const raw = req.query[detailsParam];
		if (!raw) {
			return res.status(400).json({
				error: "missing parameter",
				detail: `${detailsParam} is required`
			});
		}

		let param: string;
		if (Array.isArray(raw)) {
			param = String(raw[0]);
			console.warn("[WARN] /api/details does not support arrays yet");
		} else {
			param = String(raw);
		}
		// check param
		param = path.normalize(param);
		const fullPath = path.resolve(PROJECT_ROOT, param);
		if (!fullPath.startsWith(savePath)) {
			return res.status(400).json({
				error: `invalid '${detailsParam}'`,
				detail: `${detailsParam}: '${param}'`
			});
		}
		// does file exist?
		if (!fs.existsSync(fullPath)) {
			return res.status(404).json({
				error: `file not found`,
				detail: `${detailsParam}: '${param}'`
			});
		}
		
		if (!dataCache) {
			dataCache = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
		}
		// file info
		const info = path.parse(fullPath);
		const stats = fs.statSync(fullPath);
		const duration = getDuration(fullPath);

		const filedata = dataCache?.[param] ?? {};
		const releaseDate = filedata.releasedate;
		const tags = filedata.tags ?? [];

		const response = {
			name: info.base,
			folder: path.dirname(param),
			path: param,
			filename: info.name,
			extension: info.ext.replace(".", ""),
			size: stats.size,
			duration,
			releaseDate,
			tags
		};
		res.json(response);
	} catch (err: any) {
		res.status(500).json({ error: err.message || "internal error" });
	}
});
router.get("/file.php", (req, res) => {
	console.warn(`[DEPRECATED] redirect '/api/file.php' to '/api/details' (used by '${req.ip}')`);
	// redirect permanently (301) or temporarily (302)
	const url = "/api/details?" + new URLSearchParams(req.query as any).toString();
	res.redirect(302, url);
	//res.redirect(302, "/api/details");
});
export default router;
