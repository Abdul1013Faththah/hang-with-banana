import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const leaderboard = await db.collection("users")
      .find({}, { projection: { name: 1, points: 1, image: 1 } })
      .sort({ points: -1 })
      .limit(10)
      .toArray();

    res.status(200).json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}