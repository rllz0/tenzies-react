import { useEffect, useRef, useState } from "react";
import Die from "./Die";
import { nanoid } from "nanoid";
import Confetti from "react-confetti";

export default function App() {
  const [dice, setDice] = useState(() => generateAllNewDice());
  const buttonRef = useRef(null);

  const [gameTime, setGameTime] = useState(0);
  const [bestTime, setBestTime] = useState(() => {
    return null;
  });
  const timerRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);

  const gameWon =
    dice.every((die) => die.isHeld) &&
    dice.every((die) => die.value === dice[0].value);

  useEffect(() => {
    if (gameWon) {
      buttonRef.current.focus();
      if (bestTime === null || gameTime < bestTime) {
        setBestTime(gameTime);
      }
    }
  }, [gameWon, gameTime, bestTime]);

  useEffect(() => {
    if (gameStarted && !gameWon) {
      timerRef.current = setInterval(() => {
        setGameTime((prevTime) => prevTime + 1);
      }, 100);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [gameStarted, gameWon]);

  function generateAllNewDice() {
    return new Array(10).fill(0).map(() => ({
      value: Math.ceil(Math.random() * 6),
      isHeld: false,
      id: nanoid(),
    }));
  }

  function rollDice() {
    if (!gameWon) {
      setDice((oldDice) =>
        oldDice.map((die) =>
          die.isHeld ? die : { ...die, value: Math.ceil(Math.random() * 6) }
        )
      );
    } else {
      setDice(generateAllNewDice());
      setGameTime(0);
      setGameStarted(false);
    }
  }

  function hold(id) {
    if (!gameStarted) {
      setGameStarted(true);
    }

    setDice((oldDice) =>
      oldDice.map((die) =>
        die.id === id
          ? {
              ...die,
              isHeld: !die.isHeld,
            }
          : die
      )
    );
  }

  function formatTime(tenths) {
    const totalSeconds = Math.floor(tenths / 10);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  const diceElements = dice.map((dieObj) => (
    <Die
      key={dieObj.id}
      value={dieObj.value}
      isHeld={dieObj.isHeld}
      hold={() => hold(dieObj.id)}
    />
  ));

  return (
    <main>
      {gameWon && <Confetti />}
      <div aria-live="polite" className="sr-only">
        {gameWon && (
          <p>
            Congratulations! You won in {formatTime(gameTime)}! Press "New Game"
            to start again.
          </p>
        )}
      </div>
      <h1 className="title">Tenzies</h1>
      <p className="instructions">
        Roll until all dice are the same. Click each die to freeze it at its
        current value between rolls.
      </p>
      <div className="stats-container">
        <div className="timer">
          <span className="timer-label">Time: </span>
          <span className="timer-value">{formatTime(gameTime)}</span>
        </div>
        {bestTime !== null && (
          <div className="best-time">
            <span className="best-time-label">Best: </span>
            <span className="best-time-value">{formatTime(bestTime)}</span>
          </div>
        )}
      </div>
      {gameWon && (
        <div className="win-message">
          <h2>🎉 You Won! 🎉</h2>
          <p>Time: {formatTime(gameTime)}</p>
          {gameTime === bestTime && bestTime !== null && (
            <p className="new-record">🏆 New Best Time! 🏆</p>
          )}
        </div>
      )}

      <div className="dice-container">{diceElements}</div>
      <button ref={buttonRef} className="roll-dice" onClick={rollDice}>
        {gameWon ? "New Game" : "Roll"}
      </button>
    </main>
  );
}
