// get references to search input and table
const searchInput = document.getElementById('search');
const table = document.getElementById('playlist').getElementsByTagName('tbody')[0];

searchInput.addEventListener('input', function() {
	const filter = searchInput.value.toLowerCase();
	const rows = table.getElementsByTagName('tr');

	for (let i = 0; i < rows.length; i++) {
		const cells = rows[i].getElementsByTagName('td');
		let match = false;
		for (let j = 1; j <= 2; j++) { // check Track and Artist columns
			if (cells[j].textContent.toLowerCase().includes(filter)) {
				match = true;
				break;
			}
		}
		rows[i].style.display = match ? '' : 'none';
	}
});
