# 江岸见 · 小江豚带你逛武汉

[打开网页版](https://fuyoupeng2007.github.io/jiang-an-jian/) · [观看小江豚配音演示](https://fuyoupeng2007.github.io/jiang-an-jian/demo.html) · [试玩城市沙盘](https://fuyoupeng2007.github.io/jiang-an-jian/city.html?leaf=practice)

## 项目简介

《江岸见》是为 SAIG「武汉数命 SPU 城市 AI 接待员」赛题制作的交互作品。你可以让小江豚介绍武汉、了解数命 SPU 社区和赛事，也可以安排一条能在指定时间前抵达赛场的游览路线。到达时间为估算。

**试一趟武汉之旅**　打开接待台，点「一起排行程」，从华科南大门出发去江汉路。你可以在地图中加入光谷广场、汉阳门，查看沿途小吃和拍照点。点开黄鹤楼模型，展开楼层、打卡，再把它放进「建设我的武汉」的沙盘。

网页版在浏览器内运行，使用内置导览资料和行程对话逻辑。打卡和建设进度保存在当前浏览器。桌面本机版本的 Qwen 自由对话服务未部署在 GitHub Pages。配音演示包含小江豚中文旁白、字幕和水泡音效。

## 本地试玩

在仓库根目录运行 `python -m http.server 8000`，然后在浏览器中打开 `http://localhost:8000/`。

## 项目内容与下载

- 网页源码、地图、明信片和地标模型位于仓库根目录及 `assets/`。
- [下载安卓版 APK 与离线网页包](https://github.com/fuyoupeng2007/jiang-an-jian/releases/tag/v2.0)。解压网页包后，从文件夹中运行上面的本地试玩命令即可。
- [Android 容器源码](android/src/main) 包含 WebView 入口、定位桥接、应用清单和图标。打包时将根目录的网页文件与 `assets/` 按原有相对路径放入 Android 应用的 assets 目录。
- [小江豚配音字幕](docs/narration.zh.srt) 与仓库中的 `demo.mp4` 对应。

## 本机小江豚对话

电脑安装 Python 后，在仓库根目录运行 `python local/serve.py`。Windows 也可以双击 `local/start.cmd`。服务会在本机启动并打开接待台。

如需启用本机自由对话，先用 Ollama 下载 `qwen2.5:3b`（运行 `ollama pull qwen2.5:3b`），再用同一个 Python 环境运行 `python -m pip install -r local/requirements.txt` 并重新启动接待台。服务通过 llama.cpp 读取本机模型，`OLLAMA_MODELS` 可指定模型目录。
