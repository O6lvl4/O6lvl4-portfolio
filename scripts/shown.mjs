// What counts as work worth a card, out of everything the owners publish.
//
// A public non-fork repository qualifies unless it is GitHub's own furniture: an organisation's
// `.github` profile, the source of this site, and the drawer of personal dotfiles are not projects
// anyone comes here to read. refresh.mjs never clones or counts them and plan.mjs leaves them out
// of any inventory it is handed, so one rule keeps the two lists the same.
const EXCLUDED = new Set(["O6lvl4/O6lvl4-portfolio", "O6lvl4/dotfiles"]);

export const shown = (full) => !EXCLUDED.has(full) && !full.endsWith("/.github");
