window.onload = function(){
    // game settings obj
    var gameSettings = {
        playerSpeed: 350,
    }
    // game configuration object
    var config = {
        type: Phaser.AUTO,
        width: 1000,
        height: 544,
        backgroundColor: 0x000000,
        pixelArt: true,
        scene: [Scene1, Scene2],
        physics: {
            default: "arcade",
            arcade:{
                debug: false
            }
        }
    }

    // phaser game instance var
    var game = new Phaser.Game(config);
    window.config = config;
    window.game = game;
    window.gameSettings = gameSettings;
}