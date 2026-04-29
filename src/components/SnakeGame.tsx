/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Trophy, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const MOVE_SPEED = 150;

export default function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const generateFood = useCallback(() => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // Check if food is on snake
      const onSnake = snake.some(segment => segment.x === newFood!.x && segment.y === newFood!.y);
      if (!onSnake) break;
    }
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood());
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y,
      };

      // Collision Detection: Walls
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setGameOver(true);
        return prevSnake;
      }

      // Collision Detection: Self
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Food Detection
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => {
            const newScore = s + 10;
            if (newScore > highScore) setHighScore(newScore);
            return newScore;
        });
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, generateFood, highScore, isPaused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        case ' ':
          setIsPaused(p => !p);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    gameLoopRef.current = setInterval(moveSnake, MOVE_SPEED);
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [moveSnake]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="flex justify-between w-full max-w-[500px] mb-4 font-mono">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase text-zinc-500">Current Score</span>
          <span className="text-4xl font-bold text-green-400">{score.toString().padStart(4, '0')}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase text-zinc-500">Best Record</span>
          <span className="text-xl text-zinc-400">{highScore.toLocaleString()}</span>
        </div>
      </div>

      <div 
        className="relative bg-black border-4 border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden w-[300px] h-[300px] sm:w-[500px] sm:h-[500px]"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
        }}
      >
        {/* Grid Overlay */}
        <div className="absolute inset-0 grid grid-cols-[repeat(20,1fr)] grid-rows-[repeat(20,1fr)] opacity-5 pointer-events-none">
          {Array.from({ length: 400 }).map((_, i) => (
            <div key={i} className="border-r border-b border-zinc-500"></div>
          ))}
        </div>

        {/* Snake segments */}
        {snake.map((segment, i) => (
          <div
            key={i}
            className={`rounded-sm ${i === 0 ? 'bg-green-400 z-10' : 'bg-green-500/60'}`}
            style={{
              gridColumnStart: segment.x + 1,
              gridRowStart: segment.y + 1,
              boxShadow: i === 0 ? '0 0 15px rgba(74,222,128,0.8)' : 'none'
            }}
          />
        ))}

        {/* Food */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="bg-pink-500 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.9)]"
          style={{
            gridColumnStart: food.x + 1,
            gridRowStart: food.y + 1,
          }}
        />

        {/* Overlays */}
        <AnimatePresence>
          {gameOver && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20 backdrop-blur-md"
            >
              <h2 className="text-5xl font-bold text-pink-500 tracking-tighter mb-8 font-mono">CONNECTION LOST</h2>
              <button 
                onClick={resetGame}
                className="group relative flex items-center space-x-3 bg-zinc-100 hover:bg-green-400 text-black px-12 py-4 font-bold uppercase tracking-widest transition-all"
              >
                <div className="absolute -inset-1 bg-white/20 blur group-hover:opacity-100 transition-opacity opacity-0"></div>
                <RotateCcw className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Re-Initialize</span>
              </button>
            </motion.div>
          )}

          {isPaused && !gameOver && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20 backdrop-blur-[2px]"
            >
              <button 
                onClick={() => setIsPaused(false)}
                className="text-sm font-mono text-green-400 tracking-[0.5em] animate-pulse uppercase"
              >
                [ Press Space to Link ]
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex justify-between w-full max-w-[500px] mono-label">
        <span>X: {snake[0]?.x.toFixed(2)} Y: {snake[0]?.y.toFixed(2)}</span>
        <span>Grid: {GRID_SIZE}x{GRID_SIZE}</span>
      </div>
    </div>
  );
}
