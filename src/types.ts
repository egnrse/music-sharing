/**
 * @file types.ts
 * @fileoverview some custom types
 * @author Elia
 */
export type FilePath = string & { __brand: "FilePath" };
export interface singleFile {
	name: string;
	folder: string;
}

