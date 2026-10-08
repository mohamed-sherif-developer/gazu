// Profile Page Logic

const initializeProfile = () => {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    document.getElementById('profile-content').classList.add('hidden');
    document.getElementById('not-logged-in').classList.remove('hidden');
    return;
  }

  // Display current user email
  document.getElementById('user-email').textContent = currentUser.email;

  // Display current name
  document.getElementById('profile-name').value = currentUser.name;

  // Handle profile information update
  document.getElementById('update-information-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const newName = document.getElementById('profile-name').value.trim();
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;
    const errorDiv = document.getElementById('profile-error');
    const successDiv = document.getElementById('profile-success');

    const usersDB = getUsersDB();
    const emailLower = currentUser.email.toLowerCase();
    const user = usersDB[emailLower];

    if (!user) {
      errorDiv.textContent = 'User not found';
      errorDiv.classList.remove('hidden');
      setTimeout(() => errorDiv.classList.add('hidden'), 3000);
      return;
    }

    if (!newName) {
      errorDiv.textContent = 'Please enter your name';
      errorDiv.classList.remove('hidden');
      setTimeout(() => errorDiv.classList.add('hidden'), 3000);
      return;
    }

    const shouldUpdatePassword = currentPassword || newPassword || confirmNewPassword;

    if (shouldUpdatePassword) {
      if (user.password !== currentPassword) {
        errorDiv.textContent = 'Current password is incorrect';
        errorDiv.classList.remove('hidden');
        setTimeout(() => errorDiv.classList.add('hidden'), 3000);
        return;
      }

      if (!newPassword || newPassword.length < 6) {
        errorDiv.textContent = 'Password must be at least 6 characters';
        errorDiv.classList.remove('hidden');
        setTimeout(() => errorDiv.classList.add('hidden'), 3000);
        return;
      }

      if (newPassword !== confirmNewPassword) {
        errorDiv.textContent = 'New passwords do not match';
        errorDiv.classList.remove('hidden');
        setTimeout(() => errorDiv.classList.add('hidden'), 3000);
        return;
      }

      user.password = newPassword;
    }

    user.name = newName;
    saveUsersDB(usersDB);
    setCurrentUser({ email: currentUser.email, name: newName });

    successDiv.textContent = shouldUpdatePassword
      ? 'Information updated successfully!'
      : 'Name updated successfully!';
    successDiv.classList.remove('hidden');

    document.getElementById('update-information-form').reset();
    document.getElementById('profile-name').value = newName;

    setTimeout(() => {
      successDiv.classList.add('hidden');
      window.location.href = 'profile.html';
    }, 2000);
  });

  // Handle logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    logoutUser();
    window.location.href = 'index.html';
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeProfile);
} else {
  initializeProfile();
}
