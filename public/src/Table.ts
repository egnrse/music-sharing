/**
 * @file Table.ts 
 * @fileoverview load/manage the music table
 * @author Elia
 */

import type { Column } from  "./globals.js";
import { log, COLUMN_REC as c, DEFAULT_COLUMNS } from  "./globals.js";
import FrontSong from "./FrontSong.js";


/// VAR/CONST
const STAGGER_DELAY = 7;	// delay between staggered animating new table rows (in ms)
const MAX_STAGGER = 7;		// max staggers (in instances)


export default class Table {
	// html elements
	private table: HTMLTableElement;		// the table
	private tcol: HTMLTableColElement;		// the table colgroup
	private thead: HTMLTableSectionElement;	// the table head
	private tbody: HTMLTableSectionElement;	// the table body
	
	private columns: Column[];					// the columns of the table
	private songList: FrontSong[];				// the data for the table
	private playSong: (arg0:FrontSong) => void;	// function to call, on 'play'-button press

	/**
	 * the constructor of Table
	 * @param playSong - function to call, on 'play'-button press or row double click
	 */
	constructor(playSong: (arg0:FrontSong) => void) {
		this.columns = DEFAULT_COLUMNS;
		this.songList = [];
		this.playSong = playSong;

		this.table = document.getElementById("playlist") as HTMLTableElement;
		if (!(this.table instanceof HTMLTableElement)) throw new Error("Table: missing '#playlist' TableElement");
		this.tcol = this.table.querySelector("colgroup") as HTMLTableColElement;
		if (!this.tcol) throw new Error("Table: missing '#playlist colgroup' element");
		this.thead = this.table.querySelector("thead") as HTMLTableSectionElement;
		if (!this.thead) throw new Error("Table: missing '#playlist thead' element");
		this.tbody = this.table.querySelector("tbody") as HTMLTableSectionElement;
		if (!this.tbody) throw new Error("Table: missing '#playlist tbody' element");

		this.updateHeader();
		this.search()
	}

	/**
	 * update the table with the new songList
	 * @param songList - the data for the table
	 */
	update(songList:FrontSong[]) {
		log(`Table: update`, 3);

		this.updateHeader();

		// update table
		this.populateTable(songList, DEFAULT_COLUMNS);
		this.songList = songList;

		this.sorting()
	}

	// the render* functions, return the corresponding HTMLTable elements with columns depending on @param columns
	private renderCol(columns:Column[]): HTMLTableColElement {
		const colgroup = document.createElement("colgroup")
		columns.forEach(c => {
			const col = document.createElement("col")
			col.style.width = c.width ?? "auto"
			col.style.textAlign = c.textAlign ?? "auto"	// (does not get respected, also implemented using css class .textAlign-right)
			colgroup.appendChild(col)
		})
		return colgroup;
	}
	private renderHead(columns:Column[]): HTMLTableSectionElement {
		const thead = document.createElement('thead');
		const tr = document.createElement('tr');
		for (const c of columns) {
			const th = document.createElement("th")
			th.textContent = c.label
			if (c.sortable) th.dataset.sortable = "true";
			if (c.type) th.dataset.type = c.type;
			if (c.sortable) {
				const span = document.createElement("span");
				span.className = "sort-arrow";
				th.appendChild(span);
			}
			if (c.textAlign?.toLowerCase() == "right") th.classList.add("textAlign-right");
			tr.appendChild(th)
		}
		thead.appendChild(tr)
		return thead;
	}
	private renderRow(columns:Column[], song:FrontSong): HTMLTableRowElement {
		const tr = document.createElement('tr');
		for (const c of columns) {
			const td = document.createElement("td")
			// the function to call, on song changes
			const renderCell = () => {
				td.innerHTML = c.render(song)
				if (c.textAlign?.toLowerCase() == "right") td.classList.add("textAlign-right");
			};
			renderCell();
			if (!c.noUpdate) song.subscribe(renderCell);
			tr.appendChild(td);
		}
		log(`Table(row): ${tr.innerHTML}`, 5);
		return tr;
	}

	/**
	 * update/replace the table head and table colgroup
	 * (also calls this.sorting())
	 * @param columns - the new columns (default=this.columns)
	 */
	private updateHeader(columns:Column[] = this.columns) {
		const newCol = this.renderCol(columns);
		const newHead = this.renderHead(columns);
		this.table.replaceChild(newCol, this.tcol)
		this.table.replaceChild(newHead, this.thead);
		this.tcol = newCol;
		this.thead = newHead;

		this.sorting();
	}
	/**
	 * creates the actual tr entries into the table from songList
	 * @param songList - the data for the table
	 * @param columns - the columns to display
	 */
	private populateTable(songList: FrontSong[], columns: Column[]) {
		this.tbody.innerHTML = '';
		
		songList.forEach((song, index) => {
			const tr  = this.renderRow(columns, song)
			
			// play functionality
			const playBtn = tr.querySelector('.play-btn')
			if (!playBtn) throw new Error("missing '.play-btn' ButtonElement");
			playBtn.addEventListener('click', () => {
				this.playSong(song);
			});
			tr.addEventListener('dblclick', () => {
				this.playSong(song);
			});

			// animation
			const cappedIndex = (index > MAX_STAGGER) ? MAX_STAGGER : index;
			tr.style.animationDelay = `${cappedIndex * STAGGER_DELAY}ms`;
			tr.classList.add("fade-in");
			this.tbody.appendChild(tr);
		});
	}

	/**
	 * enables sorting for the current columns
	 * (for columns that have header.dataset.sortable set)
	 */
	private sorting() {
		const headers:NodeListOf<HTMLTableHeaderCellElement> = this.thead.querySelectorAll("th");

		headers.forEach((header, columnIndex) => {
			if (header.dataset.sortable !== "true") return;
			const arrowSpan = header.querySelector(".sort-arrow");
			if (!(arrowSpan instanceof HTMLElement)) throw new Error("missing '.sort-arrow' element");

			let asc = true;		// ascending (= direction of sorting)

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
				for (let j = 1; j <= 2; j++) { // check Name and Artist columns
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
