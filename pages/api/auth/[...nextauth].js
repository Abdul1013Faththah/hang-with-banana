import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "../../../lib/mongodb";
import bcrypt from "bcryptjs";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const client = await clientPromise;
        const db = client.db();
        const user = await db.collection("users").findOne({ email: credentials.email });

        if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
          throw new Error("Invalid credentials");
        }
        return user;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      const client = await clientPromise;
      const db = client.db();

      const existingUser = await db.collection("users").findOne({ email: user.email });

      if (!existingUser) {
        // Create new user with empty password
        await db.collection("users").insertOne({
          email: user.email,
          name: user.name,
          password: null, // No password initially
        });
      }

      return true;
    },

    async session({ session }) {
      const client = await clientPromise;
      const db = client.db();
      const dbUser = await db.collection("users").findOne({ email: session.user.email });

      session.user.needsPassword = !dbUser?.password; // Set flag if password is missing

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
});
