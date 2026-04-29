/**
 * @file server.ts
 * @fileoverview main server file
 * @author Elia
 */
import express from 'express';
import path from 'path';

import { log } from  "./globals.js";
import apiRoute from "./routes/api.js";


/// VAR/CONST
const PORT = process.env.PORT ?? 3000;

const app = express();

// fetch some important project paths
const PROJECT_ROOT = path.resolve(process.cwd());
const PUBLIC_PATH = path.resolve(PROJECT_ROOT, 'public');
const FILES_PATH = path.resolve(PROJECT_ROOT, 'files');


/// ROUTING
app.use(express.static(PUBLIC_PATH));			// ../public	-> /
app.use('/files', express.static(FILES_PATH));	// ../files		-> /files
app.use("/api", apiRoute);						// ./routes		-> /api

//app.get('/', (req, res) => {
//  res.send('Hello World!')
//})

app.listen(PORT, () => {
	log(`Server running at http://localhost:${PORT}`, 1)
})
