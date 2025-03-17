import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method Not Allowed" });

  try {
    const { email } = req.query; // Get the email from query params
    const client = await clientPromise;
    const db = client.db();

    // Find user by email
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found", points: 0 });
    }

    res.status(200).json({ points: user.points || 0 }); // Return user points (default to 0)
  } catch (error) {
    console.error("Error fetching points:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}