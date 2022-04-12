
// global variables
let auth = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Imtlc2hhbm1vb3NhaUBnbWFpbC5jb20iLCJmaXJzdG5hbWUiOm51bGwsImxhc3RuYW1lIjpudWxsLCJpZCI6MSwicm9sZXMiOiJ1c2VyIiwiaWF0IjoxNjQ5NDc4NTA4fQ.niRMnlB_nSOMK0DeHuutpxwCwgvyvrGjzXewdytAwAI';
let cuisines = {};
let areas = {};
let restaurants = {};
let displayContainer = document.getElementById("restaurant-listing");

// GET for hosted NocoDB database
async function pullData(table) {
  let results = {};
  let response = await fetch(
    `https://the-food-vault.herokuapp.com/nc/the_food_vault_scbp/api/v1/${table}?limit=100`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'xc-auth' : auth
      }
    }
  );
  results = await response.json();
  return results;
}

// Populate data objects
async function populateObjects() {
    cuisines    = await pullData('Cuisines');
    areas       = await pullData('Areas');
    restaurants = await pullData('Restaurants');
}

populateObjects();

// Restaurant Listing Area - referenced by many other functions, do not edit
restaurantsDisplayContainer = document.getElementById('restaurant-listing');

// Function to scroll to top of page
function scrollToTop() {
    // For Safari - because apple people just *special*
    document.body.scrollTop = 0;
    // For Chrome, Firefox, IE and Opera
    document.documentElement.scrollTop = 0;
}

// Open Side nav bar
function openChatArea() {
    document.getElementById("chatbot-area").classList.remove("collapsed");
    document.getElementById("chatbot-area").style.width = "390px";
    document.getElementById("page-content").style.marginLeft = "510px";
}

// Close side nav bar
function closeChatArea() {
    document.getElementById("chatbot-area").style.width = "0";
    document.getElementById("page-content").style.marginLeft = "0";
}

function formatPhoneNumber(phoneNumberString) {
    let cleaned = ('' + phoneNumberString).replace(/\D/g, '');
    let match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        let intlCode = (match[1] ? '+1 ' : '');
        return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('');
    }
    return null;
}

function closeRestaurantModal(modalElement) {
    modalElement.style.display = "none";

    // Reset body scrolling
    document.body.style.overflow = "auto";

    // Reset modal content
    modalElement.innerHTML = "";
}

// Create modal and its body
function createRestaurantModal(restaurant) {

    // Create the popup
    let modal = document.getElementById("restaurant-modal-container");
    
    // Create modal content view area
    let modalContent = document.createElement('div');
    modalContent.classList.add('modal-content', 'horizontal-container');
    modalContent.style.marginTop = "25px";

    // Populate modal content view area
    let modalContentHeader = document.createElement('h2');
    modalContentHeader.setAttribute("id", "modal-window-heading");
    modalContentHeader.innerHTML = `
        <b>${restaurant.name}</b>
    `;
    modalContent.appendChild(modalContentHeader);

    let modalContentBody = document.createElement('div');
    modalContentBody.setAttribute("id", "modal-window-body");
    modalContentBody.innerHTML = `
        <h3>Dine In: ${restaurant.dine_in ? "Yes" : "No"}</h3>
        <h3>Take Out: ${restaurant.take_out ? "Yes" : "No"}</h3>
        <h3>Rating: ${restaurant.rating}</h3>
        <h3>Address: ${restaurant.address}</h3>
        <h3>Phone: ${formatPhoneNumber(restaurant.contact)}</h3>
        <h3>Website: ${restaurant.website ? `<a href="${restaurant.website}" target="_blank">Click Here</a>` : "No website available"}</h3>
        <br>
    `;
    modalContent.appendChild(modalContentBody);

    // Create map view area
    let mapContainer = document.createElement('div');
    mapContainer.setAttribute("id", "modal-window-map-container");
    mapContainer.style.justifyContent = "center";
    mapContainer.style.alignItems = "center";
    mapContainer.style.border = "2.5px solid #ccc";
    mapContainer.style.margin = "0 auto";
    mapContainer.innerHTML = restaurant.google_maps;
    modalContent.appendChild(mapContainer);
    
    // Add button to close modal
    let closeButton = document.createElement("button");
    closeButton.setAttribute("id", "modal-close-button");
    closeButton.setAttribute("onclick", `closeRestaurantModal(this.parentElement.parentElement)`);
    closeButton.classList.add("modal-close-btn");
    closeButton.style.marginTop = "15px";
    closeButton.innerHTML = "&times;";
    modalContent.appendChild(closeButton);

    // Add modal content to modal
    modal.appendChild(modalContent);
    
    return modal;
}

