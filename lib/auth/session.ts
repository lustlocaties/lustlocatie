import { SignJWT, jwtVerify } from 'jose';

export const AUTH_COOKIE_NAME = 'auth_token';
const TOKEN_EXPIRATION = '7d';

type AuthTokenPayload = {
  sub: string;
  email: string;
  role: 'user' | 'admin';
};

function getAuthSecret() {
  const authSecret = process.env.AUTH_SECRET;

  if (!authSecret) {
    throw new Error('Missing AUTH_SECRET environment variable.');
  }

  return authSecret;
}

function getSecretKey() {
  return new TextEncoder().encode(getAuthSecret());
}

export async function signAuthToken(payload: AuthTokenPayload) {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRATION)
    .sign(getSecretKey());
}

export async function verifyAuthToken(token: string) {
  const { payload } = await jwtVerify(token, getSecretKey());

  return {
    sub: payload.sub,
    email: payload.email,
    role: payload.role,
  };
}
