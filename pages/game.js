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
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

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
            setPoints(data.points); // Set points from database
          }
        })
        .catch((error) => console.error("Error fetching points:", error));
    }
  }, [session]);

  useEffect(() => {
    if (difficulty !== "easy") {
      setTimeLeft(difficultySettings[difficulty].time);
    }
    fetchNewQuestion();
  }, [difficulty]);

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
    if (!session) {
      setShowLoginPrompt(true); // Ask guest to log in
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
        <h1>Banana Math Game</h1>
        <div>
          <label>Select Difficulty: </label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="easy">Easy (1 point)</option>
            <option value="medium">Medium (2 points)</option>
            <option value="hard">Hard (3 points)</option>
          </select>
        </div>

        {difficulty !== "easy" && <p>Time Left: {timeLeft}s</p>}

        <div className="image-container">
          {imageUrl && <img src={imageUrl} alt="Math Question" />}
        </div>

        <input
          type="number"
          placeholder="Enter your answer"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
        />
        <button onClick={handleSubmit}>Submit</button>

        <p>{message}</p>

        <button onClick={fetchNewQuestion}>Next</button>

        <p>Your Total Points: {points}</p>

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
  );
}