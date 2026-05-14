/**
 * @fileoverview shared types/intefaces between front/backend
 * @author Elia
 */


/// TYPES
export interface SongInterface {
	id: string;
	name: string;
	path: string;
	ext: string;

	artist?: string;
	releaseDate?: string;
	files?: SongInterface[]|string[];

	length?: number;
	size?: number;
	notes?: string;
	tags: string[];
}
export type SongKey = keyof SongInterface;

/** api interface */
export type fileAPI = Partial<Record<SongKey,any>>[];
export type detailsAPI = SongInterface[];
