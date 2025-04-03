import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

  try {
    const { email, points } = req.body;
    const client = await clientPromise;
    const db = client.db("hang-with-banana");

    await db.collection("users").updateOne(
      { email },
      { $inc: { points: points } },
      { upsert: true }
    );

    res.status(200).json({ message: "Points updated successfully" });
  } catch (error) {
    console.error("Error updating points:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}