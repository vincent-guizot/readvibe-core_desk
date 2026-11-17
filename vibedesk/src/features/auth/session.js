const keys = ['vibedesk_token', 'vibedesk_user'];

export function clearSession() {
  for (const storage of [localStorage, sessionStorage])
    keys.forEach((key) => storage.removeItem(key));
}

export function readSession() {
  for (const storage of [sessionStorage, localStorage]) {
    try {
      const token = storage.getItem(keys[0]);
      const user = JSON.parse(storage.getItem(keys[1]) || 'null');
      if (token && ['Admin', 'Librarian'].includes(user?.role))
        return { token, user };
    } catch {
      /* An invalid saved session requires a fresh login. */
    }
  }
  return { token: null, user: null };
}

export function saveSession(token, user, remember) {
  clearSession();
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(keys[0], token);
  storage.setItem(keys[1], JSON.stringify(user));
}
