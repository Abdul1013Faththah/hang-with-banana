import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Levels() {
  const { data: session } = useSession();
  const router = useRouter();
  const [guest, setGuest] = useState(false);
  const [guestId, setGuestId] = useState("");

  useEffect(() => {
    const storedGuest = sessionStorage.getItem("guest");
    if (storedGuest) {
      setGuest(true);
      setGuestId(localStorage.getItem("guestId") || "Guest");
    }
  }, []);

  const handleLevelSelect = (level) => {
    router.push(`/game?level=${level}`);
  };

  const handleSignOut = async () => {
    sessionStorage.clear();
    localStorage.clear();
    
    if (session) {
      await signOut({ callbackUrl: "/" });
    } else {
      router.push("/");
    }
  };

  return (
    <div className="game-page">
      <div className="container">
        <div className="auth-info">
          {guest ? (
            <p>Signed in as Guest ({guestId})</p>
          ) : session ? (
            <p>Signed in as {session.user?.name || "Guest"}</p>
          ) : (
            <p>Not signed in</p>
          )}
          <button
            className="signout-btn"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>

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
    </div>
  );
}