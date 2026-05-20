/**
 * @file server.ts
 * @fileoverview main server file
 * @author Elia
 */

import express from 'express';
import path from 'path';

import { PROJECT_ROOT,PUBLIC_PATH,FILES_PATH } from "./globals.js";
import { log } from  "./globals.js";
import apiRoute from "./routes/api.js";


/// VAR/CONST
const PORT = process.env.PORT ?? 3000;
const app = express();


/// ROUTING
app.use(express.static(PUBLIC_PATH, {
	maxAge: "1h",
	setHeaders(res) {
		res.setHeader("Cache-Control", "no-cache, must-revalidate");
	}
}));											// ../public	-> /
app.use('/files', express.static(FILES_PATH, {
	maxAge: "24h",
	setHeaders(res) {
		res.setHeader("Cache-Control", "public, immutable, max-age=10800");
	}
}));											// ../files		-> /files
app.use("/api", apiRoute);						// ./routes		-> /api
app.use((req, res, next) => {
	if (req.path.startsWith("/api")) {
		res.setHeader("Cache-Control", "no-store");
	}
	next();
});


//app.get('/', (req, res) => {
//  res.send('Hello World!')
//})

app.listen(PORT, () => {
	log(`Server running at http://localhost:${PORT}`, 1)
})
