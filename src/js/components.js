import {state} from './variables.js';

// Show a message (loading, error) inside a list
export const renderMessage = (text, listElement) => {
  listElement.innerHTML = '';
  const item = document.createElement('li');
  item.className = 'message';
  item.textContent = text;
  listElement.append(item);
};

// Is this restaurant the favorite of the logged in user?
const isFavorite = (restaurant) => {
  if (!state.user) {
    return false;
  }
  return state.user.favouriteRestaurant === restaurant._id;
};

// Create one restaurant card
// onCardClick is called with the restaurant when the card is clicked
const createRestaurantCard = (restaurant, onCardClick, onFavoriteClick) => {
  const card = document.createElement('li');
  card.className = 'restaurant-card';

  const header = document.createElement('div');
  header.className = 'card-header';

  const name = document.createElement('h2');
  name.textContent = restaurant.name;

  const favoriteButton = document.createElement('button');
  favoriteButton.type = 'button';
  favoriteButton.className = 'favorite-button';
  if (isFavorite(restaurant)) {
    favoriteButton.textContent = '♥';
    favoriteButton.setAttribute('aria-label', `Suosikki: ${restaurant.name}`);
  } else {
    favoriteButton.textContent = '♡';
    favoriteButton.setAttribute(
      'aria-label',
      `Lisää suosikiksi: ${restaurant.name}`
    );
  }
  // The heart click must not open the menu
  favoriteButton.addEventListener('click', (event) => {
    event.stopPropagation();
    onFavoriteClick(restaurant);
  });

  const address = document.createElement('p');
  address.className = 'card-address';
  address.textContent = `${restaurant.address}, ${restaurant.city}`;

  header.append(name, favoriteButton);
  card.append(header, address);

  // Highlight the nearest restaurant
  if (restaurant === state.nearestRestaurant) {
    card.classList.add('nearest');
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = 'Lähin';
    card.append(badge);
  }

  // Highlight the favorite restaurant
  if (isFavorite(restaurant)) {
    const favoriteBadge = document.createElement('span');
    favoriteBadge.className = 'badge';
    favoriteBadge.textContent = 'Suosikki';
    card.append(favoriteBadge);
  }

  card.addEventListener('click', () => {
    onCardClick(restaurant);
  });

  return card;
};

// Clear the list and fill it with a card for each restaurant
export const renderRestaurantList = (
  restaurants,
  listElement,
  onCardClick,
  onFavoriteClick
) => {
  listElement.innerHTML = '';
  restaurants.forEach((restaurant) => {
    listElement.append(
      createRestaurantCard(restaurant, onCardClick, onFavoriteClick)
    );
  });
};

// Build one menu row: course name (with diets if any) and price
const createCourseRow = (course) => {
  const row = document.createElement('li');
  const name = document.createElement('span');
  const price = document.createElement('span');

  name.textContent = course.name;
  if (course.diets) {
    name.textContent = `${course.name} (${course.diets})`;
  }

  if (course.price) {
    price.textContent = course.price;
  } else {
    price.textContent = 'Ei hintaa';
  }

  row.append(name, price);
  return row;
};

// Add a row for each course, or a "no menu" message if there are none
const appendCourses = (courses, listElement) => {
  if (courses.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'message';
    empty.textContent = 'Ei ruokalistaa.';
    listElement.append(empty);
  }
  courses.forEach((course) => {
    listElement.append(createCourseRow(course));
  });
};

// Show today's menu (menu.courses)
export const renderDayMenu = (menu, listElement) => {
  listElement.innerHTML = '';
  appendCourses(menu.courses, listElement);
};

// Show the week's menu: a date row followed by that day's courses
export const renderWeekMenu = (menu, listElement) => {
  listElement.innerHTML = '';
  if (menu.days.length === 0) {
    renderMessage('Ei ruokalistaa.', listElement);
    return;
  }
  menu.days.forEach((day) => {
    const dayRow = document.createElement('li');
    dayRow.className = 'menu-day';
    dayRow.textContent = day.date;
    listElement.append(dayRow);
    appendCourses(day.courses, listElement);
  });
};

// Add options to a select element
export const fillSelect = (select, values) => {
  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
};
