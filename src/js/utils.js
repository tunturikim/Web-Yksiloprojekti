// Fetch JSON data from a URL
export const fetchData = async (url) => {
  const response = await fetch(url);
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
