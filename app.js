/*
  Renders macros.json as a long list using Bootstrap list-group.
  Includes loading and error states. Safe to host statically.
*/

(async function init() {
  const container = document.getElementById('list-container');
  const searchInput = document.getElementById('search-input');
  const categorySelect = document.getElementById('category-select');
  const resetBtn = document.getElementById('reset-filters');
  if (!container) return;

  // Loading state
  container.innerHTML = '<div class="list-group-item">Loading macros…</div>';

  try {
    const res = await fetch('macros.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load macros.json: ${res.status} ${res.statusText}`);
    const macros = await res.json();

    if (!Array.isArray(macros)) throw new Error('macros.json is not an array');

    // Precompute sets for filters with custom order
    const ORDER = [
      'cantrips',
      '1st level',
      '2nd level',
      '3nd level',
      '4th level',
      '5th level',
      '6th level',
      '7th level',
      '8th level',
      '9th level',
      'simple melee weapons',
      'martial melee weapons',
      'simple ranged weapons',
      'martial ranged weapons',
      'special',
      'short rest',
      'dice rolls',
      'Tokens'
    ];
    const keyOf = (v) => {
      if (v == null) return Infinity;
      const i = ORDER.findIndex(o => o.toLowerCase() === String(v).toLowerCase());
      return i === -1 ? ORDER.length + 1 : i;
    };

    const categories = Array.from(new Set(macros.map(m => m.category).filter(Boolean)))
      .sort((a, b) => keyOf(a) - keyOf(b));
    // Populate selects
    const addOptions = (select, values) => {
      values.forEach(v => {
        const opt = document.createElement('option');
        opt.value = String(v);
        opt.textContent = String(v);
        select.appendChild(opt);
      });
    };
    if (categorySelect) addOptions(categorySelect, categories);

    // Render function (sorted by category using same ORDER)
    const render = (items) => {
      // sort items by category order first, then by name
      const sorted = [...items].sort((a, b) => {
        const ca = keyOf(a.category);
        const cb = keyOf(b.category);
        if (ca !== cb) return ca - cb;
        const na = (a.name || '').toLowerCase();
        const nb = (b.name || '').toLowerCase();
        return na.localeCompare(nb);
      });
      if (!items || items.length === 0) {
        container.innerHTML = '<div class="list-group-item">No results.</div>';
        return;
      }
      const frag = document.createDocumentFragment();
      sorted.forEach((m) => {
        const item = document.createElement('div');
        item.className = 'list-group-item';

        // Header row with title only
        const header = document.createElement('div');
        header.className = 'd-flex justify-content-between align-items-start gap-2';

        const headerLeft = document.createElement('div');
        const title = document.createElement('h5');
        title.className = 'mb-1';
        title.textContent = m.name || 'Untitled Macro';
        const meta = document.createElement('small');
        const cat = m.category ? String(m.category) : '';
        meta.className = 'text-muted';
        meta.textContent = [cat].filter(Boolean).join(' • ');
        headerLeft.appendChild(title);
        if (meta.textContent) headerLeft.appendChild(meta);

        header.appendChild(headerLeft);

        const desc = document.createElement('p');
        desc.className = 'mb-2 mt-2';
        desc.textContent = (m.description || '').replace(/\r\n/g, '\n');

        const code = document.createElement('div');
        // Row for macrocode with copy button aligned to the right
        if (m.macrocode) {
          const row = document.createElement('div');
          row.className = 'd-flex justify-content-between align-items-center gap-3 mb-1';
          const codeBlock = document.createElement('div');
          codeBlock.className = 'flex-grow-1 m-0 p-0';
          codeBlock.innerHTML = m.macrocode;
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'btn btn-sm';
          btn.style.backgroundColor = '#6f42c1'; // purple to match macrocode theme
          btn.style.color = 'white';
          btn.textContent = 'Copy Macro';
          btn.style.whiteSpace = 'nowrap';
          btn.style.minWidth = '110px';
          btn.addEventListener('click', async () => {
            try {
              await navigator.clipboard.writeText(m.macrocode);
              btn.textContent = 'Copied!';
              setTimeout(() => (btn.textContent = 'Copy Macro'), 1200);
            } catch {
              const ta = document.createElement('textarea');
              ta.value = m.macrocode;
              document.body.appendChild(ta);
              ta.select();
              document.execCommand('copy');
              ta.remove();
              btn.textContent = 'Copied!';
              setTimeout(() => (btn.textContent = 'Copy Macro'), 1200);
            }
          });
          row.appendChild(codeBlock);
          row.appendChild(btn);
          code.appendChild(row);
        }
        // Row for macrocodecrit with copy button aligned to the right
        if (m.macrocodecrit) {
          const rowCrit = document.createElement('div');
          rowCrit.className = 'd-flex justify-content-between align-items-center gap-3 mb-1';
          const critBlock = document.createElement('div');
          critBlock.className = 'flex-grow-1 m-0 p-0';
          critBlock.innerHTML = m.macrocodecrit;
          const btnCrit = document.createElement('button');
          btnCrit.type = 'button';
          btnCrit.className = 'btn btn-sm';
          btnCrit.style.backgroundColor = '#20c997'; // teal to match crit theme
          btnCrit.style.color = 'white';
          btnCrit.textContent = 'Copy Crit';
          btnCrit.style.whiteSpace = 'nowrap';
          btnCrit.style.minWidth = '110px';
          btnCrit.addEventListener('click', async () => {
            try {
              await navigator.clipboard.writeText(m.macrocodecrit);
              btnCrit.textContent = 'Copied!';
              setTimeout(() => (btnCrit.textContent = 'Copy Crit'), 1200);
            } catch {
              const ta = document.createElement('textarea');
              ta.value = m.macrocodecrit;
              document.body.appendChild(ta);
              ta.select();
              document.execCommand('copy');
              ta.remove();
              btnCrit.textContent = 'Copied!';
              setTimeout(() => (btnCrit.textContent = 'Copy Crit'), 1200);
            }
          });
          rowCrit.appendChild(critBlock);
          rowCrit.appendChild(btnCrit);
          code.appendChild(rowCrit);
        }

        item.appendChild(header);
        if (desc.textContent) item.appendChild(desc);
        if (code.childNodes.length) item.appendChild(code);

        frag.appendChild(item);
      });
      container.innerHTML = '';
      container.appendChild(frag);
    };

    // Filtering logic
    const normalize = (s) => (s || '').toString().toLowerCase();

    const applyFilters = () => {
      const q = normalize(searchInput ? searchInput.value : '');
      const cat = categorySelect ? categorySelect.value : '';
      const filtered = macros.filter(m => {
        // category filter only
        if (cat && String(m.category) !== cat) return false;

        if (!q) return true;
        // Search across key fields, including HTML text
        const haystack = [
          m.name,
          m.description,
          m.category,
          // m.subcategory, // removed from search domain as per requirement
          m.macrocode,
          m.macrocodecrit,
        ].map(normalize).join(' ');
        return haystack.includes(q);
      });

      render(filtered);
    };

    // Initial render (already sorted inside render)
    render(macros);

    // Wire up events with basic debouncing for input
    let t;
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(applyFilters, 150);
      });
    }
    if (categorySelect) categorySelect.addEventListener('change', applyFilters);
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (categorySelect) categorySelect.value = '';
        applyFilters();
        searchInput?.focus();
      });
    }

  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="list-group-item list-group-item-danger">Error loading macros: ${err.message}</div>`;
  }
})();
