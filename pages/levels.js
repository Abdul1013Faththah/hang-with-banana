import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Levels() {
  const { data: session } = useSession();
  const router = useRouter();
  const [guest, setGuest] = useState(false);
  const [guestId, setGuestId] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [points, setPoints] = useState(null);

  useEffect(() => {
    const storedGuest = sessionStorage.getItem("guest");
    if (storedGuest) {
      setGuest(true);
      setGuestId(localStorage.getItem("guestId") || "Guest");
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetch(`/api/getPoints?email=${session.user.email}`)
        .then((res) => res.json())
        .then((data) => setPoints(data.points ?? 0))
        .catch((err) => {
          console.error("Error fetching points:", err);
          setPoints(0); 
        });
    }
  }, [session]);


  const handleLevelSelect = (level) => {
    router.push(`/game?level=${level}`);
  };

  const handlePlayHangman = () => {
    if (!session) {
      setShowLoginPrompt(true);
    } else if (points < 10) {
      alert("You need at least 10 points to play Hangman!");
    } else {
      router.push("/hangman");
    }
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
          <button className="hangman-btn" onClick={handlePlayHangman}>
            Play Hangman
          </button>

            {showLoginPrompt && (
          <div className="popup">
            <p>You need to log in to play Hangman.</p>
            <button onClick={() => router.push("/")}>Log in</button>
            <button onClick={() => setShowLoginPrompt(false)}>Cancel</button>
          </div>
          )}

        </div>
      </div>
    </div>
  );
}