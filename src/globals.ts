/**
 * @file globals.ts
 * @fileoverview some custom global types/datastructs
 * @author Elia
 */
export type FilePath = string & { __brand: "FilePath" };
export interface singleFile {
	name: string;
	folder: string;
}

