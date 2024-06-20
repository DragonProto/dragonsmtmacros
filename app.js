let allMacros = [];

// Function to fetch data
async function fetchData() {
  const loadingIndicator = document.createElement('div');
  loadingIndicator.id = 'loading-indicator';
  loadingIndicator.textContent = 'Loading...';
  document.body.appendChild(loadingIndicator);

  try {
    const macrosResponse = await fetch('macros.json');
    if (!macrosResponse.ok) {
      throw new Error('Network response was not ok ' + macrosResponse.statusText);
    }
    const macros = await macrosResponse.json();
    document.body.removeChild(loadingIndicator);
    allMacros = macros;
    document.dispatchEvent(new CustomEvent('macrosLoaded', { detail: macros }));
  } catch (error) {
    document.body.removeChild(loadingIndicator);
    console.error('Fetch error: ', error);
  }
}

function renderMacros(macros) {
  const macrosList = document.getElementById('macros-list');
  const notification = document.getElementById('notification');

  macrosList.innerHTML = '';
  if (macros.length === 0) {
    const emptyStateMessage = document.createElement('p');
    emptyStateMessage.id = 'empty-state-message';
    emptyStateMessage.textContent = 'No macros found.';
    macrosList.appendChild(emptyStateMessage);
  } else {
    macros.forEach(macro => {
      const li = document.createElement('li');
      li.className = 'macro-item';
      li.innerHTML = `
        <h3 class="macro-header">${macro.name}</h3>
        <div class="macro-details" aria-hidden="true">
        <div id="description-wrapper">
            <div class="d-flex justify-content-between align-items-center">
                <p><strong>Description:</strong></p>
            </div>
            <p>${macro.description.replace(/\r\n/g, '<br>')}</p>
        </div>
            <div class="macro-section">
                <div class="d-flex justify-content-between align-items-center">
                    <p><strong>Macro Code:</strong></p>
                    <span class="copy-btn" data-macrocode="${macro.macrocode.replace(/"/g, '&quot;')}" title="Copy macro" role="button">&#128203;</span>
                </div>
                <code class="macro-code-content">${macro.macrocode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>
            </div>
            <div class="macro-section2">
                <div class="d-flex justify-content-between align-items-center">
                    <p><strong>Critical Hit Macro Code:</strong></p>
                    <span class="copy-btn" data-macrocode="${macro.macrocodecrit.replace(/"/g, '&quot;')}" title="Copy critical macro" role="button">&#128203;</span>
                </div>
                <code class="macro-critical-code-content">${macro.macrocodecrit.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>
            </div>
        </div>
      `;

      // Add click event listener to the entire list item to toggle open/close
      li.addEventListener('click', (e) => {
        // Ensure that clicks on the text elements inside do not toggle the macro-item
        if (e.target.closest('.macro-header, .macro-details p, .macro-details strong, .macro-code-content, .macro-critical-code-content, .copy-btn')) {
          return;
        }

        const details = li.querySelector('.macro-details');
        const isOpen = details.classList.contains('open');

        // Close all open details
        document.querySelectorAll('.macro-details.open').forEach(detail => {
          detail.classList.remove('open');
          detail.setAttribute('aria-hidden', 'true');
          detail.parentElement.setAttribute('aria-expanded', 'false');
        });

        // If the clicked item was closed, open it
        if (!isOpen) {
          details.classList.add('open');
          details.setAttribute('aria-hidden', 'false');
          li.setAttribute('aria-expanded', 'true');
          li.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          details.classList.remove('open');
          details.setAttribute('aria-hidden', 'true');
          li.setAttribute('aria-expanded', 'false');
        }
      });

      // Prevent closing the macro details when clicking on text inside it
      li.querySelectorAll('.macro-header, .macro-details p, .macro-details strong, .macro-code-content, .macro-critical-code-content')
        .forEach(element => {
          element.addEventListener('click', (e) => {
            e.stopPropagation();
          });
        });

      macrosList.appendChild(li);
    });
  }

  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const macrocode = e.target.dataset.macrocode;
      navigator.clipboard.writeText(macrocode).then(() => {
        showNotification('Copied macro!');
      }).catch(err => {
        console.error('Error copying text: ', err);
      });
    });
  });
}

// Function to update macros based on search/filter criteria
function updateMacros() {
  const query = document.getElementById('search-input').value.toLowerCase();
  const selectedOptions = Array.from(document.querySelectorAll('.dropdown-item.active')).map(option => option.dataset.value);

  const filteredMacros = allMacros.filter(macro => {
    const nameMatch = macro.name.toLowerCase().includes(query);
    const catSubs = macro.subcategories ? macro.subcategories.split(', ').map(sub => `${macro.category}::${sub}`) : [];
    const categoryMatch = selectedOptions.length === 0 || selectedOptions.some(opt => catSubs.includes(opt));
    return nameMatch && categoryMatch;
  });
  renderMacros(filteredMacros);
}

// Function to show notifications
function showNotification(message) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.classList.remove('show');
  void notification.offsetWidth;
  notification.classList.add('show');
  setTimeout(() => {
    notification.classList.remove('show');
  }, 2000);
}

// Function to populate categories
function populateCategories(macros) {
  const categoryDropdown = document.getElementById('category-dropdown');
  categoryDropdown.innerHTML = '';

  const categories = {};
  macros.forEach(macro => {
    if (macro.subcategories) {
      const subcategories = macro.subcategories.split(', ');
      subcategories.forEach(subcategory => {
        if (!categories[macro.category]) {
          categories[macro.category] = new Set();
        }
        categories[macro.category].add(subcategory);
      });
    }
  });

  const sortedCategories = Object.keys(categories).sort();
  sortedCategories.forEach(category => {
    const categoryHeader = document.createElement('h6');
    categoryHeader.className = 'dropdown-header';
    categoryHeader.innerText = category;
    categoryDropdown.appendChild(categoryHeader);

    Array.from(categories[category]).sort().forEach(subcategory => {
      const option = document.createElement('a');
      option.className = 'dropdown-item';
      option.href = '#';
      option.dataset.value = `${category}::${subcategory}`;
      option.innerText = subcategory;
      option.setAttribute('role', 'menuitem');
      option.addEventListener('click', (e) => {
        e.preventDefault();
        option.classList.toggle('active');
        updateMacros();
      });
      categoryDropdown.appendChild(option);
    });
  });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  fetchData();
});

document.addEventListener('macrosLoaded', (event) => {
  const macros = event.detail;
  renderMacros(macros);
  populateCategories(macros);
});

document.getElementById('search-input').addEventListener('input', updateMacros);

document.getElementById('clear-categories-btn').addEventListener('click', () => {
  document.querySelectorAll('.dropdown-item.active').forEach(item => {
    item.classList.remove('active');
  });
  updateMacros();
});
