import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs"; // Use bcryptjs instead of bcrypt
import clientPromise from "../../../lib/mongodb"; // Use existing MongoDB connection

export default NextAuth({
  providers: [
    // Google OAuth authentication
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    }),

    // Email/Password authentication with MongoDB
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const client = await clientPromise;
        const db = client.db();
        const user = await db.collection("users").findOne({ email: credentials.email });

        if (!user) {
          throw new Error("User not found");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        return { email: user.email, name: user.name };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "google") {
        
        try {
          const client = await clientPromise;
          const db = client.db();
          
          const existingUser = await db.collection("users").findOne({ email: user.email });

          if (!existingUser) {
            await db.collection("users").insertOne({
              name: user.name,
              email: user.email,
              image: user.image,
              provider: "google",
              createdAt: new Date(),
            });
          }
        } catch (error) {
          console.error("Error saving Google user to DB:", error);
          return false; // Reject the sign-in if there's an error
        }
      }
      return true; // Allow sign-in
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
      }
      return session;
    },
  },
});