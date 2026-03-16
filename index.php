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
				<th data-sortable="true" data-type="string">Track <span class="sort-arrow"></span></th>
				<th data-sortable="true" data-type="string">Artist <span class="sort-arrow"></span></th>
				<th data-sortable="true" data-type="string">File <span class="sort-arrow"></span></th>
			</tr>
		</thead>
		<tbody>
		<!-- the music table -->
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

	<script type="module" src="dist/main.js"></script>
</body>
</html>

