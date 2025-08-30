@echo off
echo 正在打包uTools JSON格式化工具插件...

REM 创建临时目录
if exist "temp" rmdir /s /q "temp"
mkdir temp

REM 复制必要文件
copy "index.html" "temp\"
copy "script.js" "temp\"
copy "style.css" "temp\"
copy "plugin.json" "temp\"
copy "preload.js" "temp\"
copy "logo.png" "temp\"
copy "README.md" "temp\"

REM 创建ZIP文件
powershell -command "Compress-Archive -Path 'temp\*' -DestinationPath 'JSON格式化工具.uTools.zip' -Force"

REM 清理临时目录
rmdir /s /q "temp"

echo 打包完成！插件文件：JSON格式化工具.uTools.zip
pause
