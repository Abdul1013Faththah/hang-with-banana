import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("hang-with-banana"); // Replace with your database name

    // Generate a random guest ID
    const guestId = `guest_${Date.now()}`;

    // Insert guest user into the database
    const result = await db.collection("users").insertOne({
      guestId: guestId,
      createdAt: new Date(),
    });

    res.status(201).json({ success: true, guestId });
  } catch (error) {
    console.error("Error creating guest user:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}
