class Beam extends Phaser.GameObjects.Sprite{
    constructor(scene){
        // properties of beam obj
        
        var x = scene.player.x;
        var y = scene.player.y;

        super(scene, x, y, "beam");
        // add projectiles to scene's group
        scene.add.existing(this);

        this.play("beam_anim");
        scene.physics.world.enableBody(this);
        this.body.velocity.y = - 600;
        this.setScale(1.5);
        scene.projectiles.add(this);
    }
    update(){
        if(this.y < 32){
            this.destroy();
        }
    }
}