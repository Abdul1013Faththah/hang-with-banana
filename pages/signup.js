import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

export default function Signup() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    if (response.ok) {
      setPopupMessage("Signup successful! You can now log in.");
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        router.push("/");
      }, 5000);
    } else {
      const errorData = await response.json();
      console.log("Error:", errorData.message);
      setPopupMessage("User Already Exists");
      setShowPopup(true);
    }
  };

  return (
    <div className="container">
      <div className="auth-box">
        <h2>Sign up</h2>
        <form onSubmit={handleSignup}>
          <div class="input-container">
          <input
            type="text"
            placeholder="Username"
            value={username}
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
          </div>
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

      {showPopup && (
        <div className="popup">
          <p>{popupMessage}</p>
          <button className="close-btn" onClick={() => setShowPopup(false)}>OK</button>
        </div>
      )}

    </div>
  );
}