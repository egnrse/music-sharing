// get audio element
const player = document.getElementById('player');
// get all track divs
const tracks = document.querySelectorAll('.track');

tracks.forEach(track => {
	track.addEventListener('click', () => {
		const src = track.dataset.src;
		player.src = src;
		player.play();
	});
});

