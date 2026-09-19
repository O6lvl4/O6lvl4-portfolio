// Select-only comboboxes: the native selects remain the source of filter values.
function initWorkPickers(selects) {
  let opened = null;
  const pickers = selects.map(createPicker);
  function createPicker(select) {
    const field = select.closest('.work-field');
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'work-picker';
    trigger.id = `${select.id}-trigger`;
    trigger.setAttribute('role', 'combobox');
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-labelledby', `${select.id}-label ${select.id}-value`);
    trigger.innerHTML = `<span class="work-picker-caption" aria-hidden="true"></span><span id="${select.id}-value" class="work-picker-value"></span><svg class="work-picker-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M3 6h5m4 0h5M3 14h9m4 0h1"/><circle cx="10" cy="6" r="2"/><circle cx="14" cy="14" r="2"/></svg>`;
    trigger.querySelector('.work-picker-caption').textContent = document.getElementById(`${select.id}-label`).textContent;
    const popup = document.createElement('div');
    popup.className = 'work-picker-menu';
    popup.id = `${select.id}-options`;
    popup.hidden = true;
    popup.setAttribute('role', 'listbox');
    popup.setAttribute('aria-labelledby', `${select.id}-label`);
    popup.addEventListener('pointerdown', (event) => event.preventDefault());
    trigger.setAttribute('aria-controls', popup.id);
    const options = [...select.options].map((option, index) => {
      const item = document.createElement('div');
      item.className = 'work-picker-option';
      item.id = `${select.id}-option-${index}`;
      item.setAttribute('role', 'option');
      const label = document.createElement('span');
      label.textContent = option.textContent;
      const check = document.createElement('span');
      check.className = 'work-picker-check';
      check.setAttribute('aria-hidden', 'true');
      check.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m3 8 3 3 7-7"/></svg>';
      item.append(label, check);
      item.addEventListener('click', () => choose(index));
      popup.append(item);
      return item;
    });
    field.append(trigger, popup);
    select.hidden = true;
    let active = select.selectedIndex;
    let typed = '';
    let typedAt = 0;
    function sync() {
      trigger.querySelector('.work-picker-value').textContent = select.selectedOptions[0].textContent;
      trigger.classList.toggle('is-filtered', select.selectedIndex > 0);
      options.forEach((option, index) => {
        option.hidden = select.options[index].hidden;
        option.setAttribute('aria-selected', String(index === select.selectedIndex));
      });
      if (!popup.hidden) highlight(active);
    }
    function availableIndices() {
      return options.flatMap((option, index) => option.hidden ? [] : [index]);
    }
    function moveActive(step) {
      const available = availableIndices();
      const position = Math.max(0, available.indexOf(active));
      highlight(available[Math.max(0, Math.min(available.length - 1, position + step))]);
    }
    function highlight(index) {
      const available = availableIndices();
      active = available.includes(index) ? index : available[0];
      options.forEach((option, i) => option.classList.toggle('is-active', i === active));
      trigger.setAttribute('aria-activedescendant', options[active].id);
      const item = options[active];
      if (item.offsetTop < popup.scrollTop) popup.scrollTop = item.offsetTop;
      if (item.offsetTop + item.offsetHeight > popup.scrollTop + popup.clientHeight) {
        popup.scrollTop = item.offsetTop + item.offsetHeight - popup.clientHeight;
      }
    }
    function close() {
      popup.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      trigger.removeAttribute('aria-activedescendant');
      field.classList.remove('picker-open');
      if (opened === picker) opened = null;
    }
    function open() {
      opened?.close();
      opened = picker;
      typed = "";
      const rect = trigger.getBoundingClientRect();
      const below = innerHeight - rect.bottom - 16;
      const above = rect.top - 16;
      const upward = below < 200 && above > below;
      popup.classList.toggle('opens-up', upward);
      popup.style.maxHeight = `${Math.min(300, Math.max(100, upward ? above : below))}px`;
      popup.hidden = false;
      popup.style.translate = 'none';
      const bounds = popup.getBoundingClientRect();
      const shift = Math.max(16 - bounds.left, Math.min(0, innerWidth - 16 - bounds.right));
      popup.style.translate = `${shift}px 0`;
      field.classList.add('picker-open');
      trigger.setAttribute('aria-expanded', 'true');
      highlight(select.selectedIndex);
    }
    function choose(index) {
      if (select.options[index].disabled) return;
      select.selectedIndex = index;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      sync();
      close();
      trigger.focus({ preventScroll: true });
    }
    function typeAhead(key) {
      typed = Date.now() - typedAt > 600 ? key : typed + key;
      typedAt = Date.now();
      const index = [...select.options].findIndex((option) => !option.hidden && option.textContent.toLocaleLowerCase().startsWith(typed.toLocaleLowerCase()));
      if (index >= 0) highlight(index);
    }
    function isTextKey(event) {
      return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
    }
    function onKey(event) {
      if (event.key === 'Tab' || event.key === 'Escape') { close(); return; }
      const movement = { ArrowDown: 1, ArrowUp: -1, Home: -options.length, End: options.length };
      if (event.key in movement) {
        event.preventDefault();
        if (popup.hidden) open();
        else moveActive(movement[event.key]);
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (popup.hidden) open();
        else choose(active);
        return;
      }
      if (isTextKey(event)) {
        event.preventDefault();
        if (popup.hidden) open();
        typeAhead(event.key);
      }
    }
    const picker = { sync, close, field };
    trigger.addEventListener('click', () => { if (popup.hidden) open(); else close(); });
    trigger.addEventListener('keydown', onKey);
    field.addEventListener('focusout', (event) => { if (!field.contains(event.relatedTarget)) close(); });
    select.addEventListener('change', sync);
    sync();
    return picker;
  }
  document.addEventListener('pointerdown', (event) => { if (opened && !opened.field.contains(event.target)) opened.close(); });
  window.addEventListener('resize', () => opened?.close());
  window.addEventListener('scroll', () => opened?.close());
  return () => pickers.forEach((picker) => picker.sync());
}
