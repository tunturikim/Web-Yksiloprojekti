// Fetch JSON data from a URL
export const fetchData = async (url, options) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  return await response.json();
};

// Format an API date (e.g. 2026-11-23) as "maanantai 23.11."
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const text = Number.isNaN(date.getTime())
    ? dateString
    : date.toLocaleDateString('fi-FI', {
        weekday: 'long',
        day: 'numeric',
        month: 'numeric',
      });
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Distance between two points as degrees (not kilometers)
export function distanceCalculator(lat1, lon1, lat2, lon2) {
  return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
}

// Sort restaurants so that the closest one is first
export function sortRestaurantsByDistance(restaurants, userLocation) {
  return restaurants.sort(
    (a, b) =>
      distanceCalculator(
        userLocation.lat,
        userLocation.lon,
        a.location.coordinates[1],
        a.location.coordinates[0]
      ) -
      distanceCalculator(
        userLocation.lat,
        userLocation.lon,
        b.location.coordinates[1],
        b.location.coordinates[0]
      )
  );
}
