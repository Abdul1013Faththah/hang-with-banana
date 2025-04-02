import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { email, username, image } = req.body; // Get data from request

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const client = await clientPromise;
    const db = client.db();

    // Update user details
    const result = await db.collection("users").updateOne(
      { email },
      { $set: { username, image } }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: "No changes detected" });
    }

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}