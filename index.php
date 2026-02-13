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
	<p style="text-align: center;">Hi, I make music under the name 3.Ndangered and this is some music I made.</p>
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
				<th>Download</th>
			</tr>
		</thead>
		<tbody>
			<?php
			$dir = __DIR__ . '/files';
			$files = array_merge(glob("$dir/*.mp3"), glob("$dir/*.wav"));
			sort($files); // optional: sort alphabetically

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

				echo "<tr>";
				echo "<td><button class='play-btn' data-src='files/$name'>Play</button></td>";
				echo "<td>$track</td>";
				echo "<td>$artist</td>";
				echo "<td><a href='music/$name' download>$ext</a></td>";
				echo "</tr>";
			}
			?>
		</tbody>
	</table>

	<div id="player-container">
		<div id="current-track">Nothing playing</div>
		<audio id="player" controls></audio>
	</div>
	</div>

	<script src="player.js"></script>
</body>
</html>

