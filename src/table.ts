/**
 * @file table.ts 
 * @fileoverview load/manage the music table
 * @author Elia
 */
import type { singleFile } from  "./types";
import { Track } from "./Track.js";
import { playTrack } from "./player.js";	// for connecting the play buttons


/// VAR/CONST
const MAX_STAGGER = 7;
const STAGGER_DELAY = 7;


/// FUNCTIONS
/**
 *	loads the main music table
 */
async function loadPage() {
	//const data: singleFile[] = await fetch(`list_files.php?offset=${offset}&limit=${limit}`).then(r => r.json());
	const data: singleFile[] = await fetch(`files.php`).then(r => r.json());
	//totalFiles = data.total;
	populateTable(data);
	//renderPagination();
}

/**
 * creates tr entries into the table from files
 * @param files - the data for the table
 */
function populateTable(files: singleFile[]) {
	const tbody = document.querySelector('#playlist tbody') as HTMLTableSectionElement;
	if (!tbody) throw new Error("missing '#playlist tbody' element");
	//tbody.innerHTML = '';
	
	// autoload song (preparations)
	const params = new URLSearchParams(window.location.search);
	const pathParam = params.get('path');

	files.forEach((f, index) => {
		const track = new Track(f.folder, f.name);
		const tr = document.createElement('tr');
		tr.innerHTML = `
		<td><button class='play-btn' data-src='${track.savePath}'>Play</button></td>
		<td>${track.name}</td>
		<td>${track.artist}</td>
		<td><a href='${track.savePath}' download>${track.ext}</a></td>
		`;
		
		// play functionality
		const playBtn = tr.querySelector('.play-btn')
		if (!playBtn) throw new Error("missing '.play-btn' ButtonElement");
		playBtn.addEventListener('click', () => {
			playTrack(track);
		});
		tr.addEventListener('dblclick', () => {
			playTrack(track);
		});

		// autoload song
		if (pathParam && track.path === pathParam) {
			playTrack(track, true);
		}

		// animation
		const cappedIndex = (index > MAX_STAGGER) ? MAX_STAGGER : index;
		tr.style.animationDelay = `${cappedIndex * STAGGER_DELAY}ms`;
		tr.classList.add("fade-in");
		tbody.appendChild(tr);
	});
}

/**
 * enables sorting for columns
 */
function sorting() {
	const table = document.getElementById("playlist") as HTMLTableElement;
	if (!(table instanceof HTMLTableElement)) throw new Error("missing '#playlist' TableElement");
	const headers = table.querySelectorAll("th");

	headers.forEach((header, columnIndex) => {
		let asc = true;
		if (header.dataset.sortable !== "true") return;
		const arrowSpan = header.querySelector(".sort-arrow");
		if (!(arrowSpan instanceof HTMLElement)) throw new Error("missing '.sort-arrow' element");

		header.addEventListener("click", () => {
			const tbody = table.querySelector("tbody")!;
			const rows = Array.from(tbody.querySelectorAll("tr"));

			const type = header.dataset.type;

			rows.sort((a, b) => {
				const aCell = a.children[columnIndex];
				const bCell = b.children[columnIndex];
				if (!(aCell instanceof HTMLTableCellElement) || !(bCell instanceof HTMLTableCellElement)) return 0;
				const valA = aCell.textContent?.trim() ?? "";
				const valB = bCell.textContent?.trim() ?? "";

				if (type === "number") {
					return asc
						? Number(valA) - Number(valB)
						: Number(valB) - Number(valA);
				}

				return asc
					? valA.localeCompare(valB)
					: valB.localeCompare(valA);
			});

			// re-append sorted rows
			rows.forEach(row => tbody.appendChild(row));

			headers.forEach(h => {
				const span = h.querySelector(".sort-arrow");
				if (span instanceof HTMLElement) span.textContent = "";
			});

			// set current arrow
			arrowSpan.textContent = asc ? "▲" : "▼";

			asc = !asc;
		});
	});
}

/// MAIN

document.addEventListener("DOMContentLoaded", () => {
	loadPage();
	sorting();
});
