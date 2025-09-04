import { SingletonManager } from '../core/BaseManager';

export interface GameSettings {
    // Display settings
    display: {
        width: number;
        height: number;
        fullscreen: boolean;
        scale: number;
    };
    
    // Audio settings
    audio: {
        masterVolume: number;
        musicVolume: number;
        sfxVolume: number;
        muted: boolean;
    };
    
    // Gameplay settings
    gameplay: {
        difficulty: 'easy' | 'normal' | 'hard';
        showFPS: boolean;
        showHitboxes: boolean;
        autoSave: boolean;
    };
    
    // Controls settings
    controls: {
        keyboard: Record<string, string>;
        mouse: {
            sensitivity: number;
            invertY: boolean;
        };
    };
    
    // Performance settings
    performance: {
        particleQuality: 'low' | 'medium' | 'high';
        animationQuality: 'low' | 'medium' | 'high';
        maxEnemies: number;
        maxBullets: number;
    };
}

export interface GameConstants {
    // Physics constants
    physics: {
        gravity: { x: number; y: number };
        worldBounds: { width: number; height: number };
        playerSpeed: number;
        jumpPower: number;
    };
    
    // Combat constants
    combat: {
        baseDamage: number;
        criticalMultiplier: number;
        invulnerabilityTime: number;
    };
    
    // Economy constants
    economy: {
        baseScore: number;
        timeMultiplier: number;
        killMultiplier: number;
        comboBonus: number;
    };
    
    // Enemy constants
    enemies: {
        spawnRate: number;
        maxCount: number;
        difficultyScaling: number;
        speedMultiplier: number;
    };
    
    // UI constants
    ui: {
        animationDuration: number;
        fadeSpeed: number;
        colors: Record<string, string>;
        fonts: Record<string, string>;
    };
}

/**
 * ConfigManager - Centralized configuration management
 * 
 * Manages:
 * - Game settings (user preferences)
 * - Game constants (game balance)
 * - Configuration persistence
 * - Environment-specific configs
 */
export class ConfigManager extends SingletonManager {
    private settings: GameSettings;
    private constants: GameConstants;
    private environment: 'development' | 'production' | 'test' = 'development';
    
    constructor() {
        super();
        this.settings = this.getDefaultSettings();
        this.constants = this.getDefaultConstants();
    }
    
    protected onInitialize(): void {
        // Detect environment
        this.environment = this.detectEnvironment();
        
        // Load saved settings
        this.loadSettings();
        
        // Apply environment-specific overrides
        this.applyEnvironmentOverrides();
    }
    
    /**
     * Get default game settings
     */
    private getDefaultSettings(): GameSettings {
        return {
            display: {
                width: 1024,
                height: 768,
                fullscreen: false,
                scale: 1.0
            },
            audio: {
                masterVolume: 1.0,
                musicVolume: 0.7,
                sfxVolume: 0.8,
                muted: false
            },
            gameplay: {
                difficulty: 'normal',
                showFPS: false,
                showHitboxes: false,
                autoSave: true
            },
            controls: {
                keyboard: {
                    moveLeft: 'A',
                    moveRight: 'D',
                    moveUp: 'W',
                    moveDown: 'S',
                    shoot: 'SPACE',
                    switchWeapon: 'E',
                    pause: 'ESC'
                },
                mouse: {
                    sensitivity: 1.0,
                    invertY: false
                }
            },
            performance: {
                particleQuality: 'medium',
                animationQuality: 'medium',
                maxEnemies: 15,
                maxBullets: 50
            }
        };
    }
    
    /**
     * Get default game constants
     */
    private getDefaultConstants(): GameConstants {
        return {
            physics: {
                gravity: { x: 0, y: 0 },
                worldBounds: { width: 1024, height: 768 },
                playerSpeed: 200,
                jumpPower: 500
            },
            combat: {
                baseDamage: 1,
                criticalMultiplier: 2.0,
                invulnerabilityTime: 1000
            },
            economy: {
                baseScore: 10,
                timeMultiplier: 1.0,
                killMultiplier: 10,
                comboBonus: 1.5
            },
            enemies: {
                spawnRate: 1500,
                maxCount: 15,
                difficultyScaling: 0.1,
                speedMultiplier: 1.0
            },
            ui: {
                animationDuration: 300,
                fadeSpeed: 1000,
                colors: {
                    primary: '#FFFFFF',
                    secondary: '#FFD700',
                    danger: '#FF0000',
                    success: '#00FF00',
                    warning: '#FFA500'
                },
                fonts: {
                    primary: 'Arial Black',
                    secondary: 'Arial',
                    monospace: 'Courier New'
                }
            }
        };
    }
    
