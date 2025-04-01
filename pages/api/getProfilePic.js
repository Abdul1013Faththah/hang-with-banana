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
      return res.status(404).json({ message: "User not found", profilePic: "/default-profile.png" });
    }

    res.status(200).json({ profilePic: user.image || "/default-profile.png" }); // Return profile pic (default if not found)
  } catch (error) {
    console.error("Error fetching profile picture:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
