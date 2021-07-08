class Scene2 extends Phaser.Scene {
    constructor(){
        super("playGame");
    }

    create(){
        // max enemy speed
        this.maxEnemySpeed = 2;

        this.menuOpen = true;

        this.background = this.add.tileSprite(0,0,config.width,config.height,"background");
        this.background.setOrigin(0,0);
        // add loaded ship images to game window at different positions
        this.ship1 = this.add.sprite(config.width/2 - 50, config.height/7, "ship");
        this.ship2 = this.add.sprite(config.width/2, config.height/3, "ship2");
        this.ship3 = this.add.sprite(config.width/2 + 100, config.height/4, "ship3");
        this.ship4 = this.add.sprite(config.width/2 + 500, config.height/5, "ship");
        this.ship5 = this.add.sprite(config.width/2 + 450, config.height/3, "ship3");
        this.ship6 = this.add.sprite(config.width/2 + 200, config.height/4, "ship2");
        this.ship7 = this.add.sprite(config.width/2 + 90, config.height/5, "ship3");
        this.ship8 = this.add.sprite(config.width/2 + 690, config.height/7, "ship");

        // bad things happen to player when ship collide with player for game
        this.enemies = this.physics.add.group();
        this.enemies.add(this.ship1);
        this.enemies.add(this.ship2);
        this.enemies.add(this.ship3);
        this.enemies.add(this.ship4);
        this.enemies.add(this.ship5);
        this.enemies.add(this.ship6);
        this.enemies.add(this.ship7);
        this.enemies.add(this.ship8);

        // resize
        this.ship1.setScale(2);
        this.ship2.setScale(2);
        this.ship3.setScale(2);
        this.ship4.setScale(2);
        this.ship5.setScale(2);
        this.ship6.setScale(2);
        this.ship7.setScale(2);
        this.ship8.setScale(2);

        // LIVES
        this.lives = 5;
        this.lifeLabel = this.add.bitmapText(370,65,"pixelFont", "LIVES", 30);
        this.liveSprite = [];

        for(var i = 0; i<this.lives; i++){
            this.liveSprite[i] = this.physics.add.sprite(440 + i*20,75,"player");
            this.liveSprite[i].alpha = .6;
        }

        // is powered up
        this.isPowered = false;
        // powerup ammo
        this.initialCount = 25;
        this.powerCountDown = 0;

        // add score text where playing game text previously was
        if(localStorage.getItem("highscore") != undefined || localStorage.getItem("highscore") != null){
            this.highScore = localStorage.getItem("highscore");
        }
        else{
            this.highScore = 0;
        }
        let highScoreFormatted = this.zeroPad(this.highScore, 6);

        this.score = 0;
        
        this.highScoreLabel = this.add.bitmapText(10,10,"pixelFont", "HISGHSCORE " + highScoreFormatted, 40);
        this.scoreLabel = this.add.bitmapText(10,65,"pixelFont", "SCORE 000000", 50);

        // powerup ammo text
        this.ammoLabel = this.add.bitmapText(370,5,"pixelFont", "SPECIAL AMMO 000000", 30);

        // enemies left in round
        this.additionalEnemies = 5;
        this.enemiesLeft = this.additionalEnemies;
        this.countLabel = this.add.bitmapText(690,5,"pixelFont", "ENEMIES LEFT "+ this.additionalEnemies, 50);

        // difficulty
        this.warpSpeed = .3;
        this.difficulty = 0;
        this.round = this.difficulty + 1;
        this.diffLabel = this.add.bitmapText(10,125,"pixelFont", "ROUND 0", 50);

        // sounds loaded. time to use them
        this.sound.allowMultiple = true;
        this.beamSound = this.sound.add("audio_beam");
        this.beamSound.allowMultiple = true;
        this.beamSound.playOnce = true;
        this.explosionSound = this.sound.add("audio_explosion");
        this.pickupSound = this.sound.add("audio_pickup");

        this.music = this.sound.add("music");

        // music time
        this.musicConfig = {
            mute: false,
            volume: .5,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0
        }
    
        // add physics group for power up objects
        this.powerUps = this.physics.add.group();
        
        // Play animations on creation of game
        this.ship1.play("ship1_anim");
        this.ship2.play("ship2_anim");
        this.ship3.play("ship3_anim");
        this.ship4.play("ship1_anim");
        this.ship5.play("ship3_anim");
        this.ship6.play("ship2_anim");
        this.ship7.play("ship3_anim");
        this.ship8.play("ship1_anim");
        
        // add player to physics and play animation for thrust
        this.player = this.physics.add.sprite(config.width/2-8,config.height-64,"player");
        this.player.setScale(2);
        this.player.play("thrust");
        // add key detection
        this.cursorKeys = this.input.keyboard.createCursorKeys();
        // player collision
        this.player.setCollideWorldBounds(true);
        // SHOOT - pew pew
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        // projectiles physics group
        this.projectiles = this.add.group();
        // physics for powerup objects
        this.physics.add.collider(this.projectiles, this.powerUps, function(projectile, powerUp){
            projectile.destroy();
        });
        // player can overlap powerup and pickup
        this.physics.add.overlap(this.player, this.powerUps, this.pickPowerUp, null, this);
        // overlap with player to enable hurt method
        this.physics.add.overlap(this.player, this.enemies, this.hurtPlayer, null, this);
        // hit enemies
        this.physics.add.overlap(this.projectiles, this.enemies, this.hitEnemy, null, this);

        this.menuRect = this.add.rectangle(config.width/2, config.height/2, config.width, config.height, 0x000000);
        this.startRect = this.add.rectangle(config.width/2, 250, 250, 50, 0x00aa00);
        this.startRect.setInteractive({
            useHandCursor: true
        });
        this.input.on('gameobjectdown',this.startGame, this);

        this.startLabel = this.add.bitmapText(390,240,"pixelFont", "CLICK HERE TO PLAY", 33);
        this.gameLabel = this.add.bitmapText(130,70,"pixelFont", "SPACE SURVIVAL GAME", 100);
        this.controllHeaderLabel = this.add.bitmapText(20,315,"pixelFont", "CONTROLS:", 45);
        this.controll1Label = this.add.bitmapText(20,490,"pixelFont", "[SPACEBAR] to shoot", 45);
        this.keys = this.add.sprite(75,412,"keys");
        this.keys.setScale(.18);
        this.controll2Label = this.add.bitmapText(140,420,"pixelFont", "to navigate", 45);
    }

    startGame(clicker, Obj){
        this.startRect.destroy();
        this.menuRect.destroy();
        this.startLabel.destroy();
        this.gameLabel.destroy();
        this.controllHeaderLabel.destroy();
        this.controll1Label.destroy();
        this.keys.destroy();
        this.controll2Label.destroy();
        this.menuOpen = false;
    }

    // pickup powerup func
    pickPowerUp(player, powerUp){
        powerUp.disableBody(true,true); 

        this.score += 50;
        let scoreFormated = this.zeroPad(this.score, 6);
        this.scoreLabel.text = "SCORE "+scoreFormated;
        
        // power up noises
        this.pickupSound.play();
        
        // reset count and set powered up to true
        this.isPowered = true;
        this.powerCountDown += this.initialCount;

        // power ammo label
        let ammoFormated = this.zeroPad(this.powerCountDown, 6);
        this.ammoLabel.text = "SPECIAL AMMO "+ammoFormated;
        
    }
    // hurt player func
    hurtPlayer(player, enemy){
        this.music.stop();
        this.explosionSound.play();
        // decrement lives
        if(this.player.active){
            this.cameras.main.shake(800);
            this.lives--;
            if(this.lives>0){
                this.liveSprite[this.lives].alpha = 0;
            }
            else if(this.lives == 0){
                if(this.score>this.highScore){
                    localStorage.setItem("highscore", this.score);
                }
                setTimeout(() => this.scene.restart(), 800);
            }
        }

        // enemy disapears after collision
        this.resetShipPos(enemy);
        // Cant hurt me if im transparent!
        if(this.player.alpha<1){
            return;
        }
        // player explodes on impact and resets
        var explosion = new Explosion(this, player.x, player.y);
        player.disableBody(true,true);
        player.active = false;
        // reset player to continue
        this.time.addEvent({
            delay: 1000,
            callback: this.resetPlayer,
            callbackScope: this,
            loop: false
        });
    }
    resetPlayer(){
        var x = config.width/2-8;
        var y = config.height+64;
        this.player.enableBody(true,x,y,true,true);
        // make transparent for user feedback
        this.player.alpha = .5;
        // add animation and fade in to tie together the death sequence of player
        var tween = this.tweens.add({
            targets: this.player,
            y: config.height-64,
            ease: 'Power1',
            duration: 1500,
            repeat: 0,
            onComplete: function(){
                this.player.alpha = 1;
            },
            callbackScope: this
        });
    }
    // get that enemy!!!
    hitEnemy(projectile, enemy){
        // explosion on destroy
        this.cameras.main.shake(40);
        var explosion = new Explosion(this, enemy.x, enemy.y);
        projectile.destroy();

        // spawn rare power up on death of enemy
        if(Math.random()>.8){
            var powerUp = this.physics.add.sprite(16,16,"power-up");
            powerUp.y = enemy.y;
            powerUp.x = enemy.x;

            //rescale
            powerUp.setScale(1.5);
            this.powerUps.add(powerUp);
            // varying powerup type
            if(Math.random()>.5){
                powerUp.play("red");
            }
            else{
                powerUp.play("gray");
            }
            // powerups move
            powerUp.setVelocity(100,100);
            // powerups collide with bounds
            powerUp.setCollideWorldBounds(true);
            // powerUps bounce when colliding
            powerUp.setBounce(1);
        }

        this.resetShipPos(enemy);
        // increment score because badguy dead
        this.score += 75;
        let scoreFormated = this.zeroPad(this.score, 6);
        this.scoreLabel.text = "SCORE "+scoreFormated;
        // BOOM
        this.explosionSound.play();
        // decrement enemy count until the next round is triggered
        this.enemiesLeft--;

        if(this.enemiesLeft == 0){
            this.difficulty++;
            this.round++;
            this.enemiesLeft = this.additionalEnemies * (this.difficulty+1);
            this.maxEnemySpeed += 1;
            this.warpSpeed += .5;

            this.diffLabel.text = "ROUND "+this.round;
        }

        // display enemies until next round
        this.countLabel.text = "ENEMIES LEFT "+ this.enemiesLeft;
    }
    // increase ships y offset to simulate velocity in game
    moveShip(ship, speed){
        ship.y += speed * (144/game.loop.actualFps);
        // check if ship is off game window
        if(ship.y > config.height){
            this.resetShipPos(ship);
        }
    }
    // bring ship to the top of game window
    resetShipPos(ship){
        ship.y = 0;
        var randX = Phaser.Math.Between(0, config.width);
        ship.x = randX;
    }

    destroyShip(pointer, gameObj){
        gameObj.setTexture("explosion");
        gameObj.play("explode");
    }
    // every update of game move ships
    update(){
        if(!this.menuOpen){
            this.moveShip(this.ship1, this.maxEnemySpeed);
            this.moveShip(this.ship2, this.maxEnemySpeed);
            this.moveShip(this.ship3, this.maxEnemySpeed);
            this.moveShip(this.ship4, this.maxEnemySpeed);
            this.moveShip(this.ship5, this.maxEnemySpeed);
            this.moveShip(this.ship6, this.maxEnemySpeed);
            this.moveShip(this.ship7, this.maxEnemySpeed);
            this.moveShip(this.ship8, this.maxEnemySpeed);
            
            // move bg tilesprite
            this.background.tilePositionY -= this.warpSpeed;
            // poll key manager
            this.movePlayerManager();
            if(this.isPowered && this.cursorKeys.space.isDown && this.player.active){
                
                var beam = new Beam(this);
                this.powerCountDown--;

                let ammoFormated = this.zeroPad(this.powerCountDown, 6);
                this.ammoLabel.text = "SPECIAL AMMO "+ammoFormated;

                if(this.powerCountDown == 0){
                    this.isPowered = false;
                    this.powerCountDown = this.initialCount;
                }
            }

            if(this.isPowered && Phaser.Input.Keyboard.JustDown(this.spacebar)){
                this.beamSound.play();
                this.music.play(this.musicConfig);
            }
            // shoot if player is active
            else if(Phaser.Input.Keyboard.JustDown(this.spacebar) && this.player.active){
                this.shootBeam();
            }
            else if(this.cursorKeys.space.isUp || !this.isPowered){
                this.music.stop();
            }

            for(var i = 0; i < this.projectiles.getChildren().length; i++){
                var beam = this.projectiles.getChildren()[i];
                beam.update;
            }
        }
    }
    // key manager func
    movePlayerManager(){
        if(this.cursorKeys.left.isDown){
            this.player.setVelocityX(-gameSettings.playerSpeed);
        }
        else if(this.cursorKeys.right.isDown){
            this.player.setVelocityX(gameSettings.playerSpeed);
        }
        // stop moving if key up
        else{
            this.player.setVelocityX(0);
        }

        if(this.cursorKeys.up.isDown){
            this.player.setVelocityY(-gameSettings.playerSpeed);
        }
        else if(this.cursorKeys.down.isDown){
            this.player.setVelocityY(gameSettings.playerSpeed);
        }
        // stop moving if key up
        else{
            this.player.setVelocityY(0);
        }
    }
    // beam shooting method for player
    shootBeam(){
        var beam = new Beam(this);
        this.beamSound.play();
        
    }
    // zero padding for score showing
    zeroPad(number, size){
        var stringNumber = String(number);
        while(stringNumber.length < (size|| 2)){
            stringNumber = "0" + stringNumber;
        }
        return stringNumber;
    }
}