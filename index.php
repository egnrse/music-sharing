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
	<div class="page">
	<p style="text-align: center;">Hi, I make music as 3.Ndangered and this is some of the music I made.<br> It is a pile of good, bad and experimental stuff.</p>
	<table id="playlist">
		<colgroup>
			<col style="width: 5%">
			<col style="width: 35%">
			<col style="width: 25%">
			<col style="width: 5%">
		</colgroup>
		<thead>
			<tr>
				<th>Play</th>
				<th>Track</th>
				<th>Artist</th>
				<th>File</th>
			</tr>
		</thead>
		<tbody>
			<?php
			$dir = __DIR__ . '/files';
			$files = array_merge(glob("$dir/*.mp3"), glob("$dir/*.wav"));

			sort($files); // sort alphabetically

			foreach ($files as $file) {
				$name = basename($file);
				$ext = pathinfo($file, PATHINFO_EXTENSION);

				// split Artist - Track
				if (strpos($name, ' - ') !== false) {
					list($artist, $trackNameWithExt) = explode(' - ', $name, 2);
					$track = pathinfo($trackNameWithExt, PATHINFO_FILENAME);
				} else {
					$artist = 'Unknown';
					$track = pathinfo($name, PATHINFO_FILENAME);
				}
				// escape qotes
				$name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
				$track = htmlspecialchars($track, ENT_QUOTES, 'UTF-8');
				$artist = htmlspecialchars($artist, ENT_QUOTES, 'UTF-8');
				$ext = htmlspecialchars($ext, ENT_QUOTES, 'UTF-8');

				echo "<tr>";
				echo "<td><button class='play-btn' data-src='files/$name'>Play</button></td>";
				echo "<td>$track</td>";
				echo "<td>$artist</td>";
				echo "<td><a href='files/$name' download>$ext</a></td>";
				echo "</tr>";
				echo "\n";
			}
			?>
		</tbody>
	</table>

	<div id="player-container">
		<div id="above-player">
			<div id="current-track">Nothing playing</div>
			<button id="play-mode-btn" title="">Norm</button>
			<input type="text" id="search" placeholder="Search...">
		</div>
		<audio id="player" controls></audio>
	</div>
	</div>	<!-- page -->

	<script src="player.js"></script>
	<script src="search.js"></script>
</body>
</html>

