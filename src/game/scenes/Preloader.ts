import { Scene } from 'phaser';
import { AnimationManager } from '../managers/AnimationManager';

export class Preloader extends Scene
{
    private animationManager: AnimationManager;
    
    constructor ()
    {
        super('Preloader');
        this.animationManager = AnimationManager.getInstance();
        this.animationManager.initialize(this);
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.image('logo', 'assets/logo.png');
        
        // 加载自定义鼠标光标
        this.load.image('crosshair', 'assets/crosshair_1.png');
        
        // Load tilemap JSON
        this.load.tilemapTiledJSON('tilemap', 'assets/tilemap/scenes/tilemap.json');

        // Download tilemap.
        this.load.text('tilemap_json_raw', 'assets/tilemap/scenes/tilemap.json');
        
        // 骑士资源将通过 tilemap.json 配置自动加载（firstgid: 3, atlas: true）
        
        // 加载各种武器atlas（手枪、步枪、霰弹枪）
        this.loadWeaponAtlases();
        
        // 加载子弹精灵表 - 3种不同的子弹样式
        
        // Bullets 1: 288x32 = 9帧 32x32 
        this.load.spritesheet('bullets1', 'assets/bullets1.png', { 
            frameWidth: 32, 
            frameHeight: 32 
        });
        
        // Bullets 2: 320x32 = 10帧 32x32
        this.load.spritesheet('bullets2', 'assets/bullets2.png', { 
            frameWidth: 32, 
            frameHeight: 32 
        });
        
        // Bullets 3: 800x32 = 25帧 32x32  
        this.load.spritesheet('bullets3', 'assets/bullets3.png', { 
            frameWidth: 32, 
            frameHeight: 32 
        });
        
        // 子弹资源加载监听器已移除以减少日志输出
        
        // 加载敌人atlas
        this.load.atlas('flying_creature', 'assets/enemy/fly.png', 'assets/enemy/fly.json');
        
        this.load.atlas('goblin', 'assets/enemy/goblin.png', 'assets/enemy/goblin.json');
        
        this.load.atlas('slime', 'assets/enemy/slime.png', 'assets/enemy/slime.json');
        
        // 地刺将通过 tilemap.json 配置自动加载（atlas: true）
        
        // Listen for text file loading completion, then load other resources during preload phase
        this.load.once('filecomplete-text-tilemap_json_raw', () => {
            this.loadAllAssets();
        });
    }

    private loadAllAssets() {
        // parse raw tilemap json.
        let tilemapJsonRaw = this.cache.text.get('tilemap_json_raw');
        let tilemapJsonObj = null;
        try {
            tilemapJsonObj = JSON.parse(tilemapJsonRaw);
        } catch (e) {
            console.error('Failed to parse tilemap_json_raw:', e);
        }

        let tilesets = tilemapJsonObj["tilesets"];
        if (!tilesets) {
            return;
        }

        tilesets.forEach((tileset: any) => {
            let isAtlas = false;

            let tiles = tileset["tiles"];
            if (tiles && tiles.length && tiles.length > 0) {
                let properties = tiles[0]["properties"];
                if (properties && properties.length && properties.length > 0) {
                    properties.forEach((property: any) => {
                        if (property.name === "atlas" && property.value === true) {
                            isAtlas = true;
                        }
                    })
                }
            }
            
            let imageUri = tileset["image"] as string;
            if (!imageUri) {
                return;
            }
            
            let name = tileset["name"] as string;
            if (!name) {
                return;
            }

            if (isAtlas) {
                // Replace the file extension of imageUri with .json
                let atlasJsonUri = imageUri.replace(/(\.[^/.]+)$/, '.json');
                this.load.atlas(name, imageUri, atlasJsonUri);
                
                // Load animation configuration if it exists
                let animationConfigUri = imageUri.replace(/(\.[^/.]+)$/, '_animators.json');
                this.load.json(`${name}_animations`, animationConfigUri);
            } else {
                this.load.image(name, imageUri);
            }
        })
    }

    private loadWeaponAtlases(): void {
        // 手枪 (25种)
        for (let i = 1; i <= 25; i++) {
            const weaponId = i.toString().padStart(2, '0');
            const weaponName = `pistol_${weaponId}`;
            this.load.atlas(weaponName, `assets/weapon/${weaponName}.png`, `assets/weapon/${weaponName}.json`);
        }
        
        // 步枪 (11种)
        for (let i = 1; i <= 11; i++) {
            const weaponId = i.toString().padStart(2, '0');
            const weaponName = `rifle_${weaponId}`;
            this.load.atlas(weaponName, `assets/weapon/${weaponName}.png`, `assets/weapon/${weaponName}.json`);
        }
        
        // 霰弹枪 (12种)
        for (let i = 1; i <= 12; i++) {
            const weaponId = i.toString().padStart(2, '0');
            const weaponName = `shotgun_${weaponId}`;
            this.load.atlas(weaponName, `assets/weapon/${weaponName}.png`, `assets/weapon/${weaponName}.json`);
        }
        
        // 48个武器atlas加载完成
    }

