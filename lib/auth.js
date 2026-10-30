import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { getClient } from "../db/connect.js";

/**
 * BookNook backend auth — Backend v2 (PATCHED version of your lib/auth.js).
 * Changes from your old file, and why:
 *  1. Added jwt() plugin — without it, no JWT is issued for the backend
 *     API to verify, and the spec's JWT requirement is unmet.
 *  2. Removed github provider — spec says Google ONLY for social login.
 *     Keeping github means an extra OAuth app to configure and an extra
 *     provider the examiner did not ask for. If you want github later,
 *     add the block back after the assignment result.
 *  3. Added autoSignIn: false — so backend sign-up (if ever used) does
 *     not auto-login, matching the frontend Register → Login flow.
 *
 * IMPORTANT — two auth systems warning:
 * The spec says authentication lives in NEXT.JS (frontend, Section 2 pack).
 * This backend auth file is NOT the frontend login path — frontend login
 * uses the frontend's BetterAuth. Do not mount this backend auth as the
 * login for the frontend, or you will have two competing auth systems
 * sharing one database. Keep this file patched (for completeness), but
 * the BookNook frontend logs in through the frontend only.
 *
 * ORDER BUG in the old file (kept in mind, not changed here):
 * createAuth() calls getClient().db(...) — getClient() is undefined until
 * connectToMongoDB() has finished. So index.js MUST await
 * connectToMongoDB() FIRST, and only then call createAuth().
 */
export function createAuth() {
  return betterAuth({
    database: mongodbAdapter(getClient().db("booknook")),
    emailAndPassword: {
      enabled: true,
      autoSignIn: false,
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
    },
    plugins: [jwt()],
  });
}
