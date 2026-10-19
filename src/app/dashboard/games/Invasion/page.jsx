"use client";
import api from "@/lib/api";
import { useEffect, useRef, useState } from "react";

const ASSET_PATHS = {
  planet: "/assets/misc/invasion/planet2.png",
  player: "/assets/misc/invasion/player.png",
  enemy001: "/assets/enemy/invader/enemy001.png",
  enemy002: "/assets/enemy/invader/enemy002.png",
  enemy003: "/assets/enemy/invader/enemy003.png",
  enemy004: "/assets/enemy/invader/enemy004.png",
  space_background1: "/assets/background/invasion/space_background1.png",
};

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Falha ao carregar: ${src}`));
    image.src = src;
  });

class Planet {
  constructor(game) {
    this.game = game;
    this.x = this.game.width * 0.5;
    this.y = this.game.height * 0.5;
    this.radius = 80;
    this.image = this.game.images.planet;
  }

  draw(context) {
    context.drawImage(this.image, this.x - 100, this.y - 100);
    if (this.game.debug) {
      context.beginPath();
      context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      context.stroke();
    }
  }
}

class Player {
  constructor(game) {
    this.game = game;
    this.x = this.game.width * 0.5;
    this.y = this.game.height * 0.5;
    this.radius = 20;
    this.image = this.game.images.player;
    this.aim;
    this.angle = 0;
  }

  draw(context) {
    context.save();
    context.translate(this.x, this.y);
    context.rotate(this.angle);
    context.drawImage(this.image, -this.radius + 10, -this.radius);
    if (this.game.debug) {
      context.beginPath();
      context.arc(0, 0, this.radius, 0, Math.PI * 2);
      context.stroke();
    }
    context.restore();
  }

  update() {
    this.aim = this.game.calcAim(this.game.planet, this.game.mouse);
    this.x = this.game.planet.x + (this.game.planet.radius + this.radius) * this.aim[0];
    this.y = this.game.planet.y + (this.game.planet.radius + this.radius) * this.aim[1];
    this.angle = Math.atan2(this.aim[3], this.aim[2]);
  }

  shoot() {
    const bullet = this.game.getBullet();
    if (bullet) {
      bullet.start(
        this.x + this.radius * this.aim[0],
        this.y + this.radius * this.aim[1],
        this.aim[0],
        this.aim[1]
      );
    }
  }
}

class Bullet {
  constructor(game) {
    this.game = game;
    this.radius = 5;
    this.speedX = 1;
    this.speedY = 1;
    this.speedModifier = 5;
    this.free = true;
  }

  start(x, y, speedX, speedY) {
    this.free = false;
    this.x = x;
    this.y = y;
    this.speedX = speedX * this.speedModifier;
    this.speedY = speedY * this.speedModifier;
  }

  reset() {
    this.free = true;
  }

  draw(context) {
    if (!this.free) {
      context.save();
      context.beginPath();
      context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      context.fillStyle = "green";
      context.fill();
      context.restore();
    }
  }

  update() {
    if (!this.free) {
      this.x += this.speedX;
      this.y += this.speedY;
    }

    if (this.x < 0 || this.x > this.game.width || this.y < 0 || this.y > this.game.height) {
      this.reset();
    }
  }
}

class Enemy {
  constructor(game) {
    this.game = game;
    this.x = 0;
    this.y = 0;
    this.radius = 40;
    this.width = this.radius * 2;
    this.height = this.radius * 2;
    this.speedX = 0;
    this.speedY = 0;
    this.speedModifier = Math.random() * 0.5 + 0.1;
    this.angle = 0;
    this.collided = false;
    this.free = true;
  }

  start() {
    this.free = false;
    this.collided = false;
    this.frameX = 0;
    this.lives = this.maxLives;
    this.frameY = Math.floor(Math.random() * 4);

    if (Math.random() < 0.5) {
      this.x = Math.random() * this.game.width;
      this.y = Math.random() < 0.5 ? -this.radius : this.game.height + this.radius;
    } else {
      this.x = Math.random() < 0.5 ? -this.radius : this.game.width + this.radius;
      this.y = Math.random() * this.game.height;
    }

    const aim = this.game.calcAim(this, this.game.planet);
    this.speedX = aim[0] * this.speedModifier;
    this.speedY = aim[1] * this.speedModifier;
    this.angle = Math.atan2(aim[3], aim[2]) + Math.PI * 0.5;
  }

  reset() {
    this.free = true;
  }

  hit(damage) {
    this.lives -= damage;
    if (this.lives >= 1) this.frameX++;
  }

  draw(context) {
    if (!this.free) {
      context.save();
      context.translate(this.x, this.y);
      context.rotate(this.angle);
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        -this.radius,
        -this.radius,
        this.width,
        this.height
      );

      if (this.game.debug) {
        context.beginPath();
        context.arc(0, 0, this.radius, 0, Math.PI * 2);
        context.stroke();
        context.fillText(this.lives, 0, 0);
      }
      context.restore();
    }
  }

  update() {
    if (!this.free) {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.game.checkCollision(this, this.game.planet) && this.lives >= 1) {
        this.lives = 0;
        this.speedX = 0;
        this.speedY = 0;
        this.collided = true;
        this.game.lives--;
      }

      if (this.game.checkCollision(this, this.game.player) && this.lives >= 1) {
        this.lives = 0;
        this.collided = true;
        this.game.lives--;
      }

      this.game.bulletsPool.forEach((bullet) => {
        if (!bullet.free && this.game.checkCollision(this, bullet) && this.lives >= 1) {
          bullet.reset();
          this.hit(1);
        }
      });

      if (this.lives < 1 && this.game.spriteUpdate) {
        this.frameX++;
      }

      if (this.frameX > this.maxFrame) {
        this.reset();
        if (!this.collided && !this.game.gameOver) this.game.score += this.maxLives;
      }
    }
  }
}

class Enemy001 extends Enemy {
  constructor(game) {
    super(game);
    this.image = game.images.enemy001;
    this.frameX = 0;
    this.frameY = Math.floor(Math.random() * 4);
    this.maxFrame = 7;
    this.lives = 1;
    this.maxLives = this.lives;
  }
}

class Enemy002 extends Enemy {
  constructor(game) {
    super(game);
    this.image = game.images.enemy002;
    this.frameX = 0;
    this.frameY = Math.floor(Math.random() * 4);
    this.maxFrame = 3;
    this.lives = 1;
    this.maxLives = this.lives;
  }
}

class Enemy003 extends Enemy {
  constructor(game) {
    super(game);
    this.image = game.images.enemy003;
    this.frameX = 0;
    this.frameY = Math.floor(Math.random() * 4);
    this.maxFrame = 6;
    this.lives = 4;
    this.maxLives = this.lives;
  }
}

class Enemy004 extends Enemy {
  constructor(game) {
    super(game);
    this.image = game.images.enemy004;
    this.frameX = 0;
    this.frameY = Math.floor(Math.random() * 4);
    this.maxFrame = 14;
    this.lives = 8;
    this.maxLives = this.lives;
  }
}

class Game {
  constructor(canvas, images) {
    this.canvas = canvas;
    this.images = images;
    this.backgroundImage = images.space_background1;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.planet = new Planet(this);
    this.player = new Player(this);
    this.debug = false;
    this.bulletsPool = [];
    this.numberOfBullets = 15;
    this.createBulletsPool();
    this.enemyPool = [];
    this.numberOfEnemy = 20;
    this.createEnemyPool();
    this.enemyPool[0].start();
    this.enemyTimer = 0;
    this.enemyInterval = 800;
    this.spriteUpdate = false;
    this.spriteTimer = 0;
    this.spriteInterval = 150;
    this.score = 0;
    this.winningScore = 20;
    this.lives = 10;
    this.mouse = { x: 0, y: 0 };
    this.gameOver = false;
    this.scoreSaved = false;
    this.gameOverHandled = false;
    this.onGameOver = null;

    this.syncHighScore = async (valorAtual) => {
      const valor = Number(valorAtual);
      if (!Number.isFinite(valor) || valor <= 0) return;

      try {
        const { data: scoreSalvoNaApi } = await api.get('/usuarios/score2');
        const scoreAtualNaApi = Number(scoreSalvoNaApi ?? 0);

        if (valor <= scoreAtualNaApi) {
          localStorage.setItem('score2', String(scoreAtualNaApi));
          return;
        }

        await api.patch('/usuarios/score2', { score2: valor });
        localStorage.setItem('score2', String(valor));
        console.log('score2 atualizado na API com sucesso:', valor);
      } catch (error) {
        console.error('Erro ao comparar e atualizar score2 na API:', error.response?.data?.message || error.message);
      }
    };

    this.handleMouseMove = (event) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = event.clientX - rect.left;
      this.mouse.y = event.clientY - rect.top;
    };

    this.handleMouseDown = (event) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = event.clientX - rect.left;
      this.mouse.y = event.clientY - rect.top;
      this.player.shoot();
    };

    this.handleKeyUp = (event) => {
      if (event.key === 'd') this.debug = !this.debug;
      else if (event.key === '1') this.player.shoot();
    };

    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  destroy() {
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  render(context, deltaTime) {
    if (this.backgroundImage) {
      context.drawImage(this.backgroundImage, 0, 0, this.width, this.height);
    }

    this.planet.draw(context);
    this.drawStatusText(context);
    this.player.draw(context);
    this.player.update();

    this.bulletsPool.forEach((bullet) => {
      bullet.draw(context);
      bullet.update();
    });

    this.enemyPool.forEach((enemy) => {
      enemy.draw(context);
      enemy.update();
    });

    if (!this.gameOver) {
      if (this.enemyTimer < this.enemyInterval) {
        this.enemyTimer += deltaTime;
      } else {
        this.enemyTimer = 0;
        const enemy = this.getEnemy();
        if (enemy) enemy.start();
      }
    }

    if (this.spriteTimer < this.spriteInterval) {
      this.spriteTimer += deltaTime;
      this.spriteUpdate = false;
    } else {
      this.spriteTimer = 0;
      this.spriteUpdate = true;
    }

    if (this.score >= this.winningScore || this.lives < 1) {
      this.gameOver = true;
      this.enemyPool.forEach((enemy) => {
        enemy.reset();
      });
      if (!this.gameOverHandled) {
        this.gameOverHandled = true;
        if (this.onGameOver) this.onGameOver();
      }
      if (!this.scoreSaved) {
        this.scoreSaved = true;
        this.syncHighScore(this.score);
      }
    }
  }

  drawStatusText(context) {
    context.save();
    context.textAlign = 'left';
    context.font = '30px Impact';
    context.fillText('Score: ' + this.score, 20, 30);

    for (let i = 0; i < this.lives; i++) {
      context.fillRect(20 + 15 * i, 60, 10, 30);
    }

    if (this.gameOver) {
      context.textAlign = 'center';
      let message1;
      let message2;

      if (this.score >= this.winningScore) {
        message1 = 'You win!';
        message2 = 'Your score is ' + this.score + '!';
      } else {
        message1 = 'You Lose!';
        message2 = 'Try Again!';
      }

      context.font = '100px Impact';
      context.fillText(message1, this.width * 0.5, 200);
      context.font = '50px Impact';
      context.fillText(message2, this.width * 0.5, 550);
    }

    context.restore();
  }

  calcAim(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distance = Math.hypot(dx, dy);
    const aimX = (dx / distance) * -1;
    const aimY = (dy / distance) * -1;
    return [aimX, aimY, dx, dy];
  }

  checkCollision(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distance = Math.hypot(dx, dy);
    const sumOfRadius = a.radius + b.radius;
    return distance < sumOfRadius;
  }

  createBulletsPool() {
    for (let i = 0; i < this.numberOfBullets; i++) {
      this.bulletsPool.push(new Bullet(this));
    }
  }

  getBullet() {
    for (let i = 0; i < this.bulletsPool.length; i++) {
      if (this.bulletsPool[i].free) return this.bulletsPool[i];
    }
  }

  createEnemyPool() {
    for (let i = 0; i < this.numberOfEnemy; i++) {
      const randomNumber = Math.random();
      if (randomNumber < 0.25) {
        this.enemyPool.push(new Enemy001(this));
      } else if (randomNumber < 0.5) {
        this.enemyPool.push(new Enemy002(this));
      } else if (randomNumber < 0.75) {
        this.enemyPool.push(new Enemy003(this));
      } else {
        this.enemyPool.push(new Enemy004(this));
      }
    }
  }

  getEnemy() {
    for (let i = 0; i < this.enemyPool.length; i++) {
      if (this.enemyPool[i].free) return this.enemyPool[i];
    }
  }
}

export default function InvasionGamePage() {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const gameRef = useRef(null);
  const [showRestart, setShowRestart] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 800;
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';
    ctx.lineWidth = 2;
    ctx.font = '50px Helvetica';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let isMounted = true;

    const initGame = async () => {
      try {
        const images = {};

        for (const [key, src] of Object.entries(ASSET_PATHS)) {
          images[key] = await loadImage(src);
        }

        if (!isMounted) return;

        const game = new Game(canvas, images);
        game.onGameOver = () => setShowRestart(true);
        gameRef.current = game;

        let lastTime = 0;

        const animate = (timestamp) => {
          const deltaTime = timestamp - lastTime;
          lastTime = timestamp;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          game.render(ctx, deltaTime);

          if (isMounted) {
            animationFrameRef.current = window.requestAnimationFrame(animate);
          }
        };

        animationFrameRef.current = window.requestAnimationFrame(animate);
      } catch (error) {
        console.error('Erro ao carregar os assets do jogo:', error);
      }
    };

    initGame();

    return () => {
      isMounted = false;

      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      if (gameRef.current) {
        gameRef.current.destroy();
      }
    };
  }, [restartKey]);

  const handleRestart = () => {
    setShowRestart(false);
    setRestartKey((value) => value + 1);
  };

  return (
    <div style={{ position: 'relative', width: 800, height: 800, margin: '0 auto' }}>
      <canvas
        id="canvas1"
        ref={canvasRef}
        className="invasion-canvas"
        style={{
          backgroundImage: 'url("/assets/background/invasion/space_background1.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {showRestart && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.45)',
          }}
        >
          <button
            type="button"
            onClick={handleRestart}
            className="reiniciarJogo"
          >
            Reiniciar o Jogo
          </button>
        </div>
      )}
    </div>
  );
}




