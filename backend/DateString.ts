/**
 * @fileoverview implementation of the DateString class
 * @author Elia
 */

import { log } from  "./globals.js"

export default class DateString {
	year?: number;
	month?: number;
	day?: number;

	SEPERATOR = "-";

	constructor(input?: string | Date | null, silent=false) {
		if (input instanceof Date) {
			this.year = input.getUTCFullYear();
			this.month = input.getUTCMonth() + 1;
			this.day = input.getUTCDate();
			if (!silent) log(`created DateString: ${this}`, 6);
			return;
		}
		if (input == null || input.trim() === "") {
			if (!silent) log("created empty DateString", 6);
			return;
		}
		// split off time part if ISO
		const datePart = (input.split("T")[0] ?? "").trim();
		// normalize separators: ".", "/", "-" -> "-"
		const normalized = datePart.trim().replace(/[./ ]/g, this.SEPERATOR);
		
		// expected formats: yyyy, yyyy-mm or yyyy-mm-dd
		const [y, m, d] = normalized.split(this.SEPERATOR);
		this.year = y ? Number(y) : undefined;
		this.month = m ? Number(m) : undefined;
		this.day = d ? Number(d) : undefined;
		if (!this.year || this.year < 0 || this.year > 9999) {
			throw new Error(`invalid year: ${y}`);
		}
		if (this.month !== undefined && (this.month < 1 || this.month > 12)) {
			throw new Error(`invalid month: ${m}`);
		}
		if (this.day !== undefined && (this.day < 1 || this.day > 31)) {
			throw new Error(`invalid day: ${d}`);
		}

		if (!silent) log(`created DateString: ${this}`, 6);
		return;
	}

	/** pad a number with leading 0 */
	private pad(n: number, l: number = 2): string {
		return String(n).padStart(l, "0");
	}

	toString() {
		if (this.year === undefined) return "";
		const y = this.pad(this.year,4);
		if (this.month === undefined) return y;
		const m = this.pad(this.month);
		if (this.day === undefined) return `${y}${this.SEPERATOR}${m}`;
		const d = this.pad(this.day);
		return `${y}${this.SEPERATOR}${m}${this.SEPERATOR}${d}`;
	}
	equals(other: unknown): boolean {
		if (!(other instanceof DateString)) return false;
		if (this.year !== other.year) return false;
		if (this.month !== other.month) return false;
		if (this.day !== other.day) return false;
		return true;
	}
}

