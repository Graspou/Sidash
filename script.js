var fond = document.createElement('audio');
fond.src = "musique/sidash.mp3";
fond.volume = 1;
fond.loop = true;
fond.play();

window.addEventListener ('load', function(){
    const canvas = document. getElementById('gameCanvas');
    const ctx = canvas.getContext ('2d') ;
    canvas.width = window.innerWidth;
    canvas. height = window.innerHeight;
    let enemies = [];
    let projectiles = [];
    let gameOver = false;
    let score = 0;
    let playerX = 0;
    let playerY = 0;
    
    class InputHandler {
        constructor (){
            this.keys = [];
            window.addEventListener ('keydown' , e => {
                if (( e.key === 'ArrowDown' ||
                    e.key === 'ArrowUp')
                    && this.keys.indexOf(e.key) === -1){
                this.keys.push(e.key);
                }
                if (e.key === ' ') {
                    shoot();
                }
            });
            window.addEventListener('keyup', e => {
            if (e.key === 'ArrowDown' ||
                e.key === 'ArrowUp'){
            this.keys.splice(this.keys.indexOf(e.key), 1);
            }

        });
        }
    }
    class Player {
        constructor (gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 140;
            this.height = 30;
            this.y = this.gameHeight - 120;
            this.x = 10
            this.image = document.getElementById("playerImage");
            this.vy = 0;
        }

        draw (context){

            context.strokeStyle = 'white';
            context.strokeRect(this.x, this.y, this.width, this.height)
            context.beginPath();
            context.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
            context.stroke();
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }

        update (input, enemies) {
            // collision detection
            enemies.forEach(enemy => {
                const dx = enemy.x - this.x;
                const dy = enemy.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy) * 2;
                if ( distance < enemy.width/2 + this.width/2) {
                    gameOver = true;
                }
            });
            if (input.keys.indexOf('ArrowUp') > -1 && this.y > 120) {
                this.vy -= 10;
            } else if(input.keys.indexOf('ArrowDown') > -1 && this.y < this.gameHeight - 120) {
                this.vy += 10
            }
            // vertical movement 
            this.y += this.vy;
            
            this.vy = 0;
            playerX = this.x;
            playerY = this.y;
        }
    }
    class Background {
            constructor (gameWidth, gameHeight){
                this.gameWidth = gameWidth;
                this.gameHeight = gameHeight;
                this.image = document.getElementById('backgroundImage');
                this.x = 0;
                this.y = 0;
                this.width = 2400;
                this.height = 720;
                this.speed = 7;
            }
            draw(context){
                context.drawImage(this.image, this.x, this.y, this.width, this.height);
                context.drawImage(this.image, this.x + this.width - this.speed, this.y, this.width, this.height);
            }
            update(){
                this.x -= this.speed;
                if (this.x < 0 - this.width) this.x = 0;
            }
    }
    class Enemy {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 160;
            this.height = 120;
            this.x = this.gameWidth;
            this.y = Math.random() * (this.gameHeight - 200) + this.height / 2;
            this.image = document.getElementById("enemyImage");
            this.speed = 8;
            this.fps = 20;
        }
        draw(context){
            context.strokeStyle = 'white';
            context.strokeRect(this.x, this.y, this.width, this.height)
            context.beginPath();
            context.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
            context.stroke();
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
        update(enemies){ 
            projectiles.forEach(projectile => {
            const dx = projectile.x - this.x;
            const dy = projectile.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy) * 2;
            if ( distance < projectile.width/2 + this.width/2) {
                delete enemies[enemies.indexOf(this)];
                projectiles.shift();
                score += 1;
            }
        });
            this.x -= this.speed;
        }
    }

    function handleEnemies (deltaTime){
        if (enemyTimer > enemyInterval + randomEnemyInterval) {
            enemies.push(new Enemy(canvas.width, canvas.height));
            enemyTimer = 0;
        } else {
            enemyTimer += deltaTime;
        }
        enemies.forEach(enemy => {
            enemy.draw(ctx);
            enemy.update(enemies);
        })
    }

    class Projectile {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 311;
            this.height = 84;
            this.x = playerX / 2;
            this.y = playerY;
            this.image = document.getElementById("projectile")
            this.speed = 10;
        }
        draw(context){
            context.strokeStyle = 'white';
            context.strokeRect(this.x, this.y, this.width, this.height)
            context.beginPath();
            context.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
            context.stroke();
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
        update(){
            this.x += this.speed;
        }
    }
    
    function handleProjectiles () {
        projectiles.forEach(projectile => {
            projectile.draw(ctx);
            projectile.update();
        })
    }
  
    function displayStatusText (context){
        context.font = '40px Helvetica';
        context.fillStyle = 'balck';
        context.fillText('Score: ' + score, 20, 50)
        if (gameOver) {
            context.textAlign = 'center';
            context.fillStyle = 'black';
            context.fillText('OUPS... Vous avez choppé le VIH !!!', canvas.width / 2, 200)
        }
    }
    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);

    let enemyTimer = 0;
    let enemyInterval = 2000;
    let randomEnemyInterval = Math.random() * 1000 + 500;

    function animate(){
        const deltaTime = 50;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background.draw(ctx);
        background.update();
        player.draw(ctx);
        player.update(input, enemies);
        handleEnemies(deltaTime);
        handleProjectiles();
        displayStatusText(ctx);

        if (!gameOver) {
            requestAnimationFrame(animate) ;
        }
    }

    function shoot(){
        projectiles.push(new Projectile(canvas.width, canvas.height))
    }

    animate();
});