    create ()
    {
        // Initialize AnimationManager with this scene
        // 注意：AnimationManager 已在构造函数中初始化
        
        // 子弹资源验证已移除以减少日志输出
        
        // 创建骑士动画
        this.createKnightAnimations();
        
        // 创建武器动画
        this.createWeaponAnimations();
        
        // 创建敌人动画
        this.createEnemyAnimations();
        
        // 创建地刺动画

        
        // Process all loaded animation configurations
        this.processAnimationConfigs();
        
        // Create all animations
        this.animationManager.createAllAnimations();
        
        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
    
    private createKnightAnimations(): void {
        // 创建骑士待机动画（使用atlas格式）
        this.anims.create({
            key: 'knight_idle',
            frames: this.anims.generateFrameNames('knight', { 
                prefix: 'idle/frame', 
                start: 0, 
                end: 3,
                zeroPad: 4 
            }),
            frameRate: 8,
            repeat: -1
        });
        
        // 创建骑士跑步动画（使用atlas格式）
        this.anims.create({
            key: 'knight_run',
            frames: this.anims.generateFrameNames('knight', { 
                prefix: 'walk/frame', 
                start: 0, 
                end: 3,
                zeroPad: 4 
            }),
            frameRate: 10,
            repeat: -1
        });
    }
    
    private createWeaponAnimations(): void {
        // 为所有武器创建动画（基于atlas格式）
        this.createWeaponAnimationsForType('pistol', 25);
        this.createWeaponAnimationsForType('rifle', 11);
        this.createWeaponAnimationsForType('shotgun', 12);
        
        // 48种武器动画创建完成
    }
    
    private createWeaponAnimationsForType(weaponType: string, count: number): void {
        for (let i = 1; i <= count; i++) {
            const weaponId = i.toString().padStart(2, '0');
            const weaponName = `${weaponType}_${weaponId}`;
            
            // 创建待机动画
            this.anims.create({
                key: `${weaponName}_idle`,
                frames: this.anims.generateFrameNames(weaponName, { 
                    prefix: 'idle/frame', 
                    start: 0, 
                    end: 0,
                    zeroPad: 4 
                }),
                frameRate: 1,
                repeat: 0
            });
            
            // 创建激活/射击动画
            this.anims.create({
                key: `${weaponName}_active`,
                frames: this.anims.generateFrameNames(weaponName, { 
                    prefix: 'active/frame', 
                    start: 0, 
                    end: 1,
                    zeroPad: 4 
                }),
                frameRate: 12,
                repeat: 0
            });
            
            // 创建禁用动画
            this.anims.create({
                key: `${weaponName}_disabled`,
                frames: this.anims.generateFrameNames(weaponName, { 
                    prefix: 'disabled/frame', 
                    start: 0, 
                    end: 0,
                    zeroPad: 4 
                }),
                frameRate: 1,
                repeat: 0
            });
        }
    }
    
    private createEnemyAnimations(): void {
        // 飞行生物动画（使用atlas格式）
        this.anims.create({
            key: 'flying_creature_move',
            frames: this.anims.generateFrameNames('flying_creature', { 
                prefix: 'idle/frame', 
                start: 0, 
                end: 3,
                zeroPad: 4 
            }),
            frameRate: 8,
            repeat: -1
        });
        
        // 哥布林动画（使用atlas格式）
        this.anims.create({
            key: 'goblin_move',
            frames: this.anims.generateFrameNames('goblin', { 
                prefix: 'walk/frame', 
                start: 0, 
                end: 3,
                zeroPad: 4 
            }),
            frameRate: 8,
            repeat: -1
        });
        
        // 史莱姆动画（使用atlas格式）
        this.anims.create({
            key: 'slime_move',
            frames: this.anims.generateFrameNames('slime', { 
                prefix: 'walk/frame', 
                start: 0, 
                end: 3,
                zeroPad: 4 
            }),
            frameRate: 6,
            repeat: -1
        });
    }
    

    
    private processAnimationConfigs(): void {
        // Get all loaded atlas names from cache
        const textureKeys = this.textures.getTextureKeys();
        
        for (const key of textureKeys) {
            // Check if this is an atlas (has frames)
            const texture = this.textures.get(key);
            
            if (texture && texture.frameTotal > 1) {
                // Check if we have animation config for this atlas
                const animConfigKey = `${key}_animations`;
                
                if (this.cache.json.exists(animConfigKey)) {
                    const animConfig = this.cache.json.get(animConfigKey);
                    
                    if (animConfig) {
                        // Load using legacy format
                        this.animationManager.loadLegacyAnimationConfig(animConfig);
                    }
                }
            }
        }
    }
}
