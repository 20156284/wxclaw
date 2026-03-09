#!/usr/bin/env bash
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
export LANG="zh_CN.UTF-8"
export LC_ALL="zh_CN.UTF-8"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec node "$SCRIPT_DIR/wechat-greeter.js" "$@"
