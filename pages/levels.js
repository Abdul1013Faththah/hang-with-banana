import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Levels() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLevelSelect = (level) => {
    router.push(`/game?level=${level}`);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false }); // Clears NextAuth session
    document.cookie = "__Secure-next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "https://accounts.google.com/Logout"; // Ensures Google logs out
  }

  return (
    <div className="container">
      {session && (
        <div className="auth-info">
          <p>Signed in as {session.user?.name || "Guest"}</p>
          <button className="signout-btn" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      )}

      <div className="level-box">
        <h2>Select Level</h2>
        <button className="level-btn" onClick={() => handleLevelSelect("easy")}>
          Easy <br /> (No timer, just 1 point)
        </button>
        <button className="level-btn" onClick={() => handleLevelSelect("medium")}>
          Medium <br /> (1 min timer, 2 points)
        </button>
        <button className="level-btn" onClick={() => handleLevelSelect("hard")}>
          Hard <br /> (30 sec timer, 3 points)
        </button>
      </div>
    </div>
  );
}
