import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Levels() {
  const { data: session } = useSession();
  const router = useRouter();
  const [guest, setGuest] = useState(false);
  const [guestId, setGuestId] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showPointsPopup, setShowPointsPopup] = useState(false);
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
    if (!session && !guest) {
      setShowLoginPrompt(true);
    } else if (points < 10 && !guest) {
      setShowPointsPopup(true);
    } else if (guest) {
      setShowLoginPrompt(true);
    } else {
      router.push("/hangman");
    }
  };

  const handleGuestSignOut = async () => {
    sessionStorage.clear();
    localStorage.clear();
    router.push("/");
  };

  return (
    <div className="levels-container">
      <h1 className="levels-title">Select Level</h1>

      <button className="level-btn" onClick={() => handleLevelSelect("easy")}>
        Easy <br /> (No timer, 1 point)
      </button>
      <button className="level-btn" onClick={() => handleLevelSelect("medium")}>
        Medium <br /> (1 min timer, 2 points)
      </button>
      <button className="level-btn" onClick={() => handleLevelSelect("hard")}>
        Hard <br /> (30 sec timer, 3 points)
      </button>

      <div className="button-container">
        {!guest && (
          <button className="back-btn" onClick={() => router.back()}>
            ⬅ Back
          </button>
        )}
        <button className="hangman-btn" onClick={handlePlayHangman}>Play Hangman</button>
      </div>

      {showLoginPrompt && (
        <div className="popup">
          <p>You need to Signup or Login with Google to play Hangman.</p>
          <button className="link"  onClick={guest ? handleGuestSignOut : () => router.push("/")}>Log in</button>
          <button className="back-btn" onClick={() => setShowLoginPrompt(false)}>Cancel</button>
        </div>
      )}

      {showPointsPopup && (
        <div className="popup">
          <img src = "/images/lost.gif" alt = "gif"></img>
          <p>You need at least 10 points to play Hangman!</p>
          <button className="back-btn" onClick={() => setShowPointsPopup(false)}>OK</button>
        </div>
      )}

    </div>
  );
}