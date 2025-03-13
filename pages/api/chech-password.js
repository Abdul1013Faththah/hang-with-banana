import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const client = await clientPromise;
    const db = client.db();
    const { email } = req.body;

    const user = await db.collection("users").findOne({ email });

    if (user && user.password) {
      return res.json({ requiresPassword: false });
    } else {
      return res.json({ requiresPassword: true });
    }
  } catch (error) {
    console.error("Error checking password:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
