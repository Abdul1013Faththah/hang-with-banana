import bcrypt from "bcryptjs";
import clientPromise from "../../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { name, email, password } = req.body;
    console.log('Received signup request', { name, email, password });
    const client = await clientPromise;
    const db = client.db();

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // Insert new user
    await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error('Error during signup:', error); 
    res.status(500).json({ message: "Something went wrong" });
  }
}