import { useState , useEffect } from "react";
import { useSession ,signIn ,signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { FaGoogle } from "react-icons/fa";

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
        localStorage.setItem("guestId", data.guestId);
        sessionStorage.setItem("guest", "true");
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
          <img src="/images/google.svg" alt="Google" className="google-img" />
          Sign in with Google
        </button>
        <div className="or-container">
          <hr/>
            <p>OR</p>
          <hr/>
        </div>
        <form onSubmit={handleEmailSignIn}>
          <div className="input-container">
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
            Sign in with email
          </button>
        </form>
        <button className="guest-btn" onClick={handleGuestSignIn}>
          Play as Guest
        </button>
        <div className="or-container">
          <hr/>
            <p>OR</p>
          <hr/>
        </div>
        <button className="signup-btn" onClick={() => router.push("/signup")}>
          Sign up
        </button>
      </div>
    </div>
  );
}