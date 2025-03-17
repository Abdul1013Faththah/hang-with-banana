import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

export default function Signup() {
  const router = useRouter();
  const [name, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (response.ok) {
      alert("Signup successful! You can now log in.");
      router.push("/");
    } else {
      alert("Signup failed. Try again.");
    }
  };

  return (
    <div className="container">
      <div className="auth-box">
        <h2>Sign up</h2>
        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Username"
            value={name}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="email-btn">
            Sign up with email
          </button>
        </form>
        <p>
          Already have an account?{" "}
          <span className="link" onClick={() => router.push("/")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}