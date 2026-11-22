import {API_URL, state} from './variables.js';
import {fetchData} from './utils.js';

// Log in. Saves the token and the user, or throws an error
export const login = async (username, password) => {
  const options = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({username: username, password: password}),
  };
  const result = await fetchData(`${API_URL}/auth/login`, options);

  // A failed login can come back as status 200 without a token
  if (!result.token) {
    throw new Error('Login failed');
  }

  localStorage.setItem('token', result.token);
  state.user = result.data;
};

// Create a new user. Throws an error if it fails
export const register = async (username, email, password) => {
  const options = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      username: username,
      email: email,
      password: password,
    }),
  };
  await fetchData(`${API_URL}/users`, options);
};

export const logout = () => {
  localStorage.removeItem('token');
  state.user = null;
};

// On page load: if a token is saved, ask the API who the user is
export const restoreLogin = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return;
  }

  try {
    const options = {headers: {Authorization: `Bearer ${token}`}};
    state.user = await fetchData(`${API_URL}/users/token`, options);
  } catch (error) {
    // The token was not valid any more
    localStorage.removeItem('token');
  }
};
