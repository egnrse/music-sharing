// audio player
const rows = document.querySelectorAll('#playlist tbody tr');
const player = document.getElementById('player');
const currentTrackLabel = document.getElementById('current-track');

const artistColumn = 2
const trackColumn = 1

function playTrack(track) {
	player.src = track;
	player.play();

}

rows.forEach(row => {
	// double-click to play the track
	const playBtn = row.querySelector('.play-btn');
	row.addEventListener('dblclick', () => {
		if (playBtn) {
			playTrack(playBtn.dataset.src);
			
			// show currently playing
			const artist = row.cells[artistColumn].textContent;
			const track = row.cells[trackColumn].textContent;
			currentTrackLabel.textContent = `${artist} - ${track}`;
		}
	});
	playBtn.addEventListener('click', () => {
		playTrack(playBtn.dataset.src);

		const row = playBtn.closest('tr');
		const artist = row.cells[artistColumn].textContent;
		const track = row.cells[trackColumn].textContent;
		currentTrackLabel.textContent = `${artist} - ${track}`;
	});
});

