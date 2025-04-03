import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import clientPromise from "../../../lib/mongodb"; 

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const client = await clientPromise;
        const db = client.db("hang-with-banana");
        const user = await db.collection("users").findOne({ email: credentials.email });

        if (!user) {
          throw new Error("User not found");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        return { email: user.email, username: user.username };
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
          const db = client.db("hang-with-banana");
          
          let existingUser = await db.collection("users").findOne({ email: user.email });

          if (!existingUser) {
            await db.collection("users").insertOne({
              username: user.name,
              email: user.email,
              image: user.image,
              provider: "google",
              points: 0,
              createdAt: new Date(),
            });
          }

        } catch (error) {
          console.error("Error saving Google user to DB:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.email = token.email;

      }
      return session;
    },
  },

});