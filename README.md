# JSON格式化工具 - uTools插件

一个功能强大的JSON格式化、压缩、转义工具，专为uTools设计。

## ✨ 功能特性

### 🔧 核心功能
- **JSON格式化**: 将JSON数据格式化为易读的树形结构
- **JSON压缩**: 将JSON数据压缩为单行格式
- **JSON转义**: 为JSON字符串添加转义字符
- **去除转义**: 去除JSON字符串中的转义字符
- **非标准JSON支持**: 支持单引号、注释、尾随逗号等非标准格式

### 🎯 高级功能
- **智能复制**: 根据当前模式智能复制相应内容
- **树形结构**: 交互式JSON树形显示，支持折叠展开
- **路径显示**: 显示每个节点的完整路径
- **节点复制**: 复制特定节点的JSON值
- **路径复制**: 复制节点的路径信息
- **语法高亮**: JSON语法高亮显示
- **拖拽调整**: 可拖拽调整输入输出区域宽度

## 🚀 安装使用

### 1. 安装uTools
首先确保您已安装 [uTools](https://u.tools/)

### 2. 安装插件
1. 下载插件文件
2. 在uTools中按 `Ctrl+Shift+P` 打开插件管理
3. 选择"开发者工具" → "导入插件"
4. 选择插件文件夹

### 3. 使用方法

#### 方式一：直接搜索
在uTools中输入以下关键词：
- `json格式化` - 打开JSON格式化工具
- `json压缩` - 打开JSON压缩工具
- `json转义` - 打开JSON转义工具
- `去除转义` - 打开去除转义工具

#### 方式二：选中文本后调用
1. 选中包含JSON的文本
2. 按 `Alt+Space` 呼出uTools
3. 输入相关关键词
4. 插件会自动填充选中的文本并格式化

## 📋 使用说明

### 格式化JSON
1. 在左侧输入框中粘贴JSON数据
2. 点击"格式化"按钮
3. 右侧显示格式化的JSON树形结构
4. 点击顶部"复制"按钮复制格式化后的JSON

### 压缩JSON
1. 输入JSON数据
2. 点击"压缩"按钮
3. 右侧显示压缩后的JSON
4. 点击"复制"按钮复制压缩后的JSON

### 转义处理
1. 输入需要处理的文本
2. 点击"添加转义"或"去除转义"按钮
3. 右侧显示处理后的结果
4. 点击"复制"按钮复制结果

### 智能复制功能
- **顶部复制按钮**: 根据当前输出模式智能复制相应内容
- **节点复制按钮**: 复制特定节点的JSON值
- **路径复制按钮**: 复制节点的路径信息

## ⚙️ 配置说明

### plugin.json 配置
```json
{
  "main": "index.html",
  "logo": "logo.png",
  "preload": "preload.js",
  "features": [
    {
      "code": "json-format",
      "explain": "JSON格式化工具",
      "cmds": ["json格式化", "json format", "格式化json"]
    }
  ]
}
```

### 开发模式
```json
{
  "development": {
    "main": "http://localhost:8000"
  }
}
```

## 🔧 开发说明

### 本地开发
1. 启动本地服务器：`python -m http.server 8000`
2. 修改 `plugin.json` 中的 `development.main` 为 `http://localhost:8000`
3. 在uTools中重新加载插件

### 文件结构
```
├── index.html          # 主页面
├── script.js           # 主要逻辑
├── style.css           # 样式文件
├── plugin.json         # uTools插件配置
├── preload.js          # uTools预加载脚本
├── logo.png            # 插件图标
└── README.md           # 说明文档
```

## 🎨 快捷键

- `Ctrl+Enter`: 格式化JSON
- `Ctrl+L`: 清空所有内容
- `Ctrl+C`: 复制内容（在输出区域时）

## 📝 更新日志

### v1.0.0
- ✅ JSON格式化功能
- ✅ JSON压缩功能
- ✅ JSON转义功能
- ✅ 去除转义功能
- ✅ 智能复制功能
- ✅ 树形结构显示
- ✅ 路径显示和复制
- ✅ 拖拽调整布局
- ✅ uTools插件集成

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License
