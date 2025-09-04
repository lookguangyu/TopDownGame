import { Scene } from 'phaser';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
    private speed: number = 400; // 子弹速度
    private lifeTime: number = 3000; // 子弹生存时间（毫秒）
    private direction: Phaser.Math.Vector2;
    private bulletType: string;
    
    constructor(scene: Scene, x: number, y: number, direction: Phaser.Math.Vector2, bulletType: string = 'bullets1') {
        console.log('=== Bullet Constructor ===');
        console.log('Requested bullet type:', bulletType);
        
        // 选择子弹纹理和帧
        let textureKey: string;
        let frameIndex: number;
        
        // 检查纹理是否存在
        const texturesExist = {
            bullets1: scene.textures.exists('bullets1'),
            bullets2: scene.textures.exists('bullets2'),
            bullets3: scene.textures.exists('bullets3')
        };
        console.log('Textures exist:', texturesExist);
        
        // 根据子弹类型选择不同的精灵表和帧
        switch(bulletType) {
            case 'bullets1':
                if (scene.textures.exists('bullets1')) {
                    textureKey = 'bullets1';
                    const frames1 = scene.textures.get('bullets1').frameTotal;
                    frameIndex = Math.floor(Math.random() * Math.max(1, frames1));
                    console.log('Using bullets1, frames available:', frames1, 'selected frame:', frameIndex);
                } else {
                    console.warn('bullets1 texture not found, falling back to default');
                    // 创建降级子弹纹理
                    if (!scene.textures.exists('bullet')) {
                        const graphics = scene.add.graphics();
                        graphics.fillStyle(0xffff00);
                        graphics.fillCircle(3, 3, 3);
                        graphics.generateTexture('bullet', 6, 6);
                        graphics.destroy();
                    }
                    textureKey = 'bullet';
                    frameIndex = 0;
                }
                break;
            case 'bullets2':
                if (scene.textures.exists('bullets2')) {
                    textureKey = 'bullets2';
                    const frames2 = scene.textures.get('bullets2').frameTotal;
                    frameIndex = Math.floor(Math.random() * Math.max(1, frames2));
                    console.log('Using bullets2, frames available:', frames2, 'selected frame:', frameIndex);
                } else {
                    console.warn('bullets2 texture not found, falling back to default');
                    // 创建降级子弹纹理
                    if (!scene.textures.exists('bullet')) {
                        const graphics = scene.add.graphics();
                        graphics.fillStyle(0xffff00);
                        graphics.fillCircle(3, 3, 3);
                        graphics.generateTexture('bullet', 6, 6);
                        graphics.destroy();
                    }
                    textureKey = 'bullet';
                    frameIndex = 0;
                }
                break;
            case 'bullets3':
                if (scene.textures.exists('bullets3')) {
                    textureKey = 'bullets3';
                    const frames3 = scene.textures.get('bullets3').frameTotal;
                    frameIndex = Math.floor(Math.random() * Math.max(1, frames3));
                    console.log('Using bullets3, frames available:', frames3, 'selected frame:', frameIndex);
                } else {
                    console.warn('bullets3 texture not found, falling back to default');
                    // 创建降级子弹纹理
                    if (!scene.textures.exists('bullet')) {
                        const graphics = scene.add.graphics();
                        graphics.fillStyle(0xffff00);
                        graphics.fillCircle(3, 3, 3);
                        graphics.generateTexture('bullet', 6, 6);
                        graphics.destroy();
                    }
                    textureKey = 'bullet';
                    frameIndex = 0;
                }
                break;
            default:
                console.log('Using default bullet type');
                // 降级到基本子弹
                if (!scene.textures.exists('bullet')) {
                    const graphics = scene.add.graphics();
                    graphics.fillStyle(0xffff00);
                    graphics.fillCircle(3, 3, 3);
                    graphics.generateTexture('bullet', 6, 6);
                    graphics.destroy();
                }
                textureKey = 'bullet';
                frameIndex = 0;
                break;
        }
        
        console.log('Final texture selection:', textureKey, 'frame:', frameIndex);
        
        // 使用选定的纹理和帧创建精灵
        super(scene, x, y, textureKey, frameIndex);
        
        this.bulletType = bulletType;
        
        this.direction = direction.clone().normalize();
        
        // 添加到场景
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 设置物理属性 - 确保物理体正确配置
        const body = this.body as Phaser.Physics.Arcade.Body;
        if (body) {
            // 根据子弹类型设置合适的碰撞体大小
            if (bulletType.startsWith('bullets')) {
                body.setSize(16, 16); // 精灵子弹使用较大的碰撞体
                body.setCircle(8); // 设置为圆形碰撞体，半径8
            } else {
                body.setSize(6, 6); // 默认子弹保持小碰撞体
                body.setCircle(3);
            }
            
            body.setBounce(0); // 不反弹
            body.setCollideWorldBounds(false); // 不与世界边界碰撞
            body.setGravityY(0); // 不受重力影响
            
            // 设置速度
            body.setVelocity(
                this.direction.x * this.speed,
                this.direction.y * this.speed
            );
            
            console.log('Bullet physics body set:', bulletType.startsWith('bullets') ? '16x16 circle(8)' : '6x6 circle(3)');
        }
        
        // 设置显示属性 - 根据子弹类型调整
        if (bulletType.startsWith('bullets')) {
            // 保持原始32x32大小，因为子弹在素材中心，周围有透明区域
            this.setDisplaySize(32, 32);
            this.setOrigin(0.5, 0.5); // 设置原点在中心
            this.setDepth(8);
            // 不设置tint，保持原始颜色
            console.log('Bullet created with type:', bulletType, 'texture:', textureKey, 'frame:', frameIndex, 'size: 32x32, origin: center');
        } else {
            this.setDisplaySize(8, 8); // 基本子弹保持原大小
            this.setOrigin(0.5, 0.5);
            this.setDepth(8);
            this.setTint(0xffff00); // 基本子弹保持黄色
            console.log('Bullet created with default type, size: 8x8');
        }
        
        // 设置生存时间
        scene.time.delayedCall(this.lifeTime, () => {
            if (this.active) {
                this.destroy();
            }
        });
        
        console.log('Bullet created at:', x, y, 'Direction:', direction.x.toFixed(2), direction.y.toFixed(2), 'Initial velocity set:', this.speed);
        
        // 额外的调试：延迟检查速度是否设置成功
        scene.time.delayedCall(50, () => {
            if (this.active && this.body) {
                const vel = (this.body as Phaser.Physics.Arcade.Body).velocity;
                console.log('Bullet velocity after 50ms:', Math.round(vel.x), Math.round(vel.y));
            }
        });
    }
    
    update(): void {
        // 检查是否已被销毁
        if (!this.active || !this.body) {
            return;
        }
        
        // 检查是否超出屏幕边界
        const camera = this.scene.cameras.main;
        const bounds = camera.getBounds();
        
        if (this.x < bounds.left - 100 || this.x > bounds.right + 100 || 
            this.y < bounds.top - 100 || this.y > bounds.bottom + 100) {
            this.destroy();
            return;
        }
        
        // 确保子弹持续移动（防止速度丢失）
        const body = this.body as Phaser.Physics.Arcade.Body;
        if (body && (Math.abs(body.velocity.x) < 10 && Math.abs(body.velocity.y) < 10)) {
            // 如果速度太小，重新设置
            body.setVelocity(
                this.direction.x * this.speed,
                this.direction.y * this.speed
            );
        }
        
        // 调试信息 - 每30帧输出一次
        if (this.scene.game.loop.frame % 30 === 0) {
            console.log('Bullet update - Pos:', Math.round(this.x), Math.round(this.y), 'Vel:', Math.round(body.velocity.x), Math.round(body.velocity.y));
        }
    }
    
    // 处理碰撞
    hitTarget(): void {
        // 这里可以添加击中特效
        console.log('Bullet hit target at:', this.x, this.y, 'Type:', this.bulletType);
        this.destroy();
    }
    
    // 获取子弹类型
    getBulletType(): string {
        return this.bulletType;
    }
}
