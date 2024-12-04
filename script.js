fetch('macros.json')
    .then(response => response.json())
    .then(data => {
    //Create accordionContainer
    const accordionContainer = document.getElementById("accordion");
    //Create list items
    data.forEach((item, id) => {
        // Create unique IDs for collapsible elements
        const headingId = `heading${id}`;
        const collapseId = `collapse${id}`;

        // Create collapsible card
        const card = document.createElement("div");
        card.className = "card";

        // Create card header & Bootstrap stuff
        const cardHeader = document.createElement("div");
        cardHeader.className = "card-header";
        cardHeader.id = headingId;

        //Creates button that we will append to the cardHeader
        const headerButton = document.createElement("button");
        headerButton.className = "btn btn-link";
        headerButton.setAttribute("data-toggle", "collapse");
        headerButton.setAttribute("data-target", `#${collapseId}`);
        headerButton.setAttribute("aria-expanded", id === 0 ? "true" : "false");
        headerButton.setAttribute("aria-controls", collapseId);

        //Add name to it
        headerButton.textContent = item.name;

        cardHeader.appendChild(headerButton);

        // Create collapsible body & Bootstrap stuff
        const collapseDiv = document.createElement("div");
        collapseDiv.id = collapseId;
        collapseDiv.className = `collapse ${id === 0 ? "show" : ""}`;
        collapseDiv.setAttribute("aria-labelledby", headingId);
        collapseDiv.setAttribute("data-parent", "#accordion");
        
        //Add description to cardBody
        const cardBody = document.createElement("div");
        cardBody.className = "card-body";

        //Add description to it
        cardBody.textContent = item.description;

        // Append to cardBody
        collapseDiv.appendChild(cardBody);

        // Assemble the card (appendChild is combining)
        card.appendChild(cardHeader);
        card.appendChild(collapseDiv);

        // Append to the accordion container which is the visible accordion div in index
        accordionContainer.appendChild(card);
    });
    console.log(data);
}).catch(err => {
    console.error("Error fetching JSON data:", error);
});