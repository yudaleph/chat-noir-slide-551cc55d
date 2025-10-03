export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCookie(name: string, value: string, maxAgeSeconds: number = 60 * 60 * 24 * 365) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}`;
}

const CONVERSATION_COOKIE_NAME = 'conversation';

export function ensureConversationCookie(): string {
  let val = getCookie(CONVERSATION_COOKIE_NAME);
  if (!val) {
    val = crypto.randomUUID();
    setCookie(CONVERSATION_COOKIE_NAME, val);
  }
  return val;
}
