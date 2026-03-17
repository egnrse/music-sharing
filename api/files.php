<?php
// create a json of the music files

//error_reporting(E_ALL);
//ini_set('display_errors', 1);

$workingDir = '../';
$baseDir = 'files/';			// where to search for music files (relating to $workingDir)
$fileTypes = ['mp3', 'wav', 'flac'];	// which files to show


/// FUNCTIONS
function getFiles(string $folder, array $fileTypes): array {
	$files = array();
	$dir = opendir($folder);
	while(($currentFile = readdir($dir)) !== false) {
		if ( $currentFile == '.' or $currentFile == '..' ) {
			continue;
		}
		$fullPath = realpath($folder . '/' . $currentFile);
		if (is_dir($fullPath)) {
			// recursively get files from subfolders
			$files = array_merge($files, getFiles($fullPath, $fileTypes));
		}
		else {
			$ext = strtolower(pathinfo($currentFile, PATHINFO_EXTENSION));
			if (in_array($ext, $fileTypes)) {
				$files[] = [
					'name' => $currentFile,
					'folder' => $folder,
				];
			}
		}
	}
	closedir($dir);
	return $files;
}


/// MAIN
chdir($workingDir);
$files = getFiles($baseDir, $fileTypes);

// todo:
// $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
// $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
// function to get a paginated list of files
//function getPaginatedFiles(string $baseDir, array $allowedExtensions, int $offset, int $limit): array {
//	$files = [];
//	$total = 0;
//	foreach (getFiles($baseDir, $allowedExtensions) as $i => $file) {
//		if ($i >= $offset && $i < $offset + $limit) $files[] = $file;
//		$total++;
//	}
//	return ['total' => $total, 'files' => $files];
//}


header('Content-Type: application/json');
echo json_encode($files);
