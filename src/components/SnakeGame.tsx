import React, { useEffect, useRef, useState, useCallback } from 'react';

interface SnakeGameProps {
  onScoreChange?: (score: number) => void;
}

type Point = { x: number; y: number };

const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION: Point = { x: 0, y: -1 };
const GAME_SPEED = 100;

export default function SnakeGame({ onScoreChange }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const directionRef = useRef(direction);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
        y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
      };
      const isOnSnake = currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
      if (!isOnSnake) break;
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setFood(generateFood(INITIAL_SNAKE));
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    if (onScoreChange) onScoreChange(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ') {
        if (gameOver) {
          resetGame();
        } else {
          setIsPaused((prev) => !prev);
        }
        return;
      }

      if (isPaused || gameOver) return;

      const { x, y } = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (y !== 1) directionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (y !== -1) directionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (x !== 1) directionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (x !== -1) directionRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, gameOver]);

  useEffect(() => {
    if (isPaused || gameOver) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + directionRef.current.x,
          y: head.y + directionRef.current.y,
        };

        // Check wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= CANVAS_SIZE / GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= CANVAS_SIZE / GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Check self collision
        if (
          prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)
        ) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          const newScore = score + 10;
          setScore(newScore);
          if (newScore > highScore) setHighScore(newScore);
          if (onScoreChange) onScoreChange(newScore);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const gameInterval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameInterval);
  }, [isPaused, gameOver, food, score, highScore, generateFood, onScoreChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid lines (optional, for neon effect)
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= CANVAS_SIZE; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
      ctx.stroke();
    }

    // Draw food
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ec4899';
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(food.x * GRID_SIZE + 2, food.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);

    // Draw snake
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#22c55e';
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#4ade80' : '#22c55e';
      ctx.fillRect(
        segment.x * GRID_SIZE + 1,
        segment.y * GRID_SIZE + 1,
        GRID_SIZE - 2,
        GRID_SIZE - 2
      );
    });

    // Reset shadow
    ctx.shadowBlur = 0;
  }, [snake, food]);

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="flex w-full max-w-[400px] justify-between px-2 font-mono">
        <div className="flex flex-col">
          <span className="text-xs text-zinc-500 uppercase tracking-widest">Score</span>
          <span className="text-2xl font-bold neon-text-green text-green-400">{score}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-zinc-500 uppercase tracking-widest">High Score</span>
          <span className="text-2xl font-bold text-zinc-300">{highScore}</span>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-cyan-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
        <div className="relative bg-zinc-950 rounded-xl border border-zinc-800 p-2 shadow-2xl">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="bg-zinc-950 rounded-lg"
          />

          {(isPaused || gameOver) && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl">
              {gameOver ? (
                <>
                  <h2 className="text-4xl font-bold mb-2 neon-text-pink text-pink-500 font-mono">GAME OVER</h2>
                  <p className="text-zinc-300 mb-6 font-mono">Final Score: {score}</p>
                  <button
                    onClick={(e) => { resetGame(); e.currentTarget.blur(); }}
                    className="px-6 py-3 bg-transparent border-2 border-green-500 text-green-400 font-mono font-bold uppercase tracking-widest rounded hover:bg-green-500/20 transition-colors neon-border-green neon-text-green"
                  >
                    Play Again
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-4xl font-bold mb-6 neon-text-cyan text-cyan-400 font-mono tracking-widest">SNAKE</h2>
                  <button
                    onClick={(e) => { setIsPaused(false); e.currentTarget.blur(); }}
                    className="px-6 py-3 bg-transparent border-2 border-cyan-500 text-cyan-400 font-mono font-bold uppercase tracking-widest rounded hover:bg-cyan-500/20 transition-colors neon-border-cyan neon-text-cyan"
                  >
                    Start Game
                  </button>
                  <p className="mt-6 text-xs text-zinc-500 font-mono uppercase tracking-widest">
                    Press Space to Pause/Resume
                  </p>
                  <p className="mt-2 text-xs text-zinc-500 font-mono uppercase tracking-widest">
                    Use Arrow Keys or WASD to Move
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
