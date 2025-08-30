// JSON格式化工具 - 主要功能实现
class JSONFormatter {
    constructor() {
        this.initElements();
        this.bindEvents();
        this.initResizer();
        this.updateLineNumbers();
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
        this.copyBtn = document.getElementById('copyBtn');
        this.resizer = document.getElementById('resizer');
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
        const lines = this.inputArea.textContent.split('\n');
        this.inputLineNumbers.innerHTML = lines.map((_, index) => 
            `<div class="line-number">${index + 1}</div>`
        ).join('');
    }

    // 更新输出区域行号
    updateOutputLineNumbers() {
        const lines = this.outputArea.textContent.split('\n');
        this.outputLineNumbers.innerHTML = lines.map((_, index) => 
            `<div class="line-number">${index + 1}</div>`
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
            const input = this.inputArea.textContent.trim();
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
            this.outputArea.textContent = formatted;
            this.updateOutputLineNumbers();
            this.showNotification('JSON格式化成功', 'success');
            
        } catch (error) {
            this.outputArea.textContent = `格式化失败: ${error.message}`;
            this.updateOutputLineNumbers();
            this.showNotification('JSON格式化失败', 'error');
        }
    }

    // 压缩JSON
    compressJSON() {
        try {
            const input = this.inputArea.textContent.trim();
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
            this.outputArea.textContent = compressed;
            this.updateOutputLineNumbers();
            this.showNotification('JSON压缩成功', 'success');
            
        } catch (error) {
            this.outputArea.textContent = `压缩失败: ${error.message}`;
            this.updateOutputLineNumbers();
            this.showNotification('JSON压缩失败', 'error');
        }
    }

    // 去除转义
    unescapeJSON() {
        try {
            const input = this.inputArea.textContent.trim();
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

            this.outputArea.textContent = unescaped;
            this.updateOutputLineNumbers();
            this.showNotification('转义去除成功', 'success');
            
        } catch (error) {
            this.outputArea.textContent = `处理失败: ${error.message}`;
            this.updateOutputLineNumbers();
            this.showNotification('转义去除失败', 'error');
        }
    }

    // 添加转义
    escapeJSON() {
        try {
            const input = this.inputArea.textContent.trim();
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

            this.outputArea.textContent = escaped;
            this.updateOutputLineNumbers();
            this.showNotification('转义添加成功', 'success');
            
        } catch (error) {
            this.outputArea.textContent = `处理失败: ${error.message}`;
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
        this.inputArea.textContent = '';
        this.outputArea.textContent = '';
        this.updateLineNumbers();
        this.showNotification('内容已清空', 'success');
    }

    // 复制输出内容
    async copyOutput() {
        const output = this.outputArea.textContent;
        if (!output) {
            this.showNotification('没有内容可复制', 'error');
            return;
        }

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(output);
                this.showNotification('内容已复制到剪贴板', 'success');
            } else {
                // 降级方案
                this.inputArea.textContent = output;
                this.updateInputLineNumbers();
                this.showNotification('内容已复制到剪贴板', 'success');
            }
        } catch (error) {
            this.showNotification('复制失败', 'error');
        }
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
