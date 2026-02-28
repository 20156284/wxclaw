# 🐲 wxclaw

> **春节给 200 个好友发祝福，手是不可能动的，这辈子都不可能动的。**

<p align="center">
  <img src="https://img.shields.io/badge/platform-macOS-lightgrey?style=flat-square" />
  <img src="https://img.shields.io/badge/WeChat-8.0+-07C160?style=flat-square&logo=wechat&logoColor=white" />
  <img src="https://img.shields.io/badge/node-18+-339933?style=flat-square&logo=nodedotjs&logoColor=white" />
</p>

一个让你在 **不碰鼠标、不看屏幕、甚至不打开微信窗口** 的情况下，自动给指定好友发消息的 macOS 自动化工具。

*打工已经够累了，发消息这种事，就让脚本代劳吧。*

---

## ✨ 功能一览

| 需求 | 命令 |
|------|------|
| 给张三发消息 | `./run.sh --to "张三" --msg "今晚撸串？"` |
| 给 50 个人群发祝福 | `./run.sh --to-file friends.txt --msg-file bless.txt` |
| 先演习一遍 | `./run.sh --to-file friends.txt --msg "测试" --dry-run` |

**特性速览：**
- 🎯 **单发/群发** —— 一个人发，一群人发，一视同仁
- 📝 **灵活输入** —— 命令行、文件、多行消息，随你折腾
- 🛡️ **演习模式** —— 先 dry-run 看效果，别真发出去社死
- ⏱️ **智能间隔** —— 随机延迟，假装是真人手动发的
- 📜 **完整日志** —— JSONL 格式，事后好甩锅

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

# 测试一下
./run.sh --to "张三" --msg "你好，这是一条测试消息 🎉"
```

---

## 📖 使用指南

### 1. 单发消息

```bash
./run.sh --to "好友昵称" --msg "消息内容"
```

### 2. 多人群发（三种姿势）

```bash
# 方式一：多次 --to
./run.sh --to "张三" --to "李四" --to "王五" --msg "群发通知"

# 方式二：逗号分隔（适合人不多）
./run.sh --to "张三,李四,王五" --msg "大家好"

# 方式三：文件读取（适合 200 人名单）
./run.sh --to-file friends.txt --msg "统一消息"
```

### 3. 从文件读取消息（支持多行）

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

### 4. 演习模式（强烈推荐先用这个）

```bash
./run.sh --to-file friends.txt --msg-file msg.txt --dry-run
```

只打印流程，不真发。确认没问题再去轰炸好友。

---

## 🔧 参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--to` | 好友昵称，可重复或用逗号分隔 | - |
| `--to-file` | 好友列表文件，每行一个 | - |
| `--msg` | 消息内容 | - |
| `--msg-file` | 消息文件（支持多行） | - |
| `--interval-min` | 最小间隔（毫秒） | 1200 |
| `--interval-max` | 最大间隔（毫秒） | 2600 |
| `--dry-run` | 演习模式，不发送 | false |
| `--help` | 查看帮助 | - |

---

## 📊 日志记录

所有操作记录在 `log/wechat_friend_message_log.jsonl`：

```jsonl
{"time":"2026-02-28T09:30:00.000Z","friend":"张三","status":"sent","messagePreview":"你好..."}
{"time":"2026-02-28T09:30:02.345Z","friend":"李四","status":"sent","messagePreview":"你好..."}
{"time":"2026-02-28T09:30:05.678Z","friend":"王五","status":"skipped_not_found","error":"未找到该好友"}
```

用 `jq` 分析：

```bash
# 看成功发送的
cat log/wechat_friend_message_log.jsonl | jq 'select(.status == "sent")'

# 统计结果
cat log/wechat_friend_message_log.jsonl | jq -s 'group_by(.status) | map({status: .[0].status, count: length})'
```

---

## 🔌 在 OpenClaw 中使用

如果你用 [OpenClaw](https://github.com/openclaw/openclaw) AI 助手，可以直接让 AI 帮你发：

> *你：运行 wxclaw，给张三发消息说今晚有空吗？*  
> *AI：好的，正在执行...*

安装：

```bash
cp -r wxclaw ~/.openclaw/workspace/skills/
```

---

## ⚠️ 注意事项

1. **权限！权限！权限！** 重要的事情说三遍。

2. **微信风控** —— 别发太猛：
   - 间隔建议 3-5 秒以上
   - 一次别超过几十个
   - 别发营销内容

3. **昵称匹配** —— 脚本用 `Cmd+F` 搜索，要确保是**对方在微信里显示的名字**（不是你给TA的备注）。

4. **别动鼠标** —— 发送过程中让脚本自己跑，你别抢戏。

5. **免责声明** —— 工具无罪，使用的人要有节操。骚扰他人、违反微信规则的后果自负。

---

## 🛠️ 工作原理

```
1. 激活微信窗口
2. 对每个好友：
   ├─ Cmd+F 打开搜索
   ├─ 输入昵称，回车
   ├─ 检查是否进入会话
   ├─ 写剪贴板 → 粘贴 → Ctrl+Enter 发送
   └─ 随机等待，继续下一位
3. 写日志，收工
```

核心技术：AppleScript + System Events

---

## 📝 Changelog

- **2026-02-28** — 完善 run.sh，统一环境变量
- **2026-02** — 初始版本，支持单发/批量/演习

---

## 📄 License

MIT

> *"春节祝福 200 条，手写？不存在的。*  
> *写个脚本，优雅地发送，才是程序员的浪漫。"* 🎆
