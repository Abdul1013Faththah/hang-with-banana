import bcrypt from "bcryptjs";
import clientPromise from "../../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { username, email, password } = req.body;
    console.log('Received signup request', { username, email, password });
    const client = await clientPromise;
    const db = client.db("hang-with-banana");

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    await db.collection("users").insertOne({
      username,
      email,
      password: hashedPassword,
      image : "images/avatar.jpg",
      points :0,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error('Error during signup:', error); 
    res.status(500).json({ message: "Something went wrong" });
  }
}