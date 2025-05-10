import './App.css'
import { useState, useEffect, useCallback } from 'react';
import Lottie from "lottie-react";
import crossAnimation from "./assets/lottie/cross.json";
import ovalAnimation from "./assets/lottie/oval.json";
import gridAnimation from "./assets/lottie/grid.json";

type Player = 'X' | 'O' | null;
type BoardType = (Player)[];

function App() {
  const [board, setBoard] = useState<BoardType>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [winner, setWinner] = useState<Player>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  const makeMove = useCallback((index: number) => {
    if (board[index] || gameOver) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  }, [board, gameOver, isXNext]);

  const findWinningMove = useCallback((player: Player): number => {
    const winningPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];


    for (const pattern of winningPatterns) {
      const [a, b, c] = pattern;
      // Check if two cells have the player's mark and the third is empty
      if (board[a] === player && board[b] === player && board[c] === null) return c;
      if (board[a] === player && board[c] === player && board[b] === null) return b;
      if (board[b] === player && board[c] === player && board[a] === null) return a;
    }


    return -1; // No winning move found
  }, [board]);


  const makeComputerMove = useCallback(() => {
    // Simple random move strategy
    const availableSpots = board.map((cell, index) => cell === null ? index : -1).filter(i => i !== -1);
    
    // Add some delay to make it feel more natural
    const timeout = setTimeout(() => {
      if (availableSpots.length > 0) {
        // 70% chance to make a random move, 30% chance to make a winning move if available
        const shouldMakeRandomMove = Math.random() < 0.7;
        
        if (!shouldMakeRandomMove) {
          const winMove = findWinningMove('O');
          if (winMove !== -1) {
            makeMove(winMove);
            return;
          }
        }
        
        // Make a random move
        const randomIndex = Math.floor(Math.random() * availableSpots.length);
        makeMove(availableSpots[randomIndex]);
      }
    }, 1000); // 1 second delay
    
    return () => clearTimeout(timeout);
  }, [board, findWinningMove, makeMove]);

  useEffect(() => {
    const winningPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    for (const pattern of winningPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinner(board[a]);
        setWinningLine(pattern);
        setGameOver(true);
        return;
      }
    }


    // Check for draw
    if (board.every(cell => cell !== null)) {
      setGameOver(true);
    }
  }, [board]);

  // Computer move
  useEffect(() => {
    // If it's computer's turn (O) and game is not over
    if (!isXNext && !gameOver) {
      const timeoutId = setTimeout(() => {
        makeComputerMove();
      }, 100); // 100ms delay
      
      return () => clearTimeout(timeoutId);
    }
  }, [isXNext, gameOver, makeComputerMove]);

  // Handle cell click (player's move)
  const handleClick = (index: number) => {
    // Only allow clicks when it's player's turn (X) and the cell is empty
    if (!isXNext || board[index] || gameOver) return;
    
    makeMove(index);
  };

  // Render cell content
  const renderCell = (index: number) => {
    if (board[index] === 'X') {
      return (
        <div className={`cell-animation ${winningLine && winningLine.includes(index) ? 'winning-cell' : ''}`}>
          <Lottie animationData={crossAnimation} autoPlay loop={false} />
        </div>
      );
    } else if (board[index] === 'O') {
      return (
        <div className={`cell-animation ${winningLine && winningLine.includes(index) ? 'winning-cell' : ''}`}>
          <Lottie animationData={ovalAnimation} autoPlay loop={false} />
        </div>
      );
    }
    return null;
  };

  // Reset game
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setGameOver(false);
    setWinningLine(null);
  };

  return (
    <div className="game-container">
      <>
        <div className="status">
          {gameOver 
            ? winner 
              ? `Winner: ${winner}` 
              : "It's a draw!" 
            : `Next player: ${isXNext ? 'X (You)' : 'O (Computer)'}`
          }
          {gameOver && (
            <button onClick={resetGame} className="reset-button">Play Again</button>
          )}
        </div>
        <div className="grid-container">
          <div className="grid-animation">
            <Lottie animationData={gridAnimation} autoPlay loop={false} />
          </div>
          <div className="board">
            {board.map((_, index) => (
              <div 
                key={index} 
                className="cell" 
                onClick={() => handleClick(index)}
              >
                {renderCell(index)}
              </div>
            ))}
          </div>
        </div>
      </>
    </div>
  );
}

export default App
