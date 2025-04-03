import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function HangmanGame() {
  const { data: session } = useSession();
  const router = useRouter();
  const [category, setCategory] = useState(null);
  const [word, setWord] = useState("");
  const [hint, setHint] = useState(""); 
  const [displayWord, setDisplayWord] = useState([]);
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const maxWrongGuesses = 6;
  const [points, setPoints] = useState(session?.user?.points || 0);
  const [showGameEndPopup, setShowGameEndPopup] = useState(false);
  const [gameEndMessage, setGameEndMessage] = useState("");
  const [gameEndGif, setGameEndGif] = useState("");

  useEffect(() => {
    if (!session) return;
    async function checkPoints() {
      const res = await fetch(`/api/getPoints?email=${session.user.email}`);
      const data = await res.json();
      setPoints(data.points);
      if (data.points < 10) router.push("/levels");
    }
    checkPoints();
  }, [session]);

  const fetchWord = async (selectedCategory) => {
    setCategory(selectedCategory);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameOver(false);

    try {
      let url = `https://www.wordgamedb.com/api/v1/words?category=${selectedCategory.toLowerCase()}`;
      const response = await fetch(url);
      const data = await response.json();

      console.log("API Response:", data);

      if (Array.isArray(data) && data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length);
        const randomWord = data[randomIndex].word.toUpperCase();
        const wordHint = data[randomIndex].hint || "No hint available"; 

        setWord(randomWord);
        setHint(wordHint);
        setDisplayWord(Array(randomWord.length).fill("_"));
      } else {
        console.error("No words found in the selected category:", data);
        alert("No words found in this category. Try another one.");
      }
    } catch (error) {
      console.error("Error fetching word:", error);
    }
  };

  const handleLetterClick = (letter) => {
    if (guessedLetters.includes(letter) || !word || gameOver) return; // Prevent selection if game is over
    setGuessedLetters([...guessedLetters, letter]);

    if (word.includes(letter)) {
      const updatedWord = displayWord.map((char, index) =>
        word[index] === letter ? letter : char
      );
      setDisplayWord(updatedWord);
      if (!updatedWord.includes("_")) handleGameEnd(true);
    } else {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);
      if (newWrongGuesses >= maxWrongGuesses) handleGameEnd(false);
    }
  };

  const handleGameEnd = async (won) => {
    setGameOver(true);
    setDisplayWord(word.split(""));
    const points = won ? 5 : -3;
    if (won) {
      setGameEndMessage("You Win!");
      setGameEndGif("/images/win.gif"); 
    } else {
      setGameEndMessage(`Game Over! ❌ You lost 3 points. The word was: ${word}`);
      setGameEndGif("/images/lost.gif"); 
    }
    setShowGameEndPopup(true);

    if (session) {
      await fetch("/api/updatePoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email, points }),
      });
    }
  };

  const restartGame = () => {
    fetchWord(category);
  };

  return (
    <div className="hangman-container">
      {!category ? (
        <div className="category-selection">
          <h1>Wellcome to Hang Wuth Banana</h1>
          <h2>Select a Category</h2>
          <p>Your Total Points: {points}</p>
          <button className="category-btn" onClick={() => fetchWord("animal")}>Animals</button>
          <button className="category-btn" onClick={() => fetchWord("country")}>Countries</button>
          <button className="category-btn" onClick={() => fetchWord("food")}>Food</button>
          <button className="category-btn" onClick={() => fetchWord("plant")}>Plants</button>
          <button className="category-btn" onClick={() => fetchWord("sport")}>Sports</button>
          <button className="back-btn" onClick={() => router.back()}>
            ⬅ Back
          </button>
        </div>
      ) : (
        <div className="game-area">
          <h2>Category: {category}</h2>

          <div className="hangman-drawing">
            <div className="hangman-bar"></div>
            <div className="hangman-rope"></div>
            <div className="hangman-left-pole"></div>
            <div className="hangman-base"></div>
            <div className={`hangman-part head ${wrongGuesses > 0 ? "show" : ""}`} />
            <div className={`hangman-part body ${wrongGuesses > 1 ? "show" : ""}`} />
            <div className={`hangman-part arm-left ${wrongGuesses > 2 ? "show" : ""}`} />
            <div className={`hangman-part arm-right ${wrongGuesses > 3 ? "show" : ""}`} />
            <div className={`hangman-part leg-left ${wrongGuesses > 4 ? "show" : ""}`} />
            <div className={`hangman-part leg-right ${wrongGuesses > 5 ? "show" : ""}`} />
          </div>

          <div className="word-display">{displayWord.join(" ")}</div>

          <div className="hint-box">
            <strong>Hint: </strong> {hint}
          </div>

          <div className="keyboard">
            {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
              <button
                key={letter}
                onClick={() => handleLetterClick(letter)}
                disabled={guessedLetters.includes(letter) || gameOver}
              >
                {letter}
              </button>
            ))}
          </div>

          <p>Wrong Guesses: {wrongGuesses} / {maxWrongGuesses}</p>

          <div className="game-options">
            <button className="restart-btn" onClick={restartGame}>🔄 Restart Game</button>
            <button className="back-btn" onClick={() => setCategory(null)}>Select Categories</button>
          </div>
          {showGameEndPopup && (
            <div className="popup">
              <img src={gameEndGif} alt="Game Result" className="popup-gif" />
              <p>{gameEndMessage}</p>
              <button className="back-btn" onClick={() => setShowGameEndPopup(false)}>OK</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
