// JSON格式化工具 - 主要功能实现
class JSONFormatter {
    constructor() {
        this.initElements();
        this.bindEvents();
        this.initResizer();
        this.updateLineNumbers();
        this.initLayout();
        this.initUToolsListener(); // 初始化uTools消息监听器
    }

    // 初始化uTools消息监听器
    initUToolsListener() {
        window.addEventListener('message', (event) => {
            if (event.data.type === 'setInput') {
                // 设置输入框内容
                this.inputArea.value = event.data.data;
                this.updateInputLineNumbers();
                
                // 自动格式化
                setTimeout(() => {
                    this.formatJSON();
                }, 100);
            }
        });
    }

    // 初始化DOM元素
    initElements() {
        this.inputArea = document.getElementById('inputArea');
        this.outputArea = document.getElementById('outputArea');
        this.inputLineNumbers = document.getElementById('inputLineNumbers');
        this.outputLineNumbers = document.getElementById('outputLineNumbers');
        this.formatBtn = document.getElementById('formatBtn');
        this.compressBtn = document.getElementById('compressBtn');
        this.unescapeBtn = document.getElementById('unescapeBtn');
        this.escapeBtn = document.getElementById('escapeBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.copyBtn = document.getElementById('copyBtn'); // 新增复制按钮

        this.resizer = document.getElementById('resizer');
    }

    // 初始化布局
    initLayout() {
        const containerWidth = window.innerWidth - 40;
        const inputWidth = containerWidth * 0.5;
        const outputWidth = containerWidth * 0.5 - 4;
        
        this.inputArea.parentElement.parentElement.style.flex = `0 0 ${inputWidth}px`;
        this.inputArea.parentElement.parentElement.style.width = `${inputWidth}px`;
        
        this.outputArea.parentElement.parentElement.style.flex = `0 0 ${outputWidth}px`;
        this.outputArea.parentElement.parentElement.style.width = `${outputWidth}px`;
    }

    // 初始化拖拽调整器
    initResizer() {
        let isResizing = false;
        let startX;
        let startWidth;

        this.resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startWidth = this.inputArea.parentElement.parentElement.offsetWidth;
            document.body.style.cursor = 'col-resize';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            const deltaX = e.clientX - startX;
            const containerWidth = window.innerWidth - 80; // 减去padding和margin
            const minWidth = containerWidth * 0.3; // 最小宽度为容器的30%
            const maxWidth = containerWidth * 0.7; // 最大宽度为容器的70%
            const newWidth = Math.max(minWidth, Math.min(startWidth + deltaX, maxWidth));
            
            this.inputArea.parentElement.parentElement.style.flex = `0 0 ${newWidth}px`;
            this.outputArea.parentElement.parentElement.style.flex = `1 1 auto`;
        });

