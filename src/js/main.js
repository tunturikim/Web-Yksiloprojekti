import {API_URL, state} from './variables.js';
import {fetchData} from './utils.js';
import {
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
    renderRestaurantList(state.restaurants, restaurantList, openMenuDialog);
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

// Map (markers are added in the next step)
const map = L.map('map-container').setView([60.195, 24.97], 11);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

loadRestaurants();
