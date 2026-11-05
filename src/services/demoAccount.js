// Adaptador local de demostración. Sustituir por un servicio de backend para uso real.
const ACCOUNT = 'audicaz-demo-account-v1';
const SESSION = 'audicaz-demo-session-v1';
export function readJSON(key, fallback, storage) {
  try { return JSON.parse((storage ?? localStorage).getItem(key)) ?? fallback; } catch { return fallback; }
}
function write(key, value, storage = localStorage) {
  try { storage.setItem(key, JSON.stringify(value)); }
  catch { throw new Error('No se pudo guardar. Permite el almacenamiento del navegador e inténtalo de nuevo.'); }
}
function account() { return readJSON(ACCOUNT, null); }
async function fingerprint(password, salt) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + password));
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
}
export const demoAccount = {
  current() {
    const saved = account();
    const session = readJSON(SESSION, null) || readJSON(SESSION, null, sessionStorage);
    return saved && saved.id === session?.id ? saved : null;
  },
  async register({ name, email, group, password }) {
    if (account()) throw new Error('Este navegador ya tiene una cuenta de prueba. Inicia sesión con ella.');
    const salt = crypto.randomUUID();
    const user = { id: crypto.randomUUID(), name: name.trim(), email: email.trim().toLowerCase(), group: group.trim(), salt, passwordHash: await fingerprint(password, salt), setupDone: false, setup: {} };
    write(ACCOUNT, user);
    write(SESSION, { id: user.id }, sessionStorage);
    return user;
  },
  async login(email, password, remember) {
    const user = account();
    if (!user || user.email !== email.trim().toLowerCase() || user.passwordHash !== await fingerprint(password, user.salt)) throw new Error('El correo o la contraseña no coinciden. Usa la cuenta de prueba creada en este navegador.');
    const target = remember ? localStorage : sessionStorage;
    write(SESSION, { id: user.id }, target);
    (remember ? sessionStorage : localStorage).removeItem(SESSION);
    return user;
  },
  update(fields) {
    const user = this.current();
    if (!user) throw new Error('Inicia sesión para guardar los cambios.');
    const next = { ...user, ...fields, id: user.id };
    write(ACCOUNT, next);
    return next;
  },
  async changePassword(currentPassword, password) {
    const user = this.current();
    if (!user || user.passwordHash !== await fingerprint(currentPassword, user.salt)) throw new Error('La contraseña actual no coincide.');
    const salt = crypto.randomUUID();
    return this.update({ salt, passwordHash: await fingerprint(password, salt) });
  },
  logout() { localStorage.removeItem(SESSION); sessionStorage.removeItem(SESSION); },
};
