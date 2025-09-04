/**
 * 游戏配置管理器
 * Game Configuration Manager
 */

export interface PlayerConfig {
    moveSpeed: number;
    health: number;
    maxHealth: number;
    invulnerabilityDuration: number;
    knockbackForce: { x: number; y: number };
    collisionSize: { width: number; height: number; offsetX: number; offsetY: number };
}

export interface BulletConfig {
    speed: number;
    lifetime: number;
    poolSize: number;
    maxPoolSize: number;
    defaultType: string;
}

export interface EnemySpawnConfig {
    spawnInterval: number;
    maxEnemies: number;
    spawnDistance: number;
    initialEnemyCount: number;
    enemyWeights: Array<{ type: string; weight: number }>;
}

export interface EnemyStatsConfig {
    [key: string]: {
        moveSpeed: number;
        health: number;
        damage: number;
        scale: number;
        trackingDistance: number;
        speedBoostDistance: number;
        speedBoostMultiplier: number;
    };
}

export interface UIConfig {
    healthUI: { x: number; y: number };
    scoreUI: { x: number; y: number; fontSize: string };
    weaponUI: { x: number; y: number; fontSize: string };
    instructionUI: { x: number; y: number; fontSize: string };
    colors: {
        text: string;
        stroke: string;
        weaponText: string;
    };
    strokeThickness: number;
    depth: number;
}

export interface PhysicsConfig {
    gravity: { x: number; y: number };
    bounce: number;
    debug: boolean;
}

export interface CameraConfig {
    lerp: { x: number; y: number };
    fadeOutDuration: number;
    fadeInDuration: number;
}

export interface GameConfiguration {
    player: PlayerConfig;
    bullet: BulletConfig;
    enemySpawn: EnemySpawnConfig;
    enemyStats: EnemyStatsConfig;
    ui: UIConfig;
    physics: PhysicsConfig;
    camera: CameraConfig;
    debug: {
        enableLogging: boolean;
        showBulletDebug: boolean;
        showCollisionBounds: boolean;
        logFrameRate: boolean;
    };
}

export class GameConfig {
    private static instance: GameConfig;
    private config: GameConfiguration;
    
    private constructor() {
        this.config = this.createDefaultConfig();
    }
    
    static getInstance(): GameConfig {
        if (!GameConfig.instance) {
            GameConfig.instance = new GameConfig();
        }
        return GameConfig.instance;
    }
    
    private createDefaultConfig(): GameConfiguration {
        return {
            player: {
                moveSpeed: 150,
                health: 3,
                maxHealth: 3,
                invulnerabilityDuration: 800,
                knockbackForce: { x: 200, y: -100 },
                collisionSize: { width: 0.7, height: 0.7, offsetX: 0.15, offsetY: 0.15 }
            },
            bullet: {
                speed: 400,
                lifetime: 3000,
                poolSize: 20,
                maxPoolSize: 50,
                defaultType: 'bullets1'
            },
            enemySpawn: {
                spawnInterval: 1500,
                maxEnemies: 15,
                spawnDistance: 400,
                initialEnemyCount: 3,
                enemyWeights: [
                    { type: 'slime', weight: 50 },
                    { type: 'flying_creature', weight: 30 },
                    { type: 'goblin', weight: 20 }
                ]
            },
            enemyStats: {
                flying_creature: {
                    moveSpeed: 120,
                    health: 2,
                    damage: 1,
                    scale: 3.0,
                    trackingDistance: 1000,
                    speedBoostDistance: 200,
                    speedBoostMultiplier: 1.2
                },
                goblin: {
                    moveSpeed: 140,
                    health: 3,
                    damage: 2,
                    scale: 3.0,
                    trackingDistance: 1000,
                    speedBoostDistance: 200,
                    speedBoostMultiplier: 1.2
                },
                slime: {
                    moveSpeed: 100,
                    health: 1,
                    damage: 1,
                    scale: 3.0,
                    trackingDistance: 1000,
                    speedBoostDistance: 200,
                    speedBoostMultiplier: 1.2
                }
            },
            ui: {
                healthUI: { x: 50, y: 50 },
                scoreUI: { x: 50, y: 100, fontSize: '24px' },
                weaponUI: { x: 50, y: 160, fontSize: '18px' },
                instructionUI: { x: 50, y: 130, fontSize: '18px' },
                colors: {
                    text: '#ffffff',
                    stroke: '#000000',
                    weaponText: '#ffff00'
                },
                strokeThickness: 4,
                depth: 1000
            },
            physics: {
                gravity: { x: 0, y: 0 },
                bounce: 0.1,
                debug: false
            },
            camera: {
                lerp: { x: 0.1, y: 0.1 },
                fadeOutDuration: 250,
                fadeInDuration: 500
            },
            debug: {
                enableLogging: false, // 默认关闭调试日志
                showBulletDebug: false,
                showCollisionBounds: false,
                logFrameRate: false
            }
        };
    }
    
    // Getter methods for easy access
    getPlayerConfig(): PlayerConfig {
        return this.config.player;
    }
    
    getBulletConfig(): BulletConfig {
        return this.config.bullet;
    }
    
    getEnemySpawnConfig(): EnemySpawnConfig {
        return this.config.enemySpawn;
    }
    
    getEnemyStatsConfig(): EnemyStatsConfig {
        return this.config.enemyStats;
    }
    
    getUIConfig(): UIConfig {
        return this.config.ui;
    }
    
    getPhysicsConfig(): PhysicsConfig {
        return this.config.physics;
    }
    
    getCameraConfig(): CameraConfig {
        return this.config.camera;
    }
    
    getDebugConfig() {
        return this.config.debug;
    }
    
    // Update methods
    updatePlayerConfig(updates: Partial<PlayerConfig>): void {
        this.config.player = { ...this.config.player, ...updates };
    }
    
    updateBulletConfig(updates: Partial<BulletConfig>): void {
        this.config.bullet = { ...this.config.bullet, ...updates };
    }
    
    updateEnemySpawnConfig(updates: Partial<EnemySpawnConfig>): void {
        this.config.enemySpawn = { ...this.config.enemySpawn, ...updates };
    }
    
    updateDebugConfig(updates: Partial<typeof this.config.debug>): void {
        this.config.debug = { ...this.config.debug, ...updates };
    }
    
    // Get entire config
    getFullConfig(): GameConfiguration {
        return this.config;
    }
    
    // Load config from external source (future enhancement)
    loadConfig(externalConfig: Partial<GameConfiguration>): void {
        this.config = { ...this.config, ...externalConfig };
    }
    
    // Export config for saving
    exportConfig(): string {
        return JSON.stringify(this.config, null, 2);
    }
    
    // Import config from JSON
    importConfig(jsonConfig: string): void {
        try {
            const importedConfig = JSON.parse(jsonConfig);
            this.config = { ...this.config, ...importedConfig };
        } catch (error) {
            console.error('Failed to import config:', error);
        }
    }
}
