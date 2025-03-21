import { useState , useEffect } from "react";
import { useSession ,signIn ,signOut } from "next-auth/react";
import { useRouter } from "next/router";

export default function Component() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      console.log("User session:", session);
      router.push("/leaderboard");
    }
  }, [status]);

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (result.ok) router.push("/leaderboard");
    else alert("Invalid credentials");
  };

  const handleGuestSignIn = async () => {
    try {
      const response = await fetch("/api/auth/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
  
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("guestId", data.guestId); // Store guest ID
        sessionStorage.setItem("guest", "true"); // Indicate guest session
        router.push("/levels");
      } else {
        alert("Error creating guest user. Please try again.");
      }
    } catch (error) {
      console.error("Guest sign-in error:", error);
      alert("Something went wrong!");
    }
  };

  if (status === "loading") return <p>Loading...</p>;
  return (
    <div className="container">
      <div className="auth-box">
        <h2>Log in or Sign up</h2>
        <button className="google-btn" onClick={() => signIn("google")}>
          Sign in with Google
        </button>
        <p>OR</p>
        <form onSubmit={handleEmailSignIn}>
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
            Sign in with email
          </button>
        </form>
        <button className="guest-btn" onClick={handleGuestSignIn}>
          Play as Guest
        </button>
        <p>OR</p>
        <button className="signup-btn" onClick={() => router.push("/signup")}>
          Sign up
        </button>
      </div>
    </div>
  );
}