// Mock data in the same shape the API will give later
const restaurants = [
  {
    id: '1',
    name: 'DIAK Kalasatama',
    address: 'Kyläsaarenkuja 2, Helsinki',
    phone: '040 123 4567',
    coordinates: [60.1873, 24.9769],
    menu: [
      {name: 'Kasviskeitto (G, L)', price: '4,20 €'},
      {name: 'Broileripasta', price: '2,95 €'},
      {name: 'Linssipata (VL)', price: null},
    ],
  },
  {
    id: '2',
    name: 'Fiilu',
    address: 'Piippukatu 11, Helsinki',
    phone: '040 765 4321',
    coordinates: [60.1942, 24.9658],
    menu: [
      {name: 'Lohikeitto', price: '3,80 €'},
      {name: 'Kasvispihvi (VL)', price: '2,95 €'},
    ],
  },
  {
    id: '3',
    name: 'Hesburger',
    address: 'Hämeentie 135, Helsinki',
    phone: '040 555 0000',
    coordinates: [60.2048, 24.9662],
    menu: [{name: 'Hampurilaisateria', price: '5,50 €'}],
  },
];

const userButton = document.querySelector('#user-button');
const userDialog = document.querySelector('#user-dialog');
const menuDialog = document.querySelector('#menu-dialog');
const restaurantList = document.querySelector('#restaurant-list');

// Fill the menu dialog with the restaurant's data and open it
const openMenuDialog = (id) => {
  const restaurant = restaurants.find((item) => item.id === id);
  if (!restaurant) {
    return;
  }

  menuDialog.querySelector('.dialog-header h2').textContent = restaurant.name;
  menuDialog.querySelector('.restaurant-info').textContent =
    `${restaurant.address} · ${restaurant.phone}`;

  const menuList = menuDialog.querySelector('#menu-list');
  menuList.innerHTML = '';
  restaurant.menu.forEach((course) => {
    const item = document.createElement('li');
    const name = document.createElement('span');
    const price = document.createElement('span');
    name.textContent = course.name;
    price.textContent = course.price || 'Ei hintaa';
    item.append(name, price);
    menuList.append(item);
  });

  menuDialog.showModal();
};

userButton.addEventListener('click', () => {
  userDialog.showModal();
});

// One listener on the list works for every card
restaurantList.addEventListener('click', (event) => {
  if (event.target.closest('.favorite-button')) {
    return;
  }
  const card = event.target.closest('.restaurant-card');
  if (card) {
    openMenuDialog(card.dataset.id);
  }
});

// Map with example markers
const map = L.map('map-container').setView([60.195, 24.97], 12);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

restaurants.forEach((restaurant) => {
  L.marker(restaurant.coordinates).addTo(map).bindPopup(restaurant.name);
});
