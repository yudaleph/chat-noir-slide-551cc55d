export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCookie(name: string, value: string, maxAgeSeconds: number = 60 * 60 * 24 * 365) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}`;
}

const CONVERSATIONS_COOKIE_NAME = 'conversation_ids';

export function getConversationIds(): string[] {
  const val = getCookie(CONVERSATIONS_COOKIE_NAME);
  if (!val) return [];
  try {
    return JSON.parse(val);
  } catch {
    return [];
  }
}

export function setConversationIds(ids: string[]) {
  setCookie(CONVERSATIONS_COOKIE_NAME, JSON.stringify(ids));
}

export function addConversationId(id: string) {
  const ids = getConversationIds();
  if (!ids.includes(id)) {
    ids.unshift(id); // Ajouter au début
    setConversationIds(ids);
  }
}

export function removeConversationId(id: string) {
  const ids = getConversationIds();
  setConversationIds(ids.filter(convId => convId !== id));
}
