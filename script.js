const storeKey = 'flashcards_v1';
const qEl = document.getElementById('q');
const aEl = document.getElementById('a');
const countEl = document.getElementById('count');
const statusEl = document.getElementById('status');
const listEl = document.getElementById('list');
const questionIn = document.getElementById('question');
const answerIn = document.getElementById('answer');
const modePill = document.getElementById('modePill');
const form = document.getElementById('form');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const toggleBtn = document.getElementById('toggleBtn');
const editBtn = document.getElementById('editBtn');
const deleteBtn = document.getElementById('deleteBtn');
const newBtn = document.getElementById('newBtn');
const clearAllBtn = document.getElementById('clearAllBtn');

let deck = [];
let idx = 0;
let showAnswer = false;
let editIndex = null;

function saveDeck() { localStorage.setItem(storeKey, JSON.stringify(deck)); }
function loadDeck() {
  const raw = localStorage.getItem(storeKey);
  if (raw) { try { deck = JSON.parse(raw) || []; } catch { deck = []; } }
  if (!raw) {
    deck = [
      { q:'What is HTML?', a:'HyperText Markup Language' },
      { q:'CSS is used for?', a:'Styling and layout of web pages' },
      { q:'LocalStorage persistence?', a:'Stores data in the browser across sessions' }
    ];
    saveDeck();
  }
}

function clampIndex() {
  if (deck.length === 0) { idx = 0; return; }
  if (idx < 0) idx = deck.length - 1;
  if (idx >= deck.length) idx = 0;
}

function renderStudy() {
  const has = deck.length > 0;
  qEl.textContent = has ? deck[idx].q : 'No flashcards yet';
  aEl.textContent = has ? deck[idx].a : '';
  aEl.classList.toggle('show', showAnswer && has);
  countEl.textContent = has ? (idx + 1) + ' / ' + deck.length : '0 / 0';
  prevBtn.disabled = !has;
  nextBtn.disabled = !has;
  toggleBtn.disabled = !has;
  editBtn.disabled = !has;
  deleteBtn.disabled = !has;
  toggleBtn.textContent = showAnswer ? 'Hide Answer' : 'Show Answer';
}

function renderList() {
  listEl.innerHTML = '';
  if (deck.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'item';
    empty.innerHTML = '<span class="t muted">No cards added</span>';
    listEl.appendChild(empty);
    return;
  }
  deck.forEach((card, i) => {
    const row = document.createElement('div');
    row.className = 'item';
    const left = document.createElement('span');
    left.className = 't';
    left.textContent = card.q;
    const actions = document.createElement('div');
    actions.className = 'actions';
    const openBtn = document.createElement('button');
    openBtn.textContent = 'Open';
    const eBtn = document.createElement('button');
    eBtn.textContent = 'Edit';
    const dBtn = document.createElement('button');
    dBtn.textContent = 'Delete';
    dBtn.className = 'danger';
    openBtn.onclick = () => { idx = i; showAnswer = false; renderStudy(); flash('Opened'); };
    eBtn.onclick = () => { setEditMode(i); };
    dBtn.onclick = () => { removeAt(i); };
    actions.appendChild(openBtn);
    actions.appendChild(eBtn);
    actions.appendChild(dBtn);
    row.appendChild(left);
    row.appendChild(actions);
    listEl.appendChild(row);
  });
}

function flash(msg) { statusEl.textContent = msg; setTimeout(() => { if (statusEl.textContent === msg) statusEl.textContent = 'Ready'; }, 1200); }

function setAddMode() {
  editIndex = null;
  modePill.textContent = 'Mode: Add';
  questionIn.value = '';
  answerIn.value = '';
}

function setEditMode(i) {
  editIndex = i;
  modePill.textContent = 'Mode: Edit';
  questionIn.value = deck[i].q;
  answerIn.value = deck[i].a;
}

function upsertCard(q, a) {
  if (!q.trim() || !a.trim()) { flash('Enter question & answer'); return; }
  if (editIndex === null) {
    deck.push({ q, a });
    idx = deck.length - 1;
    flash('Card added');
  } else {
    deck[editIndex] = { q, a };
    idx = editIndex;
    flash('Card updated');
  }
  saveDeck();
  showAnswer = false;
  setAddMode();
  renderStudy();
  renderList();
}

function removeAt(i) {
  if (deck.length === 0) return;
  deck.splice(i, 1);
  saveDeck();
  if (idx >= deck.length) idx = deck.length - 1;
  if (idx < 0) idx = 0;
  showAnswer = false;
  flash('Card deleted');
  renderStudy();
  renderList();
}

prevBtn.onclick = () => { if (deck.length === 0) return; idx--; clampIndex(); showAnswer = false; renderStudy(); };
nextBtn.onclick = () => { if (deck.length === 0) return; idx++; clampIndex(); showAnswer = false; renderStudy(); };
toggleBtn.onclick = () => { if (deck.length === 0) return; showAnswer = !showAnswer; renderStudy(); };
editBtn.onclick = () => { if (deck.length === 0) return; setEditMode(idx); };
deleteBtn.onclick = () => { if (deck.length === 0) return; removeAt(idx); };

newBtn.onclick = () => { setAddMode(); questionIn.focus(); };
clearAllBtn.onclick = () => {
  if (!confirm('Delete all flashcards?')) return;
  deck = [];
  saveDeck();
  idx = 0; showAnswer = false;
  renderStudy(); renderList(); flash('All cleared');
};

form.addEventListener('submit', (e) => {
  e.preventDefault();
  upsertCard(questionIn.value, answerIn.value);
});

loadDeck();
clampIndex();
renderStudy();
renderList();
setAddMode();
