// ==================== User Authentication System ====================

// User Database (stored in localStorage)
const getUsersDB = () => {
  try {
    const users = localStorage.getItem('gazu_users_db');
    return users ? JSON.parse(users) : {};
  } catch (error) {
    return {};
  }
};

const saveUsersDB = (usersDB) => {
  localStorage.setItem('gazu_users_db', JSON.stringify(usersDB));
};

// Get current logged-in user
const getCurrentUser = () => {
  const user = localStorage.getItem('gazu_current_user');
  return user ? JSON.parse(user) : null;
};

const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem('gazu_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('gazu_current_user');
  }
};

// ----- Session-aware storage helpers -----
const cartKey = (isPersistent) => isPersistent ? 'gazu_cart' : 'gazu_cart_session';
const wishlistKey = (isPersistent) => isPersistent ? 'gazu_wishlist' : 'gazu_wishlist_session';

const isUserLoggedIn = () => !!getCurrentUser();

const readCart = () => {
  const persistent = isUserLoggedIn();
  try {
    const raw = persistent ? localStorage.getItem(cartKey(true)) : sessionStorage.getItem(cartKey(false));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      if (persistent) localStorage.removeItem(cartKey(true)); else sessionStorage.removeItem(cartKey(false));
      return [];
    }
    return parsed.filter(item => item && item.id && Number(item.quantity) > 0);
  } catch (e) {
    if (persistent) localStorage.removeItem(cartKey(true)); else sessionStorage.removeItem(cartKey(false));
    return [];
  }
};

const writeCart = (cart) => {
  const persistent = isUserLoggedIn();
  const key = cartKey(persistent);
  const payload = JSON.stringify(cart || []);
  if (persistent) localStorage.setItem(key, payload); else sessionStorage.setItem(key, payload);
};

const readWishlist = () => {
  const persistent = isUserLoggedIn();
  try {
    const raw = persistent ? localStorage.getItem(wishlistKey(true)) : sessionStorage.getItem(wishlistKey(false));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      if (persistent) localStorage.removeItem(wishlistKey(true)); else sessionStorage.removeItem(wishlistKey(false));
      return [];
    }
    return parsed.filter(id => id);
  } catch (e) {
    if (persistent) localStorage.removeItem(wishlistKey(true)); else sessionStorage.removeItem(wishlistKey(false));
    return [];
  }
};

const writeWishlist = (wishlist) => {
  const persistent = isUserLoggedIn();
  const key = wishlistKey(persistent);
  const payload = JSON.stringify(wishlist || []);
  if (persistent) localStorage.setItem(key, payload); else sessionStorage.setItem(key, payload);
};

// When a user logs in, migrate any session cart/wishlist into persistent storage
const migrateSessionDataToPersistent = () => {
  const user = getCurrentUser();
  if (!user) return;
  // migrate cart
  const sessionCartRaw = sessionStorage.getItem(cartKey(false));
  if (sessionCartRaw) {
    try {
      const sessionCart = JSON.parse(sessionCartRaw);
      const persistentCart = JSON.parse(localStorage.getItem(cartKey(true)) || '[]');
      // merge by id
      const map = {};
      (persistentCart.concat(sessionCart)).forEach(item => {
        if (!item || !item.id) return;
        if (!map[item.id]) map[item.id] = { ...item };
        else map[item.id].quantity = Number(map[item.id].quantity || 0) + Number(item.quantity || 0);
      });
      const merged = Object.values(map);
      localStorage.setItem(cartKey(true), JSON.stringify(merged));
    } catch (e) { /* ignore */ }
    sessionStorage.removeItem(cartKey(false));
  }
  // migrate wishlist
  const sessionWishlistRaw = sessionStorage.getItem(wishlistKey(false));
  if (sessionWishlistRaw) {
    try {
      const sessionWishlist = JSON.parse(sessionWishlistRaw);
      const persistentWishlist = JSON.parse(localStorage.getItem(wishlistKey(true)) || '[]');
      const merged = Array.from(new Set(persistentWishlist.concat(sessionWishlist || [])));
      localStorage.setItem(wishlistKey(true), JSON.stringify(merged));
    } catch (e) { /* ignore */ }
    sessionStorage.removeItem(wishlistKey(false));
  }
};

