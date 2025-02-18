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
      clientSecret: process.env.GOOGLE_SECRET,
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

        // Find user by email
        const user = await db.collection("users").findOne({ email: credentials.email });

        if (!user) {
          throw new Error("User not found");
        }

        // Compare hashed password
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        // Return user details for the session
        return { email: user.email, name: user.name };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
});
