# 架构清理计划

## 🎯 目标
解决从2D平台游戏到2D顶视角游戏转换过程中的架构混乱问题

## 🔍 发现的问题

### 1. 敌人系统并存
- **Enemy.ts (旧)**: 平台游戏设计，有重力、巡逻、跳跃
- **BattleEnemy.ts (新)**: 顶视角设计，全方向移动

### 2. 缩放标准混乱
```
瓦片: 16x16 → 4倍缩放 → 64x64
旧敌人: 16x16 → 无统一缩放 → 混乱
新敌人: 16x16 → 3倍缩放 → 48x48  
武器: 32x32 → 2倍缩放 → 64x64
玩家: 16x16 → 动态计算 → 不一致
```

### 3. 重力系统冲突
- 全局重力设为 {x:0, y:0}
- 旧敌人仍使用 setGravityY(800)
- 新敌人需要抵消重力 setGravityY(-300)

## 🛠️ 清理步骤

### 第一阶段：统一配置系统
1. ✅ 扩展 ConfigManager 添加统一缩放标准
2. ✅ 定义标准游戏元素尺寸和缩放
3. ✅ 创建游戏元素标准化接口

### 第二阶段：敌人系统重构
1. 🔄 废弃 Enemy.ts（平台游戏遗留）
2. 🔄 统一使用 BattleEnemy.ts
3. 🔄 更新 Game.ts 中的敌人创建逻辑
4. 🔄 移除 tilemap 敌人创建代码

### 第三阶段：清理重力系统
1. 🔄 移除所有 setGravityY 调用
2. 🔄 清理重力相关的物理配置
3. 🔄 确保所有sprite都是顶视角行为

### 第四阶段：统一缩放标准
1. 🔄 统一所有游戏元素使用配置中的缩放
2. 🔄 清理硬编码的缩放值
3. 🔄 确保视觉一致性

## 📋 文件影响列表

### 需要重构的文件
- ❌ `/sprites/Enemy.ts` - 废弃
- 🔄 `/sprites/BattleEnemy.ts` - 使用统一配置
- 🔄 `/scenes/Game.ts` - 移除tilemap敌人逻辑
- 🔄 `/config/ConfigManager.ts` - 添加统一标准

### 需要清理的文件
- 🔄 `/sprites/Player.ts` - 统一缩放配置
- 🔄 `/sprites/Weapon.ts` - 统一缩放配置
- 🔄 `/sprites/Bullet.ts` - 移除重力相关代码
- 🔄 `/sprites/OptimizedBullet.ts` - 移除重力相关代码

## 🎯 预期结果

### 统一的游戏元素标准
```typescript
// 标准尺寸配置
STANDARD_SIZES = {
  TILE: { base: 16, scale: 4, final: 64 },
  ENEMY: { base: 16, scale: 4, final: 64 },  // 统一为64x64
  WEAPON: { base: 32, scale: 2, final: 64 }, // 统一为64x64  
  PLAYER: { base: 16, scale: 4, final: 64 }, // 统一为64x64
  BULLET: { base: 8, scale: 2, final: 16 }   // 小型子弹
}
```

### 清洁的架构
- ✅ 单一的敌人系统（BattleEnemy）
- ✅ 统一的缩放配置
- ✅ 无重力系统冲突
- ✅ 一致的视觉标准

## ⚠️ 注意事项
1. 备份现有配置
2. 逐步替换，确保游戏可运行
3. 测试所有游戏元素的视觉一致性
4. 确保碰撞检测仍然正确
