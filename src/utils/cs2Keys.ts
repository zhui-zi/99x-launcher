// Maps browser KeyboardEvent.code / MouseEvent.button / WheelEvent to CS2 console bind key tokens.

const CODE_TO_CS2_KEY: Record<string, string> = {
  // Modifiers
  ControlLeft: 'ctrl',
  ControlRight: 'rctrl',
  ShiftLeft: 'shift',
  ShiftRight: 'rshift',
  AltLeft: 'alt',
  AltRight: 'ralt',

  // Common & navigation
  Space: 'space',
  Tab: 'tab',
  CapsLock: 'capslock',
  Enter: 'enter',
  Backspace: 'backspace',
  Insert: 'ins',
  Delete: 'del',
  Home: 'home',
  End: 'end',
  PageUp: 'pgup',
  PageDown: 'pgdn',
  ArrowUp: 'uparrow',
  ArrowDown: 'downarrow',
  ArrowLeft: 'leftarrow',
  ArrowRight: 'rightarrow',
  Pause: 'pause',
  ScrollLock: 'scrolllock',

  // Punctuation
  Minus: '-',
  Equal: '=',
  BracketLeft: '[',
  BracketRight: ']',
  Backslash: '\\',
  Semicolon: ';',
  Quote: "'",
  Comma: ',',
  Period: '.',
  Slash: '/',
  Backquote: '`',

  // Numpad (CS2 Source 2 uses kp_0 .. kp_9)
  Numpad0: 'kp_0',
  Numpad1: 'kp_1',
  Numpad2: 'kp_2',
  Numpad3: 'kp_3',
  Numpad4: 'kp_4',
  Numpad5: 'kp_5',
  Numpad6: 'kp_6',
  Numpad7: 'kp_7',
  Numpad8: 'kp_8',
  Numpad9: 'kp_9',
  NumpadAdd: 'kp_plus',
  NumpadSubtract: 'kp_minus',
  NumpadMultiply: 'kp_multiply',
  NumpadDivide: 'kp_divide',
  NumpadDecimal: 'kp_del',
  NumpadEnter: 'kp_enter'
}

export function keyboardEventToCs2Key(e: KeyboardEvent): string | null {
  const code = e.code
  if (!code || code === 'Escape' || code === 'MetaLeft' || code === 'MetaRight' || code === 'ContextMenu') {
    return null
  }
  if (CODE_TO_CS2_KEY[code]) {
    return CODE_TO_CS2_KEY[code]
  }
  if (/^Key[A-Z]$/.test(code)) {
    return code.slice(3).toLowerCase()
  }
  if (/^Digit[0-9]$/.test(code)) {
    return code.slice(5)
  }
  if (/^F([1-9]|1[0-2])$/.test(code)) {
    return code
  }
  return null
}

export function mouseButtonToCs2Key(button: number): string | null {
  switch (button) {
    case 1:
      return 'mouse3'
    case 2:
      return 'mouse2'
    case 3:
      return 'mouse4'
    case 4:
      return 'mouse5'
    default:
      return null
  }
}

/** Standard CS2 default keyboard/mouse bindings (lowercase key token -> CS2 command) */
export const CS2_DEFAULT_BINDS: Record<string, string> = {
  w: '+forward',
  s: '+back',
  a: '+left',
  d: '+right',
  space: '+jump',
  ctrl: '+duck',
  shift: '+sprint',
  e: '+use',
  r: '+reload',
  q: 'lastinv',
  g: 'drop',
  b: 'buymenu',
  f: '+lookatweapon',
  t: '+spray_menu',
  y: 'messagemode',
  u: 'messagemode2',
  k: '+voicerecord',
  m: 'teammenu',
  tab: '+showscores',
  '`': 'toggleconsole',
  '1': 'slot1',
  '2': 'slot2',
  '3': 'slot3',
  '4': 'slot4',
  '5': 'slot5',
  '6': 'slot6',
  '7': 'slot7',
  '8': 'slot8',
  '9': 'slot9',
  '0': 'slot10',
  z: 'radio',
  x: 'slot12',
  c: 'radio2',
  f3: 'autobuy',
  f4: 'rebuy',
  mouse1: '+attack',
  mouse2: '+attack2',
  mouse3: 'player_ping',
  mwheelup: 'invprev',
  mwheeldown: 'invnext'
}

const CS2_CMD_LABELS: Record<string, string> = {
  '+forward': '前进',
  '+back': '后退',
  '+left': '向左移动',
  '+right': '向右移动',
  '+jump': '跳跃',
  '+duck': '蹲下',
  '+sprint': '静步',
  '+use': '使用/互动',
  '+reload': '换弹',
  lastinv: '切回上一武器',
  drop: '丢弃武器',
  buymenu: '购买菜单',
  '+lookatweapon': '检视武器',
  '+spray_menu': '涂鸦菜单',
  messagemode: '全局聊天',
  messagemode2: '队内聊天',
  '+voicerecord': '语音麦克风',
  teammenu: '选择阵营',
  '+showscores': '计分板',
  toggleconsole: '控制台',
  slot1: '主武器',
  slot2: '副武器',
  slot3: '近战武器',
  slot4: '投掷物循环',
  slot5: 'C4 / 炸弹',
  slot6: '高爆手雷',
  slot7: '闪光弹',
  slot8: '烟雾弹',
  slot9: '诱饵弹',
  slot10: '燃烧弹',
  slot12: '医疗针',
  radio: '无线电',
  radio1: '无线电1',
  radio2: '无线电2',
  radio3: '无线电3',
  autobuy: '自动购买',
  rebuy: '重复购买',
  '+attack': '开火',
  '+attack2': '副攻击/开镜',
  player_ping: '标记点',
  invprev: '上一武器',
  invnext: '下一武器',
  '+radialradio': '轮盘指令1',
  '+radialradio2': '轮盘指令2',
  '+radialradio3': '轮盘指令3'
}

export function normalizeCs2KeyToken(raw: string): string {
  const k = raw.trim().toLowerCase()
  if (k === 'semicolon') return ';'
  if (k === 'mouse_x' || k === 'mouse_y') return ''
  return k
}

/** Merge CS2 defaults with user's cs2_user_keys_0_slot0.vcfg overrides (respecting "<unbound>") */
export function buildEffectiveCs2Binds(
  userOverrides: Record<string, string>
): Record<string, string> {
  const merged: Record<string, string> = { ...CS2_DEFAULT_BINDS }
  for (const [rawKey, rawCmd] of Object.entries(userOverrides || {})) {
    const key = normalizeCs2KeyToken(rawKey)
    if (!key) continue
    const cmd = (rawCmd || '').trim()
    if (!cmd || cmd.toLowerCase() === '<unbound>') {
      delete merged[key]
    } else {
      merged[key] = cmd
    }
  }
  return merged
}

export function formatCs2CommandLabel(cmd: string): string {
  const clean = cmd.trim()
  const lower = clean.toLowerCase()
  if (CS2_CMD_LABELS[lower]) {
    return `${CS2_CMD_LABELS[lower]} (${clean})`
  }
  return clean
}
