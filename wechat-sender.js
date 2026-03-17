/**
 * wxclaw - WeChat Sender (指定好友发送模式)
 * 
 * 用法:
 *   ./run.sh --to "好友名" --msg "消息内容"
 *   ./run.sh --to-file friends.txt --msg-file msg.txt
 *   ./run.sh --to "张三" --msg "test" --dry-run
 * 
 * 参数:
 *   --to         好友昵称（可重复或用逗号分隔）
 *   --to-file    好友列表文件（每行一个）
 *   --msg        消息内容
 *   --msg-file   消息文件（支持多行）
 *   --dry-run    演习模式（不真发送）
 * 
 * 技术: AppleScript + System Events + 剪贴板操作
 * 编码: UTF-8
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Parse args
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');

// 显示帮助
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
wxclaw - WeChat 自动发消息工具 (指定好友模式)

用法:
  ./run.sh --to "好友名" --msg "消息内容"
  ./run.sh --to-file friends.txt --msg-file msg.txt
  ./run.sh --to "张三,李四" --msg "大家好" --dry-run

参数:
  --to        好友昵称（可重复或用逗号分隔）
  --to-file   好友列表文件（每行一个）
  --msg       消息内容
  --msg-file  消息文件（支持多行）
  --dry-run   演习模式（只打印流程，不真发送）
  --help      显示帮助

示例:
  ./run.sh --to "张三" --msg "今晚有空吗？"
  ./run.sh --to "张三" --to "李四" --msg "群发测试"
  ./run.sh --to-file friends.txt --msg "统一消息"
`);
  process.exit(0);
}

function getArg(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

function getAllArgs(flag) {
  const result = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === flag && args[i + 1]) result.push(args[i + 1]);
  }
  return result;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// 設置剪貼板
function setClipboard(text) {
  try {
    const script = `set the clipboard to "${text.replace(/"/g, '\\"')}"`;
    execSync(`osascript -e '${script}'`);
    return true;
  } catch (e) {
    console.error('剪貼板失敗:', e.message);
    return false;
  }
}

// Step 1: 確保微信開啟並聚焦
function ensureWeChatFocus() {
  const script = `
    tell application "WeChat"
      if not running then launch
      activate
    end tell
    delay 1
    tell application "System Events" to tell process "WeChat"
      set frontmost to true
      set position of window 1 to {0, 0}
      set size of window 1 to {1000, 900}
    end tell
    delay 0.5
  `;
  execSync(`osascript -e '${script}'`);
}

// Step 2: 去聊天列表 (Cmd+2)
function goToChatList() {
  const script = `
    tell application "System Events" to tell process "WeChat"
      keystroke "2" using command down
    end tell
    delay 0.8
  `;
  execSync(`osascript -e '${script}'`);
}

// Step 3: 搜索好友 (Cmd+F, paste 名, Enter)
async function searchAndOpenFriend(name) {
  setClipboard(name);
  const script = `
    tell application "System Events" to tell process "WeChat"
      -- Cmd+F 打開搜索
      keystroke "f" using command down
      delay 0.3
      -- 全選舊內容
      keystroke "a" using command down
      delay 0.1
      -- Paste 名稱
      keystroke "v" using command down
      delay 0.5
      -- Enter 確認
      key code 36
      delay 1
    end tell
  `;
  execSync(`osascript -e '${script}'`);
  await sleep(1000);
}

// Step 4: 發送消息 (paste 內容 + Enter)
function sendMessage(text) {
  setClipboard(text);
  const delayBeforeEnter = (Math.random() * 0.8 + 0.5).toFixed(2);
  const script = `
    tell application "System Events" to tell process "WeChat"
      set frontmost to true
      keystroke "v" using command down
      delay ${delayBeforeEnter}
      key code 36
    end tell
  `;
  execSync(`osascript -e '${script}'`);
}

async function sendToFriend(name, message) {
  console.log(`📱 ${DRY_RUN ? '[演习] ' : ''}發送給: ${name}`);
  
  if (DRY_RUN) {
    console.log(`   內容: ${message.substring(0, 40)}...`);
    return;
  }

  try {
    console.log('   Step 1: 確保微信聚焦...');
    ensureWeChatFocus();
    
    console.log('   Step 2: 去聊天列表...');
    goToChatList();
    
    console.log('   Step 3: 搜索並打開好友...');
    await searchAndOpenFriend(name);
    
    console.log('   Step 4: 發送消息...');
    sendMessage(message);
    
    console.log(`   ✅ 已發送`);
    await sleep(randomInt(2000, 4000));
  } catch (e) {
    console.error(`   ❌ 失敗: ${e.message}`);
  }
}

async function main() {
  let friends = [];
  
  const toArgs = getAllArgs('--to');
  toArgs.forEach(t => friends.push(...t.split(',').map(s => s.trim())));
  
  const toFile = getArg('--to-file');
  if (toFile && fs.existsSync(toFile)) {
    const content = fs.readFileSync(toFile, 'utf8');
    friends.push(...content.split('\n').map(s => s.trim()).filter(Boolean));
  }
  
  let message = '';
  const msgArg = getArg('--msg');
  if (msgArg) message = msgArg;
  
  const msgFile = getArg('--msg-file');
  if (msgFile && fs.existsSync(msgFile)) {
    message = fs.readFileSync(msgFile, 'utf8');
  }
  
  if (friends.length === 0 || !message) {
    console.log('用法: ./run.sh --to "好友名" --msg "消息内容"');
    console.log('   或: ./run.sh --to-file friends.txt --msg-file msg.txt');
    process.exit(1);
  }
  
  console.log(`🎯 共 ${friends.length} 位好友\n`);
  
  for (const friend of friends) {
    await sendToFriend(friend, message);
  }
  
  console.log('\n🎉 完成！');
}

main();
