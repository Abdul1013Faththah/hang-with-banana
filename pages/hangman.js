import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";


export default function HangmanGame() {
  const { data: session } = useSession();
  const router = useRouter();
  const [category, setCategory] = useState(null);
  const [word, setWord] = useState("");
  const [displayWord, setDisplayWord] = useState([]);
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const maxWrongGuesses = 6;

  useEffect(() => {
    if (!session) return;
    async function checkPoints() {
      const res = await fetch(`/api/getPoints?email=${session.user.email}`);
      const data = await res.json();
      if (data.points < 10) router.push("/levels");
    }
    checkPoints();
  }, [session]);

  const fetchWord = async (selectedCategory) => {
    setCategory(selectedCategory);
    const response = await fetch(`https://www.wordgamedb.com/api/v1/words?category=${selectedCategory}`);
    const data = await response.json();
    if (data && data.length > 0) {
      const randomWord = data[0].toUpperCase();
      setWord(randomWord);
      setDisplayWord(Array(randomWord.length).fill("_"));
    }
  };

  const handleLetterClick = (letter) => {
    if (guessedLetters.includes(letter) || !word) return;
    setGuessedLetters([...guessedLetters, letter]);

    if (word.includes(letter)) {
      const updatedWord = displayWord.map((char, index) =>
        word[index] === letter ? letter : char
      );
      setDisplayWord(updatedWord);
      if (!updatedWord.includes("_")) handleGameEnd(true);
    } else {
      setWrongGuesses(wrongGuesses + 1);
      if (wrongGuesses + 1 >= maxWrongGuesses) handleGameEnd(false);
    }
  };

  const handleGameEnd = async (won) => {
    const points = won ? 5 : -3;
    alert(won ? "You Win! 🎉" : "Game Over! ❌");

    if (session) {
      await fetch("/api/updatePoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email, points }),
      });
    }

    setTimeout(() => router.push("/levels"), 2000);
  };

  return (
    <div className="hangman-container">
      {!category ? (
        <div className="category-selection">
          <h2>Select a Category</h2>
          <button onClick={() => fetchWord("Fruits")}>Fruits</button>
          <button onClick={() => fetchWord("Animals")}>Animals</button>
          <button onClick={() => fetchWord("Countries")}>Countries</button>
        </div>
      ) : (
        <div className="game-area">
          <h2>Category: {category}</h2>

          {/* Hangman Drawing */}
          <div className="hangman-drawing">
            <div className={`hangman-part head ${wrongGuesses > 0 ? "show" : ""}`} />
            <div className={`hangman-part body ${wrongGuesses > 1 ? "show" : ""}`} />
            <div className={`hangman-part arm-left ${wrongGuesses > 2 ? "show" : ""}`} />
            <div className={`hangman-part arm-right ${wrongGuesses > 3 ? "show" : ""}`} />
            <div className={`hangman-part leg-left ${wrongGuesses > 4 ? "show" : ""}`} />
            <div className={`hangman-part leg-right ${wrongGuesses > 5 ? "show" : ""}`} />
          </div>

          <div className="word-display">{displayWord.join(" ")}</div>
          
          <div className="keyboard">
            {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
              <button
                key={letter}
                onClick={() => handleLetterClick(letter)}
                disabled={guessedLetters.includes(letter)}
              >
                {letter}
              </button>
            ))}
          </div>

          <p>Wrong Guesses: {wrongGuesses} / {maxWrongGuesses}</p>
        </div>
      )}
    </div>
  );
}