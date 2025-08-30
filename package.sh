#!/bin/bash

echo "正在打包uTools JSON格式化工具插件..."

# 创建临时目录
rm -rf temp
mkdir temp

# 复制必要文件
cp index.html temp/
cp script.js temp/
cp style.css temp/
cp plugin.json temp/
cp preload.js temp/
cp logo.png temp/
cp README.md temp/

# 创建ZIP文件
cd temp
zip -r ../JSON格式化工具.uTools.zip ./*
cd ..

# 清理临时目录
rm -rf temp

echo "打包完成！插件文件：JSON格式化工具.uTools.zip"
