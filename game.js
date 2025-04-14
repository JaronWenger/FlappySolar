class FlappySolar {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 400;
        this.canvas.height = 600;
        
        // Game state
        this.gameStarted = false;
        this.gameOver = false;
        this.score = 0;
        this.highScore = localStorage.getItem('highScore') || 0;
        
        // Load images
        this.images = {};
        this.loadImages();
        
        // Detect mobile device
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Bird properties
        this.bird = {
            x: 50,
            y: this.canvas.height / 2,
            width: 40,
            height: 40,
            velocity: 0,
            gravity: this.isMobile ? 0.15 : 0.2, // Slightly reduced gravity on mobile
            jump: this.isMobile ? -4 : -5, // Slightly reduced jump on mobile
            rotation: 0
        };
        
        // Pipe properties
        this.pipes = [];
        this.pipeWidth = 60;
        this.pipeGap = 150;
        this.pipeSpacing = 250;
        this.pipeSpeed = this.isMobile ? 1.5 : 2; // Slower pipes on mobile
        
        // Background parallax
        this.backgroundX = 0;
        this.backgroundSpeed = this.isMobile ? 0.3 : 0.5; // Slower background on mobile
        
        // Stars background
        this.stars = this.createStars(this.isMobile ? 50 : 100); // Fewer stars on mobile
        
        // Event listeners
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.getElementById('restartButton').addEventListener('click', this.restartGame.bind(this));
        
        // Add touch support for mobile
        this.canvas.addEventListener('touchstart', this.handleTouch.bind(this));
        
        // Add click support for desktop
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        
        // Add click support for start screen
        document.getElementById('startScreen').addEventListener('click', this.handleStartClick.bind(this));
        
        // Update high score display
        document.getElementById('highScore').textContent = this.highScore;
        
        // Performance tracking
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.lastFPSUpdate = 0;
        this.currentFPS = 0;
        
        // Start animation loop
        this.animate();
    }
    
    loadImages() {
        // Get the base URL for GitHub Pages
        const isGitHubPages = window.location.hostname.includes('github.io');
        const baseUrl = isGitHubPages ? '/FlappySolar' : '';
            
        // Define image sources with proper paths
        const imageSources = {
            bird: `${baseUrl}/src/LOGO.png`,
            background: `${baseUrl}/src/Background.jpg`,
            pipeTop: `${baseUrl}/src/solar-panel.svg`,
            pipeBottom: `${baseUrl}/src/solar-panel.svg`
        };
        
        // Log the image paths for debugging
        console.log('Loading images with paths:', imageSources);
        
        let loadedImages = 0;
        const totalImages = Object.keys(imageSources).length;
        
        for (const [key, src] of Object.entries(imageSources)) {
            this.images[key] = new Image();
            this.images[key].onload = () => {
                loadedImages++;
                console.log(`Loaded image: ${key} from ${src}`);
                if (loadedImages === totalImages) {
                    console.log('All images loaded successfully');
                }
            };
            this.images[key].onerror = (e) => {
                console.error(`Error loading image ${src}:`, e);
                // Fallback to stars if background fails to load
                if (key === 'background') {
                    console.log('Using stars as fallback background');
                }
            };
            this.images[key].src = src;
        }
    }
    
    createStars(count) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 0.5 + 0.1
            });
        }
        return stars;
    }
    
    handleKeyDown(e) {
        if (e.code === 'Space') {
            if (!this.gameStarted) {
                this.startGame();
            } else if (this.gameOver) {
                this.restartGame();
            } else {
                this.bird.velocity = this.bird.jump;
            }
        }
    }
    
    handleTouch(e) {
        // Prevent default behavior (scrolling, zooming)
        e.preventDefault();
        
        // Jump when screen is tapped
        if (!this.gameStarted) {
            this.startGame();
        } else if (!this.gameOver) {
            this.bird.velocity = this.bird.jump;
        }
    }
    
    handleClick(e) {
        // Jump when canvas is clicked
        if (!this.gameStarted) {
            this.startGame();
        } else if (!this.gameOver) {
            this.bird.velocity = this.bird.jump;
        }
    }
    
    handleStartClick(e) {
        // Start game when start screen is clicked
        if (!this.gameStarted) {
            this.startGame();
        }
    }
    
    startGame() {
        this.gameStarted = true;
        document.getElementById('startScreen').classList.add('hidden');
        this.spawnPipe();
    }
    
    restartGame() {
        this.gameStarted = true;
        this.gameOver = false;
        this.score = 0;
        this.bird.y = this.canvas.height / 2;
        this.bird.velocity = 0;
        this.pipes = [];
        this.backgroundX = 0;
        document.getElementById('gameOver').classList.add('hidden');
        document.getElementById('score').textContent = '0';
        this.spawnPipe();
    }
    
    spawnPipe() {
        const minHeight = 50;
        const maxHeight = this.canvas.height - this.pipeGap - minHeight;
        const height = Math.random() * (maxHeight - minHeight) + minHeight;
        
        this.pipes.push({
            x: this.canvas.width,
            topHeight: height,
            bottomY: height + this.pipeGap,
            passed: false
        });
    }
    
    update() {
        if (!this.gameStarted || this.gameOver) return;
        
        // Update bird
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        this.bird.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, this.bird.velocity * 0.1));
        
        // Update background position (parallax effect)
        this.backgroundX -= this.backgroundSpeed;
        if (this.backgroundX <= -this.canvas.width) {
            this.backgroundX = 0;
        }
        
        // Update pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed;
            
            // Check for score
            if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.passed = true;
                this.score++;
                document.getElementById('score').textContent = this.score;
                
                // Update high score
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    localStorage.setItem('highScore', this.highScore);
                    document.getElementById('highScore').textContent = this.highScore;
                }
            }
            
            // Remove off-screen pipes
            if (pipe.x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
            }
        }
        
        // Spawn new pipes
        if (this.pipes.length === 0 || 
            this.canvas.width - this.pipes[this.pipes.length - 1].x >= this.pipeSpacing) {
            this.spawnPipe();
        }
        
        // Check collisions
        if (this.checkCollision()) {
            this.gameOver = true;
            document.getElementById('gameOver').classList.remove('hidden');
            document.getElementById('finalScore').textContent = this.score;
        }
        
        // Update stars
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.canvas.height) {
                star.y = 0;
                star.x = Math.random() * this.canvas.width;
            }
        });
    }
    
    checkCollision() {
        // Check floor and ceiling
        if (this.bird.y < 0 || this.bird.y + this.bird.height > this.canvas.height) {
            return true;
        }
        
        // Check pipes
        for (const pipe of this.pipes) {
            if (this.bird.x + this.bird.width > pipe.x && 
                this.bird.x < pipe.x + this.pipeWidth) {
                if (this.bird.y < pipe.topHeight || 
                    this.bird.y + this.bird.height > pipe.bottomY) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background with parallax effect
        if (this.images.background && this.images.background.complete) {
            // Draw two copies of the background side by side for seamless scrolling
            this.ctx.drawImage(this.images.background, this.backgroundX, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.images.background, this.backgroundX + this.canvas.width, 0, this.canvas.width, this.canvas.height);
        } else {
            // Draw stars as fallback
            this.ctx.fillStyle = '#FFFFFF';
            this.stars.forEach(star => {
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                this.ctx.fill();
            });
        }
        
        // Draw pipes
        for (const pipe of this.pipes) {
            // Top pipe - now goes all the way to the top
            if (this.images.pipeTop && this.images.pipeTop.complete) {
                // Draw solar panel top pipe
                this.ctx.drawImage(
                    this.images.pipeTop,
                    pipe.x,
                    0, // Start from the top of the screen
                    this.pipeWidth,
                    pipe.topHeight // Draw all the way down to the gap
                );
            } else {
                // Fallback to rectangle
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            }

            // Bottom pipe
            if (this.images.pipeBottom && this.images.pipeBottom.complete) {
                // Draw solar panel bottom pipe
                this.ctx.drawImage(
                    this.images.pipeBottom,
                    pipe.x,
                    pipe.bottomY,
                    this.pipeWidth,
                    this.canvas.height - pipe.bottomY
                );
            } else {
                // Fallback to rectangle
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, this.canvas.height - pipe.bottomY);
            }
        }
        
        // Draw bird
        this.ctx.save();
        this.ctx.translate(this.bird.x + this.bird.width / 2, this.bird.y + this.bird.height / 2);
        this.ctx.rotate(this.bird.rotation);
        
        if (this.images.bird && this.images.bird.complete) {
            // Draw bird image with proper aspect ratio
            const aspectRatio = this.images.bird.width / this.images.bird.height;
            const drawWidth = this.bird.width;
            const drawHeight = drawWidth / aspectRatio;
            
            this.ctx.drawImage(
                this.images.bird,
                -drawWidth / 2,
                -drawHeight / 2,
                drawWidth,
                drawHeight
            );
        } else {
            // Fallback to circle
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, this.bird.width / 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    animate(currentTime) {
        // Calculate delta time and FPS
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        this.frameCount++;
        if (currentTime - this.lastFPSUpdate >= 1000) {
            this.currentFPS = this.frameCount;
            this.frameCount = 0;
            this.lastFPSUpdate = currentTime;
            
            // Log FPS for debugging
            if (this.isMobile) {
                console.log(`Mobile FPS: ${this.currentFPS}`);
            }
        }
        
        // Skip frame if too much time has passed (prevents large jumps)
        if (deltaTime > 100) {
            requestAnimationFrame(this.animate.bind(this));
            return;
        }
        
        this.update();
        this.draw();
        requestAnimationFrame(this.animate.bind(this));
    }
}

// Start the game when the page loads
window.onload = () => {
    new FlappySolar();
}; 