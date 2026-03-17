/**
 * @file Table.ts 
 * @fileoverview load/manage the music table
 * @author Elia
 */
import type { singleFile, Column } from  "./globals.js";
import { log, COLUMN_REC as c } from  "./globals.js";
import { Track } from "./Track.js";


/// VAR/CONST
const STAGGER_DELAY = 7;	// delay between staggered animating new table rows (in ms)
const MAX_STAGGER = 7;		// max staggers (in instances)
const columns:Column[] = [c.play,c.track,c.artist,c.file];	// active/visible columns


export class Table {
	// html elements
	private table: HTMLTableElement;		// the table
	private tcol: HTMLTableColElement;		// the table colgroup
	private thead: HTMLTableSectionElement;	// the table head
	private tbody: HTMLTableSectionElement;	// the table body
	
	private columns: Column[];					// the columns of the table
	private trackList: Track[];					// the data for the table
	private playTrack: (arg0:Track) => void;	// function to call, on 'play'-button press

	/**
	 * the constructor of Table
	 * @param playTrack - function to call, on 'play'-button press or row double click
	 */
	constructor(playTrack: (arg0:Track) => void) {
		this.columns = columns;
		this.trackList = [];
		this.playTrack = playTrack;

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
	 * update the table with the new trackList
	 * @param trackList - the data for the table
	 */
	update(trackList:Track[]) {
		log(`Table: update`, 3);

		this.updateHeader();

		// update table
		this.populateTable(trackList, columns);
		this.trackList = trackList;

		this.sorting()
	}

	// the render* functions, return the corresponding HTMLTable elements with columns depending on @param columns
	private renderCol(columns:Column[]): HTMLTableColElement {
		const colgroup = document.createElement("colgroup")
		columns.forEach(c => {
			const col = document.createElement("col")
			col.style.width = c.width ?? "auto"
			colgroup.appendChild(col)
		})
		return colgroup;
	}
	private renderHead(columns:Column[]): HTMLTableSectionElement {
		const track = new Track('files', "EN - Fighting Till We Can't.wav");
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
			tr.appendChild(th)
		}
		thead.appendChild(tr)
		return thead;
	}
	private renderRow(columns:Column[], track:Track): HTMLTableRowElement {
		const tr = document.createElement('tr');
		for (const c of columns) {
			const td = document.createElement("td")
			td.innerHTML = c.render(track)
			tr.appendChild(td)
		}
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
	 * creates the actual tr entries into the table from trackList
	 * @param trackList - the data for the table
	 * @param columns - the columns to display
	 */
	private populateTable(trackList: Track[], columns: Column[]) {
		this.tbody.innerHTML = '';
		
		trackList.forEach((track, index) => {
			const tr  = this.renderRow(columns, track)
			
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
