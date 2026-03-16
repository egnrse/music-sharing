/**
 * @file Table.ts 
 * @fileoverview load/manage the music table
 * @author Elia
 */
import type { singleFile } from  "./globals.js";
import { log } from  "./globals.js";
import { Track } from "./Track.js";


/// VAR/CONST
const MAX_STAGGER = 7;
const STAGGER_DELAY = 7;


export class Table {
	// html elements
	private table: HTMLTableElement;		// the table
	private tbody: HTMLTableSectionElement;	// the table body
	
	private playTrack: (arg0:Track) => void; // function to call, on 'play'-button press
	private trackList: Track[];

	/**
	 * the constructor of Table
	 * @param playTrack - function to call, on 'play'-button press or row double click
	 */
	constructor(playTrack: (arg0:Track) => void) {
		this.playTrack = playTrack;
		this.trackList = [];

		this.table = document.getElementById("playlist") as HTMLTableElement;
		if (!(this.table instanceof HTMLTableElement)) throw new Error("Table: missing '#playlist' TableElement");
		this.tbody = this.table.querySelector("tbody") as HTMLTableSectionElement;
		if (!this.tbody) throw new Error("Table: missing '#playlist tbody' element");

		// prepare/enable features
		this.search()
		this.sorting()
	}

	/**
	 * update the table with the new trackList
	 * @param trackList - the data for the table
	 */
	update(trackList:Track[]) {
		log(`Table: update`, 3);
		this.populateTable(trackList);
		this.trackList = trackList;
	}

	/**
	 * creates the actual tr entries into the table from trackList
	 * @param trackList - the data for the table
	 */
	private populateTable(trackList: Track[]) {
		//this.tbody.innerHTML = '';
		
		trackList.forEach((track, index) => {
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
				this.playTrack(track);
			});
			tr.addEventListener('dblclick', () => {
				this.playTrack(track);
			});

			// animation
			const cappedIndex = (index > MAX_STAGGER) ? MAX_STAGGER : index;
			tr.style.animationDelay = `${cappedIndex * STAGGER_DELAY}ms`;
			tr.classList.add("fade-in");
			this.tbody.appendChild(tr);
		});
	}

	/**
	 * enables sorting for columns
	 * (for columns that have header.dataset.sortable set)
	 */
	private sorting() {
		const headers:NodeListOf<HTMLTableHeaderCellElement> = this.table.querySelectorAll("th");

		headers.forEach((header, columnIndex) => {
			let asc = true;		// ascending (= direction of sorting)
			if (header.dataset.sortable !== "true") return;
			const arrowSpan = header.querySelector(".sort-arrow");
			if (!(arrowSpan instanceof HTMLElement)) throw new Error("missing '.sort-arrow' element");

			header.addEventListener("click", () => {
				const rows = Array.from(this.tbody.querySelectorAll("tr"));

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
				rows.forEach(row => this.tbody.appendChild(row));

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
	/**
	* enables searching
	*/
	private search() {
		const searchInput = document.getElementById('search') as HTMLInputElement;
		if (!searchInput) throw new Error("Table: missing '#search' InputElement");
		let tbody = this.tbody;

		searchInput.addEventListener('input', function() {
			const filter = searchInput.value.toLowerCase();
			const rows = tbody.getElementsByTagName('tr');

			for (let i = 0; i < rows.length; i++) {
				const cells = rows[i].getElementsByTagName('td');
				let match = false;
				for (let j = 1; j <= 2; j++) { // check Track and Artist columns
					if (cells[j].textContent.toLowerCase().includes(filter)) {
						match = true;
						break;
					}
				}
				rows[i].style.display = match ? '' : 'none';
			}
		});
	}
}
