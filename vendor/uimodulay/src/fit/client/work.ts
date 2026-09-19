// Browser side of the work-view pattern: the arrow keys follow the previous and next links,
// Escape goes back to the series.

document.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const link = document.querySelector<HTMLAnchorElement>(`.steps a[data-key="${e.key}"]`);
  if (link) location.href = link.href;
});

export {};