// Login function
const loginUser = (email, password) => {
  const usersDB = getUsersDB();
  const user = usersDB[email.toLowerCase()];

  if (!user || user.password !== password) {
    return { success: false, message: 'Invalid email or password' };
  }

  setCurrentUser({ email: email.toLowerCase(), name: user.name });
  // migrate any session data (cart/wishlist) into persistent storage for this user
  migrateSessionDataToPersistent();
  return { success: true, message: 'Logged in successfully' };
};

// Sign up function
const signupUser = (name, email, password, confirmPassword) => {
  if (password !== confirmPassword) {
    return { success: false, message: 'Passwords do not match' };
  }

  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters' };
  }

  if (!name || name.trim().length === 0) {
    return { success: false, message: 'Please enter your name' };
  }

  const usersDB = getUsersDB();
  const emailLower = email.toLowerCase();

  if (usersDB[emailLower]) {
    return { success: false, message: 'Email already registered' };
  }

  usersDB[emailLower] = { email: emailLower, password, name: name.trim() };
  saveUsersDB(usersDB);
  setCurrentUser({ email: emailLower, name: name.trim() });
  migrateSessionDataToPersistent();

  return { success: true, message: 'Account created successfully' };
};

// Logout function
const logoutUser = () => {
  setCurrentUser(null);
};

// ==================== Login Page Logic ====================

if (document.getElementById('login-form')) {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const switchToSignup = document.getElementById('switch-to-signup');
  const switchToSignin = document.getElementById('switch-to-signin');

  // Switch to Sign Up form
  switchToSignup.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
  });

  // Switch to Sign In form
  switchToSignin.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
  });

  // Handle Sign In
  document.getElementById('signin-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');

    const result = loginUser(email, password);

    if (result.success) {
      // Redirect to home
      window.location.href = 'index.html';
    } else {
      errorDiv.textContent = result.message;
      errorDiv.classList.remove('hidden');
      setTimeout(() => errorDiv.classList.add('hidden'), 3000);
    }
  });

  // Handle Sign Up
  document.getElementById('signup-form-element').addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const errorDiv = document.getElementById('signup-error');

    const result = signupUser(name, email, password, confirmPassword);

    if (result.success) {
      // Redirect to home
      window.location.href = 'index.html';
    } else {
      errorDiv.textContent = result.message;
      errorDiv.classList.remove('hidden');
      setTimeout(() => errorDiv.classList.add('hidden'), 3000);
    }
  });
}

// ==================== Data Persistence Logic ====================

// Data persistence: sessionStorage is used for anonymous users so no special unload handling is required
const setupDataPersistence = () => {
  // no-op: sessionStorage clears automatically when the tab/window is closed
};

setupDataPersistence();

// Check if user is logged in on page load
const initializeUserSession = () => {
  const currentUser = getCurrentUser();

  // Prefer explicit id if present, fallback to link selectors
  const loginLink = document.getElementById('login-link') || document.querySelector('a[href="login.html"]') || document.querySelector('a[href="#"]');
  if (!loginLink) return;

  if (currentUser) {
    // Show: hi, <Name> — keep user's original casing, make 'hi,' lowercase
    loginLink.href = 'profile.html';
    loginLink.innerHTML = `<span>Hi,</span> <span class="font-medium text-black text-[16px] tracking-wide">${currentUser.name}</span>`;
    loginLink.classList.remove('uppercase');
    loginLink.classList.add('normal-case');
    loginLink.style.cursor = 'pointer';
    loginLink.style.userSelect = 'none';
  } else {
    // Show 'LOGIN' in uppercase when logged out
    loginLink.href = 'login.html';
    loginLink.textContent = 'LOGIN';
    loginLink.classList.remove('normal-case');
    loginLink.classList.add('uppercase');
    loginLink.style.cursor = '';
    loginLink.style.userSelect = '';
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeUserSession);
} else {
  initializeUserSession();
}
