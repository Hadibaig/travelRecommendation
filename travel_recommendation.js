const input = document.getElementById('searchInput');
const resultsBox = document.getElementById('results');
const PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250"><rect width="100%" height="100%" fill="#13877b"/><text x="50%" y="50%" fill="#fff" font-family="Arial" font-size="22" text-anchor="middle">Image coming soon</text></svg>');
let travelData = null;

// Task 6: fetch data from the JSON file
fetch('travel_recommendation_api.json')
  .then(res => res.json())
  .then(data => { travelData = data; console.log(data); })
  .catch(err => console.error('Error fetching data:', err));

function localTime(tz) {
  const options = { timeZone: tz, hour12: true, hour: 'numeric', minute: 'numeric', second: 'numeric' };
  return new Date().toLocaleTimeString('en-US', options);
}

// Task 7: keyword matching (case-insensitive, handles plurals like beaches / countries)
function findResults(q) {
  const allCities = travelData.countries.flatMap(c => c.cities);
  if (q.includes('beach')) return travelData.beaches;
  if (q.includes('temple')) return travelData.temples;
  if (q.includes('countr')) return allCities;
  // bonus: match a specific country or place name
  const byCountry = travelData.countries.filter(c => c.name.toLowerCase().includes(q));
  if (byCountry.length) return byCountry.flatMap(c => c.cities);
  return [...allCities, ...travelData.temples, ...travelData.beaches]
    .filter(p => p.name.toLowerCase().includes(q));
}

// Task 8: render results
function showResults(list) {
  resultsBox.innerHTML = '<h2>Search Results</h2>';
  if (!list.length) {
    resultsBox.innerHTML += '<p class="msg">No results found. Try "beach", "temple" or "country".</p>';
    return;
  }
  const grid = document.createElement('div');
  grid.className = 'grid';
  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<img src="${p.imageUrl}" alt="${p.name}"><h3>${p.name}</h3><p>${p.description}</p>` +
      (p.timeZone ? `<p class="time">Local time: ${localTime(p.timeZone)}</p>` : '');
    card.querySelector('img').onerror = function () { this.onerror = null; this.src = PLACEHOLDER; };
    grid.appendChild(card);
  });
  resultsBox.appendChild(grid);
}

function search() {
  const q = input.value.trim().toLowerCase();
  if (!q) { clearResults(); return; }
  if (!travelData) { console.warn('Data not loaded yet'); return; }
  showResults(findResults(q));
}

// Task 9: clear
function clearResults() {
  resultsBox.innerHTML = '';
  input.value = '';
}

document.getElementById('searchBtn').addEventListener('click', search);
document.getElementById('clearBtn').addEventListener('click', clearResults);
input.addEventListener('keydown', e => { if (e.key === 'Enter') search(); });
