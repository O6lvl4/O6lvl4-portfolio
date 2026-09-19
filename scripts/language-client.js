// Browser language is a preference, not a guess based on a visitor's location.
const siteLanguages = new Set(['en', 'ja', 'zh']);
const languageStorageKey = 'o6lvl4-portfolio-language';

function preferredLanguage() {
  try {
    const saved = localStorage.getItem(languageStorageKey);
    if (siteLanguages.has(saved)) return saved;
  } catch {
    // Language detection still works when storage is unavailable.
  }
  const preferences = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const preference of preferences) {
    const language = String(preference ?? '').toLowerCase().split(/[-_]/)[0];
    if (siteLanguages.has(language)) return language;
  }
  return 'en';
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a.locale-btn, a[data-site-language]');
  if (!link) return;
  const target = new URL(link.href);
  const language = target.pathname.match(/\/(en|ja|zh)\/?$/)?.[1];
  if (target.origin !== location.origin || !siteLanguages.has(language)) return;
  try {
    localStorage.setItem(languageStorageKey, language);
  } catch {
    // The link itself still navigates normally.
  }
});

// Explicit /en/, /ja/ and /zh/ URLs always keep the language they name.
if (document.documentElement.hasAttribute('data-language-entry')) {
  location.replace(preferredLanguage() + '/' + location.search + location.hash);
}
