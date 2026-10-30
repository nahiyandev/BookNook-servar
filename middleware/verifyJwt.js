import { jwtVerify, createRemoteJWKSet } from "jose";

/**
 * BookNook JWT verification — Backend v2 (NEW file, ESM).
 * Your backend is ESM (import/export), so this file imports jose directly
 * — no dynamic import trick is needed (that was only for CommonJS).
 *
 * The frontend (Next.js BetterAuth + JWT plugin) issues the token and
 * serves its public keys at AUTH_BASE_URL + "/api/auth/jwks".
 * issuer/audience = AUTH_BASE_URL (BetterAuth uses BASE_URL for both).
 * AUTH_BASE_URL = frontend URL (same value as CLIENT_URL in your .env):
 * locally http://localhost:3000, live https://booknook-lovat.vercel.app.
 *
 * On success: req.user = { id, email, name } from the token payload.
 * The backend trusts the TOKEN's email, never a body email.
 * On failure: 401, no bypass.
 */
let cachedJwks = null;

function getJwks() {
  if (cachedJwks) return cachedJwks;
  const authBase = process.env.AUTH_BASE_URL;
  if (!authBase) {
    throw new Error("AUTH_BASE_URL is not set. See README.");
  }
  cachedJwks = createRemoteJWKSet(
    new URL(`${authBase.replace(/\/$/, "")}/api/auth/jwks`)
  );
  return cachedJwks;
}

export default async function verifyJwt(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: no token provided" });
    }
    const authBase = process.env.AUTH_BASE_URL;
    const { payload } = await jwtVerify(token, getJwks(), {
      issuer: authBase,
      audience: authBase,
    });
    req.user = {
      id: payload.id || payload.sub,
      email: payload.email,
      name: payload.name,
    };
    if (!req.user.email) {
      return res.status(401).json({ error: "Unauthorized: token has no email" });
    }
    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return res.status(401).json({ error: "Unauthorized: invalid or expired token" });
  }
}
