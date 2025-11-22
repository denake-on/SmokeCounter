# 吸烟计数器

一个简单的Web应用，用于追踪每日吸烟情况，具备每日自动重置功能。

## 功能特性

- 黑色背景，显示烟盒图片
- 两个可点击的烟盒，点击后计数器增加
- 自定义背景图片的确认对话框
- 每日重置功能（计数器在午夜自动清零）
- 使用localStorage进行本地存储（或后端数据库，用于部署）

## 文件结构

```
smokecount/
├── index.html          # 主HTML文件
├── style.css           # 样式文件
├── script.js           # JavaScript功能文件
├── image/              # 图片文件夹
│   ├── smoke1.png      # 烟盒图片1
│   ├── smoke2.png      # 烟盒图片2
│   ├── check1.jpg      # 确认对话框背景1
│   └── check2.jpg      # 确认对话框背景2
├── server.js           # 后端服务器（用于数据库部署）
├── package.json        # Node.js依赖文件
└── README.md           # 说明文件
```

## 使用方法

### 静态部署（无需后端）

1. 直接在浏览器中打开`index.html`
2. 点击任何一个烟盒来增加计数器
3. 计数器将在每天午夜自动重置
4. 数据存储在浏览器的localStorage中

### 后端部署（配合数据库）

1. 将`server.js`部署到Vercel、Railway或其他Node.js托管平台
2. 设置以下环境变量（二选一）：
   - Upstash Redis（设置`UPSTASH_REDIS_URL`环境变量），或
   - Neon PostgreSQL（设置`DATABASE_URL`环境变量）
3. 将`script.js`中的`backendUrl`更新为您的部署服务器URL
4. 将`script.js`中的`useBackend`设置为`true`
5. 将静态文件（`index.html`，`style.css`，`script.js`，以及图片）部署到静态托管服务（如Vercel、Netlify等）

### Upstash + Vercel 部署指南

1. **创建Upstash Redis数据库**：
   - 访问 [Upstash Console](https://console.upstash.com/)
   - 点击"Create Database"
   - 选择Region
   - 创建数据库后复制Redis URL和REST Token

2. **部署后端到Vercel**：
   - 在Vercel仪表板中点击"New Project"
   - 连接您的GitHub仓库
   - 在环境变量中添加：
     - `UPSTASH_REDIS_URL`: 您的Upstash Redis URL
     - `UPSTASH_REDIS_REST_TOKEN`: 您的Upstash REST Token
   - 部署项目，记下您的后端URL

3. **配置前端**：
   - 在`script.js`中，将`config.backendUrl`设置为您的Vercel后端URL
   - 将`config.useBackend`设置为`true`

4. **部署前端到Vercel**：
   - 在Vercel仪表板中创建新项目
   - 连接包含静态文件的仓库
   - 部署完成

### Upstash接口配置

在`script.js`中，Upstash Redis的接口函数如下：

```javascript
// 使用Upstash Redis存储数据的示例
async function saveDataToRedis(date, count) {
  try {
    const response = await fetch(`${config.backendUrl}/counter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: date,
        count: count
      })
    });
    
    if (!response.ok) {
      // 如果API失败，保存到localStorage作为备份
      localStorage.setItem(config.localStorageKey, JSON.stringify({
        date: date,
        count: count
      }));
    }
  } catch (error) {
    // 如果API失败，保存到localStorage作为备份
    localStorage.setItem(config.localStorageKey, JSON.stringify({
      date: date,
      count: count
    }));
  }
}
```

### 环境变量说明

部署后端时，设置以下环境变量：

- `UPSTASH_REDIS_URL`: 您的Upstash Redis连接URL（可选）
- `DATABASE_URL`: 您的Neon PostgreSQL连接URL（可选）
- `ADMIN_PASSWORD`: 重置端点密码（可选）

如果同时设置两者，将优先使用Redis。如果都不设置，则使用内存存储（服务器重启后数据丢失）。

## 自定义选项

- 替换`smoke1.png`和`smoke2.png`为您喜欢的烟盒图片
- 替换`check1.jpg`和`check2.jpg`为您喜欢的确认对话框背景
- 修改`style.css`调整颜色、大小和布局
- 修改`script.js`调整计数器行为

## 许可证

MIT