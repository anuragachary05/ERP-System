export const getCurrentUser = () => {
  const token = localStorage.getItem('erp_token');
  const user = localStorage.getItem('erp_user');
  if (!token || !user) return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};

export const setCurrentUser = (user, token) => {
  localStorage.setItem('erp_user', JSON.stringify(user));
  localStorage.setItem('erp_token', token);
};

export const logout = () => {
  localStorage.removeItem('erp_user');
  localStorage.removeItem('erp_token');
};
