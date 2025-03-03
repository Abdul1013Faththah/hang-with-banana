import { useState } from "react";
import { useRouter } from "next/router";

export default function Signup() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
    } else {
      setSuccess("Account created! Redirecting...");
      setTimeout(() => router.push("/signin"), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl mb-4">Sign Up</h2>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      <form
        onSubmit={handleSignup}
        className="flex flex-col space-y-4 w-80 bg-gray-100 p-6 rounded-lg shadow-lg"
      >
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="p-3 border rounded-lg" required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="p-3 border rounded-lg" required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="p-3 border rounded-lg" required />
        <button type="submit" className="p-3 bg-blue-600 text-white rounded-lg">Sign Up</button>
      </form>
    </div>
  );
}
