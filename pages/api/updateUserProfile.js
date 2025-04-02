import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { username, profilePic } = req.body;
    const { email } = req.query;

    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection("users").updateOne(
      { email },
      {
        $set: {
          username,
          profilePic,
        },
      }
    );

    if (user.modifiedCount === 0) {
      return res.status(404).json({ message: "User not found or no changes made" });
    }

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
