const input = document.getElementById('searchInput');
const resultsBox = document.getElementById('results');
const hero = document.getElementById('hero');
const PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250"><rect width="100%" height="100%" fill="#13877b"/><text x="50%" y="50%" fill="#fff" font-family="Arial" font-size="22" text-anchor="middle">Image not found</text></svg>');
let travelData = null;

// Task 6: fetch data from the JSON file and log it
function loadData() {
  return fetch('travel_recommendation_api.json')
    .then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(data => {
      travelData = data;
      console.log(data);
      return data;
    });
}
loadData().catch(err => console.error('Error fetching data:', err));

// Task 10: current time in a time zone
function localTime(tz) {
  const options = { timeZone: tz, hour12: true, hour: 'numeric', minute: 'numeric', second: 'numeric' };
  return new Date().toLocaleTimeString('en-US', options);
}
function updateTimes() {
  document.querySelectorAll('.time[data-tz]').forEach(el => {
    el.textContent = 'Local time: ' + localTime(el.dataset.tz);
  });
}
setInterval(updateTimes, 1000);

// Task 7: keyword matching (case-insensitive; beach/beaches, temple/temples, country/countries)
function findResults(q) {
  const allCities = travelData.countries.flatMap(c => c.cities);
  if (q.includes('beach')) return travelData.beaches;
  if (q.includes('temple')) return travelData.temples;
  if (q.includes('countr')) return allCities;
  // bonus: a specific country or place name, e.g. "japan", "sydney"
  const byCountry = travelData.countries.filter(c => c.name.toLowerCase().includes(q));
  if (byCountry.length) return byCountry.flatMap(c => c.cities);
  return [...allCities, ...travelData.temples, ...travelData.beaches]
    .filter(p => p.name.toLowerCase().includes(q));
}

// Task 8: show results (image, name, description, local time)
function showResults(list) {
  hero.classList.add('hidden');
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
      (p.timeZone ? `<p class="time" data-tz="${p.timeZone}">Local time: ${localTime(p.timeZone)}</p>` : '');
    card.querySelector('img').onerror = function () { this.onerror = null; this.src = PLACEHOLDER; };
    grid.appendChild(card);
  });
  resultsBox.appendChild(grid);
}

function showError() {
  hero.classList.add('hidden');
  resultsBox.innerHTML = '<h2>Search Results</h2><p class="msg">Could not load travel_recommendation_api.json. ' +
    'Open the site with Live Server or GitHub Pages (not by double-clicking the HTML file) and check the file name.</p>';
}

// Search button click
function search() {
  const q = input.value.trim().toLowerCase();
  if (!q) { clearResults(); return; }
  const run = () => showResults(findResults(q));
  if (travelData) run();
  else loadData().then(run).catch(err => { console.error('Error fetching data:', err); showError(); });
}

// Task 9: clear button
function clearResults() {
  resultsBox.innerHTML = '';
  input.value = '';
  hero.classList.remove('hidden');
}

document.getElementById('searchBtn').addEventListener('click', search);
document.getElementById('clearBtn').addEventListener('click', clearResults);
// Enter key just clicks the Search button (results only show via the Search button)
input.addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('searchBtn').click(); });
