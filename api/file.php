<?php
// create a json with details about a specific file
// GET /api/file.php?path=files/song1.mp3

$workingDir = '../';
$baseDir = "files/";
$db = "$baseDir/data.json";


/// FUNCTIONS

// get a GET argument and make some checks
function saveGet(string $arg): string {
	// validate input
	$rawGet = $_GET[$arg] ?? '';
	if ($rawGet === '' || str_contains($rawGet, '../')) {
		http_response_code(400);
		echo json_encode(["error" => "invalid input", "$arg" => "$rawGet"]);
		exit;
	}
	return $rawGet;
}
// check a path for security things (@return realpath)
function securePath(string $inpath, string $saveDir="/"): string {
	$path = realpath($inpath);
	// security: ensure file is inside directory
	if (!$path || !str_starts_with($path, realpath($saveDir))) {
		http_response_code(404);
		echo json_encode(["error" => "file not found", "path" => "$inpath"]);
		exit;
	}
	return $path;
}

function getDuration($path) {
    $cmd = "ffmpeg -i " . escapeshellarg($path) . " 2>&1 | grep 'Duration' | cut -d ' ' -f 4 | sed s/,//";
    return exec($cmd);
}


/// MAIN
chdir($workingDir);
$path = saveGet('path');
$path = urldecode($path);
$realpath = securePath($path, $workingDir.$baseDir);

// load db (cached)
static $dataCache = null;
if ($dataCache === null) {
	$dataCache = json_decode(file_get_contents("$db"), true);
}

// build response
$info = pathinfo($path);
$modTime = filemtime($path);
$duration = getDuration($path);

$filedata = $dataCache[$path] ?? [];
$releasedate = $filedata['releasedate'] ?? '';
$tags = $filedata['tags'] ?? [];

$response = [
	"name" => $info['basename'],		// filename + extension
	"folder" => $info['dirname'],		// folder of the file
	"path" => $path,					// url path to the file
	"filename" => $info['filename'],	// filename (without extension)
	"extension" => $info['extension'] ?? '',	// file extension
	"size" => filesize($path),			// size in bytes
	//"modified" => $modTime,				// unix timestamp
	//"modified_human" => date("Y-m-d H:i:s", $modTime),
	"duration" => $duration,			// song duration
	"releaseDate" => $releasedate,
	"tags" => $tags
];

header('Content-Type: application/json');
echo json_encode($response);
