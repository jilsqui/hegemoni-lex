import crypto from 'crypto';

type ResetPayload = {
  email: string;
  exp: number;
};

function getSecret() {
  return process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'hegemoni-lex-reset-secret';
}

export function createPasswordResetToken(email: string, expiresInMinutes = 30) {
  const payload: ResetPayload = {
    email,
    exp: Date.now() + expiresInMinutes * 60 * 1000,
  };

  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = crypto.createHmac('sha256', getSecret()).update(encoded).digest('base64url');

  return `${encoded}.${signature}`;
}

export function verifyPasswordResetToken(token: string): { valid: boolean; email?: string; reason?: string } {
  try {
    const [encoded, signature] = token.split('.');
    if (!encoded || !signature) {
      return { valid: false, reason: 'Token tidak valid.' };
    }

    const expected = crypto.createHmac('sha256', getSecret()).update(encoded).digest('base64url');
    if (signature !== expected) {
      return { valid: false, reason: 'Token tidak valid.' };
    }

    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as ResetPayload;
    if (!payload.email || !payload.exp) {
      return { valid: false, reason: 'Token tidak valid.' };
    }

    if (Date.now() > payload.exp) {
      return { valid: false, reason: 'Token sudah kedaluwarsa.' };
    }

    return { valid: true, email: payload.email };
  } catch {
    return { valid: false, reason: 'Token tidak valid.' };
  }
}
