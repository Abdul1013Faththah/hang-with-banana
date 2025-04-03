import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { email } = req.query;

    const client = await clientPromise;
    const db = client.db("hang-with-banana");
    const result = await db.collection("users").deleteOne({ email });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
