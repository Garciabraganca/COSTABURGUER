import crypto from 'crypto';

import { isStrongPassword } from './auth';

const TEMP_PASSWORD_CHARS =
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';

export function generateTempPassword(length = 12) {
  let password = '';

  while (!password || !isStrongPassword(password)) {
    const bytes = crypto.randomBytes(length);
    password = Array.from(bytes)
      .map(b => TEMP_PASSWORD_CHARS[b % TEMP_PASSWORD_CHARS.length])
      .join('');
  }

  return password;
}
