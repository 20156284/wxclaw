#!/usr/bin/env bash
# wxclaw - WeChat 自动发消息工具
# 
# 用法:
#   ./run.sh --to "好友名" --msg "消息内容"     # 指定好友发送模式
#   ./run.sh --to-file friends.txt --msg-file msg.txt  # 从文件读取
#   ./run.sh --to "张三" --msg "test" --dry-run # 演习模式
#   ./run.sh                                      # 自动扫描群发模式
#
# 模式说明:
#   - 指定好友模式: 使用 --to/--msg 等参数，调用 wechat-sender.js
#   - 自动扫描模式: 不加参数，调用 wechat-greeter.js (春节祝福模式)

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
export LANG="zh_CN.UTF-8"
export LC_ALL="zh_CN.UTF-8"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 检测参数决定使用哪个模式
# 如果有 --to/--to-file/--msg/--msg-file 参数，使用 wechat-sender.js (指定好友版)
# 否则使用 wechat-greeter.js (自动扫描版)
USE_SENDER=false
for arg in "$@"; do
  if [[ "$arg" == "--to" ]] || [[ "$arg" == "--to-file" ]] || [[ "$arg" == "--msg" ]] || [[ "$arg" == "--msg-file" ]]; then
    USE_SENDER=true
    break
  fi
done

if [ "$USE_SENDER" = true ]; then
  exec node "$SCRIPT_DIR/wechat-sender.js" "$@"
else
  exec node "$SCRIPT_DIR/wechat-greeter.js" "$@"
fi
