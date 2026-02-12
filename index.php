<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">

	<meta name="author" content="egnrse">
	<meta name="description" content="Is it music?">

	<title>My Music</title>
	<link rel="stylesheet" href="style.css">
</head>
<body>
	<h1>My Music</h1>
	<div id="playlist">
		<?php
		$dir = __DIR__ . '/music';
		// get all music files
		$mp3Files = glob("$dir/*.mp3");
		$wavFiles = glob("$dir/*.wav");
		$files = array_merge($mp3Files, $wavFiles);

		foreach ($files as $file) {
			$name = basename($file);
			echo "<div class='track' data-src='music/$name'>$name <a href='music/$name' download>Download</a></div>";
		}
		?>

	</div>
	<audio id="player" controls></audio>

	<script src="player.js"></script>
</body>
</html>

