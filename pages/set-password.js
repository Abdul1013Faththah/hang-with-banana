import { useState } from "react";
import { useRouter } from "next/router";

export default function SetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSetPassword = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Password set successfully! You can now log in with email.");
      router.push("/levels");
    } else {
      setError(data.error);
    }
  };

  return (
    <div className="container">
      <h2>Set Your Password</h2>
      <form onSubmit={handleSetPassword}>
        <input
          type="password"
          placeholder="Enter a new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Set Password</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
