import {API_URL, state} from './variables.js';
import {fetchData} from './utils.js';
import {createMap, showMarkers} from './map.js';
import {
  fillSelect,
  renderDayMenu,
  renderMessage,
  renderRestaurantList,
  renderWeekMenu,
} from './components.js';

const userButton = document.querySelector('#user-button');
const userDialog = document.querySelector('#user-dialog');
const menuDialog = document.querySelector('#menu-dialog');
const menuList = document.querySelector('#menu-list');
const dailyButton = document.querySelector('#daily-button');
const weeklyButton = document.querySelector('#weekly-button');
const restaurantList = document.querySelector('#restaurant-list');
const cityFilter = document.querySelector('#city-filter');
const providerFilter = document.querySelector('#provider-filter');

// Load the selected restaurant's menu ('daily' or 'weekly')
const loadMenu = async (mode) => {
  renderMessage('Ladataan ruokalistaa...', menuList);
  try {
    const url = `${API_URL}/restaurants/${mode}/${state.selectedRestaurant._id}/fi`;
    const menu = await fetchData(url);
    if (mode === 'daily') {
      renderDayMenu(menu, menuList);
    } else {
      renderWeekMenu(menu, menuList);
    }
  } catch (error) {
    console.error(error);
    renderMessage(
      'Ruokalistaa ei ole saatavilla tälle ravintolalle.',
      menuList
    );
  }
};

// Highlight the active day/week button
const setActiveMode = (mode) => {
  dailyButton.classList.toggle('active', mode === 'daily');
  weeklyButton.classList.toggle('active', mode === 'weekly');
};

// Fill the dialog with the restaurant's info and open it with the daily menu
// Called from a card click (see renderRestaurantList)
const openMenuDialog = (restaurant) => {
  state.selectedRestaurant = restaurant;

  let info = `${restaurant.address}, ${restaurant.city}`;
  if (restaurant.phone) {
    info += ` · ${restaurant.phone}`;
  }
  menuDialog.querySelector('.dialog-header h2').textContent = restaurant.name;
  menuDialog.querySelector('.restaurant-info').textContent = info;

  setActiveMode('daily');
  menuDialog.showModal();
  loadMenu('daily');
};

// Show the restaurants that match the selected filters
const applyFilters = () => {
  const city = cityFilter.value;
  const company = providerFilter.value;

  const filtered = state.restaurants.filter((restaurant) => {
    if (city !== '' && restaurant.city !== city) {
      return false;
    }
    if (company !== '' && restaurant.company !== company) {
      return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    renderMessage('Ei ravintoloita valituilla suodattimilla.', restaurantList);
  } else {
    renderRestaurantList(filtered, restaurantList, openMenuDialog);
  }
  showMarkers(filtered, openMenuDialog);
};

// Collect each city and company once and add them to the selects
const createFilterOptions = () => {
  const cities = [];
  const companies = [];

  state.restaurants.forEach((restaurant) => {
    if (!cities.includes(restaurant.city)) {
      cities.push(restaurant.city);
    }
    if (!companies.includes(restaurant.company)) {
      companies.push(restaurant.company);
    }
  });

  cities.sort((a, b) => a.localeCompare(b, 'fi'));
  companies.sort((a, b) => a.localeCompare(b, 'fi'));
  fillSelect(cityFilter, cities);
  fillSelect(providerFilter, companies);
};

// Create the map and show the restaurants as markers
createMap();

// Fetch all restaurants, save them to state and show them as cards
const loadRestaurants = async () => {
  renderMessage('Ladataan ravintoloita...', restaurantList);
  try {
    const data = await fetchData(`${API_URL}/restaurants`);
    // Check in the console which one is true and delete the other branch
    if (Array.isArray(data)) {
      state.restaurants = data;
    } else {
      state.restaurants = data.restaurants;
    }
    state.restaurants.sort((a, b) => a.name.localeCompare(b.name, 'fi'));
    createFilterOptions();
    applyFilters();
  } catch (error) {
    console.error(error);
    renderMessage(
      'Ravintoloiden lataus epäonnistui. Tarkista verkkoyhteys ja VPN.',
      restaurantList
    );
  }
};

// Event listeners
userButton.addEventListener('click', () => {
  userDialog.showModal();
});

dailyButton.addEventListener('click', () => {
  setActiveMode('daily');
  loadMenu('daily');
});

weeklyButton.addEventListener('click', () => {
  setActiveMode('weekly');
  loadMenu('weekly');
});

cityFilter.addEventListener('change', applyFilters);
providerFilter.addEventListener('change', applyFilters);

// Load the restaurants when the page is opened
loadRestaurants();
