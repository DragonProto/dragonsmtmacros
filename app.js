// Fetch data from the backend API (this is where you'll get the data from your database)
fetch('macros.json')
  .then(response => response.json())  // Convert the response to JSON
  .then(data => {  // Once we have the data, we can start rendering the list
    const container = document.getElementById('list-container');  // Get the container where we'll append the list items

    // Loop through each item in the fetched data
    data.forEach(item => {
      // Create a new div for each collapsible item
      const listItem = document.createElement('div');
      listItem.classList.add('collapsible-item');  // Add a class for styling

      // Define the HTML structure for each collapsible item
      listItem.innerHTML = `
        <button class="collapsible">${item.title}</button>  <!-- The button that will toggle the collapse -->
        <div class="content">${item.details}</div>  <!-- The content that will be shown/hidden -->
      `;

      // Add event listener to handle the collapse/expand action when the button is clicked
      listItem.querySelector('.collapsible').onclick = function() {
        this.classList.toggle('active');  // Toggle the 'active' class to change button styling
        const content = this.nextElementSibling;  // Get the content div that follows the button
        
        // If the content is currently displayed, hide it; otherwise, show it
        if (content.style.display === "block") {
          content.style.display = "none";  // Hide the content
        } else {
          content.style.display = "block";  // Show the content
        }
      };

      // Append the created list item to the container in the HTML
      container.appendChild(listItem);
    });
  })
  .catch(error => {
    console.error('Error fetching data:', error);  // If the fetch fails, log the error
  });