import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method Not Allowed" });

  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const client = await clientPromise;
    const db = client.db();

    // Find user by email
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ username: user.username });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
}
