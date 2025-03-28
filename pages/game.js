import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";



export default function Game() {
  const { data: session , status } = useSession();
  const [guest, setGuest] = useState(false);
  const [guestId, setGuestId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [timeLeft, setTimeLeft] = useState(null);
  const [points, setPoints] = useState(session?.user?.points || 0);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { level } = router.query; 
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showPointsPopup, setShowPointsPopup] = useState(false);

  useEffect(() => {
    const storedGuest = sessionStorage.getItem("guest");
    if (storedGuest) {
      setGuest(true);
      setGuestId(localStorage.getItem("guestId") || "Guest");
    }
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
      fetch(`/api/getPoints?email=${session.user.email}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.points !== undefined) {
            setPoints(data.points);
          }
        })
        .catch((error) => console.error("Error fetching points:", error));
    }
  }, [session]);

  useEffect(() => {
    if (level && difficultySettings[level]) {
      setDifficulty(level);
      if (level !== "easy") {
        setTimeLeft(difficultySettings[level].time);
      }
    }
    fetchNewQuestion();
  }, [level]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setMessage("Time's up! Try again.");
    }
  }, [timeLeft]);

  const difficultySettings = {
    easy: { time: null, points: 1 },
    medium: { time: 60, points: 2 },
    hard: { time: 30, points: 3 },
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

  async function fetchNewQuestion() {
    setMessage("");
    try {
      const res = await fetch("https://marcconrad.com/uob/banana/api.php");
      const data = await res.json();
      setImageUrl(data.question);
      setCorrectAnswer(data.solution);
      setUserAnswer("");
    } catch (error) {
      console.error("Error fetching question:", error);
    }
  }

  async function handleSubmit() {
    if (timeLeft === 0) {
      setMessage("Time's up!");
      return;
    }

    if (parseInt(userAnswer) === correctAnswer) {
      const earnedPoints = difficultySettings[difficulty].points;
      setPoints(points + earnedPoints);
      setMessage(`Correct! You earned ${earnedPoints} points.`);

      if (session?.user) {
        await updateUserPoints(earnedPoints);
      }
    } else {
      setMessage("Wrong answer. Try again!");
    }
  }

  async function updateUserPoints(earnedPoints) {
    try {
      await fetch("/api/updatePoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          points: earnedPoints,
        }),
      });
    } catch (error) {
      console.error("Error updating points:", error);
    }
  }

  return (
    <div className="game-page">
      <div className="game-container">
        <h1>FIND THE BANANA</h1>
          <div className="game-buttons">
            <button className="select-level-btn" onClick={() => router.push("/levels")}>
              Select Level
            </button>
          </div>

          <div>
            {difficulty !== "easy" && <p>Time Left: {timeLeft}s</p>}
          </div>
          <div className="image-container">
            {imageUrl && <img src={imageUrl} alt="Math Question" />}
          </div>

          <div className="answer-section">
              <input
                  type="number"
                  placeholder="Enter your answer"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={timeLeft === 0} 
              />

              <div className="button-group">
                  <button className="hangman-btn" onClick={handleSubmit} disabled={timeLeft === 0} >Submit</button>
                  <button className="hangman-btn" onClick={fetchNewQuestion}>Next</button>
              </div>

              <p>{message}</p>
              <p>Your Total Points: {points}</p>

              <div className="button-group">
                  <button className="back-btn" onClick={() => router.back()}>⬅ Back</button>
                  <button className="hangman-btn" onClick={handlePlayHangman}>Play Hangman</button>
              </div>
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
            <p>You need at least 10 points to play Hangman!</p>
            <button className="back-btn" onClick={() => setShowPointsPopup(false)}>OK</button>
          </div>
        )}

      </div>
    </div>
  );
}