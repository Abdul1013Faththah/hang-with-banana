import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

  try {
    const { email, points } = req.body;
    const client = await clientPromise;
    const db = client.db();

    // Increment user's points instead of overwriting them
    await db.collection("users").updateOne(
      { email },
      { $inc: { points: points } }, // This ensures points are accumulated
      { upsert: true } // If user doesn't exist, create them
    );

    res.status(200).json({ message: "Points updated successfully" });
  } catch (error) {
    console.error("Error updating points:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}