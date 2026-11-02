import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { getClient } from "../db/connect.js";


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
