// One state controls search, filters and ordering, including bookmarked URLs.
const controls = document.querySelector('.work-controls');
const query = document.querySelector('#work-query');
const family = document.querySelector('#work-family');
const language = document.querySelector('#work-language');
const sort = document.querySelector('#work-sort');
const list = document.querySelector('#project-results');
const count = document.querySelector('#work-count');
const reset = document.querySelector('#work-reset');
const clear = document.querySelector('#work-clear');
const empty = document.querySelector('.work-empty');
const syncPickers = initWorkPickers([family, language, sort]);
const normalise = (text) => text.normalize('NFKC').toLowerCase().trim();
const familyNames = new Map([...family.options].map((option) => [option.value, option.textContent]));
const rows = [...list.children].map((el, index) => ({
  el, index, name: el.dataset.name, family: el.dataset.org, language: el.dataset.lang,
  date: el.dataset.date, commits: Number(el.dataset.commits),
  search: normalise(`${el.textContent} ${familyNames.get(el.dataset.org) ?? ''}`),
}));
function compare(a, b) {
  if (sort.value === 'name') return a.name.localeCompare(b.name, undefined, { numeric: true });
  if (sort.value === 'commits') return b.commits - a.commits || a.index - b.index;
  if (sort.value === 'format') return a.language.localeCompare(b.language) || b.commits - a.commits;
  return b.date.localeCompare(a.date) || a.index - b.index;
}
function saveUrl() {
  const url = new URL(location.href);
  for (const [key, value] of [['q', query.value.trim()], ['family', family.value], ['lang', language.value], ['sort', sort.value === 'date' ? '' : sort.value]]) {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  history.replaceState(null, '', url);
}
function matches(row, terms) {
  return terms.every((term) => row.search.includes(term)) && (!family.value || family.value === row.family) && (!language.value || language.value === row.language);
}
function updateFacets(terms) {
  const matching = rows.filter((row) => terms.every((term) => row.search.includes(term)));
  const families = new Set(matching.filter((row) => !language.value || row.language === language.value).map((row) => row.family));
  const languages = new Set(matching.filter((row) => !family.value || row.family === family.value).map((row) => row.language));
  for (const [select, available] of [[family, families], [language, languages]]) {
    for (const option of select.options) {
      option.hidden = Boolean(option.value) && !available.has(option.value);
      option.disabled = option.hidden;
    }
  }
}
function apply(save = true) {
  const terms = normalise(query.value).split(/\s+/).filter(Boolean);
  updateFacets(terms);
  syncPickers();
  let shown = 0;
  const fragment = document.createDocumentFragment();
  for (const row of [...rows].sort(compare)) {
    row.el.hidden = !matches(row, terms);
    if (!row.el.hidden) shown++;
    fragment.append(row.el);
  }
  list.append(fragment);
  count.textContent = `${shown} / ${rows.length} ${count.dataset.unit}`;
  document.querySelector('#works .section-count').textContent = `${shown} / ${rows.length}`;
  list.hidden = shown === 0;
  empty.hidden = shown !== 0;
  clear.hidden = query.value.length === 0;
  reset.disabled = !query.value && !family.value && !language.value && sort.value === 'date';
  if (save) saveUrl();
}
function restore() {
  const params = new URLSearchParams(location.search);
  query.value = params.get('q') ?? '';
  for (const [select, key, fallback] of [[family, 'family', ''], [language, 'lang', ''], [sort, 'sort', 'date']]) {
    const value = params.get(key) ?? fallback;
    select.value = [...select.options].some((option) => option.value === value) ? value : fallback;
  }
  apply(false);
}
query.addEventListener('input', (event) => { if (!event.isComposing) apply(); });
query.addEventListener('compositionend', () => apply());
for (const select of [family, language, sort]) select.addEventListener('change', () => apply());
clear.addEventListener('click', () => { query.value = ''; apply(); query.focus(); });
reset.addEventListener('click', () => {
  query.value = ''; family.value = ''; language.value = ''; sort.value = 'date'; apply(); query.focus();
});
window.addEventListener('popstate', restore);
restore();
controls.hidden = false;

const shortcut = document.querySelector('.work-shortcut');
shortcut.textContent = navigator.platform.includes('Mac') ? '⌘ K' : 'Ctrl K';
document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    query.focus();
  }
});
