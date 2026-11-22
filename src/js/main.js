import {API_URL, state} from './variables.js';
import {login, register, logout, restoreLogin, saveFavorite} from './auth.js';
import {fetchData, sortRestaurantsByDistance} from './utils.js';
import {createMap, refreshMap, showMarkers} from './map.js';
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
const nearestButton = document.querySelector('#nearest-button');
const listButton = document.querySelector('#list-button');
const mapButton = document.querySelector('#map-button');
const restaurantsSection = document.querySelector('#restaurants');
const mapSection = document.querySelector('#map');
const themeButton = document.querySelector('#theme-button');

const userDialogTitle = document.querySelector('#user-dialog-title');
const loginForm = document.querySelector('#login-form');
const loginUsername = document.querySelector('#login-username');
const loginPassword = document.querySelector('#login-password');
const loginError = document.querySelector('#login-error');
const registerForm = document.querySelector('#register-form');
const registerUsername = document.querySelector('#register-username');
const registerEmail = document.querySelector('#register-email');
const registerPassword = document.querySelector('#register-password');
const registerPassword2 = document.querySelector('#register-password2');
const registerError = document.querySelector('#register-error');
const loggedInSection = document.querySelector('#logged-in');
const loggedInText = document.querySelector('#logged-in-text');
const logoutButton = document.querySelector('#logout-button');
const showRegisterButton = document.querySelector('#show-register');
const showLoginButton = document.querySelector('#show-login');

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
  if (mode === 'daily') {
    dailyButton.classList.add('active');
    weeklyButton.classList.remove('active');
  } else {
    dailyButton.classList.remove('active');
    weeklyButton.classList.add('active');
  }
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
    renderRestaurantList(
      filtered,
      restaurantList,
      openMenuDialog,
      toggleFavorite
    );
  }
  showMarkers(filtered, openMenuDialog);
};

// Set the clicked restaurant as the favorite
const toggleFavorite = async (restaurant) => {
  if (!state.user) {
    userDialog.showModal();
    return;
  }

  // The API cannot remove a favorite, so nothing to do if it is already one
  if (state.user.favouriteRestaurant === restaurant._id) {
    return;
  }

  try {
    await saveFavorite(restaurant._id);
    applyFilters();
  } catch (error) {
    console.log('Saving favorite failed:', error);
  }
};

// Sort the restaurants by distance and highlight the nearest one
const markNearest = (latitude, longitude) => {
  const userLocation = {lat: latitude, lon: longitude};
  sortRestaurantsByDistance(state.restaurants, userLocation);
  state.nearestRestaurant = state.restaurants[0];
  applyFilters();
};

// Ask the browser for the user's location
const findNearest = () => {
  if (!navigator.geolocation) {
    alert('Selain ei tue sijaintia.');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (position) => {
      markNearest(position.coords.latitude, position.coords.longitude);
    },
    () => {
      alert('Sijaintia ei saatu. Salli sijainnin käyttö selaimessa.');
    }
  );
};

// Show either the list or the map (used on mobile)
const showView = (view) => {
  if (view === 'list') {
    restaurantsSection.classList.remove('hidden');
    mapSection.classList.add('hidden');
    listButton.classList.add('active');
    mapButton.classList.remove('active');
  } else {
    restaurantsSection.classList.add('hidden');
    mapSection.classList.remove('hidden');
    listButton.classList.remove('active');
    mapButton.classList.add('active');
    refreshMap();
  }
};

// Set the theme: true = dark, false = light. The choice is saved
const setDarkTheme = (isDark) => {
  if (isDark) {
    document.body.classList.add('dark');
    themeButton.textContent = '☀️';
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark');
    themeButton.textContent = '🌙';
    localStorage.setItem('theme', 'light');
  }
};

// Show one part of the user dialog: 'login', 'register' or 'loggedIn'
const showUserView = (view) => {
  // Hide everything first, then show the one we want
  loginForm.classList.add('hidden');
  registerForm.classList.add('hidden');
  loggedInSection.classList.add('hidden');

  if (view === 'login') {
    loginForm.classList.remove('hidden');
    userDialogTitle.textContent = 'Kirjaudu';
  }
  if (view === 'register') {
    registerForm.classList.remove('hidden');
    userDialogTitle.textContent = 'Rekisteröidy';
  }
  if (view === 'loggedIn') {
    loggedInSection.classList.remove('hidden');
    userDialogTitle.textContent = 'Käyttäjä';
  }
};

// Update the header button and the dialog to match the login state
const updateUserUI = () => {
  if (state.user) {
    userButton.textContent = state.user.username;
    loggedInText.textContent = `Kirjautunut: ${state.user.username}`;
    showUserView('loggedIn');
  } else {
    userButton.textContent = 'Kirjaudu';
    showUserView('login');
  }

  // Redraw the list so the hearts match the logged in user
  if (state.restaurants.length > 0) {
    applyFilters();
  }
};

// Check on page load if the user is still logged in
const restoreUser = async () => {
  await restoreLogin();
  updateUserUI();
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
    state.restaurants = await fetchData(`${API_URL}/restaurants`);
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

listButton.addEventListener('click', () => {
  showView('list');
});

mapButton.addEventListener('click', () => {
  showView('map');
});

showRegisterButton.addEventListener('click', () => {
  showUserView('register');
});

showLoginButton.addEventListener('click', () => {
  showUserView('login');
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginError.textContent = '';
  try {
    await login(loginUsername.value, loginPassword.value);
    loginForm.reset();
    updateUserUI();
    userDialog.close();
  } catch (error) {
    loginError.textContent =
      'Kirjautuminen epäonnistui. Tarkista käyttäjänimi ja salasana.';
  }
});

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  registerError.textContent = '';

  if (registerPassword.value !== registerPassword2.value) {
    registerError.textContent = 'Salasanat eivät täsmää.';
    return;
  }

  try {
    await register(
      registerUsername.value,
      registerEmail.value,
      registerPassword.value
    );
  } catch (error) {
    // The server can create the user and still return an error
    // (sending the activation email fails), so we continue to login
    console.log('Register returned an error:', error);
  }

  try {
    await login(registerUsername.value, registerPassword.value);
    registerForm.reset();
    updateUserUI();
    userDialog.close();
  } catch (error) {
    registerError.textContent =
      'Rekisteröinti epäonnistui. Käyttäjänimi tai sähköposti voi olla jo käytössä.';
  }
});

logoutButton.addEventListener('click', () => {
  logout();
  updateUserUI();
  userDialog.close();
});

themeButton.addEventListener('click', () => {
  const isDark = document.body.classList.contains('dark');
  setDarkTheme(!isDark);
});

cityFilter.addEventListener('change', applyFilters);
providerFilter.addEventListener('change', applyFilters);
nearestButton.addEventListener('click', findNearest);

// Load the restaurants when the page is opened
loadRestaurants();
// Check if the user is still logged in
restoreUser();
// Use the saved theme when the page loads
if (localStorage.getItem('theme') === 'dark') {
  setDarkTheme(true);
}
