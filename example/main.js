'use strict';

const API_URL = 'https://media2.edu.metropolia.fi/restaurant/api/v1';

// generic fetch function: throws an error if the response is not ok
async function fetchData(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const json = await response.json();
  return json;
}

// returns the restaurant array, or null if the request failed
async function getRestaurants() {
  try {
    const restaurants = await fetchData(`${API_URL}/restaurants`);
    console.log('Fetched restaurants:', restaurants);
    return restaurants;
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return null;
  }
}

// returns the daily menu object, or null if the request failed
async function fetchRestaurantDetails(id) {
  try {
    const details = await fetchData(`${API_URL}/restaurants/daily/${id}/fi`);
    return details;
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    return null;
  }
}

// get refs to elements
const dialog = document.querySelector('dialog');
const tableElem = document.querySelector('table');

dialog.addEventListener('click', () => {
  dialog.close();
});

dialog.addEventListener('close', () => {
  const highlightedRow = document.querySelector('.highlight');
  highlightedRow?.classList.remove('highlight');
});

async function main() {
  const restaurants = await getRestaurants();

  // show an error message if the restaurant list could not be loaded
  if (!restaurants) {
    const message = document.createElement('p');
    message.textContent =
      'Restaurants could not be loaded. Check your VPN or network connection and try again.';
    document.body.appendChild(message);
    return;
  }

  // sort the restaurants by name in ascending order
  restaurants.sort((a, b) => a.name.localeCompare(b.name));

  for (const restaurant of restaurants) {
    const tableRow = document.createElement('tr');
    const nameCell = document.createElement('td');
    const addressCell = document.createElement('td');

    nameCell.textContent = restaurant.name;
    addressCell.textContent = restaurant.address;

    tableRow.appendChild(nameCell);
    tableRow.appendChild(addressCell);
    tableElem.appendChild(tableRow);

    tableRow.addEventListener('click', async () => {
      // highlight only the clicked row
      const highlightedRow = document.querySelector('.highlight');
      highlightedRow?.classList.remove('highlight');
      tableRow.classList.add('highlight');

      dialog.innerHTML = ''; // clear previous content

      // restaurant details
      const title = document.createElement('h2');
      title.textContent = restaurant.name;

      const info = document.createElement('div');
      const infoList = [
        `Address: ${restaurant.address}`,
        `Postal Code: ${restaurant.postalCode}`,
        `City: ${restaurant.city}`,
        restaurant.phone !== '-'
          ? `Phone: ${restaurant.phone}`
          : 'Phone: Not available',
        `Company: ${restaurant.company}`,
      ];
      for (const line of infoList) {
        const lineElem = document.createElement('div');
        lineElem.textContent = line;
        info.appendChild(lineElem);
      }

      // menu placeholder, filled in after the request
      const foodlist = document.createElement('h3');
      foodlist.textContent = 'Menu:';
      const menuElem = document.createElement('div');
      menuElem.textContent = 'Loading menu...';

      // the scrolling happens inside this wrapper, not in the dialog itself
      const content = document.createElement('div');
      content.className = 'content';
      content.append(title, info, foodlist, menuElem);
      dialog.append(content);
      dialog.showModal(); // open right away so a second click is not possible

      const menu = await fetchRestaurantDetails(restaurant._id);
      menuElem.textContent = '';

      if (!menu) {
        menuElem.textContent = 'Menu could not be loaded.';
      } else if (!menu.courses?.length) {
        menuElem.textContent = 'No menu available for today.';
      } else {
        for (const course of menu.courses) {
          const courseElem = document.createElement('div');
          const diets = course.diets ? ` (${course.diets})` : '';
          courseElem.textContent = `${course.name}, ${course.price}${diets}`;
          menuElem.appendChild(courseElem);
        }
      }
    });
  }
}

main();