    /**
     * Detect current environment
     */
    private detectEnvironment(): 'development' | 'production' | 'test' {
        if (typeof window !== 'undefined') {
            if (window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1') {
                return 'development';
            }
        }
        
        // Check for Node.js environment
        if (typeof process !== 'undefined' && process.env) {
            if (process.env.NODE_ENV === 'test') {
                return 'test';
            }
            if (process.env.NODE_ENV === 'development') {
                return 'development';
            }
        }
        
        return 'production';
    }
    
    /**
     * Apply environment-specific overrides
     */
    private applyEnvironmentOverrides(): void {
        switch (this.environment) {
            case 'development':
                this.settings.gameplay.showFPS = true;
                this.constants.enemies.spawnRate *= 0.5; // Faster spawning for testing
                break;
                
            case 'test':
                this.settings.audio.muted = true;
                this.constants.ui.animationDuration = 0; // Skip animations in tests
                break;
                
            case 'production':
                this.settings.performance.particleQuality = 'high';
                this.settings.performance.animationQuality = 'high';
                break;
        }
    }
    
    /**
     * Load settings from localStorage
     */
    private loadSettings(): void {
        try {
            const savedSettings = localStorage.getItem('gameSettings');
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                this.settings = this.mergeDeep(this.settings, parsed);
            }
        } catch (error) {
            console.warn('Failed to load settings from localStorage:', error);
        }
    }
    
    /**
     * Save settings to localStorage
     */
    public saveSettings(): void {
        try {
            localStorage.setItem('gameSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save settings to localStorage:', error);
        }
    }
    
    /**
     * Deep merge objects
     */
    private mergeDeep(target: any, source: any): any {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.mergeDeep(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }
    
    // Settings getters/setters
    public getSettings(): GameSettings {
        return { ...this.settings };
    }
    
    public getSetting<K extends keyof GameSettings>(category: K): GameSettings[K] {
        return { ...this.settings[category] };
    }
    
    public updateSetting<K extends keyof GameSettings>(
        category: K, 
        updates: Partial<GameSettings[K]>
    ): void {
        this.settings[category] = { ...this.settings[category], ...updates };
        this.saveSettings();
    }
    
    // Constants getters
    public getConstants(): GameConstants {
        return { ...this.constants };
    }
    
    public getConstant<K extends keyof GameConstants>(category: K): GameConstants[K] {
        return { ...this.constants[category] };
    }
    
    // Convenience getters
    public getDisplaySize(): { width: number; height: number } {
        return {
            width: this.settings.display.width,
            height: this.settings.display.height
        };
    }
    
    public getVolume(type: 'master' | 'music' | 'sfx' = 'master'): number {
        if (this.settings.audio.muted) {
            return 0;
        }
        
        const master = this.settings.audio.masterVolume;
        
        switch (type) {
            case 'music':
                return master * this.settings.audio.musicVolume;
            case 'sfx':
                return master * this.settings.audio.sfxVolume;
            default:
                return master;
        }
    }
    
    public getDifficulty(): 'easy' | 'normal' | 'hard' {
        return this.settings.gameplay.difficulty;
    }
    
    public getEnvironment(): string {
        return this.environment;
    }
    
    public isDevelopment(): boolean {
        return this.environment === 'development';
    }
    
    public isProduction(): boolean {
        return this.environment === 'production';
    }
    
    // Debug methods
    public exportSettings(): string {
        return JSON.stringify(this.settings, null, 2);
    }
    
    public importSettings(settingsJson: string): void {
        try {
            const imported = JSON.parse(settingsJson);
            this.settings = this.mergeDeep(this.getDefaultSettings(), imported);
            this.saveSettings();
        } catch (error) {
            console.error('Failed to import settings:', error);
        }
    }
    
    public resetSettings(): void {
        this.settings = this.getDefaultSettings();
        this.saveSettings();
    }
}
