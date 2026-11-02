import { jwtVerify, createRemoteJWKSet } from "jose";


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
