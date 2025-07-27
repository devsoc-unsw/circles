import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal } from 'antd';
import { useTheme } from 'styled-components';

interface Position {
  x: number;
  y: number;
}

interface SnakeGameProps {
  isOpen: boolean;
  onClose: () => void;
}

const GRID_SIZE = 20;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;

const SnakeGame: React.FC<SnakeGameProps> = ({ isOpen, onClose }) => {
  const theme = useTheme() as {
    body: string;
    text: string;
    graph?: { borderColor?: string };
  };
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Position>({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const gameLoopRef = useRef<number>();

  const generateFood = useCallback((): Position => {
    const maxX = Math.floor(CANVAS_WIDTH / GRID_SIZE);
    const maxY = Math.floor(CANVAS_HEIGHT / GRID_SIZE);
    return {
      x: Math.floor(Math.random() * maxX),
      y: Math.floor(Math.random() * maxY)
    };
  }, []);

  const resetGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood());
    setDirection({ x: 0, y: 0 });
    setGameOver(false);
    setScore(0);
  }, [generateFood]);

  const checkCollision = useCallback((head: Position, snakeBody: Position[]): boolean => {
    if (
      head.x < 0 ||
      head.x >= CANVAS_WIDTH / GRID_SIZE ||
      head.y < 0 ||
      head.y >= CANVAS_HEIGHT / GRID_SIZE
    ) {
      return true;
    }
    return snakeBody.some((segment) => segment.x === head.x && segment.y === head.y);
  }, []);

  const gameLoop = useCallback(() => {
    setSnake((prevSnake) => {
      if (gameOver || (direction.x === 0 && direction.y === 0)) return prevSnake;

      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };
      head.x += direction.x;
      head.y += direction.y;

      if (checkCollision(head, newSnake)) {
        setGameOver(true);
        return prevSnake;
      }

      newSnake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        setScore((prev) => prev + 1);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, checkCollision, generateFood]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = theme.body || '#1d1f20';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.strokeStyle = theme.graph?.borderColor || '#333';
    ctx.lineWidth = 0.3;
    ctx.globalAlpha = 0.3;
    for (let i = 0; i <= CANVAS_WIDTH / GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * GRID_SIZE, 0);
      ctx.lineTo(i * GRID_SIZE, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let i = 0; i <= CANVAS_HEIGHT / GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * GRID_SIZE);
      ctx.lineTo(CANVAS_WIDTH, i * GRID_SIZE);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    snake.forEach((segment, index) => {
      if (index === 0) {
        const gradient = ctx.createRadialGradient(
          segment.x * GRID_SIZE + GRID_SIZE / 2,
          segment.y * GRID_SIZE + GRID_SIZE / 2,
          2,
          segment.x * GRID_SIZE + GRID_SIZE / 2,
          segment.y * GRID_SIZE + GRID_SIZE / 2,
          GRID_SIZE / 2
        );
        gradient.addColorStop(0, '#d7b7fd');
        gradient.addColorStop(1, '#9254de');
        ctx.fillStyle = gradient;
      } else {
        const opacity = Math.max(0.6, 1 - index * 0.04);
        ctx.fillStyle = `rgba(146, 84, 222, ${opacity})`;
      }

      ctx.fillRect(
        segment.x * GRID_SIZE + 1,
        segment.y * GRID_SIZE + 1,
        GRID_SIZE - 2,
        GRID_SIZE - 2
      );

      ctx.strokeStyle = '#51258f';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        segment.x * GRID_SIZE + 1,
        segment.y * GRID_SIZE + 1,
        GRID_SIZE - 2,
        GRID_SIZE - 2
      );
    });

    const foodGradient = ctx.createRadialGradient(
      food.x * GRID_SIZE + GRID_SIZE / 2,
      food.y * GRID_SIZE + GRID_SIZE / 2,
      3,
      food.x * GRID_SIZE + GRID_SIZE / 2,
      food.y * GRID_SIZE + GRID_SIZE / 2,
      GRID_SIZE / 2 - 1
    );
    foodGradient.addColorStop(0, '#ffd666');
    foodGradient.addColorStop(0.7, '#ff7a45');
    foodGradient.addColorStop(1, '#ff4d4f');

    ctx.fillStyle = foodGradient;
    ctx.fillRect(food.x * GRID_SIZE + 1, food.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);

    ctx.strokeStyle = '#d4380d';
    ctx.lineWidth = 1;
    ctx.strokeRect(food.x * GRID_SIZE + 1, food.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
  }, [snake, food, theme]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    if (isOpen && !gameOver) {
      gameLoopRef.current = window.setInterval(gameLoop, 150);
      return () => {
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
        }
      };
    }
    return undefined;
  }, [gameLoop, isOpen, gameOver]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
        case ' ':
          if (gameOver) resetGame();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [direction, isOpen, gameOver, resetGame]);

  useEffect(() => {
    if (isOpen) {
      resetGame();
    }
  }, [isOpen, resetGame]);

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={500}
      styles={{
        content: {
          backgroundColor: theme.body,
          borderRadius: '12px'
        },
        header: {
          backgroundColor: theme.body,
          borderBottom: `1px solid ${theme.graph?.borderColor || '#333'}`
        }
      }}
    >
      <div style={{ textAlign: 'center', padding: '20px 10px' }}>
        <div
          style={{
            marginBottom: '15px',
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#9254de',
            textShadow: '0 0 10px rgba(146, 84, 222, 0.3)'
          }}
        >
          Score: {score}
        </div>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{
            border: `3px solid #9254de`,
            borderRadius: '8px',
            backgroundColor: theme.body,
            boxShadow: '0 0 20px rgba(146, 84, 222, 0.2)'
          }}
        />
        <div
          style={{
            marginTop: '15px',
            fontSize: '14px',
            color: theme.text,
            lineHeight: '1.4'
          }}
        >
          {gameOver ? (
            <div>
              <div
                style={{
                  color: '#ff4d4f',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  marginBottom: '5px'
                }}
              >
                Game Over!
              </div>
              <div style={{ color: theme.text }}>Press SPACE to restart</div>
            </div>
          ) : (
            <div>
              <div>Use arrow keys to move the snake</div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SnakeGame;
