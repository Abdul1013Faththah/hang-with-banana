import clientPromise from "../../lib/mongodb";
import bcrypt from "bcryptjs";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end(); // Only allow POST

  const session = await getSession({ req });
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const client = await clientPromise;
    const db = client.db();
    await db.collection("users").updateOne(
      { email: session.user.email },
      { $set: { password: hashedPassword } }
    );

    res.json({ message: "Password set successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error updating password" });
  }
}
