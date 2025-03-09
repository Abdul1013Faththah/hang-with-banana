import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (session?.needsPassword) {
      router.push("/set-password"); // Redirect Google users to set password
    }
  }, [session]);

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (result.ok) router.push("/levels");
    else alert("Invalid credentials");
  };

  const handleGuestSignIn = () => {
    router.push("/levels"); // Redirects guest users to level selection
  };

  return (
    <div className="container">
      <div className="auth-box">
        <h2>Log in or Sign up</h2>
        
        <button
          className="google-btn"
          onClick={() => signIn("google", { callbackUrl: "/levels" })}
        >
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
            Sign in with Email
          </button>
        </form>
        
        <p>OR</p>
        
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
