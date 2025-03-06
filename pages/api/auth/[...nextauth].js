import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

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

      // If user does not exist in DB, insert them
      if (!user) {
        const newUser = {
          username: session.user.name,
          email: session.user.email,
          createdAt: new Date(),
        };

        const result = await db.collection("users").insertOne(newUser);
        user = { ...newUser, _id: result.insertedId };
      }

      session.user.id = user._id.toString();
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});