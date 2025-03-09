import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import clientPromise from "../../../lib/mongodb";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const client = await clientPromise;
        const db = client.db();
        const user = await db.collection("users").findOne({ email: credentials.email });

        if (!user) throw new Error("User not found");

        if (!user.password) {
          throw new Error("Please set a password first via Google login.");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) throw new Error("Invalid credentials");

        return { id: user._id.toString(), name: user.username, email: user.email };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    useSecureCookies: false, // Ensures cookies work on localhost
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      const client = await clientPromise;
      const db = client.db();
      let user = await db.collection("users").findOne({ email: session.user.email });

      if (!user) {
        const newUser = {
          username: session.user.name,
          email: session.user.email,
          password: null, // User must set password manually
          provider: "google",
          createdAt: new Date(),
        };

        const result = await db.collection("users").insertOne(newUser);
        user = { ...newUser, _id: result.insertedId };
      }

      session.user.id = user._id.toString();
      session.needsPassword = !user.password;

      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});
