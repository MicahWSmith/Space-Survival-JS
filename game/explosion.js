class Explosion extends Phaser.GameObjects.Sprite{
    constructor(scene,x,y){
        super(scene,x,y,"explosion");
        scene.add.existing(this);
        this.setScale(5);
        this.play("explode");
    }
}