/***********************
 * Movie Review Platform (Final – 12 Movies, Colorful Watchlist)
 ***********************/

const SAMPLE_MOVIES = [
  { id:1, title:"The Lost Island", year:2021, genre:"Adventure", desc:"An expedition discovers an uncharted island where mysteries unfold.", poster:"https://picsum.photos/seed/movie1/600/900", reviews:["Amazing visuals!","Loved the score."], ratings:[5,4,5] },
  { id:2, title:"Midnight City", year:2019, genre:"Thriller", desc:"A tense thriller as secrets unravel during one long night in the city.", poster:"https://picsum.photos/seed/movie2/600/900", reviews:["Kept me on edge."], ratings:[4] },
  { id:3, title:"Love in Paris", year:2020, genre:"Romance", desc:"Two strangers meet and discover love among the streets of Paris.", poster:"https://picsum.photos/seed/movie3/600/900", reviews:[], ratings:[] },
  { id:4, title:"Space Bound", year:2023, genre:"Sci-Fi", desc:"A crewed mission journeys beyond the solar system into unknown realms.", poster:"https://picsum.photos/seed/movie4/600/900", reviews:["Stunning concept."], ratings:[5,5,4] },
  { id:5, title:"Cooked Up", year:2018, genre:"Comedy", desc:"Comedy ensues when a food truck crew tries to win a cooking contest.", poster:"https://picsum.photos/seed/movie5/600/900", reviews:["So funny!"], ratings:[4,3] },
  { id:6, title:"Silent Echo", year:2022, genre:"Drama", desc:"A moving story about family, memory, and reconciliation.", poster:"https://picsum.photos/seed/movie6/600/900", reviews:[], ratings:[] },
  { id:7, title:"Frozen Secrets", year:2021, genre:"Mystery", desc:"A detective uncovers chilling secrets buried under the snow.", poster:"https://picsum.photos/seed/movie7/600/900", reviews:["Really suspenseful!"], ratings:[5,4] },
  { id:8, title:"The Iron Fist", year:2017, genre:"Action", desc:"An ex-soldier fights against corruption in his hometown.", poster:"https://picsum.photos/seed/movie8/600/900", reviews:["Great fight scenes!"], ratings:[4,4,3] },
  { id:9, title:"Dream Chaser", year:2020, genre:"Inspiration", desc:"A young athlete overcomes odds to reach his dreams.", poster:"https://picsum.photos/seed/movie9/600/900", reviews:["Motivational!"], ratings:[5] },
  { id:10, title:"Haunted House", year:2019, genre:"Horror", desc:"Friends encounter terrifying forces inside an abandoned house.", poster:"https://picsum.photos/seed/movie10/600/900", reviews:["Really scary!"], ratings:[4,5] },
  { id:11, title:"Pixel World", year:2023, genre:"Animation", desc:"An animated journey through a video game universe.", poster:"https://picsum.photos/seed/movie11/600/900", reviews:["Kids will love it!"], ratings:[5,5] },
  { id:12, title:"Golden Age", year:2016, genre:"Historical", desc:"The rise and fall of a great empire told through its people.", poster:"https://picsum.photos/seed/movie12/600/900", reviews:["Very well directed."], ratings:[4] }
];

/* --- State --- */
let movies = [];
let watchlist = [];
let currentMovie = null;

/* --- LocalStorage Keys --- */
const LS_KEY = "reelrate_movies_v1";
const LS_WATCH = "reelrate_watch_v1";

function loadState(){
  const saved = localStorage.getItem(LS_KEY);
  movies = saved ? JSON.parse(saved) : SAMPLE_MOVIES;
  const w = localStorage.getItem(LS_WATCH);
  watchlist = w ? JSON.parse(w) : [];
}
function saveState(){ localStorage.setItem(LS_KEY, JSON.stringify(movies)); }
function saveWatch(){ localStorage.setItem(LS_WATCH, JSON.stringify(watchlist)); }

function calcAvg(m){
  if(!m.ratings || m.ratings.length===0) return 0;
  const s = m.ratings.reduce((a,b)=>a+b,0);
  return +(s / m.ratings.length).toFixed(1);
}
function starsHtml(avg){
  const full = Math.round(avg);
  let s = "";
  for(let i=0;i<full;i++) s += "★";
  for(let i=full;i<5;i++) s += "☆";
  return `<span class="badge">${s} ${avg>0?`(${avg})`:"(0.0)"}</span>`;
}

