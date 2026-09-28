import React, { useRef, useState, useEffect } from 'react';
import { Gamepad2, Play, RefreshCw, Trophy } from 'lucide-react';

export const ArcadeGameApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(1240);

  const gameLoopRef = useRef<number | null>(null);
  const playerRef = useRef({ x: 300, y: 400, speed: 6 });
  const bulletsRef = useRef<Array<{ x: number; y: number }>>([]);
  const enemiesRef = useRef<Array<{ x: number; y: number; speed: number; radius: number }>>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});

  const startGame = () => {
    setScore(0);
    setGameState('playing');
    playerRef.current = { x: 300, y: 400, speed: 6 };
    bulletsRef.current = [];
    enemiesRef.current = [];
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if (e.key === ' ' && gameState === 'playing') {
        // Fire bullet
        bulletsRef.current.push({ x: playerRef.current.x, y: playerRef.current.y - 10 });
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 700;
    canvas.height = 450;

    let localScore = 0;

    const loop = () => {
      // Clear
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      ctx.fillStyle = 'white';
      for (let i = 0; i < 30; i++) {
        ctx.fillRect((i * 37) % canvas.width, (Date.now() / 20 + i * 50) % canvas.height, 2, 2);
      }

      // Player Movement
      if (keysRef.current['ArrowLeft'] || keysRef.current['a']) {
        playerRef.current.x = Math.max(20, playerRef.current.x - playerRef.current.speed);
      }
      if (keysRef.current['ArrowRight'] || keysRef.current['d']) {
        playerRef.current.x = Math.min(canvas.width - 20, playerRef.current.x + playerRef.current.speed);
      }

      // Draw Player Ship (Triangle)
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.moveTo(playerRef.current.x, playerRef.current.y - 15);
      ctx.lineTo(playerRef.current.x - 12, playerRef.current.y + 10);
      ctx.lineTo(playerRef.current.x + 12, playerRef.current.y + 10);
      ctx.closePath();
      ctx.fill();

      // Update Bullets
      bulletsRef.current.forEach((b, idx) => {
        b.y -= 8;
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(b.x - 2, b.y, 4, 10);
      });
      bulletsRef.current = bulletsRef.current.filter((b) => b.y > 0);

      // Spawn Enemies
      if (Math.random() < 0.04) {
        enemiesRef.current.push({
          x: Math.random() * (canvas.width - 40) + 20,
          y: -20,
          speed: Math.random() * 2 + 1.5,
          radius: Math.random() * 10 + 12
        });
      }

      // Update Enemies & Collisions
      enemiesRef.current.forEach((e, eIdx) => {
        e.y += e.speed;

        // Draw Enemy Asteroid
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Bullet hit check
        bulletsRef.current.forEach((b, bIdx) => {
          const dist = Math.hypot(b.x - e.x, b.y - e.y);
          if (dist < e.radius) {
            // Destroy enemy & bullet
            enemiesRef.current.splice(eIdx, 1);
            bulletsRef.current.splice(bIdx, 1);
            localScore += 10;
            setScore(localScore);
          }
        });

        // Player collision check
        const playerDist = Math.hypot(playerRef.current.x - e.x, playerRef.current.y - e.y);
        if (playerDist < e.radius + 12) {
          setGameState('gameover');
          setHighScore((prev) => Math.max(prev, localScore));
        }
      });

      enemiesRef.current = enemiesRef.current.filter((e) => e.y < canvas.height + 20);

      if (gameState === 'playing') {
        gameLoopRef.current = requestAnimationFrame(loop);
      }
    };

    gameLoopRef.current = requestAnimationFrame(loop);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState]);

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Header Bar */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-rose-400" />
          <span className="text-xs font-bold text-slate-100">Space Defense 2D Canvas Engine</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-400">Score:</span>{' '}
            <span className="text-rose-400 font-bold">{score}</span>
          </div>
          <div>
            <span className="text-slate-400">High Score:</span>{' '}
            <span className="text-emerald-400 font-bold">{highScore}</span>
          </div>
        </div>
      </div>

      {/* Main Game Screen */}
      <div className="flex-1 flex items-center justify-center p-3 relative bg-slate-950">
        <canvas
          ref={canvasRef}
          className="border border-slate-800 rounded-2xl shadow-2xl max-w-full max-h-full"
        />

        {/* Start Overlay */}
        {gameState === 'start' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
            <Gamepad2 className="w-12 h-12 text-rose-500 animate-bounce" />
            <div>
              <h2 className="text-xl font-bold text-slate-100">Space Defense 2D</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Built in HTML5 Canvas & TypeScript. Use [A] / [D] or Arrow Keys to move, press [SPACE] to fire laser cannons!
              </p>
            </div>
            <button
              onClick={startGame}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Mission</span>
            </button>
          </div>
        )}

        {/* Gameover Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
            <Trophy className="w-10 h-10 text-amber-400" />
            <div>
              <h2 className="text-xl font-bold text-slate-100">Mission Complete</h2>
              <p className="text-xs text-rose-400 font-mono mt-0.5">Final Score: {score} Points</p>
            </div>
            <button
              onClick={startGame}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
