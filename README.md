# 🐲 wxclaw

> **春节给 200 个好友发祝福，手是不可能动的，这辈子都不可能动的。**

<p align="center">
  <img src="https://img.shields.io/badge/platform-macOS-lightgrey?style=flat-square" />
  <img src="https://img.shields.io/badge/WeChat-8.0+-07C160?style=flat-square&logo=wechat&logoColor=white" />
  <img src="https://img.shields.io/badge/node-18+-339933?style=flat-square&logo=nodedotjs&logoColor=white" />
</p>

一个让你在 **不碰鼠标、不看屏幕** 的情况下，自动给微信好友发消息的 macOS 自动化工具。

*打工已经够累了，发消息这种事，就让脚本代劳吧。*

---

## ✨ 功能一览

| 需求 | 命令 |
|------|------|
| 给指定好友发消息 | `./run.sh --to "张三" --msg "今晚撸串？"` |
| 给 50 个人群发祝福 | `./run.sh --to-file friends.txt --msg-file bless.txt` |
| 自动扫描发送（春节模式）| `./run.sh` |
| 先演习一遍 | `./run.sh --to "张三" --msg "测试" --dry-run` |

**特性速览：**
- 🎯 **指定好友发送** —— 输入昵称，精准发送
- 🔄 **自动扫描群发** —— 自动遍历联系人列表，支持断点续传
- 📝 **灵活输入** —— 命令行、文件、多行消息
- 🛡️ **演习模式** —— 先 dry-run 看效果，别真发出去社死
- ⏱️ **智能间隔** —— 随机延迟，假装是真人手动发的

---

## 🚀 快速开始

### 环境要求

- macOS 10.15+
- 微信 Mac 客户端（3.0+）
- Node.js 18+（`brew install node`）

### 权限设置（⚠️ 必做，否则没反应）

1. **登录微信**，保持在线状态
2. **授予辅助功能权限**：
   - 系统设置 → 隐私与安全性 → 辅助功能
   - 添加你的终端（Terminal / iTerm2）
3. **自动化权限** —— 运行时系统会弹窗，点「允许」

> 💡 不给权限的话，脚本和微信就是「鸡同鸭讲」——它喊破喉咙，微信也不会动一下。

### 安装

```bash
git clone https://github.com/20156284/wxclaw.git
cd wxclaw

# 测试指定好友发送
./run.sh --to "张三" --msg "你好，这是一条测试消息 🎉"
```

---

## 📖 使用指南

### 模式一：指定好友发送（推荐日常使用）

使用 `--to` 和 `--msg` 参数指定好友和内容。

#### 1. 单发消息

```bash
./run.sh --to "好友昵称" --msg "消息内容"
```

#### 2. 多人群发

```bash
# 方式一：多次 --to
./run.sh --to "张三" --to "李四" --to "王五" --msg "群发通知"

# 方式二：逗号分隔
./run.sh --to "张三,李四,王五" --msg "大家好"

# 方式三：文件读取
./run.sh --to-file friends.txt --msg "统一消息"
```

#### 3. 从文件读取消息（支持多行）

```bash
./run.sh --to-file friends.txt --msg-file msg.txt
```

**friends.txt 格式：**
```
张三
李四
王五
```

**msg.txt 格式：**
```
亲爱的朋友，

春节快乐！
新的一年万事如意 🧧

—— 你的 AI 助理
```

#### 4. 演习模式

```bash
./run.sh --to "张三" --msg "测试" --dry-run
```

### 模式二：自动扫描群发（春节祝福模式）

**不添加任何参数**直接运行，会进入自动扫描模式：

```bash
./run.sh
```

这个模式会：
- 自动扫描左侧联系人列表
- 逐个进入聊天窗口
- 智能识别联系人（防止重复发送）
- 根据聊天氛围自动选择祝福语模板

**特性：**
- 状态记忆，支持断点续传
- 双重防重（日志记录 + 视觉识别）
- 智能匹配祝福语（幽默/温馨/极简）

---

## 🔧 参数说明

### 指定好友模式参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--to` | 好友昵称，可重复或用逗号分隔 | - |
| `--to-file` | 好友列表文件，每行一个 | - |
| `--msg` | 消息内容 | - |
| `--msg-file` | 消息文件（支持多行） | - |
| `--dry-run` | 演习模式，不发送 | false |

### 自动扫描模式参数（wechat-greeter.js）

| 参数 | 说明 |
|------|------|
| `--interval-min` | 最小间隔（毫秒） |
| `--interval-max` | 最大间隔（毫秒） |
| `--dry-run` | 演习模式 |

---

## ⚙️ 工作原理

### 指定好友模式（wechat-sender.js）

技术流程：

```
1. 打开并聚焦微信窗口
2. Cmd+2 切换到聊天列表
3. Cmd+F 打开搜索 → paste 好友名 → Enter 确认
4. paste 消息内容 → 随机延迟 → Enter 发送
```

核心技术：AppleScript + System Events + 剪贴板操作 (pbcopy)

### 自动扫描模式（wechat-greeter.js）

```
1. 激活微信窗口
2. 对每个可见联系人：
   ├─ 截图识别 OCR
   ├─ 点击进入会话
   ├─ 检查聊天历史（防止重复）
   ├─ 判断聊天氛围
   ├─ paste 祝福语 → 发送
   └─ 滚动列表，继续下一位
3. 记录日志，支持断点续传
```

核心技术：AppleScript + System Events + Swift Vision OCR

---

## ⚠️ 注意事项

1. **权限！权限！权限！** 重要的事情说三遍。

2. **微信风控** —— 别发太猛：
   - 间隔建议 2-4 秒以上
   - 一次别超过几十个
   - 别发营销内容

3. **昵称匹配** —— 脚本用 `Cmd+F` 搜索，要确保是**对方在微信里显示的名字**（不是你给TA的备注）。

4. **别动鼠标** —— 发送过程中让脚本自己跑，你别抢戏。

5. **文件编码** —— 所有文本文件请使用 **UTF-8** 编码，确保中文正常显示。

6. **免责声明** —— 工具无罪，使用的人要有节操。骚扰他人、违反微信规则的后果自负。

---

## 📊 日志记录

自动扫描模式会记录日志到：
- `~/.openclaw/workspace/wechat_cny_2026_sent.json`
- `~/.openclaw/workspace/wechat_cny_2026_clicked.json`

指定好友模式暂不记录日志。

---

## 🔌 在 OpenClaw 中使用

如果你用 [OpenClaw](https://github.com/openclaw/openclaw) AI 助手，可以直接让 AI 帮你发：

> *你：运行 wxclaw，给张三发消息说今晚有空吗？*  
> *AI：好的，正在执行...*

安装到 OpenClaw：

```bash
cp -r wxclaw ~/.openclaw/workspace/skills/
```

---

## 📝 Changelog

- **2026-03-18** — 新增指定好友发送模式（wechat-sender.js）
- **2026-02-28** — 完善 run.sh，统一环境变量
- **2026-02** — 初始版本（wechat-greeter.js），支持自动扫描群发

---

## 📄 License

MIT

> *"春节祝福 200 条，手写？不存在的。*  
> *写个脚本，优雅地发送，才是程序员的浪漫。"* 🎆