        document.addEventListener('mouseup', () => {
            isResizing = false;
            document.body.style.cursor = '';
        });
    }

    // 更新行号
    updateLineNumbers() {
        this.updateInputLineNumbers();
        this.updateOutputLineNumbers();
    }

    // 更新输入区域行号
    updateInputLineNumbers() {
        const lines = this.inputArea.value.split('\n');
        this.inputLineNumbers.innerHTML = lines.map((_, index) => 
            `<div class="line-number">${index + 1}</div>`
        ).join('');
    }

    // 更新输出区域行号
    updateOutputLineNumbers() {
        // 对于树形结构，计算实际显示的行数
        const jsonNodes = this.outputArea.querySelectorAll('.json-node');
        const lines = Array.from(jsonNodes).map((_, index) => index + 1);
        this.outputLineNumbers.innerHTML = lines.map(index => 
            `<div class="line-number">${index}</div>`
        ).join('');
    }

    // 绑定事件
    bindEvents() {
        this.formatBtn.addEventListener('click', () => this.formatJSON());
        this.compressBtn.addEventListener('click', () => this.compressJSON());
        this.unescapeBtn.addEventListener('click', () => this.unescapeJSON());
        this.escapeBtn.addEventListener('click', () => this.escapeJSON());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        this.copyBtn.addEventListener('click', () => this.copyOutput());
        
        // 输入框变化时自动更新行号
        this.inputArea.addEventListener('input', () => {
            this.updateInputLineNumbers();
        });

        // 同步滚动
        this.inputArea.addEventListener('scroll', () => {
            this.inputLineNumbers.scrollTop = this.inputArea.scrollTop;
        });

        this.outputArea.addEventListener('scroll', () => {
            this.outputLineNumbers.scrollTop = this.outputArea.scrollTop;
        });

        // 窗口大小变化时重新调整布局
        window.addEventListener('resize', () => {
            this.initLayout();
        });
    }

    // 显示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    // 格式化JSON
    formatJSON() {
        try {
            const input = this.inputArea.value.trim();
            if (!input) {
                this.showNotification('请输入JSON数据', 'error');
                return;
            }

            // 尝试解析JSON
            let parsed;
            try {
                parsed = JSON.parse(input);
            } catch (e) {
                // 如果不是标准JSON，尝试处理非标准格式
                parsed = this.parseNonStandardJSON(input);
            }

            // 格式化输出
            const formatted = JSON.stringify(parsed, null, 2);
            this.renderJSONTree(parsed);
            this.updateOutputLineNumbers();
            this.showNotification('JSON格式化成功', 'success');
            
        } catch (error) {
            this.outputArea.innerHTML = `<span class="error">格式化失败: ${error.message}</span>`;
            this.updateOutputLineNumbers();
            this.showNotification('JSON格式化失败', 'error');
        }
    }

    // 压缩JSON
    compressJSON() {
        try {
            const input = this.inputArea.value.trim();
            if (!input) {
                this.showNotification('请输入JSON数据', 'error');
                return;
            }

            let parsed;
            try {
                parsed = JSON.parse(input);
            } catch (e) {
                parsed = this.parseNonStandardJSON(input);
            }

            const compressed = JSON.stringify(parsed);
            this.outputArea.innerHTML = `<pre>${this.highlightJSON(compressed)}</pre>`;
            this.outputArea.className = 'output-area';
            this.updateOutputLineNumbers();
            this.showNotification('JSON压缩成功', 'success');
            
        } catch (error) {
            this.outputArea.innerHTML = `<span class="error">压缩失败: ${error.message}</span>`;
            this.outputArea.className = 'output-area';
            this.updateOutputLineNumbers();
            this.showNotification('JSON压缩失败', 'error');
        }
    }

    // 去除转义
    unescapeJSON() {
        try {
            const input = this.inputArea.value.trim();
            if (!input) {
                this.showNotification('请输入JSON数据', 'error');
                return;
            }

            // 去除转义字符
            let unescaped = input
                .replace(/\\"/g, '"')
                .replace(/\\n/g, '\n')
                .replace(/\\t/g, '\t')
                .replace(/\\r/g, '\r')
                .replace(/\\\\/g, '\\');

            // 尝试格式化
            try {
                const parsed = JSON.parse(unescaped);
                unescaped = JSON.stringify(parsed, null, 2);
            } catch (e) {
                // 如果解析失败，保持原样
            }

            this.outputArea.innerHTML = this.highlightJSON(unescaped);
            this.outputArea.className = 'output-area';
            this.updateOutputLineNumbers();
            this.showNotification('转义去除成功', 'success');
            
        } catch (error) {
            this.outputArea.innerHTML = `<span class="error">处理失败: ${error.message}</span>`;
            this.outputArea.className = 'output-area';
            this.updateOutputLineNumbers();
            this.showNotification('转义去除失败', 'error');
        }
    }

    // 添加转义
    escapeJSON() {
        try {
            const input = this.inputArea.value.trim();
            if (!input) {
                this.showNotification('请输入JSON数据', 'error');
                return;
            }

            // 添加转义字符
            let escaped = input
                .replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/\n/g, '\\n')
                .replace(/\t/g, '\\t')
                .replace(/\r/g, '\\r');

            this.outputArea.innerHTML = this.highlightJSON(escaped);
            this.outputArea.className = 'output-area';
            this.updateOutputLineNumbers();
            this.showNotification('转义添加成功', 'success');
            
        } catch (error) {
            this.outputArea.innerHTML = `<span class="error">处理失败: ${error.message}</span>`;
            this.outputArea.className = 'output-area';
            this.updateOutputLineNumbers();
            this.showNotification('转义添加失败', 'error');
        }
    }

    // 解析非标准JSON（处理单引号、注释等）
    parseNonStandardJSON(input) {
        // 移除注释
        let cleaned = input
            .replace(/\/\*[\s\S]*?\*\//g, '') // 多行注释
            .replace(/\/\/.*$/gm, '') // 单行注释
            .replace(/^\s*\/\/.*$/gm, ''); // 行首注释

        // 替换单引号为双引号
        cleaned = cleaned.replace(/'/g, '"');

        // 处理尾随逗号
        cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

        // 处理属性名没有引号的情况
        cleaned = cleaned.replace(/(\w+):/g, '"$1":');

        try {
            return JSON.parse(cleaned);
        } catch (e) {
            throw new Error('无法解析JSON格式');
        }
    }

    // 清空所有内容
    clearAll() {
        this.inputArea.value = '';
        this.outputArea.innerHTML = '';
        this.outputArea.className = 'output-area';
        this.updateLineNumbers();
        this.showNotification('内容已清空', 'success');
    }

    // JSON语法高亮
    highlightJSON(jsonString) {
        return jsonString
            // 字符串高亮
            .replace(/"([^"]*)"/g, '<span class="json-string">"$1"</span>')
            // 数字高亮
            .replace(/\b(-?\d+\.?\d*)\b/g, '<span class="json-number">$1</span>')
            // 布尔值高亮
            .replace(/\b(true|false)\b/g, '<span class="json-boolean">$1</span>')
            // null值高亮
            .replace(/\b(null)\b/g, '<span class="json-null">$1</span>')
            // 标点符号高亮
            .replace(/([{}[\],:])/g, '<span class="json-punctuation">$1</span>');
    }

    // 验证JSON格式
    validateJSON(input) {
        try {
            JSON.parse(input);
            return true;
        } catch (e) {
            return false;
        }
    }

    // 渲染JSON树形结构
    renderJSONTree(data, path = '') {
        this.outputArea.innerHTML = '';
        this.outputArea.className = 'output-area json-tree';
        this.outputArea.appendChild(this.createJSONNode(data, path));
    }

    // 创建JSON节点
    createJSONNode(data, path = '') {
        const node = document.createElement('div');
        node.className = 'json-node';
        
        if (typeof data === 'object' && data !== null) {
            const isArray = Array.isArray(data);
            
            // 创建节点头部容器
            const header = document.createElement('div');
            header.className = 'json-node-header';
            
            const toggle = document.createElement('span');
            toggle.className = 'json-toggle expanded';
            toggle.onclick = (e) => {
                e.stopPropagation();
                this.toggleNode(toggle, children);
            };
            
            // 显示键名（如果有的话）
            if (path && !path.includes('[')) {
                const keySpan = document.createElement('span');
                keySpan.className = 'json-key';
                keySpan.textContent = `"${path.split('.').pop()}": `;
                header.appendChild(keySpan);
            }
            
            const bracket = document.createElement('span');
            bracket.className = 'json-punctuation';
            bracket.textContent = isArray ? '[' : '{';
            
            // 添加路径显示（仅用于显示，不参与复制）
            const pathSpan = document.createElement('span');
            pathSpan.className = 'json-path';
            pathSpan.textContent = this.formatPath(path);
            pathSpan.title = '点击复制路径';
            pathSpan.onclick = (e) => {
                e.stopPropagation();
                this.copyPath(path);
            };
            
            // 添加路径复制按钮
            const pathCopyBtn = document.createElement('button');
            pathCopyBtn.className = 'json-path-copy-btn';
            pathCopyBtn.textContent = '📋';
            pathCopyBtn.title = '复制路径';
            pathCopyBtn.onclick = (e) => {
                e.stopPropagation();
                this.copyPath(path);
            };
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'json-copy-btn';
            copyBtn.textContent = '复制';
            copyBtn.title = '复制JSON值';
            copyBtn.onclick = (e) => {
                e.stopPropagation();
                this.copyNodeValue(data, path);
            };
            
            header.appendChild(toggle);
            header.appendChild(bracket);
            header.appendChild(pathSpan);
            header.appendChild(pathCopyBtn);
            header.appendChild(copyBtn);
            node.appendChild(header);
            
            const children = document.createElement('div');
            children.className = 'json-children';
            
            if (isArray) {
                data.forEach((item, index) => {
                    const childPath = path ? `${path}[${index}]` : `[${index}]`;
                    const childNode = this.createJSONNode(item, childPath);
                    children.appendChild(childNode);
                });
            } else {
                Object.keys(data).forEach(key => {
                    const childPath = path ? `${path}.${key}` : key;
                    const childNode = this.createJSONNode(data[key], childPath);
                    children.appendChild(childNode);
                });
            }
            
            const closeBracket = document.createElement('span');
            closeBracket.className = 'json-punctuation';
            closeBracket.textContent = isArray ? ']' : '}';
            
            node.appendChild(children);
            node.appendChild(closeBracket);
            
        } else {
            // 创建节点头部容器
            const header = document.createElement('div');
            header.className = 'json-node-header';
            
            // 显示键名（如果有的话）
            if (path && !path.includes('[')) {
                const keySpan = document.createElement('span');
                keySpan.className = 'json-key';
                keySpan.textContent = `"${path.split('.').pop()}": `;
                header.appendChild(keySpan);
            }
            
            const valueSpan = document.createElement('span');
            if (typeof data === 'string') {
                valueSpan.className = 'json-string';
                valueSpan.textContent = `"${data}"`;
            } else if (typeof data === 'number') {
                valueSpan.className = 'json-number';
                valueSpan.textContent = data.toString();
            } else if (typeof data === 'boolean') {
                valueSpan.className = 'json-boolean';
                valueSpan.textContent = data.toString();
            } else if (data === null) {
                valueSpan.className = 'json-null';
                valueSpan.textContent = 'null';
            }
            
            // 添加路径显示（仅用于显示，不参与复制）
            const pathSpan = document.createElement('span');
            pathSpan.className = 'json-path';
            pathSpan.textContent = this.formatPath(path);
            pathSpan.title = '点击复制路径';
            pathSpan.onclick = (e) => {
                e.stopPropagation();
                this.copyPath(path);
            };
            
            // 添加路径复制按钮
            const pathCopyBtn = document.createElement('button');
            pathCopyBtn.className = 'json-path-copy-btn';
            pathCopyBtn.textContent = '📋';
            pathCopyBtn.title = '复制路径';
            pathCopyBtn.onclick = (e) => {
                e.stopPropagation();
                this.copyPath(path);
            };
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'json-copy-btn';
            copyBtn.textContent = '复制';
            copyBtn.title = '复制JSON值';
            copyBtn.onclick = (e) => {
                e.stopPropagation();
                this.copyNodeValue(data, path);
            };
            
            header.appendChild(valueSpan);
            header.appendChild(pathSpan);
            header.appendChild(pathCopyBtn);
            header.appendChild(copyBtn);
            node.appendChild(header);
        }
        
        return node;
    }

    // 切换节点折叠状态
    toggleNode(toggle, children) {
        if (toggle.classList.contains('expanded')) {
            toggle.classList.remove('expanded');
            toggle.classList.add('collapsed');
            children.classList.add('collapsed');
        } else {
            toggle.classList.remove('collapsed');
            toggle.classList.add('expanded');
            children.classList.remove('collapsed');
        }
    }

    // 复制节点值
    copyNodeValue(data, path) {
        // 只复制JSON数据本身，不包含路径信息
        const valueToCopy = JSON.stringify(data, null, 2);
        
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(valueToCopy).then(() => {
                this.showNotification('JSON值已复制到剪贴板', 'success');
            }).catch(() => {
                // 如果clipboard API失败，使用降级方案
                this.fallbackCopy(valueToCopy);
            });
        } else {
            // 降级方案
            this.fallbackCopy(valueToCopy);
        }
    }

    // 降级复制方案
    fallbackCopy(text) {
        const tempInput = document.createElement('textarea');
        tempInput.value = text;
        tempInput.style.position = 'fixed';
        tempInput.style.opacity = '0';
        document.body.appendChild(tempInput);
        tempInput.select();
        
        try {
            document.execCommand('copy');
            this.showNotification('JSON值已复制到剪贴板', 'success');
        } catch (err) {
            this.showNotification('复制失败，请手动复制', 'error');
        }
        
        document.body.removeChild(tempInput);
    }

    // 复制路径
    copyPath(path) {
        const pathToCopy = path || 'root';
        
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(pathToCopy).then(() => {
                this.showNotification('路径已复制到剪贴板', 'success');
            });
        } else {
            // 降级方案
            const tempInput = document.createElement('textarea');
            tempInput.value = pathToCopy;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            this.showNotification('路径已复制到剪贴板', 'success');
        }
    }

    // 复制输出区域内容
    copyOutput() {
        // 检查是否有JSON树形结构
        if (this.outputArea.classList.contains('json-tree')) {
            // 如果有JSON树，复制格式化后的JSON字符串
            this.copyFormattedJSON();
            return;
        }
        
        // 检查是否有pre标签（压缩、转义等操作的结果）
        const preElement = this.outputArea.querySelector('pre');
        if (preElement) {
            // 如果有pre标签，复制其中的文本内容
            this.copyTextContent(preElement.textContent);
            return;
        }
        
        // 如果没有特殊结构，复制普通文本内容
        const output = this.outputArea.textContent || this.outputArea.innerText;
        if (!output) {
            this.showNotification('没有内容可复制', 'error');
            return;
        }
        
        this.copyTextContent(output);
    }

    // 复制格式化后的JSON字符串
    copyFormattedJSON() {
        try {
            // 从输入区域获取原始JSON数据并重新格式化
            const input = this.inputArea.value.trim();
            if (!input) {
                this.showNotification('没有JSON数据可复制', 'error');
                return;
            }

            // 解析JSON并格式化
            let parsed;
            try {
                parsed = JSON.parse(input);
            } catch (e) {
                // 如果不是标准JSON，尝试处理非标准格式
                parsed = this.parseNonStandardJSON(input);
            }

            // 格式化输出
            const formatted = JSON.stringify(parsed, null, 2);
            
            // 复制到剪贴板
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(formatted).then(() => {
                    this.showNotification('格式化后的JSON已复制到剪贴板', 'success');
                }).catch(() => {
                    this.fallbackCopy(formatted);
                });
            } else {
                this.fallbackCopy(formatted);
            }
            
        } catch (error) {
            this.showNotification('JSON数据提取失败', 'error');
        }
    }

    // 复制文本内容
    copyTextContent(text) {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('内容已复制到剪贴板', 'success');
            }).catch(() => {
                this.fallbackCopy(text);
            });
        } else {
            this.fallbackCopy(text);
        }
    }


    // 格式化路径显示
    formatPath(path) {
        if (!path) return 'root';
        
        // 处理数组索引路径，保持简洁
        if (path.includes('[')) {
            // 将连续的数组索引合并，如 [0][1][2] 显示为 [0,1,2]
            return path.replace(/\[(\d+)\]/g, (match, num) => {
                // 检查前面是否已经有数组索引
                const prevMatch = path.substring(0, path.indexOf(match));
                if (prevMatch.endsWith(']')) {
                    return `,${num}`;
                }
                return `[${num}`;
            }).replace(/\[(\d+),/g, '[$1,').replace(/,\]/g, ']');
        }
        
        // 处理对象属性路径
        return path;
    }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new JSONFormatter();
});

// 添加快捷键支持
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                document.getElementById('formatBtn').click();
                break;
            case 'l':
                e.preventDefault();
                document.getElementById('clearBtn').click();
                break;
            case 'c':
                if (document.activeElement === document.getElementById('outputArea')) {
                    e.preventDefault();
                    document.getElementById('copyBtn').click();
                }
                break;
        }
    }
});