function displayGrid(list = movies){
  const grid = document.getElementById("movieGrid");
  grid.innerHTML = "";
  list.forEach(m=>{
    const card = document.createElement("div"); card.className = "card";
    const avg = calcAvg(m);
    card.innerHTML = `
      <img class="poster" src="${m.poster}" alt="${m.title}" />
      <div class="title">${m.title}</div>
      <div class="meta">${m.genre} • ${m.year} • ${starsHtml(avg)}</div>
      <div class="row">
        <button class="btn view-btn" onclick="openMovie(${m.id})">View Details</button>
        <button class="btn fav-btn" onclick="toggleWatchlist(${m.id}, this)">${watchlist.includes(m.id)?'★ In Watchlist':'☆ Add'}</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function searchMovies(){
  const q = document.getElementById("searchBox").value.trim().toLowerCase();
  const filtered = movies.filter(m => m.title.toLowerCase().includes(q) || m.genre.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q));
  displayGrid(filtered);
}
function sortMovies(){
  const v = document.getElementById("sortSelect").value;
  let sorted = [...movies];
  if(v==="rating") sorted.sort((a,b)=>calcAvg(b)-calcAvg(a));
  else if(v==="year") sorted.sort((a,b)=>b.year-a.year);
  else if(v==="az") sorted.sort((a,b)=>a.title.localeCompare(b.title));
  displayGrid(sorted);
}

function openMovie(id){
  const m = movies.find(x=>x.id===id); if(!m) return;
  currentMovie = m;
  document.getElementById("modalPoster").src = m.poster;
  document.getElementById("modalTitle").textContent = `${m.title} (${m.year})`;
  document.getElementById("modalMeta").textContent = `${m.genre} • ${m.year} • Avg Rating: ${calcAvg(m)}`;
  document.getElementById("modalDesc").textContent = m.desc;
  document.getElementById("movieModal").style.display = "flex";
  renderReviews(m);
  updateWatchButton();
}

function renderReviews(m){
  const list = document.getElementById("reviewsList");
  list.innerHTML = "";
  if(!m.reviews || m.reviews.length===0){ list.innerHTML = "<p>No reviews yet. Be the first!</p>"; return; }
  m.reviews.slice().reverse().forEach((r,idx)=>{
    const ri = document.createElement("div"); ri.className="review";
    const rating = m.ratings[m.ratings.length-1-idx] || 0;
    ri.innerHTML = `<div style="font-weight:700">${"★".repeat(rating)}${"☆".repeat(5-rating)}</div><div style="margin-top:6px">${escapeHtml(r)}</div>`;
    list.appendChild(ri);
  });
  document.getElementById("avgRating").innerHTML = starsHtml(calcAvg(m));
}

function submitReview(){
  const text = document.getElementById("reviewText").value.trim();
  const rating = parseInt(document.getElementById("ratingSelect").value);
  if(!currentMovie) return alert("No movie selected");
  if(!text) return alert("Please write a short review");
  currentMovie.reviews = currentMovie.reviews || [];
  currentMovie.ratings = currentMovie.ratings || [];
  currentMovie.reviews.push(text);
  currentMovie.ratings.push(rating);
  saveState();
  renderReviews(currentMovie);
  displayGrid();
  document.getElementById("reviewText").value = "";
  alert("Thanks — your review is added!");
}

function toggleWatchlist(id, btnEl){
  const idx = watchlist.indexOf(id);
  if(idx===-1) watchlist.push(id);
  else watchlist.splice(idx,1);
  saveWatch();
  updateWatchCount();
  if(btnEl) btnEl.textContent = watchlist.includes(id)?'★ In Watchlist':'☆ Add';
  if(currentMovie && currentMovie.id===id) updateWatchButton();
}
function toggleWatchlistCurrent(){
  if(!currentMovie) return;
  toggleWatchlist(currentMovie.id);
  updateWatchButton();
}
function updateWatchButton(){
  const btn = document.getElementById("toggleWatchBtn");
  if(!btn || !currentMovie) return;
  btn.textContent = watchlist.includes(currentMovie.id) ? "★ In Watchlist" : "☆ Add to Watchlist";
}
function updateWatchCount(){ document.getElementById("watchCount").textContent = watchlist.length; }
function showWatchlist(){
  const el = document.getElementById("watchItems"); el.innerHTML = "";
  if(watchlist.length===0){ el.innerHTML = "<p>No movies in watchlist</p>"; document.getElementById("watchModal").style.display = "flex"; return; }
  watchlist.forEach(id=>{
    const m = movies.find(x=>x.id===id);
    if(!m) return;
    const row = document.createElement("div"); row.className = "watch-row";
    row.innerHTML = `
      <div>${m.title} (${m.year})</div>
      <div>
        <button onclick="openMovie(${m.id})" class="btn view-btn">View</button>
        <button onclick="toggleWatchlist(${m.id})" class="btn fav-btn">Remove</button>
      </div>
    `;
    el.appendChild(row);
  });
  document.getElementById("watchModal").style.display = "flex";
}
function clearWatchlist(){
  if(!confirm("Clear all watchlist items?")) return;
  watchlist = []; saveWatch(); updateWatchCount(); document.getElementById("watchItems").innerHTML = "<p>Cleared.</p>";
}

function closeMovieModal(){ document.getElementById("movieModal").style.display = "none"; currentMovie=null; }
function closeWatchModal(){ document.getElementById("watchModal").style.display = "none"; }

function escapeHtml(s){ return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

function toggleTheme(){ document.body.classList.toggle("light"); }

(function init(){
  loadState();
  updateWatchCount();
  displayGrid();
  window.onclick = (e) => { if(e.target.classList.contains("modal")) e.target.style.display = "none"; };
})();
