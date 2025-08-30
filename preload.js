// uTools插件预加载脚本
window.exports = {
  // JSON格式化功能
  "json-format": {
    mode: "list",
    args: {
      // 进入插件时调用
      enter: (action) => {
        // 可以在这里处理传入的文本
        if (action.payload) {
          // 如果有传入的文本，可以自动填充到输入框
          window.postMessage({
            type: 'setInput',
            data: action.payload
          }, '*');
        }
      }
    }
  },
  
  // JSON压缩功能
  "json-compress": {
    mode: "list",
    args: {
      enter: (action) => {
        if (action.payload) {
          window.postMessage({
            type: 'setInput',
            data: action.payload
          }, '*');
        }
      }
    }
  },
  
  // JSON转义功能
  "json-escape": {
    mode: "list",
    args: {
      enter: (action) => {
        if (action.payload) {
          window.postMessage({
            type: 'setInput',
            data: action.payload
          }, '*');
        }
      }
    }
  },
  
  // JSON去除转义功能
  "json-unescape": {
    mode: "list",
    args: {
      enter: (action) => {
        if (action.payload) {
          window.postMessage({
            type: 'setInput',
            data: action.payload
          }, '*');
        }
      }
    }
  }
};

// 监听来自页面的消息
window.addEventListener('message', (event) => {
  if (event.data.type === 'copyToClipboard') {
    // 复制到剪贴板
    uTools.copyText(event.data.data);
  }
});

// 插件退出时调用
window.exports.exit = () => {
  // 清理工作
  console.log('JSON格式化工具插件已退出');
};
