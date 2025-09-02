export const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('jwt') : null);
export const saveToken = (t) => { if (typeof window !== 'undefined') localStorage.setItem('jwt', t); };
export const clearToken = () => { if (typeof window !== 'undefined') localStorage.removeItem('jwt'); };

export const getUser = () => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
};
export const saveUser = (u) => { if (typeof window !== 'undefined') localStorage.setItem('user', JSON.stringify(u || null)); };
export const clearUser = () => { if (typeof window !== 'undefined') localStorage.removeItem('user'); };