// Show restaurant modal
function displayRestaurantPopup(restaurant) {

    // Create the modal
    let modal = createRestaurantModal(restaurant);

    // Show the modal and disable body scrolling
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

// Generate a random list of restaurants for trending section
async function generateTrending() {
    await populateObjects();
    let trendingList = [];

    // Get number of restaurants in database
    let numRestaurants = restaurants.length;

    // Generate random number between 0 and number of restaurants, three times
    // If two numbers are the same, generate another number
    while (trendingList[0] === trendingList[1] || trendingList[0] === trendingList[2] || trendingList[1] === trendingList[2]) {
        for (let i = 0; i < 3; i++) {
            let rand = Math.floor(Math.random() * numRestaurants);
            trendingList.push(restaurants[rand]);
        }
    }

    // Display the random list of restaurants in trending section
    for (let i = 0; i < trendingList.length; i++) {
        let trendingRestaurant = document.createElement('div');
        trendingRestaurant.classList.add('vertical-card');
        trendingRestaurant.innerHTML = `
            <div style="display: flex; flex-direction: column; flex: 4; justify-content: center;">
                <h2><b>${trendingList[i].name}</b></h2>
            </div>
            <div style="display: flex; flex-direction: column; flex: 3;">
                <h3>Rating: ${trendingList[i].rating}</h3>
                <h3>Area: ${trendingList[i].AreasMMList[0].name}</h3>
                <h3>Cuisine: ${trendingList[i].CuisinesMMList[0].style}</h3>
            </div>
        `;
        trendingRestaurant.setAttribute("id", `trending-restaurant-${i}`);
        trendingRestaurant.style.cursor = "pointer";
        trendingRestaurant.onclick = function() { displayRestaurantPopup(trendingList[i]); };
        document.getElementById("trending-container").appendChild(trendingRestaurant);
    }
}


// Div-builder for restaurant listing
function createRestaurantCardItem(restaurant) {
    // create card for restaurant
    let card = document.createElement("div");
    card.className = "horizontal-card";
    card.style.height = "120px";
    card.style.width = "80%";
    card.style.backgroundColor = "aliceblue";
    card.style.boxShadow = "0px 0px 10px #888888";
    card.style.justifyContent = "center";
    card.style.alignItems = "center";
    card.onclick = function() { displayRestaurantPopup(restaurant); };

    // add a vertical container to card
    let vertical_container = document.createElement("div");
    vertical_container.className = "vertical-container";

    // create card header
    let card_header = document.createElement("h2")
    card_header.setAttribute("id", "restaurant-name");
    card_header.className = "vertical-card";
    card_header.style.margin = "0 auto";
    card_header.style.marginLeft = "10px";
    card_header.style.padding = "10px";
    card_header.style.boxShadow = "none";
    card_header.style.backgroundColor = "aliceblue";
    card_header.innerHTML = restaurant.name;
    vertical_container.appendChild(card_header);

    // add an inner horizontal container to vertical container
    let inner_horizontal_container = document.createElement("div");
    inner_horizontal_container.setAttribute("id", "details-container");
    inner_horizontal_container.className = "horizontal-container";

    let card_bodies = [];

    // create card bodies
    let card_body_1 = document.createElement("h3")
    card_body_1.setAttribute("id", "dine-in");
    card_body_1.innerHTML = `Dine In: ${restaurant.dine_in ? "Yes" : "No"}`;
    card_bodies.push(card_body_1);

    let card_body_2 = document.createElement("h3")
    card_body_2.setAttribute("id", "take-out");
    card_body_2.innerHTML = `Take Out: ${restaurant.take_out ? "Yes" : "No"}`;
    card_bodies.push(card_body_2);

    let card_body_3 = document.createElement("h3")
    card_body_3.setAttribute("id", "rating");
    card_body_3.innerHTML = `Rating: ${restaurant.rating}`;
    card_bodies.push(card_body_3);

    // add card bodies to inner horizontal container
    for (let i = 0; i < card_bodies.length; i++) {
        card_bodies[i].style.margin = "0 auto";
        card_bodies[i].style.padding = "5px";
        inner_horizontal_container.appendChild(card_bodies[i]);
    }

    // add inner horizontal container to vertical container
    vertical_container.appendChild(inner_horizontal_container);

    // add vertical container to card
    card.appendChild(vertical_container);

    return card;
}

// Display restaurants for given cuisine
function displayRestaurantList(cuisine_id, area_id, rating) {
    let cuisine_style = '';
    let area_name = '';

    // get name of cuisine
    for (let i = 0; i < cuisines.length; i++) {
        if (cuisines[i].id === Number(cuisine_id)) {
        cuisine_style = cuisines[i].style;
        }
    }

    // get name of area
    for (let i = 0; i < areas.length; i++) {
        if (areas[i].id === Number(area_id)) {
        area_name = areas[i].name;
        }
    }

    // Add heading to restaurantsDisplayContainer
    let heading;
    if (cuisine_id !== 'all' && area_id === 'all' && rating === 'all') {
        heading = `${cuisine_style} Restaurants`;
    } else if (cuisine_id === 'all' && area_id !== 'all' && rating === 'all') {
        heading = `Restaurants in ${area_name}`;
    } else if (cuisine_id === 'all' && area_id === 'all' && rating !== 'all') {
        heading = `${rating} Star Restaurants`;
    } else if (cuisine_id !== 'all' && area_id !== 'all' && rating === 'all') {
        heading = `${cuisine_style} Restaurants in ${area_name}`;
    } else if (cuisine_id !== 'all' && area_id === 'all' && rating !== 'all') {
        heading = `${rating} Star ${cuisine_style} Restaurants`;
    } else if (cuisine_id === 'all' && area_id !== 'all' && rating !== 'all') {
        heading = `${rating} Star Restaurants in ${area_name}`;
    } else if (cuisine_id !== 'all' && area_id !== 'all' && rating !== 'all') {
        heading = `${rating} Star ${cuisine_style} Restaurants in ${area_name}`;
    }

    let headingHTML = `
        <br>
        <div class="vertical-container" style="width: 100%">
        <h2 style="margin: 0 auto; padding-top: 15px; padding-bottom: 15px"><b>${heading}</b></h2>
        <br>
        </div>
    `;
    restaurantsDisplayContainer.innerHTML = headingHTML;

    let list = [];

    // Display all restaurants for cuisine
    for (let i = 0; i < restaurants.length; i++) {
        
        // ensure cuisine matches
        if (restaurants[i].CuisinesMMList[0].id == cuisine_id || cuisine_id === 'all') {

        // check all filters
        if (area_id === 'all' && rating === 'all') {
            console.log('Displaying all ' + restaurants[i].CuisinesMMList[0].style + ' restaurants');
            list.push(createRestaurantCardItem(restaurants[i]));
        }
        
        else if (area_id !== 'all' && rating === 'all') {
            if (restaurants[i].AreasMMList[0].id == area_id) {
            console.log('Displaying restaurants in ' + area_name);
            list.push(createRestaurantCardItem(restaurants[i]));
            }
        }
        
        else if (area_id === 'all' && rating !== 'all') {
            let rating_val = restaurants[i].rating;
            if (rating_val >= Number(rating) && rating_val < Number(rating) + 1) {
            console.log('Displaying restaurants with ' + rating + ' star rating');
            list.push(createRestaurantCardItem(restaurants[i]));
            }
        }

        else if (area_id !== 'all' && rating !== 'all') {
            if (restaurants[i].AreasMMList[0].id == area_id && restaurants[i].rating >= Number(rating) && restaurants[i].rating < Number(rating) + 1) {
            console.log('Displaying restaurants in ' + area_name + ' with ' + rating + ' star rating');
            list.push(createRestaurantCardItem(restaurants[i]));
            }
        }
        }
    }

    // Append restaurants to restaurantsDisplayContainer if there are any, otherwise display message
    if (list.length > 0) {
        for (let i = 0; i < list.length; i++) {
        restaurantsDisplayContainer.appendChild(list[i]);
        }

        // Create a div and append after the list
        let div = document.createElement("div");
        div.setAttribute("id", "return-area");
        div.className = "vertical-container";
        div.style.width = "100%";
        div.style.marginTop = "20px";

        // Create a button to return to the top of the page
        let button = document.createElement("button");
        button.setAttribute("id", "return-button");
        button.setAttribute("onclick", "scrollToTop()");
        button.innerHTML = "Go Back Up";

        // Append button to div and append div to restaurantsDisplayContainer
        div.appendChild(button);
        restaurantsDisplayContainer.appendChild(div);

    } else {
        let message = `
        <br>
        <div class="vertical-container" style="width: 100%">
            <h2 style="margin: 0 auto; padding-top: 15px; padding-bottom: 15px"><b>No Restaurants Found</b></h2>
        </div>
        <br><hr>
        `;
        restaurantsDisplayContainer.innerHTML = message;
    }
}

// Populate restaurant-listing area
async function displayRestaurantData() {
    let cuisine   = document.getElementById("cuisine-selections").value;
    let area      = document.getElementById("area-selections").value;
    let rating    = document.getElementById("rating-selections").value;

    // If no filters are selected, display all cuisines to select from
    if (cuisine == "all" && area == "all" && rating == "all") {
        restaurantsDisplayContainer.innerHTML = "";

        // Check if there are any restaurants listed under each cuisine before adding to the list
        for (let each of cuisines) {
            if (each.RestaurantsMMList.length > 0) {
                let newVerticalCard = document.createElement("div");
                newVerticalCard.classList.add("vertical-card");
                newVerticalCard.setAttribute("onclick", `displayRestaurantList(${each.id}, 'all', 'all')`);
                newVerticalCard.innerHTML = `<h3 style="margin: 0 auto; padding-top: 15px; padding-bottom: 15px">${each.style}</h3>`;
                restaurantsDisplayContainer.appendChild(newVerticalCard);
            }
        }
    }

    // Display restaurants according to filters
    else {
        displayRestaurantList(cuisine, area, rating);
    }
}

// Close modal, if open, when user clicks outside of it
window.onclick = function(event) {
    let modal = document.getElementById("restaurant-modal-container");
    if (event.target == modal) {
        closeModal(modal);
    }
}