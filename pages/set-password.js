import { useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function SetPassword() {
  const { data: session } = useSession();
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

    if (res.ok) {
      alert("Password set successfully! You can now play.");
      router.push("/levels"); // Redirect to game levels
    } else {
      setError("Failed to set password.");
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
