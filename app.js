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
            <div class="macro-section" onclick="event.stopPropagation();">
                <div class="d-flex justify-content-between align-items-center">
                  <p><strong>Macro Code:</strong></p>
                  <span class="copy-btn" data-macrocode="${macro.macrocode.replace(/"/g, '&quot;')}" title="Copy macro code" role="button"><img src="copy.svg" alt="Copy" class="copy-icon"></span></div>
                  <div id="macrocode-wrapper">
                    <code class="macro-code-content">${macro.macrocode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>
                  </div>  
            </div>
            <div class="macro-section2" onclick="event.stopPropagation();">
                <div class="d-flex justify-content-between align-items-center">
                    <p><strong>Critical Hit Macro Code:</strong></p>
                    <span class="copy-btn" data-macrocode="${macro.macrocodecrit.replace(/"/g, '&quot;')}" title="Copy critical macro" role="button"><img src="copy.svg" alt="Copy" class="copy-icon"></span>
                </div>
                <div id="macrocritcode-wrapper">
                  <code class="macro-critical-code-content">${macro.macrocodecrit.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>
                </div>
            </div>
        </div>
      `;

      macrosList.appendChild(li);

      // Apply cursor: text to the macro code content
      const macroCodeContent = li.querySelector('.macro-code-content');
      if (macroCodeContent) {
        macroCodeContent.style.cursor = 'text';
      }

      // Apply cursor: text to the critical hit macro code content
      const macroCriticalCodeContent = li.querySelector('.macro-critical-code-content');
      if (macroCriticalCodeContent) {
        macroCriticalCodeContent.style.cursor = 'text';
      }

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
          li.scrollIntoView({ behavior: 'smooth', block: 'center'});
        } else {
          details.classList.remove('open');
          details.setAttribute('aria-hidden', 'true');
          li.setAttribute('aria-expanded', 'false');
        }
      });

      // Prevent closing the macro details when clicking on text inside it
      li.querySelectorAll('.macro-header, .macro-details p, .macro-details strong, .macro-code-content, .macro-critical-code-content, .macro-section2, .macro-section, #description-wrapper')
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

function updateSelectedCategories() {
  const selectedOptions = Array.from(document.querySelectorAll('.dropdown-item.active')).map(option => option.innerText);
  const selectedCategoriesDiv = document.getElementById('selected-categories');
  selectedCategoriesDiv.textContent = selectedOptions.length > 0 ? `Selected categories: ${selectedOptions.join(', ')}` : '';
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
  updateSelectedCategories(); // Update the selected categories display
});

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
        updateSelectedCategories(); // Update the selected categories display
      });
      categoryDropdown.appendChild(option);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  fetchData();

  // Create the clear button element and wrap the search input
  const searchInput = document.getElementById('search-input');
  const searchInputWrapper = document.createElement('div');
  searchInputWrapper.id = 'search-input-wrapper';
  searchInputWrapper.style.position = 'relative';
  searchInputWrapper.style.display = 'inline-block'; // Ensure it displays correctly

  // Insert the wrapper before the search input and then move the search input inside the wrapper
  searchInput.parentNode.insertBefore(searchInputWrapper, searchInput);
  searchInputWrapper.appendChild(searchInput);

  const clearBtn = document.createElement('span');
  clearBtn.className = 'clear-btn';
  clearBtn.innerHTML = '&#10005;'; // Unicode for 'X'
  searchInputWrapper.appendChild(clearBtn);

  // Add event listener to clear the search input
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    updateMacros();
    searchInput.focus();
    clearBtn.style.display = 'none'; // Hide the clear button when input is cleared
  });

  // Show the clear button when typing
  searchInput.addEventListener('input', () => {
    clearBtn.style.display = searchInput.value ? 'block' : 'none';
  });

  // Ensure the dropdown menu width adjusts based on its content
  const dropdownMenu = document.querySelector('.dropdown-menu');
  categoryBtn.addEventListener('click', () => {
    dropdownMenu.style.display = 'block'; // Temporarily display to get width
    const dropdownWidth = dropdownMenu.scrollWidth; // Get the width of the content
    dropdownMenu.style.minWidth = `${dropdownWidth}px`; // Set min-width based on content
    dropdownMenu.style.display = ''; // Revert display setting
  });
});

document.addEventListener('DOMContentLoaded', () => {
  fetchData().then(() => {
    initializeDropdown();
  });

  function initializeDropdown() {
    const categoryBtn = document.getElementById('category-btn');
    const categoryDropdown = document.getElementById('category-dropdown');

    function setButtonAndDropdownWidth() {
      if (window.innerWidth > 768) {
        // Desktop view
        categoryDropdown.style.display = 'block'; // Temporarily display to calculate width
        const dropdownWidth = categoryDropdown.scrollWidth; // Use scrollWidth to get the full width of the content
        categoryBtn.style.width = dropdownWidth + 'px';
        categoryDropdown.style.display = 'none'; // Hide again after calculation
        categoryDropdown.style.width = 'auto'; // Reset the dropdown width to auto for desktop view
      } else {
        // Mobile view
        categoryBtn.style.width = '100%';
        categoryDropdown.style.width = '100%';
      }
    }

    // Set initial width
    setButtonAndDropdownWidth();

    // Update widths on window resize
    window.addEventListener('resize', setButtonAndDropdownWidth);

    let isMouseOverButtonOrDropdown = false;

    function openDropdown() {
      categoryDropdown.style.display = 'block';
      categoryBtn.classList.add('dropdown-open');
      categoryBtn.classList.remove('dropdown-closed');
    }
  
    function closeDropdown() {
      categoryDropdown.style.display = 'none';
      categoryBtn.classList.remove('dropdown-open');
      categoryBtn.classList.add('dropdown-closed');
    }
    
    categoryBtn.addEventListener('mouseenter', () => {
      isMouseOverButtonOrDropdown = true;
      openDropdown();
    });
  
    categoryBtn.addEventListener('mouseleave', () => {
      isMouseOverButtonOrDropdown = false;
      setTimeout(() => {
        if (!isMouseOverButtonOrDropdown) {
          closeDropdown();
        }
      }, 100);
    });
  
    categoryDropdown.addEventListener('mouseenter', () => {
      isMouseOverButtonOrDropdown = true;
    });
  
    categoryDropdown.addEventListener('mouseleave', () => {
      isMouseOverButtonOrDropdown = false;
      setTimeout(() => {
        if (!isMouseOverButtonOrDropdown) {
          closeDropdown();
        }
      }, 100);
    });

    categoryBtn.addEventListener('click', () => {
      if (categoryDropdown.style.display === 'block') {
        closeDropdown();
      } else {
        openDropdown();
      }
    });

    categoryBtn.classList.add('dropdown-closed');
  }
});

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
        updateSelectedCategories(); // Update the selected categories display
      });
      categoryDropdown.appendChild(option);
    });
  });
}

// Ensure the dropdown menu width adjusts based on its content
document.addEventListener('macrosLoaded', (event) => {
  const macros = event.detail;
  renderMacros(macros);
  populateCategories(macros);
  initializeDropdown();
});


