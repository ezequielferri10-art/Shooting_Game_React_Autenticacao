'use client'
import { useEffect, useRef, useState } from "react";

const Canvas = () => {
  const canvasRef = useRef(null);
  const collisionCanvasRef = useRef(null);
  const STORAGE_KEY = "shooting_game_score";
  const [gameId, setGameId] = useState(0);
  const [showRestart, setShowRestart] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const collisionCanvas = collisionCanvasRef.current;
    if (!canvas || !collisionCanvas) return;

    const ctx = canvas.getContext("2d");
    const collisionCtx = collisionCanvas.getContext('2d', { willReadFrequently: true });

    // Ajusta o tamanho dinamicamente para a tela inteira
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    collisionCanvas.width = window.innerWidth;
    collisionCanvas.height = window.innerHeight;

    const saveScore = () => {
      window.localStorage.setItem(STORAGE_KEY, String(score));
    };

    let score = 0;
    let gameOver = false;
    ctx.font = "50px Impact";
    let timeToNextAlvo = 0;
    let alvoInterval = 500;
    let lastTime = 0;
    let alvos = [];
    let explosions = [];
    let pngs = ['/enemy/babul.png', '/enemy/mosca.png', '/enemy/prato_rotacao.png', '/enemy/robocoptero.png', '/enemy/robocoptero2.png'];

    class Alvo {
      
      constructor() {
        this.spriteWidth = 128;
        this.spriteHeight = 128;
        this.sizeModifier = Math.random() * 1 + 0.6;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 4 + 3;
        this.directionY = Math.random() * 4 - 2.5;
        this.markForDeletion = false;
        this.image = new Image();
        this.image.src = pngs[Math.floor(Math.random() * pngs.length)]; 
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 80 + 80;
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
        this.color = "rgb(" + this.randomColors[0] + "," + this.randomColors[1] + "," + this.randomColors[2] + ")";
      }
      update(deltaTime) {
        if (this.y < 0 || this.y > canvas.height - this.height) {
          this.directionY = -this.directionY;
        }
        this.x -= this.directionX;
        this.y += this.directionY;
        if (this.x < 0 - this.width) this.markForDeletion = true;
        this.timeSinceFlap += deltaTime;
        if (this.timeSinceFlap > this.flapInterval) {
          if (this.frame > this.maxFrame) this.frame = 0;
          else this.frame++;
          this.timeSinceFlap = 0;
        }
        if (this.x < 0 - this.width) {
          gameOver = true;
          saveScore();
          setShowRestart(true); 
        }
      }
      draw() {
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
      }
    }

    class Explosion {
      constructor(x, y, size){
        this.image = new Image();
        this.image.src = '/explosao.png';
        this.spriteWidth = 128;
        this.spriteHeight = 128;
        this.size = size;
        this.x = x;
        this.y = y;
        this.sound = new Audio();
        this.sound.src = '/ram.wav';
        this.frame = 0;
        this.timeSinceLastFrame = 0;
        this.frameInterval = 200;
        this.markForDeletion = false;
      }
      update(deltaTime){
        if (this.frame === 0) this.sound.play().catch(e => console.log("Áudio bloqueado"));
        this.timeSinceLastFrame += deltaTime;
        if (this.timeSinceLastFrame > this.frameInterval){
          this.frame++;
          this.timeSinceLastFrame = 0;
          if (this.frame > 5) this.markForDeletion = true;
        }
      }
      draw(){
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y - this.size/4, this.size, this.size);
      }
    }

    function drawScore() {
      ctx.fillStyle = "black";
      ctx.fillText("Score: " + score, 50, 75);
      ctx.fillStyle = "white";
      ctx.fillText("Score: " + score, 55, 80);
    }

    function drawGameOver(){
      ctx.fillStyle = "rgba(110, 228, 110, 0.8)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = 'center';
      
      ctx.fillStyle = 'black';
      ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 50);
      ctx.fillText('Your score is: ' + score, canvas.width/2, canvas.height/2 + 50);
      
      ctx.fillStyle = 'white';
      ctx.fillText('GAME OVER', canvas.width/2 + 5, canvas.height/2 - 45);
      ctx.fillText('Your score is: ' + score, canvas.width/2 + 5, canvas.height/2 + 55);
    }

    const handleClick = (e) => {
      if (gameOver) return;

      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const detectPixelColor = collisionCtx.getImageData(clickX, clickY, 1, 1);
      const pc = detectPixelColor.data;

      alvos.forEach((object) => {
        if (object.randomColors[0] === pc[0] && object.randomColors[1] === pc[1] && object.randomColors[2] === pc[2]){
          object.markForDeletion = true;
          score++;
          saveScore();
          explosions.push(new Explosion(object.x, object.y, object.width));
        }
      });
    };

    window.addEventListener("click", handleClick);

    let animationFrameId;
    function animate(timestamp) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      collisionCtx.clearRect(0, 0, canvas.width, canvas.height);
      let deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      timeToNextAlvo += deltaTime;

      if (timeToNextAlvo > alvoInterval) {
        alvos.push(new Alvo());
        timeToNextAlvo = 0;
        alvos.sort((a, b) => a.width - b.width);
      }

      drawScore();
      [...alvos, ...explosions].forEach(object => object.update(deltaTime));
      [...alvos, ...explosions].forEach(object => object.draw());

      alvos = alvos.filter((object) => !object.markForDeletion);
      explosions = explosions.filter((object) => !object.markForDeletion);

      if (!gameOver) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        drawGameOver();
      }
    }
    
    animate(0);

    return () => {
      window.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameId]); 

  const handleRestart = () => {
    window.localStorage.setItem(STORAGE_KEY, "0");
    setShowRestart(false);
    setGameId(prev => prev + 1);
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#1a1a1a" }}>
      {/* Canvas Principal */}
      <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, zIndex: 1, display: "block" }} />
      
      {/* Canvas Oculto de Colisão (Invisível mas funcional) */}
      <canvas ref={collisionCanvasRef} style={{ position: "absolute", top: 0, left: 0, opacity: 0, zIndex: 0, pointerEvents: "none" }} />
      
      
      {showRestart && (
        <button 
          onClick={handleRestart}
          style={{
            position: "absolute",
            top: "80%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
            padding: "15px 40px",
            fontSize: "24px",
            fontFamily: "Impact, sans-serif",
            letterSpacing: "2px",
            backgroundColor: "#8a6006",
            color: "white",
            border: "4px solid black",
            borderRadius: "10px",
            cursor: "pointer",
            boxShadow: "0px 5px 0px 0px #000",
            transition: "all 0.1s ease"
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "translate(-50%, -46%)";
            e.currentTarget.style.boxShadow = "0px 2px 0px 0px #000";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "translate(-50%, -50%)";
            e.currentTarget.style.boxShadow = "0px 5px 0px 0px #000";
          }}
        >
          RESTART GAME
        </button>
      )}
    </div>
  );
};

export default Canvas;
