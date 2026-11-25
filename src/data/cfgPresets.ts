import type { CommunityId } from '../types/server'

export type CfgProfileId = 'fys' | 'exg'

export interface CfgCmdPreset {
  id: string
  profile: CfgProfileId | 'common'
  category: string
  subGroup?: string
  label: string
  cmdDisplay: string
  desc: string
  note?: string
  defaultKey: string
  /** Base command, e.g. "say .hide" or direct cvar block when isDirectCvar is true */
  command: string
  isDirectCvar?: boolean
  /** Multi-line bind/alias script using {{KEY}} placeholder for user-selected key */
  isKeyTemplate?: boolean
  /** Primary bound command token for conflict detection on isKeyTemplate presets */
  bindMatchCmd?: string
  /** Optional parameter support for commands like .hide <范围>, .epos <x> <y>, .bet <阵营> <助力值> */
  hasParam?: boolean
  paramLabel?: string
  paramPlaceholder?: string
  defaultParam?: string
  paramRequired?: boolean
  /** When true, the parameter input captures a pressed keyboard/mouse key instead of free text */
  paramIsKey?: boolean
}

export const FYS_CATEGORIES = [
  'ZE 买枪与道具',
  'ZE 核心与指挥',
  '玩家通用指令',
  '全模式专有',
  '游戏优化与操作',
  '颜文字表情'
] as const

export const EXG_CATEGORIES = [
  'EXG 基本与订图',
  'EXG ZE / ZM 与指挥',
  'EXG 快捷买枪与道具',
  'EXG 进阶视角与脚本',
  '游戏优化与操作',
  '颜文字表情'
] as const

export const FYS_REFERENCE_URL = 'https://bbs.fyscs.cn/t-162844-1.html'
export const EXG_CFG_REFERENCE_URL = 'https://bbs.darkrp.cn/forum-post/6143.html/'

export function communityToCfgProfile(community: CommunityId): CfgProfileId {
  return community === 'fys' ? 'fys' : 'exg'
}

export const CFG_PRESETS: CfgCmdPreset[] = [
  // =========================================================================
  // FYS 风云社 — ZE 买枪与道具
  // =========================================================================
  // 道具 / 补给 / 手雷
  {
    id: 'fys_h',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '补给与手雷',
    label: '购买血针',
    cmdDisplay: '.h',
    desc: '快速购买医疗血针恢复生命值',
    defaultKey: 'F1',
    command: 'say .h'
  },
  {
    id: 'fys_k',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '补给与手雷',
    label: '购买护盾电池',
    cmdDisplay: '.k',
    desc: '快速购买护盾电池补充护甲',
    defaultKey: 'F2',
    command: 'say .k'
  },
  {
    id: 'fys_if',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '补给与手雷',
    label: '购买无限火力',
    cmdDisplay: '.if',
    desc: '购买无限弹药/火力压制道具',
    defaultKey: 'F3',
    command: 'say .if'
  },
  {
    id: 'fys_rebuy',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '补给与手雷',
    label: '重复购买主武器',
    cmdDisplay: '.rebuy',
    desc: '一键重复购买上一把使用的主武器',
    defaultKey: 'v',
    command: 'say .rebuy'
  },
  {
    id: 'fys_nade',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '补给与手雷',
    label: '购买高爆手雷',
    cmdDisplay: '.nade',
    desc: '购买高爆手雷减速/击退僵尸',
    defaultKey: 'F4',
    command: 'say .nade'
  },
  {
    id: 'fys_ices',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '补给与手雷',
    label: '购买冰冻手雷',
    cmdDisplay: '.ices',
    desc: '购买冰冻手雷冻结控场',
    defaultKey: 'F5',
    command: 'say .ices'
  },
  {
    id: 'fys_fire',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '补给与手雷',
    label: '购买燃烧手雷',
    cmdDisplay: '.fire',
    desc: '购买燃烧手雷封路减速',
    defaultKey: 'F6',
    command: 'say .fire'
  },
  {
    id: 'fys_push',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '补给与手雷',
    label: '购买屏障手雷',
    cmdDisplay: '.push',
    desc: '购买屏障手雷推开僵尸防抓',
    defaultKey: 'F7',
    command: 'say .push'
  },
  {
    id: 'fys_hole',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '补给与手雷',
    label: '购买黑洞手雷',
    cmdDisplay: '.hole',
    desc: '购买黑洞手雷聚怪控场',
    defaultKey: 'F8',
    command: 'say .hole'
  },

  // 冲锋枪与机枪 (ZE 主力)
  {
    id: 'fys_bizon',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '冲锋枪与机枪',
    label: '购买 野牛 Bizon',
    cmdDisplay: '.bizon',
    desc: 'ZE 守点常用高弹容冲锋枪',
    defaultKey: 'kp_1',
    command: 'say .bizon'
  },
  {
    id: 'fys_p90',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '冲锋枪与机枪',
    label: '购买 P90',
    cmdDisplay: '.p90',
    desc: '高机动大弹匣冲锋枪',
    defaultKey: 'kp_2',
    command: 'say .p90'
  },
  {
    id: 'fys_negev',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '冲锋枪与机枪',
    label: '购买 内格夫 Negev',
    cmdDisplay: '.negev',
    desc: '持续火力压制机枪',
    defaultKey: 'kp_3',
    command: 'say .negev'
  },
  {
    id: 'fys_m249',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '冲锋枪与机枪',
    label: '购买 M249',
    cmdDisplay: '.m249',
    desc: '重火力机枪',
    defaultKey: 'kp_4',
    command: 'say .m249'
  },
  {
    id: 'fys_mp9',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '冲锋枪与机枪',
    label: '购买 MP9',
    cmdDisplay: '.mp9',
    desc: '高射速轻型冲锋枪',
    defaultKey: 'kp_5',
    command: 'say .mp9'
  },
  {
    id: 'fys_mp5',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '冲锋枪与机枪',
    label: '购买 MP5',
    cmdDisplay: '.mp5',
    desc: '消音冲锋枪 MP5-SD',
    defaultKey: '',
    command: 'say .mp5'
  },
  {
    id: 'fys_mp7',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '冲锋枪与机枪',
    label: '购买 MP7',
    cmdDisplay: '.mp7',
    desc: '稳定控枪冲锋枪',
    defaultKey: '',
    command: 'say .mp7'
  },
  {
    id: 'fys_ump',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '冲锋枪与机枪',
    label: '购买 UMP45',
    cmdDisplay: '.ump',
    desc: '高单发伤害冲锋枪',
    defaultKey: '',
    command: 'say .ump'
  },
  {
    id: 'fys_mac10',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '冲锋枪与机枪',
    label: '购买 Mac10',
    cmdDisplay: '.mac10',
    desc: '高移速便携冲锋枪',
    defaultKey: '',
    command: 'say .mac10'
  },

  // 步枪与连狙
  {
    id: 'fys_m4a1',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '步枪与连狙',
    label: '购买 M4A1 消音',
    cmdDisplay: '.m4a1',
    desc: '精准稳定步枪 M4A1-S',
    defaultKey: 'kp_6',
    command: 'say .m4a1'
  },
  {
    id: 'fys_ak47',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '步枪与连狙',
    label: '购买 AK47',
    cmdDisplay: '.ak47',
    desc: '高伤害主力步枪',
    defaultKey: 'kp_7',
    command: 'say .ak47'
  },
  {
    id: 'fys_m4a4',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '步枪与连狙',
    label: '购买 M4A4',
    cmdDisplay: '.m4a4',
    desc: '30发弹容步枪',
    defaultKey: 'kp_8',
    command: 'say .m4a4'
  },
  {
    id: 'fys_scar20',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '步枪与连狙',
    label: '购买 警连狙 Scar20',
    cmdDisplay: '.scar20',
    desc: '远距离连发狙击步枪',
    defaultKey: 'kp_9',
    command: 'say .scar20'
  },
  {
    id: 'fys_g3sg1',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '步枪与连狙',
    label: '购买 匪连狙 G3SG1',
    cmdDisplay: '.g3sg1',
    desc: '远距离连发狙击步枪',
    defaultKey: '',
    command: 'say .g3sg1'
  },
  {
    id: 'fys_galil',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '步枪与连狙',
    label: '购买 加列尔 GalilAR',
    cmdDisplay: '.galil',
    desc: '35发经济型步枪',
    defaultKey: '',
    command: 'say .galil'
  },
  {
    id: 'fys_famas',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '步枪与连狙',
    label: '购买 法玛斯 Famas',
    cmdDisplay: '.famas',
    desc: '经济型步枪',
    defaultKey: '',
    command: 'say .famas'
  },
  {
    id: 'fys_sg553',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '步枪与连狙',
    label: '购买 SG553',
    cmdDisplay: '.sg553',
    desc: '带瞄具步枪',
    defaultKey: '',
    command: 'say .sg553'
  },
  {
    id: 'fys_aug',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '步枪与连狙',
    label: '购买 AUG',
    cmdDisplay: '.aug',
    desc: '带瞄具步枪',
    defaultKey: '',
    command: 'say .aug'
  },

  // 霰弹枪与手枪
  {
    id: 'fys_xm1014',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '霰弹枪与手枪',
    label: '购买 连喷 XM1014',
    cmdDisplay: '.xm1014',
    desc: '近距离高击退自动霰弹枪',
    defaultKey: '',
    command: 'say .xm1014'
  },
  {
    id: 'fys_nova',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '霰弹枪与手枪',
    label: '购买 Nova',
    cmdDisplay: '.nova',
    desc: '泵动霰弹枪',
    defaultKey: '',
    command: 'say .nova'
  },
  {
    id: 'fys_mag7',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '霰弹枪与手枪',
    label: '购买 警喷 Mag-7',
    cmdDisplay: '.mag7',
    desc: '短管高爆发霰弹枪',
    defaultKey: '',
    command: 'say .mag7'
  },
  {
    id: 'fys_sawed',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '霰弹枪与手枪',
    label: '购买 匪喷 Sawedoff',
    cmdDisplay: '.sawed',
    desc: '短管霰弹枪',
    defaultKey: '',
    command: 'say .sawed'
  },
  {
    id: 'fys_deagle',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '霰弹枪与手枪',
    label: '购买 沙鹰 Deagle',
    cmdDisplay: '.deagle',
    desc: '高单发伤害副武器',
    defaultKey: '',
    command: 'say .deagle'
  },
  {
    id: 'fys_elite',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '霰弹枪与手枪',
    label: '购买 双枪 Elite',
    cmdDisplay: '.elite',
    desc: '高弹容副武器',
    defaultKey: '',
    command: 'say .elite'
  },
  {
    id: 'fys_usp',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '霰弹枪与手枪',
    label: '购买 USP',
    cmdDisplay: '.usp',
    desc: '消音手枪',
    defaultKey: '',
    command: 'say .usp'
  },
  {
    id: 'fys_p2000',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '霰弹枪与手枪',
    label: '购买 P2000',
    cmdDisplay: '.p2000',
    desc: 'CT 默认手枪',
    defaultKey: '',
    command: 'say .p2000'
  },
  {
    id: 'fys_glock',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '霰弹枪与手枪',
    label: '购买 Glock',
    cmdDisplay: '.glock',
    desc: 'T 默认手枪',
    defaultKey: '',
    command: 'say .glock'
  },
  {
    id: 'fys_p250',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '霰弹枪与手枪',
    label: '购买 P250',
    cmdDisplay: '.p250',
    desc: '便携副武器',
    defaultKey: '',
    command: 'say .p250'
  },
  {
    id: 'fys_r8',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '霰弹枪与手枪',
    label: '购买 R8',
    cmdDisplay: '.r8',
    desc: 'R8 左轮手枪',
    defaultKey: '',
    command: 'say .r8'
  },
  {
    id: 'fys_fiveseven',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '霰弹枪与手枪',
    label: '购买 FN57',
    cmdDisplay: '.fiveseven',
    desc: 'Five-SeveN 手枪',
    defaultKey: '',
    command: 'say .fiveseven'
  },
  {
    id: 'fys_tec9',
    profile: 'fys',
    category: 'ZE 买枪与道具',
    subGroup: '霰弹枪与手枪',
    label: '购买 TEC-9',
    cmdDisplay: '.tec9',
    desc: '高机动手枪',
    defaultKey: '',
    command: 'say .tec9'
  },

  // =========================================================================
  // FYS 风云社 — ZE 核心与指挥
  // =========================================================================
  {
    id: 'fys_hide',
    profile: 'fys',
    category: 'ZE 核心与指挥',
    subGroup: '视野与生存',
    label: '屏蔽友方模型',
    cmdDisplay: '.hide <范围>',
    desc: '屏蔽指定范围内的友方人物模型，大幅提升帧数',
    note: '0 为目中无人，-1 为解除屏蔽，如 .hide 500',
    defaultKey: 'h',
    command: 'say .hide',
    hasParam: true,
    defaultParam: '500',
    paramPlaceholder: '500 / 0 / -1'
  },
  {
    id: 'fys_unhide',
    profile: 'fys',
    category: 'ZE 核心与指挥',
    subGroup: '视野与生存',
    label: '临时解除屏蔽队友',
    cmdDisplay: '.unhide',
    desc: '临时解除屏蔽队友模型（默认键位为鼠标右键）',
    defaultKey: '',
    command: 'say .unhide'
  },
  {
    id: 'fys_hwl',
    profile: 'fys',
    category: 'ZE 核心与指挥',
    subGroup: '视野与生存',
    label: '临时开关白名单',
    cmdDisplay: '.hwl',
    desc: '临时开关队友屏蔽白名单功能，下回合自动恢复',
    defaultKey: '',
    command: 'say .hwl'
  },
  {
    id: 'fys_ztele',
    profile: 'fys',
    category: 'ZE 核心与指挥',
    subGroup: '视野与生存',
    label: '僵尸卡住回城',
    cmdDisplay: '.ztele',
    desc: '仅僵尸阵营可用，3 秒后传回出生点（90 秒 CD）',
    defaultKey: 'z',
    command: 'say .ztele'
  },
  {
    id: 'fys_stopsound',
    profile: 'fys',
    category: 'ZE 核心与指挥',
    subGroup: '视野与生存',
    label: '屏蔽其他玩家枪声',
    cmdDisplay: '.stopsound',
    desc: '开关屏蔽其他玩家枪声，清晰听清指挥语音',
    defaultKey: 'n',
    command: 'say .stopsound'
  },
  {
    id: 'fys_nv',
    profile: 'fys',
    category: 'ZE 核心与指挥',
    subGroup: '视野与生存',
    label: '开关夜视仪模式',
    cmdDisplay: '.nv',
    desc: '在暗图快速开关夜视仪',
    defaultKey: 'l',
    command: 'say .nv'
  },
  {
    id: 'fys_f3',
    profile: 'fys',
    category: 'ZE 核心与指挥',
    subGroup: '职业与设置',
    label: '打开 ZE 设置菜单',
    cmdDisplay: '.f3',
    desc: '打开僵尸逃跑设置面板（默认按键 F3）',
    defaultKey: '',
    command: 'say .f3'
  },
  {
    id: 'fys_guns',
    profile: 'fys',
    category: 'ZE 核心与指挥',
    subGroup: '职业与设置',
    label: '设置初始武器',
    cmdDisplay: '.guns',
    desc: '打开每局自动配发的初始武器设置菜单',
    defaultKey: '',
    command: 'say .guns'
  },
  {
    id: 'fys_hclass',
    profile: 'fys',
    category: 'ZE 核心与指挥',
    subGroup: '职业与设置',
    label: '更换人类种类',
    cmdDisplay: '.hclass',
    desc: '打开更换人类种类/职业面板',
    defaultKey: 'F9',
    command: 'say .hclass'
  },
  {
    id: 'fys_zclass',
    profile: 'fys',
    category: 'ZE 核心与指挥',
    subGroup: '职业与设置',
    label: '更换僵尸种类',
    cmdDisplay: '.zclass',
    desc: '打开更换僵尸种类/职业面板',
    defaultKey: 'F10',
    command: 'say .zclass'
  },
  {
    id: 'fys_awp',
    profile: 'fys',
    category: 'ZE 核心与指挥',
    subGroup: '职业与设置',
    label: '成为雷神统御',
    cmdDisplay: '.awp',
    desc: '申请成为雷神统御',
    defaultKey: '',
    command: 'say .awp'
  },
  {
    id: 'fys_ehud',
    profile: 'fys',
    category: 'ZE 核心与指挥',
    subGroup: '神器与地图信息',
    label: '开关神器面板',
    cmdDisplay: '.ehud',
    desc: '开关屏幕上的神器状态面板显示',
    defaultKey: 'j',
    command: 'say .ehud'
  },
  {
    id: 'fys_epos',
    profile: 'fys',
    category: 'ZE 核心与指挥',
    subGroup: '神器与地图信息',
    label: '调整神器面板坐标',
    cmdDisplay: '.epos <x> <y>',
    desc: '自定义神器面板屏幕坐标',
    note: '范围 X(0~10), Y(0~3.8)，如 .epos 3 0.5',
    defaultKey: '',
    command: 'say .epos',
    hasParam: true,
    defaultParam: '3 0.5',
    paramPlaceholder: 'X(0~10) Y(0~3.8)',
    paramRequired: true
  },
  {
    id: 'fys_estatus',
    profile: 'fys',
    category: 'ZE 核心与指挥',
    subGroup: '神器与地图信息',
    label: '查询神器信用',
    cmdDisplay: '.estatus',
    desc: '查询自己的神器信用分与状态',
    defaultKey: '',
    command: 'say .estatus'
  },
  {
    id: 'fys_level',
    profile: 'fys',
    category: 'ZE 核心与指挥',
    subGroup: '神器与地图信息',
    label: '查看个人神器等级',
    cmdDisplay: '.level',
    desc: '查看当前地图个人神器等级',
    defaultKey: '',
    command: 'say .level'
  },
  {
    id: 'fys_knockback',
    profile: 'fys',
    category: 'ZE 核心与指挥',
    subGroup: '神器与地图信息',
    label: '查询当前地图击退',
    cmdDisplay: '.knockback',
    desc: '查询当前地图的武器击退参数',
    defaultKey: '',
    command: 'say .knockback'
  },
  {
    id: 'fys_c',
    profile: 'fys',
    category: 'ZE 核心与指挥',
    subGroup: '指挥官系统',
    label: '担任指挥官',
    cmdDisplay: '.c',
    desc: '申请担任本局人类指挥官',
    defaultKey: '',
    command: 'say .c'
  },
  {
    id: 'fys_dc',
    profile: 'fys',
    category: 'ZE 核心与指挥',
    subGroup: '指挥官系统',
    label: '辞去指挥官',
    cmdDisplay: '.dc',
    desc: '卸任当前指挥官职位',
    defaultKey: '',
    command: 'say .dc'
  },
  {
    id: 'fys_marker',
    profile: 'fys',
    category: 'ZE 核心与指挥',
    subGroup: '指挥官系统',
    label: '指挥官地形标点',
    cmdDisplay: '.marker',
    desc: '对准心指向的地形生成标记点（默认鼠标中键）',
    defaultKey: 'mouse3',
    command: 'say .marker'
  },
  {
    id: 'fys_crm',
    profile: 'fys',
    category: 'ZE 核心与指挥',
    subGroup: '指挥官系统',
    label: '取消最早标记点',
    cmdDisplay: '.crm',
    desc: '指挥官取消最早放置的一个地形标记点',
    defaultKey: '',
    command: 'say .crm'
  },
  {
    id: 'fys_cdu',
    profile: 'fys',
    category: 'ZE 核心与指挥',
    subGroup: '指挥官系统',
    label: '指定参谋长',
    cmdDisplay: '.cdu <对象>',
    desc: '指定某位人类玩家担任参谋长（如 .cdu $1）',
    defaultKey: '',
    command: 'say .cdu',
    hasParam: true,
    defaultParam: '$1',
    paramPlaceholder: '$pid 如 $1',
    paramRequired: true
  },
  {
    id: 'fys_cdd',
    profile: 'fys',
    category: 'ZE 核心与指挥',
    subGroup: '指挥官系统',
    label: '辞去参谋长',
    cmdDisplay: '.cdd',
    desc: '辞去当前参谋长职位',
    defaultKey: '',
    command: 'say .cdd'
  },

  // =========================================================================
  // FYS 风云社 — 玩家通用指令
  // =========================================================================
  {
    id: 'fys_tp',
    profile: 'fys',
    category: '玩家通用指令',
    subGroup: '视角与语音',
    label: '开关第三人称',
    cmdDisplay: '.tp',
    desc: '仅 ZE 模式人类和其他模式热身阶段可用（跳刀必备）',
    defaultKey: 't',
    command: 'say .tp'
  },
  {
    id: 'fys_sm',
    profile: 'fys',
    category: '玩家通用指令',
    subGroup: '视角与语音',
    label: '屏蔽普通玩家语音',
    cmdDisplay: '.sm',
    desc: '屏蔽其他玩家语音，保留指挥官、侦探和管理员语音',
    defaultKey: 'm',
    command: 'say .sm'
  },
  {
    id: 'fys_su',
    profile: 'fys',
    category: '玩家通用指令',
    subGroup: '视角与语音',
    label: '解除语音屏蔽',
    cmdDisplay: '.su',
    desc: '解除 .sm 屏蔽，恢复所有玩家语音',
    defaultKey: ',',
    command: 'say .su'
  },
  {
    id: 'fys_legs',
    profile: 'fys',
    category: '玩家通用指令',
    subGroup: '视角与语音',
    label: '开关第一人称腿部',
    cmdDisplay: '.legs',
    desc: '开关显示第一人称视角下的腿部模型',
    defaultKey: '',
    command: 'say .legs'
  },
  {
    id: 'fys_thud',
    profile: 'fys',
    category: '玩家通用指令',
    subGroup: '视角与语音',
    label: '更换信息面板模式',
    cmdDisplay: '.thud',
    desc: '切换信息面板为 跟随相机 / 跟随视角 / 跟随玩家',
    defaultKey: '',
    command: 'say .thud'
  },
  {
    id: 'fys_dt',
    profile: 'fys',
    category: '玩家通用指令',
    subGroup: '视角与语音',
    label: '切换伤害动效模式',
    cmdDisplay: '.dt',
    desc: '切换命中伤害数字/动效的显示模式',
    defaultKey: '',
    command: 'say .dt'
  },
  {
    id: 'fys_fl',
    profile: 'fys',
    category: '玩家通用指令',
    subGroup: '视角与语音',
    label: '开关强光手电/夜视仪',
    cmdDisplay: '.fl',
    desc: '需在 F3 菜单中设置强光手电为“指令(.fl)”才能生效',
    defaultKey: '',
    command: 'say .fl'
  },
  {
    id: 'fys_yd',
    profile: 'fys',
    category: '玩家通用指令',
    subGroup: '地图预定与查询',
    label: '预定地图 / 打开面板',
    cmdDisplay: '.yd [地图名]',
    desc: '留空打开地图预定面板；填地图名支持模糊搜索直接预定',
    note: '例：.yd 或 .yd ze_fapescape_p',
    defaultKey: 'p',
    command: 'say .yd',
    hasParam: true,
    defaultParam: '',
    paramPlaceholder: '留空开面板，或填地图名'
  },
  {
    id: 'fys_maps',
    profile: 'fys',
    category: '玩家通用指令',
    subGroup: '地图预定与查询',
    label: '查看服务器地图列表',
    cmdDisplay: '.maps',
    desc: '在控制台输出服务器所有地图列表',
    defaultKey: '',
    command: 'say .maps'
  },
  {
    id: 'fys_nlist',
    profile: 'fys',
    category: '玩家通用指令',
    subGroup: '地图预定与查询',
    label: '查看已预定地图',
    cmdDisplay: '.nlist',
    desc: '在控制台输出当前所有已预定地图列表',
    defaultKey: '',
    command: 'say .nlist'
  },
  {
    id: 'fys_store',
    profile: 'fys',
    category: '玩家通用指令',
    subGroup: '商城、签到与账户',
    label: '打开皮肤商城',
    cmdDisplay: '.store',
    desc: '打开风云社皮肤商城菜单',
    defaultKey: '',
    command: 'say .store'
  },
  {
    id: 'fys_skin',
    profile: 'fys',
    category: '玩家通用指令',
    subGroup: '商城、签到与账户',
    label: '皮肤和语音设置',
    cmdDisplay: '.skin',
    desc: '打开个人皮肤与语音包设置',
    defaultKey: '',
    command: 'say .skin'
  },
  {
    id: 'fys_v',
    profile: 'fys',
    category: '玩家通用指令',
    subGroup: '商城、签到与账户',
    label: '打开 VIP 菜单',
    cmdDisplay: '.v',
    desc: '打开 VIP 专属功能菜单',
    defaultKey: '',
    command: 'say .v'
  },
  {
    id: 'fys_hd',
    profile: 'fys',
    category: '玩家通用指令',
    subGroup: '商城、签到与账户',
    label: '打开活动菜单',
    cmdDisplay: '.hd',
    desc: '打开社区活动菜单（默认快捷键位为句号键）',
    defaultKey: '',
    command: 'say .hd'
  },
  {
    id: 'fys_card',
    profile: 'fys',
    category: '玩家通用指令',
    subGroup: '商城、签到与账户',
    label: '打开卡片仓库',
    cmdDisplay: '.card',
    desc: '查看通过活动或公会兑换获得的卡片',
    defaultKey: '',
    command: 'say .card'
  },
  {
    id: 'fys_qiandao',
    profile: 'fys',
    category: '玩家通用指令',
    subGroup: '商城、签到与账户',
    label: '每日签到',
    cmdDisplay: '.qiandao',
    desc: '进行社区每日签到领取奖励',
    defaultKey: '',
    command: 'say .qiandao'
  },
  {
    id: 'fys_user',
    profile: 'fys',
    category: '玩家通用指令',
    subGroup: '商城、签到与账户',
    label: '查看个人信息',
    cmdDisplay: '.user',
    desc: '查看个人社区账户信息',
    defaultKey: '',
    command: 'say .user'
  },
  {
    id: 'fys_credits',
    profile: 'fys',
    category: '玩家通用指令',
    subGroup: '商城、签到与账户',
    label: '查看龙晶余额',
    cmdDisplay: '.credits',
    desc: '显示自己的龙晶余额',
    defaultKey: '',
    command: 'say .credits'
  },
  {
    id: 'fys_spray',
    profile: 'fys',
    category: '玩家通用指令',
    subGroup: '互动与社交',
    label: '对墙体喷漆',
    cmdDisplay: '.spray',
    desc: '对准心指向的墙面进行喷漆',
    defaultKey: '',
    command: 'say .spray'
  },
  {
    id: 'fys_cheer',
    profile: 'fys',
    category: '玩家通用指令',
    subGroup: '互动与社交',
    label: '发出欢呼音效',
    cmdDisplay: '.cheer',
    desc: '播放角色欢呼音效',
    defaultKey: '',
    command: 'say .cheer'
  },
  {
    id: 'fys_cp',
    profile: 'fys',
    category: '玩家通用指令',
    subGroup: '互动与社交',
    label: '打开 CP 菜单',
    cmdDisplay: '.cp',
    desc: '打开 CP 关系菜单',
    defaultKey: '',
    command: 'say .cp'
  },
  {
    id: 'fys_cptp',
    profile: 'fys',
    category: '玩家通用指令',
    subGroup: '互动与社交',
    label: '打开 CP 传送菜单',
    cmdDisplay: '.cptp',
    desc: '打开 CP 传送功能菜单',
    defaultKey: '',
    command: 'say .cptp'
  },
  {
    id: 'fys_lb',
    profile: 'fys',
    category: '玩家通用指令',
    subGroup: '互动与社交',
    label: '发送全服喇叭',
    cmdDisplay: '.lb <内容>',
    desc: '发送全服喇叭播报消息',
    defaultKey: '',
    command: 'say .lb',
    hasParam: true,
    defaultParam: '',
    paramPlaceholder: '输入播报内容',
    paramRequired: true
  },
  {
    id: 'fys_bind',
    profile: 'fys',
    category: '玩家通用指令',
    subGroup: '账户关联',
    label: '绑定论坛账户',
    cmdDisplay: '.bind',
    desc: '绑定关联风云社论坛账户',
    defaultKey: '',
    command: 'say .bind'
  },
  {
    id: 'fys_password',
    profile: 'fys',
    category: '玩家通用指令',
    subGroup: '账户关联',
    label: '获取官网临时密码',
    cmdDisplay: '.password',
    desc: '获取登录官网所需的临时密码',
    defaultKey: '',
    command: 'say .password'
  },
  {
    id: 'fys_client',
    profile: 'fys',
    category: '玩家通用指令',
    subGroup: '账户关联',
    label: '登录助手状态',
    cmdDisplay: '.client',
    desc: '查看登录助手在线状态',
    defaultKey: '',
    command: 'say .client'
  },
  {
    id: 'fys_kook',
    profile: 'fys',
    category: '玩家通用指令',
    subGroup: '账户关联',
    label: 'KOOK 互联状态',
    cmdDisplay: '.kook',
    desc: '查看 KOOK 语音互联状态',
    defaultKey: '',
    command: 'say .kook'
  },

  // =========================================================================
  // FYS 风云社 — 全模式专有 (娱乐对抗 / 匪镇谍影 / 魔兽混战)
  // =========================================================================
  {
    id: 'fys_mg_hide',
    profile: 'fys',
    category: '全模式专有',
    subGroup: '娱乐对抗',
    label: '屏蔽所有队友模型',
    cmdDisplay: '.hide',
    desc: '屏蔽所有队友模型（鼠标中键可短暂解除屏蔽）',
    defaultKey: 'h',
    command: 'say .hide'
  },
  {
    id: 'fys_bet',
    profile: 'fys',
    category: '全模式专有',
    subGroup: '娱乐对抗 / 魔兽混战',
    label: '阵营助力竞猜',
    cmdDisplay: '.bet <阵营> <助力值>',
    desc: '助力阶段选择 ct 或 t 阵营获胜（范围 50~3000）',
    note: '例：.bet ct 100',
    defaultKey: '',
    command: 'say .bet',
    hasParam: true,
    defaultParam: 'ct 100',
    paramPlaceholder: 'ct/t 50~3000',
    paramRequired: true
  },
  {
    id: 'fys_ttt_shop',
    profile: 'fys',
    category: '全模式专有',
    subGroup: '匪镇谍影 (TTT)',
    label: '打开帮助菜单',
    cmdDisplay: '.shop',
    desc: '打开匪镇谍影帮助/商店菜单（默认按键 F3）',
    defaultKey: '',
    command: 'say .shop'
  },
  {
    id: 'fys_ttt_menu',
    profile: 'fys',
    category: '全模式专有',
    subGroup: '匪镇谍影 (TTT)',
    label: '打开高级菜单',
    cmdDisplay: '.menu',
    desc: '打开匪镇谍影高级菜单（默认按键 F4）',
    defaultKey: '',
    command: 'say .menu'
  },
  {
    id: 'fys_ttt_log',
    profile: 'fys',
    category: '全模式专有',
    subGroup: '匪镇谍影 (TTT)',
    label: '查看当局伤害日志',
    cmdDisplay: '.log',
    desc: '在控制台显示当局伤害记录日志',
    defaultKey: '',
    command: 'say .log'
  },
  {
    id: 'fys_ttt_kill',
    profile: 'fys',
    category: '全模式专有',
    subGroup: '匪镇谍影 (TTT)',
    label: '背一次锅',
    cmdDisplay: '.kill',
    desc: '背锅自杀，惩罚下回合内无法游玩',
    defaultKey: '',
    command: 'say .kill'
  },
  {
    id: 'fys_war3_menu',
    profile: 'fys',
    category: '全模式专有',
    subGroup: '魔兽混战 (War3)',
    label: '打开魔兽主菜单',
    cmdDisplay: '.war3',
    desc: '打开魔兽混战主菜单（默认按键 F3）',
    defaultKey: '',
    command: 'say .war3'
  },
  {
    id: 'fys_war3_bank',
    profile: 'fys',
    category: '全模式专有',
    subGroup: '魔兽混战 (War3)',
    label: '打开魔兽银行',
    cmdDisplay: '.bank',
    desc: '存取魔兽模式现金',
    defaultKey: '',
    command: 'say .bank'
  },
  {
    id: 'fys_war3_f3',
    profile: 'fys',
    category: '全模式专有',
    subGroup: '魔兽混战 (War3)',
    label: '打开魔兽装备商店',
    cmdDisplay: '.f3',
    desc: '打开魔兽装备购买商店',
    defaultKey: '',
    command: 'say .f3'
  },
  {
    id: 'fys_war3_withdraw',
    profile: 'fys',
    category: '全模式专有',
    subGroup: '魔兽混战 (War3)',
    label: '快捷取款 2w 现金',
    cmdDisplay: '.withdraw',
    desc: '一键从魔兽银行取出 20000 现金',
    defaultKey: '',
    command: 'say .withdraw'
  },
  {
    id: 'fys_war3_ability',
    profile: 'fys',
    category: '全模式专有',
    subGroup: '魔兽混战 (War3)',
    label: '使用种族主动技能',
    cmdDisplay: '.ability',
    desc: '触发当前种族的主动技能',
    defaultKey: 'q',
    command: 'say .ability'
  },
  {
    id: 'fys_war3_ultimate',
    profile: 'fys',
    category: '全模式专有',
    subGroup: '魔兽混战 (War3)',
    label: '使用种族超绝技能',
    cmdDisplay: '.ultimate',
    desc: '触发当前种族的超绝大招',
    defaultKey: 'x',
    command: 'say .ultimate'
  },
  {
    id: 'fys_war3_16x9',
    profile: 'fys',
    category: '全模式专有',
    subGroup: '魔兽混战 (War3)',
    label: 'UI 适配 16:9',
    cmdDisplay: '.16x9',
    desc: '将魔兽游戏 UI 适配为 16:9 分辨率',
    defaultKey: '',
    command: 'say .16x9'
  },
  {
    id: 'fys_war3_4x3',
    profile: 'fys',
    category: '全模式专有',
    subGroup: '魔兽混战 (War3)',
    label: 'UI 适配 4:3',
    cmdDisplay: '.4x3',
    desc: '将魔兽游戏 UI 适配为 4:3 分辨率',
    defaultKey: '',
    command: 'say .4x3'
  },

  // =========================================================================
  // EXG / ZED 社区指令 — 基本与订图
  // =========================================================================
  // 基本
  {
    id: 'exg_mm',
    profile: 'exg',
    category: 'EXG 基本与订图',
    subGroup: '基本指令',
    label: '打开游戏内设置菜单',
    cmdDisplay: '.mm',
    desc: '打开 EXG 游戏内设置菜单，各项功能可在此调整',
    defaultKey: 'F3',
    command: 'say .mm'
  },
  {
    id: 'exg_jy',
    profile: 'exg',
    category: 'EXG 基本与订图',
    subGroup: '基本指令',
    label: '开关语音静音',
    cmdDisplay: '.jy <数字>',
    desc: '0 不静音；1 屏蔽所有玩家语音（不含指挥官）；2 屏蔽全部（含指挥官）',
    defaultKey: 'm',
    command: 'say .jy',
    hasParam: true,
    defaultParam: '1',
    paramPlaceholder: '0不静音 / 1屏蔽玩家 / 2含指挥官'
  },
  {
    id: 'exg_qs',
    profile: 'exg',
    category: 'EXG 基本与订图',
    subGroup: '基本指令',
    label: '修改自己枪声音量',
    cmdDisplay: '.qs <音量>',
    desc: '调整自身枪声音量，支持 0-100 之间的数字',
    defaultKey: 'n',
    command: 'say .qs',
    hasParam: true,
    defaultParam: '0',
    paramPlaceholder: '0~100（0为静音）'
  },
  {
    id: 'exg_hidename',
    profile: 'exg',
    category: 'EXG 基本与订图',
    subGroup: '基本指令',
    label: '队友头顶名字显示距离',
    cmdDisplay: '.hidename <数字>',
    desc: '修改显示队友头顶名字的距离范围',
    note: '0或1不显示任何人，9999显示几乎全部，如 .hidename 200',
    defaultKey: '',
    command: 'say .hidename',
    hasParam: true,
    defaultParam: '200',
    paramPlaceholder: '0/1不显示 · 200 · 9999全部'
  },
  {
    id: 'exg_nv',
    profile: 'exg',
    category: 'EXG 基本与订图',
    subGroup: '基本指令',
    label: '开关夜视仪',
    cmdDisplay: '.nv',
    desc: '快速开关夜视仪',
    defaultKey: 'l',
    command: 'say .nv'
  },
  {
    id: 'exg_tp',
    profile: 'exg',
    category: 'EXG 基本与订图',
    subGroup: '基本指令',
    label: '开关新版第三人称（控制台）',
    cmdDisplay: 'tp',
    desc: 'EXG 新版第三人称开关，控制台输入 tp 生效，未开启假作弊的地图也可使用（不支持固定视角）',
    note: '控制台指令，不带 say / 点号；建议配合聊天指令 .tp 150、.tph 0 调节镜头',
    defaultKey: 'f9',
    command: 'tp'
  },
  {
    id: 'exg_tp_dist',
    profile: 'exg',
    category: 'EXG 基本与订图',
    subGroup: '基本指令',
    label: '调整第三人称镜头距离',
    cmdDisplay: '.tp <数字>',
    desc: '聊天框设置新版第三人称的镜头远近距离（需配合控制台 tp 开启使用）',
    note: '新版推荐数值：.tp 150',
    defaultKey: '',
    command: 'say .tp',
    hasParam: true,
    defaultParam: '150',
    paramPlaceholder: '填距离数值，推荐 150',
    paramRequired: true
  },
  {
    id: 'exg_tph',
    profile: 'exg',
    category: 'EXG 基本与订图',
    subGroup: '基本指令',
    label: '调整第三人称镜头水平位置',
    cmdDisplay: '.tph <数字>',
    desc: '聊天框控制新版第三人称视角的镜头水平位置（相对于肩部）',
    note: '推荐数值：.tph 0',
    defaultKey: '',
    command: 'say .tph',
    hasParam: true,
    defaultParam: '0',
    paramPlaceholder: '推荐 0',
    paramRequired: true
  },
  {
    id: 'exg_bet_ct',
    profile: 'exg',
    category: 'EXG 基本与订图',
    subGroup: '基本指令',
    label: '切换人类装备模板',
    cmdDisplay: '.bet ct [模板名/序号]',
    desc: '在游戏内快速轮换切换人类（CT）装备/皮肤模板，留空依次轮换',
    note: '也可在队伍后加模板名或序号，如 .bet ct 1',
    defaultKey: '',
    command: 'say .bet ct',
    hasParam: true,
    paramLabel: '模板/序号',
    defaultParam: '',
    paramPlaceholder: '留空依次轮换，或填模板名 / 序号'
  },
  {
    id: 'exg_bet_t',
    profile: 'exg',
    category: 'EXG 基本与订图',
    subGroup: '基本指令',
    label: '切换僵尸装备模板',
    cmdDisplay: '.bet t [模板名/序号]',
    desc: '在游戏内快速轮换切换僵尸（T）装备/皮肤模板，留空依次轮换',
    note: '也可在队伍后加模板名或序号，如 .bet t 1',
    defaultKey: '',
    command: 'say .bet t',
    hasParam: true,
    paramLabel: '模板/序号',
    defaultParam: '',
    paramPlaceholder: '留空依次轮换，或填模板名 / 序号'
  },
  {
    id: 'exg_fwq',
    profile: 'exg',
    category: 'EXG 基本与订图',
    subGroup: '基本指令',
    label: '查看当前服务器信息',
    cmdDisplay: '.fwq',
    desc: '查看当前所在服务器信息',
    defaultKey: '',
    command: 'say .fwq'
  },
  {
    id: 'exg_tj',
    profile: 'exg',
    category: 'EXG 基本与订图',
    subGroup: '基本指令',
    label: '查看统计信息与活动加成',
    cmdDisplay: '.tj',
    desc: '查看个人统计信息及当前活动加成',
    defaultKey: '',
    command: 'say .tj'
  },
  {
    id: 'exg_qd',
    profile: 'exg',
    category: 'EXG 基本与订图',
    subGroup: '基本指令',
    label: '查看今日签到信息',
    cmdDisplay: '.qd',
    desc: '查看今日签到状态（在线 30 分钟算签到，有活动时会说明）',
    defaultKey: '',
    command: 'say .qd'
  },
  {
    id: 'exg_vip',
    profile: 'exg',
    category: 'EXG 基本与订图',
    subGroup: '基本指令',
    label: '查看 VIP 介绍与到期时间',
    cmdDisplay: '.vip',
    desc: '查看 VIP 权益介绍及个人到期时间',
    defaultKey: '',
    command: 'say .vip'
  },
  {
    id: 'exg_vip000',
    profile: 'exg',
    category: 'EXG 基本与订图',
    subGroup: '基本指令',
    label: '刷新 VIP 到期时间',
    cmdDisplay: '.vip000',
    desc: '付款完成后刷新读取自己的 VIP 到期时间',
    defaultKey: '',
    command: 'say .vip000'
  },
  {
    id: 'exg_pwa',
    profile: 'exg',
    category: 'EXG 基本与订图',
    subGroup: '基本指令',
    label: '刷新完美世界充值结果',
    cmdDisplay: '.pwa',
    desc: '在完美世界充值之后刷新充值到账结果',
    defaultKey: '',
    command: 'say .pwa'
  },

  // 订图
  {
    id: 'exg_rtv',
    profile: 'exg',
    category: 'EXG 基本与订图',
    subGroup: '订图与投票',
    label: '发起提前换图投票',
    cmdDisplay: 'rtv',
    desc: '发起或参与提前换图投票',
    note: '前面不带点号或感叹号，直接输出到聊天框',
    defaultKey: 'F6',
    command: 'say rtv'
  },
  {
    id: 'exg_timeleft',
    profile: 'exg',
    category: 'EXG 基本与订图',
    subGroup: '订图与投票',
    label: '查看地图剩余时间',
    cmdDisplay: 'timeleft',
    desc: '查询当前地图剩余时间',
    note: '前面不带点号或感叹号，直接输出到聊天框',
    defaultKey: '',
    command: 'say timeleft'
  },
  {
    id: 'exg_nomlist',
    profile: 'exg',
    category: 'EXG 基本与订图',
    subGroup: '订图与投票',
    label: '查看当前服务器预订列表',
    cmdDisplay: '.nomlist',
    desc: '查看当前服务器已预订的地图队列',
    defaultKey: 'F7',
    command: 'say .nomlist'
  },
  {
    id: 'exg_revote',
    profile: 'exg',
    category: 'EXG 基本与订图',
    subGroup: '订图与投票',
    label: '撤回地图投票',
    cmdDisplay: '.revote',
    desc: '游戏快结束地图投票时撤回自己的投票重新选择',
    defaultKey: '',
    command: 'say .revote'
  },
  {
    id: 'exg_mi',
    profile: 'exg',
    category: 'EXG 基本与订图',
    subGroup: '订图与投票',
    label: '查看当前地图信息',
    cmdDisplay: '.mi',
    desc: '查看当前地图是否为预订地图等详细信息',
    defaultKey: '',
    command: 'say .mi'
  },
  {
    id: 'exg_emaplist',
    profile: 'exg',
    category: 'EXG 基本与订图',
    subGroup: '订图与投票',
    label: '输出地图库列表到控制台',
    cmdDisplay: '.emaplist',
    desc: '将当前服务器完整地图库列表输出至控制台',
    defaultKey: '',
    command: 'say .emaplist'
  },
  {
    id: 'exg_ve',
    profile: 'exg',
    category: 'EXG 基本与订图',
    subGroup: '订图与投票',
    label: '申请延长当前地图',
    cmdDisplay: '.ve',
    desc: '发起投票申请延长当前地图时长（VIP 玩家可用）',
    defaultKey: '',
    command: 'say .ve'
  },

  // =========================================================================
  // EXG — ZE / ZM 与指挥官
  // =========================================================================
  // ZE / ZM
  {
    id: 'exg_hide',
    profile: 'exg',
    category: 'EXG ZE / ZM 与指挥',
    subGroup: 'ZE / ZM 核心',
    label: '隐藏指定距离内队友',
    cmdDisplay: '.hide <距离>',
    desc: '隐藏 0-9999 范围内的队友，0 显示全部，留空默认 200',
    defaultKey: 'h',
    command: 'say .hide',
    hasParam: true,
    defaultParam: '200',
    paramPlaceholder: '0显示全部 / 留空默认200 / 0~9999'
  },
  {
    id: 'exg_hidep',
    profile: 'exg',
    category: 'EXG ZE / ZM 与指挥',
    subGroup: 'ZE / ZM 核心',
    label: '限制人类皮肤显示人数',
    cmdDisplay: '.hidep <人数>',
    desc: '超出人数显示低质小人模型以提升帧数，0 显示全部',
    note: '低配电脑推荐 10，最少可填 5',
    defaultKey: '',
    command: 'say .hidep',
    hasParam: true,
    defaultParam: '10',
    paramPlaceholder: '0全部 / 推荐10 / 最少5'
  },
  {
    id: 'exg_hidew',
    profile: 'exg',
    category: 'EXG ZE / ZM 与指挥',
    subGroup: 'ZE / ZM 核心',
    label: 'Hide 白名单总开关',
    cmdDisplay: '.hidew <0/1>',
    desc: '快捷开关 hide 白名单（.hidew 1 打开，留空直接切换）',
    defaultKey: '',
    command: 'say .hidew',
    hasParam: true,
    defaultParam: '',
    paramPlaceholder: '留空切换 / 0关闭 / 1打开'
  },
  {
    id: 'exg_hidewq',
    profile: 'exg',
    category: 'EXG ZE / ZM 与指挥',
    subGroup: 'ZE / ZM 核心',
    label: '开关隐藏他人武器模型',
    cmdDisplay: '.hidewq',
    desc: '隐藏其他玩家武器模型以提升帧数（hide 白名单玩家不受影响）',
    defaultKey: '',
    command: 'say .hidewq'
  },
  {
    id: 'exg_ztele',
    profile: 'exg',
    category: 'EXG ZE / ZM 与指挥',
    subGroup: 'ZE / ZM 核心',
    label: '僵尸卡住回城',
    cmdDisplay: '.ztele',
    desc: '僵尸传送指令，5 秒后传回出生点（期间不可乱走）',
    defaultKey: 'z',
    command: 'say .ztele'
  },
  {
    id: 'exg_dtlj',
    profile: 'exg',
    category: 'EXG ZE / ZM 与指挥',
    subGroup: 'ZE / ZM 核心',
    label: '开关地图滤镜',
    cmdDisplay: '.dtlj',
    desc: '快速开启或关闭当前地图滤镜效果',
    defaultKey: '',
    command: 'say .dtlj'
  },
  {
    id: 'exg_hud',
    profile: 'exg',
    category: 'EXG ZE / ZM 与指挥',
    subGroup: 'ZE / ZM 核心',
    label: '调整速度 / 职业技能 HUD',
    cmdDisplay: '.hud',
    desc: '切换或调整速度表、职业技能 HUD 显示',
    defaultKey: 'j',
    command: 'say .hud'
  },
  {
    id: 'exg_zy',
    profile: 'exg',
    category: 'EXG ZE / ZM 与指挥',
    subGroup: 'ZE / ZM 核心',
    label: '更换人类 / 僵尸职业',
    cmdDisplay: '.zy <数字/拼音>',
    desc: '更换人类或僵尸职业（目前仅在 ZM 有效）',
    note: '拼音举例：医疗兵 ylb，迷雾僵尸 mwjs',
    defaultKey: '',
    command: 'say .zy',
    hasParam: true,
    defaultParam: '',
    paramPlaceholder: '数字或拼音如 ylb / mwjs'
  },
  {
    id: 'exg_cheer',
    profile: 'exg',
    category: 'EXG ZE / ZM 与指挥',
    subGroup: 'ZE / ZM 核心',
    label: '发出嘲笑声',
    cmdDisplay: '.cheer',
    desc: '发出嘲笑声（蚌埠住了!!）',
    defaultKey: '',
    command: 'say .cheer'
  },
  {
    id: 'exg_vl',
    profile: 'exg',
    category: 'EXG ZE / ZM 与指挥',
    subGroup: 'ZE / ZM 核心',
    label: '投票选举指挥官',
    cmdDisplay: '.vl <名字>',
    desc: '给某位玩家（或自己）投票当指挥官，票数集齐即生效',
    defaultKey: '',
    command: 'say .vl',
    hasParam: true,
    defaultParam: '',
    paramPlaceholder: '输入玩家名'
  },
  {
    id: 'exg_vlv',
    profile: 'exg',
    category: 'EXG ZE / ZM 与指挥',
    subGroup: 'ZE / ZM 核心',
    label: '预订者直接担任指挥',
    cmdDisplay: '.vlv',
    desc: '当前地图为预订地图且你是预订者时，直接成为指挥官',
    defaultKey: '',
    command: 'say .vlv'
  },
  {
    id: 'exg_hero',
    profile: 'exg',
    category: 'EXG ZE / ZM 与指挥',
    subGroup: 'ZE / ZM 核心',
    label: '打开英雄菜单 (PVE)',
    cmdDisplay: '.hero',
    desc: '打开英雄聊天框菜单（仅 PVE 伪人模式可用，需使用英雄勋章）',
    defaultKey: '',
    command: 'say .hero'
  },

  // ZE 指挥官
  {
    id: 'exg_ld2',
    profile: 'exg',
    category: 'EXG ZE / ZM 与指挥',
    subGroup: 'ZE 指挥官',
    label: '指挥官主动辞职',
    cmdDisplay: '.ld2',
    desc: '身为指挥官时主动辞去指挥职位',
    defaultKey: '',
    command: 'say .ld2'
  },
  {
    id: 'exg_tv',
    profile: 'exg',
    category: 'EXG ZE / ZM 与指挥',
    subGroup: 'ZE 指挥官',
    label: '检查或开关两队语音互通',
    cmdDisplay: '.TV <0/1>',
    desc: '控制人类与僵尸两队伍之间是否互相语音（.TV 1 允许互通）',
    defaultKey: '',
    command: 'say .TV',
    hasParam: true,
    defaultParam: '1',
    paramPlaceholder: '0关闭 / 1允许互通'
  },
  {
    id: 'exg_ldvp',
    profile: 'exg',
    category: 'EXG ZE / ZM 与指挥',
    subGroup: 'ZE 指挥官',
    label: '指挥官语音保护开关',
    cmdDisplay: '.LDVP <0/1>',
    desc: '默认关闭；1 为指挥官说话时其他玩家闭嘴',
    defaultKey: '',
    command: 'say .LDVP',
    hasParam: true,
    defaultParam: '1',
    paramPlaceholder: '0关闭 / 1开启语音保护'
  },
  {
    id: 'exg_beacon',
    profile: 'exg',
    category: 'EXG ZE / ZM 与指挥',
    subGroup: 'ZE 指挥官',
    label: '开关指定玩家信标',
    cmdDisplay: '.beacon <玩家>',
    desc: '为指定玩家开启或关闭光环信标效果',
    defaultKey: '',
    command: 'say .beacon',
    hasParam: true,
    defaultParam: '',
    paramPlaceholder: '输入玩家名',
    paramRequired: true
  },
  {
    id: 'exg_rr2',
    profile: 'exg',
    category: 'EXG ZE / ZM 与指挥',
    subGroup: 'ZE 指挥官',
    label: '发起平局投票',
    cmdDisplay: '.rr2',
    desc: '指挥官发起本回合平局重开投票',
    defaultKey: '',
    command: 'say .rr2'
  },
  {
    id: 'exg_votepeace',
    profile: 'exg',
    category: 'EXG ZE / ZM 与指挥',
    subGroup: 'ZE 指挥官',
    label: '发起跑图模式投票',
    cmdDisplay: '.votepeace',
    desc: '发起跑图模式投票（仅限 40 人以下时使用）',
    defaultKey: '',
    command: 'say .votepeace'
  },
  {
    id: 'exg_endpeace',
    profile: 'exg',
    category: 'EXG ZE / ZM 与指挥',
    subGroup: 'ZE 指挥官',
    label: '结束跑图模式',
    cmdDisplay: '.endpeace',
    desc: '结束跑图模式，当前回合会直接平局',
    defaultKey: '',
    command: 'say .endpeace'
  },

  // =========================================================================
  // EXG — 进阶视角与脚本 (参考 EXG 论坛 CFG 大合集 6143)
  // =========================================================================
  {
    id: 'exg_multi_input',
    profile: 'exg',
    category: 'EXG 进阶视角与脚本',
    subGroup: '前置必开与控制台优化',
    label: '开启多重输入绑定（脚本必开）',
    cmdDisplay: 'cl_allow_multi_input_binds true',
    desc: '开启 CS2 多重输入绑定支持，EXG 大部分视角/防震动/辅助脚本均依赖此指令',
    note: '未开启会导致部分脚本无法生效或功能异常',
    defaultKey: '',
    command: 'cl_allow_multi_input_binds true',
    isDirectCvar: true
  },
  {
    id: 'exg_console_clean',
    profile: 'exg',
    category: 'EXG 进阶视角与脚本',
    subGroup: '前置必开与控制台优化',
    label: '控制台文本清理',
    cmdDisplay: 'log_flags +donotecho',
    desc: '屏蔽控制台刷屏的冗余开发/材质/音频/资源日志，还你一份干净的控制台',
    defaultKey: '',
    command: [
      'log_flags +Developer +donotecho',
      'log_flags "CL CommandQueue" +donotecho',
      'log_flags MaterialSystem +donotecho',
      'log_flags AnimResource +donotecho',
      'log_flags ResourceSystem +donotecho',
      'log_flags SoundSystem +donotecho',
      'log_flags SndOperators +donotecho',
      'log_flags Console +donotecho'
    ].join('\n'),
    isDirectCvar: true
  },
  {
    id: 'exg_alias_exec',
    profile: 'exg',
    category: 'EXG 进阶视角与脚本',
    subGroup: '前置必开与控制台优化',
    label: 'CFG 快捷执行绰号（alias）',
    cmdDisplay: 'alias <简称> "exec <cfg>"',
    desc: '为长文件名 CFG 设置极短控制台别名，输入简称回车即可加载对应 CFG',
    note: '例如控制台输入 exw 即可执行 exg_ze.cfg',
    defaultKey: '',
    command: 'alias {{PARAM}}',
    isDirectCvar: true,
    hasParam: true,
    paramLabel: '别名定义',
    defaultParam: 'exw "exec exg_ze"',
    paramPlaceholder: '如 exw "exec exg_ze"',
    paramRequired: true
  },
  {
    id: 'exg_ysylj',
    profile: 'exg',
    category: 'EXG 进阶视角与脚本',
    subGroup: '画面、音效与实用指令',
    label: '一键循环切换夜视仪 / 滤镜（4种组合）',
    cmdDisplay: 'mat_fullbright + postprocess',
    desc: '单键循环切换夜视仪(0/1)与滤镜(0/1)共 4 种画面组合',
    note: '默认绑定右 Ctrl (rctrl)，可自定义按键',
    defaultKey: 'rctrl',
    command: [
      'bind "{{KEY}}" "ysylj"',
      'alias ysylj ysy0lj1',
      'alias ysy0lj1 "mat_fullbright 0;r_csgo_postprocess_enable 1;alias ysylj ysy0lj0"',
      'alias ysy0lj0 "mat_fullbright 0;r_csgo_postprocess_enable 0;alias ysylj ysy1lj0"',
      'alias ysy1lj0 "mat_fullbright 1;r_csgo_postprocess_enable 0;alias ysylj ysy1lj1"',
      'alias ysy1lj1 "mat_fullbright 1;r_csgo_postprocess_enable 1;alias ysylj ysy0lj1"'
    ].join('\n'),
    isKeyTemplate: true,
    bindMatchCmd: 'ysylj'
  },
  {
    id: 'exg_post_bloom',
    profile: 'exg',
    category: 'EXG 进阶视角与脚本',
    subGroup: '画面、音效与实用指令',
    label: '屏蔽后期处理泛光',
    cmdDisplay: 'toggle r_csgo_render_post_bloom',
    desc: '一键开关后期处理泛光（Bloom）效果，防止强光/过曝地图晃眼',
    defaultKey: '',
    command: 'toggle r_csgo_render_post_bloom'
  },
  {
    id: 'exg_draw_players',
    profile: 'exg',
    category: 'EXG 进阶视角与脚本',
    subGroup: '画面、音效与实用指令',
    label: '开关人物模型渲染',
    cmdDisplay: 'toggle r_drawcsplayers',
    desc: '一键隐藏/恢复游戏内全部人物模型渲染，适用于糖豆人 KZ 关等僵尸卡视角遮挡场景',
    defaultKey: '',
    command: 'toggle r_drawcsplayers'
  },
  {
    id: 'exg_stopsound_console',
    profile: 'exg',
    category: 'EXG 进阶视角与脚本',
    subGroup: '画面、音效与实用指令',
    label: '一键停止地图嘈杂音效',
    cmdDisplay: 'stopsound',
    desc: '立即静音并打断当前地图嘈杂的 playsound 事件（如火星逃亡圣诞版等）',
    defaultKey: '',
    command: 'stopsound'
  },
  {
    id: 'exg_tracers_toggle',
    profile: 'exg',
    category: 'EXG 进阶视角与脚本',
    subGroup: '画面、音效与实用指令',
    label: '开关第一人称弹道渲染',
    cmdDisplay: 'toggle r_drawtracers_firstperson',
    desc: '一键开关第一人称子弹弹道（如减少大狙弹道干扰），不影响指挥标点与 EXG 大狙准星，未开假作弊地图可用',
    defaultKey: '',
    command: 'toggle r_drawtracers_firstperson'
  },
  {
    id: 'exg_photo_mode',
    profile: 'exg',
    category: 'EXG 进阶视角与脚本',
    subGroup: '画面、音效与实用指令',
    label: '纯净拍照模式（隐藏手模与 HUD）',
    cmdDisplay: 'toggle r_drawviewmodel; toggle cl_drawhud',
    desc: '一键隐藏/恢复第一人称手模与全部 HUD 界面，适用于挂机服纯净拍照截图',
    note: '建议绑定不常用按键，避免实战误触隐藏界面',
    defaultKey: '',
    command: 'toggle r_drawviewmodel;toggle cl_drawhud'
  },
  {
    id: 'exg_combo_awp',
    profile: 'exg',
    category: 'EXG 进阶视角与脚本',
    subGroup: '画面、音效与实用指令',
    label: '组合宏：刷大狙 + 关弹道 + 切装备',
    cmdDisplay: 'awp; r_drawtracers_firstperson 0; bet ct',
    desc: '一键刷大狙、关闭第一人称弹道干扰并自动切换指定人类大狙装备模板',
    note: '装备服专用，下方填大狙装备模板名或序号',
    defaultKey: '',
    command: 'awp;r_drawtracers_firstperson 0;bet ct {{PARAM}}',
    hasParam: true,
    paramLabel: '大狙装备',
    defaultParam: '1',
    paramPlaceholder: '输入大狙装备模板名或序号，如 1',
    paramRequired: true
  },
  {
    id: 'exg_combo_negev',
    profile: 'exg',
    category: 'EXG 进阶视角与脚本',
    subGroup: '画面、音效与实用指令',
    label: '组合宏：刷内格夫 + 开弹道 + 切装备',
    cmdDisplay: 'negev; r_drawtracers_firstperson 1; bet ct',
    desc: '一键刷内格夫、恢复第一人称弹道并自动切换指定人类机枪装备模板',
    note: '装备服专用，下方填内格夫装备模板名或序号',
    defaultKey: '',
    command: 'negev;r_drawtracers_firstperson 1;bet ct {{PARAM}}',
    hasParam: true,
    paramLabel: '机枪装备',
    defaultParam: '2',
    paramPlaceholder: '输入内格夫装备模板名或序号，如 2',
    paramRequired: true
  },
  {
    id: 'exg_tp_shoulder',
    profile: 'exg',
    category: 'EXG 进阶视角与脚本',
    subGroup: '第三人称与视角',
    label: '越肩视角第三人称（四段循环）',
    cmdDisplay: 'cs_chasecam (近/远/固定/第一)',
    desc: '按第1下切第三人称(近)，第2下切第三人称(远)，第3下切固定相机，第4下恢复第一人称',
    note: '需开 cl_allow_multi_input_binds true；适用于开启假作弊的地图（未开请用基本指令的控制台 tp）',
    defaultKey: 'v',
    command: [
      'alias cam_settings "cam_ideallag 3;cam_collision 1; cam_idealyaw 0;cam_idealpitch 0;c_thirdpersonshoulder 1;c_thirdpersonshoulderheight 6;c_thirdpersonshoulderoffset 18;c_thirdpersonshoulderaimdist 1000;cam_idealdist 75"',
      'alias cs_aliasthird "thirdperson; cam_settings; alias cs_chasecam cs_aliasthird_far"',
      'alias cs_aliasthird_far "cam_idealdist 150; alias cs_chasecam cs_aliasthird_mayamode"',
      'alias cs_aliasthird_mayamode "thirdperson_mayamode; alias cs_chasecam cs_aliasfirst"',
      'alias cs_aliasfirst "firstperson; thirdperson_mayamode; alias cs_chasecam cs_aliasthird"',
      'alias cs_chasecam cs_aliasthird',
      'bind "{{KEY}}" "cs_chasecam"'
    ].join('\n'),
    isKeyTemplate: true,
    bindMatchCmd: 'cs_chasecam'
  },
  {
    id: 'exg_tp_shoulder_simple',
    profile: 'exg',
    category: 'EXG 进阶视角与脚本',
    subGroup: '第三人称与视角',
    label: '越肩视角第三人称（三段精简·无固定视角）',
    cmdDisplay: 'cs_chasecam (近/远/第一)',
    desc: '精简版越肩第三人称，移除 Maya 固定视角：中距(75) → 远距(150) → 第一人称循环',
    note: '需开 cl_allow_multi_input_binds true；适用于开启假作弊的地图',
    defaultKey: 'v',
    command: [
      'alias cam_settings "cam_ideallag 3;cam_collision 1; cam_idealyaw 0;cam_idealpitch 0;c_thirdpersonshoulder 1;c_thirdpersonshoulderheight 6;c_thirdpersonshoulderoffset 18;c_thirdpersonshoulderaimdist 1000;cam_idealdist 75"',
      'alias cs_aliasthird "thirdperson; cam_settings; alias cs_chasecam cs_aliasthird_far"',
      'alias cs_aliasthird_far "cam_idealdist 150; alias cs_chasecam cs_aliasfirst"',
      'alias cs_aliasfirst "firstperson; alias cs_chasecam cs_aliasthird"',
      'alias cs_chasecam cs_aliasthird',
      'bind "{{KEY}}" "cs_chasecam"'
    ].join('\n'),
    isKeyTemplate: true,
    bindMatchCmd: 'cs_chasecam'
  },
  {
    id: 'exg_soul_cam',
    profile: 'exg',
    category: 'EXG 进阶视角与脚本',
    subGroup: '第三人称与视角',
    label: '灵魂出窍（穿墙观察 + 滚轮缩放）',
    cmdDisplay: '+cam_soul',
    desc: '按住进入无碰撞穿墙视角，滚轮上下缩进/拉远镜头（穿墙观人、找神器、探路），松开恢复滚轮跳',
    note: '需开 cl_allow_multi_input_binds true；如滚轮非 +jump 可手动改 bindNormal',
    defaultKey: 'c',
    command: [
      'alias cam_settings_soul "cam_idealyaw 0; cam_idealpitch 0; cam_ideallag 3; c_thirdpersonshoulder 0;cam_idealdist 0;c_mindistance -50000; c_maxdistance 50000;"',
      'alias cs_aliasthird_soul "thirdperson; cam_settings_soul; alias cs_chasecam_soul cs_aliasfirst_soul"',
      'alias cs_aliasfirst_soul "firstperson; alias cs_chasecam_soul cs_aliasthird_soul"',
      'alias cs_chasecam_soul cs_aliasthird_soul',
      'bind "{{KEY}}" "+cam_soul"',
      'alias +cam_soul "cs_chasecam_soul; bindZoom; cam_collision 0"',
      'alias -cam_soul "cs_chasecam_soul; bindNormal"',
      'alias bindZoom "bind MWHEELUP incrementvar cam_idealdist -50000 50000 -100; bind MWHEELDOWN incrementvar cam_idealdist -50000 50000 100"',
      'alias bindNormal "bind MWHEELUP +jump; bind MWHEELDOWN +jump"'
    ].join('\n'),
    isKeyTemplate: true,
    bindMatchCmd: '+cam_soul'
  },
  {
    id: 'exg_spycam',
    profile: 'exg',
    category: 'EXG 进阶视角与脚本',
    subGroup: '第三人称与视角',
    label: '后视镜（按住向后看防抓背）',
    cmdDisplay: '+cs_spycam',
    desc: '按住瞬间切换 180° 后视镜观察身后僵尸，松开立即恢复正常第一人称',
    note: '准星偏肩可将 c_thirdpersonshoulder 1 改为 0；若转成侧面可将 cam_idealyaw 180 改为 179',
    defaultKey: 'x',
    command: [
      'alias spycam_settings "cam_collision 1; cam_ideallag 0; c_minyaw -180; c_maxyaw 180; cam_idealpitch 0; c_thirdpersonshoulder 1; c_thirdpersonshoulderheight 6; c_thirdpersonshoulderoffset 18; c_thirdpersonshoulderaimdist 100; cam_idealdist 125; cam_idealyaw 180"',
      'alias +cs_spycam "spycam_settings; thirdperson"',
      'alias -cs_spycam "cam_idealyaw 0; firstperson"',
      'bind "{{KEY}}" "+cs_spycam"'
    ].join('\n'),
    isKeyTemplate: true,
    bindMatchCmd: '+cs_spycam'
  },
  {
    id: 'exg_telescope',
    profile: 'exg',
    category: 'EXG 进阶视角与脚本',
    subGroup: '第三人称与视角',
    label: '便携望远镜 / 广角视野切换',
    cmdDisplay: 'toggle fov_cs_debug',
    desc: '不起狙也能一键放大望远精确打僵尸，再按复原（默认 55 ↔ 110，填 55 25 110 可模拟两段开镜）',
    note: '修改 fov_cs_debug 后 AWP/AUG 开镜放大将失效，换图或重进服务器可恢复',
    defaultKey: 'alt',
    command: 'toggle fov_cs_debug',
    hasParam: true,
    paramLabel: 'FOV 序列',
    defaultParam: '55 110',
    paramPlaceholder: '两档 55 110 / 三档 55 25 110',
    paramRequired: true
  },
  {
    id: 'exg_telescope_reset',
    profile: 'exg',
    category: 'EXG 进阶视角与脚本',
    subGroup: '第三人称与视角',
    label: '换弹顺手重置望远镜视野',
    cmdDisplay: '+reload; fov_cs_debug',
    desc: '配合便携望远镜使用：按换弹键（默认 R）自动复原正常 FOV，防止跑路时忘切回视角',
    note: '需开启 cl_allow_multi_input_binds true；默认 FOV 为 90 或 110',
    defaultKey: 'r',
    command: '+reload; fov_cs_debug {{PARAM}}',
    hasParam: true,
    paramLabel: '恢复 FOV',
    defaultParam: '110',
    paramPlaceholder: '90 或 110',
    paramRequired: true
  },
  {
    id: 'exg_backwards_tpp',
    profile: 'exg',
    category: 'EXG 进阶视角与脚本',
    subGroup: '第三人称与视角',
    label: '背身跳刀 / 连跳（第三人称·单按切换）',
    cmdDisplay: 'cs_bw_tpp (180°转身+WASD反转)',
    desc: '按一下瞬间 180° 转身并切背身第三人称 + WASD 反向移动，再按恢复（跳刀/背身连跳专用）',
    note: '需开 cl_allow_multi_input_binds true；yaw 值公式 = 180 / (0.022 × 灵敏度)，如灵敏度 1.0 填 8182、2.0 填 4091',
    defaultKey: 'f10',
    command: [
      'cl_allow_multi_input_binds 1',
      'alias 180turn "yaw {{PARAM}} 1 1"',
      'alias bw_tpp_cam_settings "c_mindistance -999999; c_maxdistance 999999;cam_collision 1; cam_ideallag 0; c_minyaw -180; c_maxyaw 180; cam_idealpitch 0; c_thirdpersonshoulder 1; c_thirdpersonshoulderheight 6; c_thirdpersonshoulderoffset 18; c_thirdpersonshoulderaimdist 999; cam_idealdist 125; cam_idealyaw 180"',
      'alias normal_cam_settings "cam_idealpitch 0; cam_idealyaw 0;"',
      'alias bwBind "bind W +back; bind S +forward; bind A +right; bind D +left"',
      'alias normalBind "bind W +forward; bind S +back; bind A +left; bind D +right"',
      'alias cancelMove "-forward; -back; -left; -right"',
      'alias mode_bwTPP_on "bw_tpp_cam_settings; 180turn; thirdperson; bwBind; cancelMove"',
      'alias mode_bw_off "normal_cam_settings; 180turn; firstperson; normalBind; cancelMove"',
      'alias cs_alias_bw_tpp_on "mode_bwTPP_on; alias cs_bw_tpp cs_alias_bw_tpp_off"',
      'alias cs_alias_bw_tpp_off "mode_bw_off; alias cs_bw_tpp cs_alias_bw_tpp_on"',
      'alias cs_bw_tpp "cs_alias_bw_tpp_on"',
      'bind "{{KEY}}" "cs_bw_tpp"'
    ].join('\n'),
    isKeyTemplate: true,
    bindMatchCmd: 'cs_bw_tpp',
    hasParam: true,
    paramLabel: '180° yaw值',
    defaultParam: '8182',
    paramPlaceholder: '180/(0.022*灵敏度)，例 sens 1.0 → 8182',
    paramRequired: true
  },
  {
    id: 'exg_backwards_fpp',
    profile: 'exg',
    category: 'EXG 进阶视角与脚本',
    subGroup: '第三人称与视角',
    label: '背身跳刀 / 连跳（第一人称·单按切换）',
    cmdDisplay: 'cs_bw_fpp (180°转身+WASD反转)',
    desc: '按一下瞬间 180° 转身并进入背身第一人称视角 + WASD 反向移动，再按恢复',
    note: '需开 cl_allow_multi_input_binds true；yaw 值公式 = 180 / (0.022 × 灵敏度)',
    defaultKey: '',
    command: [
      'cl_allow_multi_input_binds 1',
      'alias 180turn "yaw {{PARAM}} 1 1"',
      'alias bw_fpp_cam_settings "c_mindistance -999999; c_maxdistance 999999;cam_collision 1; cam_ideallag 0; c_minyaw -180; c_maxyaw 180; cam_idealpitch 0; c_thirdpersonshoulder 0; cam_idealdist 0; cam_idealyaw 180;"',
      'alias normal_cam_settings "cam_idealpitch 0; cam_idealyaw 0;"',
      'alias bwBind "bind W +back; bind S +forward; bind A +right; bind D +left"',
      'alias normalBind "bind W +forward; bind S +back; bind A +left; bind D +right"',
      'alias cancelMove "-forward; -back; -left; -right"',
      'alias mode_bwFPP_on "bw_fpp_cam_settings; 180turn; thirdperson; bwBind; cancelMove"',
      'alias mode_bw_off "normal_cam_settings; 180turn; firstperson; normalBind; cancelMove"',
      'alias cs_alias_bw_fpp_on "mode_bwFPP_on; alias cs_bw_fpp cs_alias_bw_fpp_off"',
      'alias cs_alias_bw_fpp_off "mode_bw_off; alias cs_bw_fpp cs_alias_bw_fpp_on"',
      'alias cs_bw_fpp "cs_alias_bw_fpp_on"',
      'bind "{{KEY}}" "cs_bw_fpp"'
    ].join('\n'),
    isKeyTemplate: true,
    bindMatchCmd: 'cs_bw_fpp',
    hasParam: true,
    paramLabel: '180° yaw值',
    defaultParam: '8182',
    paramPlaceholder: '180/(0.022*灵敏度)，例 sens 1.0 → 8182',
    paramRequired: true
  },
  {
    id: 'exg_backwards_hold',
    profile: 'exg',
    category: 'EXG 进阶视角与脚本',
    subGroup: '第三人称与视角',
    label: '背身跳刀 / 连跳（按住切换·松开恢复）',
    cmdDisplay: '+cs_bw_tpp',
    desc: '按住立即进入第三人称背身 + WASD 反转，松开按键瞬间自动恢复正面视角与正常移动',
    note: '需开 cl_allow_multi_input_binds true；yaw 值公式 = 180 / (0.022 × 灵敏度)',
    defaultKey: '',
    command: [
      'cl_allow_multi_input_binds 1',
      'alias 180turn "yaw {{PARAM}} 1 1"',
      'alias bw_tpp_cam_settings "c_mindistance -999999; c_maxdistance 999999;cam_collision 1; cam_ideallag 0; c_minyaw -180; c_maxyaw 180; cam_idealpitch 0; c_thirdpersonshoulder 1; c_thirdpersonshoulderheight 6; c_thirdpersonshoulderoffset 18; c_thirdpersonshoulderaimdist 999; cam_idealdist 125; cam_idealyaw 180"',
      'alias normal_cam_settings "cam_idealpitch 0; cam_idealyaw 0;"',
      'alias bwBind "bind W +back; bind S +forward; bind A +right; bind D +left"',
      'alias normalBind "bind W +forward; bind S +back; bind A +left; bind D +right"',
      'alias cancelMove "-forward; -back; -left; -right"',
      'alias mode_bwTPP_on "bw_tpp_cam_settings; 180turn; thirdperson; bwBind; cancelMove"',
      'alias mode_bw_off "normal_cam_settings; 180turn; firstperson; normalBind; cancelMove"',
      'alias +cs_bw_tpp "mode_bwTPP_on"',
      'alias -cs_bw_tpp "mode_bw_off"',
      'bind "{{KEY}}" "+cs_bw_tpp"'
    ].join('\n'),
    isKeyTemplate: true,
    bindMatchCmd: '+cs_bw_tpp',
    hasParam: true,
    paramLabel: '180° yaw值',
    defaultParam: '8182',
    paramPlaceholder: '180/(0.022*灵敏度)，例 sens 1.0 → 8182',
    paramRequired: true
  },
  {
    id: 'exg_tp_old',
    profile: 'exg',
    category: 'EXG 进阶视角与脚本',
    subGroup: '第三人称与视角',
    label: '开关第三人称（旧版假作弊）',
    cmdDisplay: 'thirdperson / firstperson',
    desc: '旧版假作弊第三人称切换，支持配合固定第三人称视角使用',
    note: '与新版控制台 tp 无法同时使用，只能二选一或绑定不同按键',
    defaultKey: 't',
    command: [
      'alias +tp1 "thirdperson"',
      'alias -tp1 "bind {{KEY}} +tp2"',
      'alias +tp2 "firstperson"',
      'alias -tp2 "bind {{KEY}} +tp1"',
      'bind "{{KEY}}" "+tp1"'
    ].join('\n'),
    isKeyTemplate: true,
    bindMatchCmd: '+tp1'
  },
  {
    id: 'exg_tp_mayamode',
    profile: 'exg',
    category: 'EXG 进阶视角与脚本',
    subGroup: '第三人称与视角',
    label: '固定第三人称视角',
    cmdDisplay: 'thirdperson_mayamode',
    desc: '开关固定第三人称镜头视角（仅配合旧版假作弊第三人称生效）',
    defaultKey: 'f11',
    command: 'thirdperson_mayamode'
  },
  {
    id: 'exg_shake_stop',
    profile: 'exg',
    category: 'EXG 进阶视角与脚本',
    subGroup: '防震动与操作脚本',
    label: '缓解屏幕震动（WASD 版）',
    cmdDisplay: 'wasd + shake_stop',
    desc: '为 W/S/A/D 移动键附加 shake_stop，显著缓解地图/爆炸屏幕震动',
    defaultKey: '',
    command: [
      'bind "w" "+forward;shake_stop"',
      'bind "s" "+back;shake_stop"',
      'bind "a" "+left;shake_stop"',
      'bind "d" "+right;shake_stop"'
    ].join('\n'),
    isDirectCvar: true
  },
  {
    id: 'exg_shake_stop_mouse',
    profile: 'exg',
    category: 'EXG 进阶视角与脚本',
    subGroup: '防震动与操作脚本',
    label: '缓解屏幕震动（鼠标移动版）',
    cmdDisplay: 'mouse_x/y + shake_stop',
    desc: '在移动鼠标时实时触发 shake_stop，比 WASD 版更彻底消除突发屏幕摇晃',
    note: '缺点：官匹或未开假作弊地图会在控制台刷 ignored 日志（可搭配控制台文本清理）',
    defaultKey: '',
    command: [
      'bind "mouse_x" "shake_stop;yaw"',
      'bind "mouse_y" "shake_stop;pitch"'
    ].join('\n'),
    isDirectCvar: true
  },
  {
    id: 'exg_auto_forward',
    profile: 'exg',
    category: 'EXG 进阶视角与脚本',
    subGroup: '防震动与操作脚本',
    label: '一键前进（自动按 W）',
    cmdDisplay: 'moveForward',
    desc: '按一下自动持续向前冲，再按一下停止（当僵尸破点/长距离跑图省手）',
    defaultKey: 'kp_0',
    command: [
      'alias moveForward moveForward_on',
      'alias moveForward_on "+forward;alias moveForward moveForward_off"',
      'alias moveForward_off "-forward;alias moveForward moveForward_on"',
      'bind "{{KEY}}" "moveForward"'
    ].join('\n'),
    isKeyTemplate: true,
    bindMatchCmd: 'moveForward'
  },
  {
    id: 'exg_auto_shoot_v1',
    profile: 'exg',
    category: 'EXG 进阶视角与脚本',
    subGroup: '防震动与操作脚本',
    label: '一键开枪（方式一：单键开关）',
    cmdDisplay: 'iShoot',
    desc: '按一下持续开火，再按一下停止（打 BOSS、跳刀躲弹幕、PVE 伪人服省手）',
    note: 'CS2 引擎机制：持续 +attack 打空不会全自动换弹，打空后需按两下或改用方式二单按换弹续射',
    defaultKey: 'kp_plus',
    command: [
      'alias iShoot shoot_on',
      'alias shoot_on "+attack;alias iShoot shoot_off"',
      'alias shoot_off "-attack;alias iShoot shoot_on"',
      'bind "{{KEY}}" "iShoot"'
    ].join('\n'),
    isKeyTemplate: true,
    bindMatchCmd: 'iShoot'
  },
  {
    id: 'exg_auto_shoot_v2',
    profile: 'exg',
    category: 'EXG 进阶视角与脚本',
    subGroup: '防震动与操作脚本',
    label: '一键开枪（方式二：单按强制换弹续射）',
    cmdDisplay: '+shoot (-attack;+reload) / -attack',
    desc: '按一下持续开火；打空或中途按一下立刻停火强制换弹，换完自动继续连射（需额外设一个停火键）',
    note: '已内置 cl_allow_multi_input_binds true 与 +reload；按停火键或点鼠标左键即可停止开火',
    defaultKey: 'mouse4',
    command: [
      'cl_allow_multi_input_binds true',
      'alias +shoot "-attack;+reload"',
      'alias -shoot "-reload;+attack"',
      'bind "{{KEY}}" "+shoot"',
      'bind "{{PARAM}}" "-attack"'
    ].join('\n'),
    isKeyTemplate: true,
    bindMatchCmd: '+shoot',
    hasParam: true,
    paramLabel: '停火键',
    paramIsKey: true,
    defaultParam: 'mouse5',
    paramPlaceholder: '按下停止开火按键',
    paramRequired: true
  },
  {
    id: 'exg_spin',
    profile: 'exg',
    category: 'EXG 进阶视角与脚本',
    subGroup: '防震动与操作脚本',
    label: '原地转圈圈',
    cmdDisplay: '[ / ] +turnleft/right',
    desc: '绑定 [ 和 ] 键控制视角向左/向右匀速旋转',
    defaultKey: '',
    command: 'bind "[" "+turnleft"\nbind "]" "+turnright"',
    isDirectCvar: true
  },
  {
    id: 'exg_xly',
    profile: 'exg',
    category: 'EXG 进阶视角与脚本',
    subGroup: '防震动与操作脚本',
    label: '写轮眼（已被 V 社删除）',
    cmdDisplay: 'r_drawworld 0/1',
    desc: '按住隐藏世界渲染（该指令已被 Valve 删除，当前版本已失效）',
    note: '仅作历史脚本留档参考',
    defaultKey: 'alt',
    command: [
      '// 写轮眼（已被V社删除）',
      'alias +xly "r_drawworld 0"',
      'alias -xly "r_drawworld 1"',
      'bind "{{KEY}}" "+xly"'
    ].join('\n'),
    isKeyTemplate: true,
    bindMatchCmd: '+xly'
  },

  // =========================================================================
  // EXG — 快捷买枪与道具 (. 前缀)
  // =========================================================================
  // 道具与补给
  {
    id: 'exg_xz',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '道具与补给',
    label: '购买 血针',
    cmdDisplay: '.xz',
    desc: '快速购买医疗血针恢复生命值',
    defaultKey: 'F1',
    command: 'say .xz'
  },
  {
    id: 'exg_fdy',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '道具与补给',
    label: '购买 防弹衣加头盔',
    cmdDisplay: '.fdy',
    desc: '一键补充防弹衣与头盔护甲防抓',
    defaultKey: 'F2',
    command: 'say .fdy'
  },
  {
    id: 'exg_he',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '道具与补给',
    label: '购买 手雷',
    cmdDisplay: '.he',
    desc: '一键购买高爆手雷减速僵尸',
    defaultKey: 'F4',
    command: 'say .he'
  },
  {
    id: 'exg_dec',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '道具与补给',
    label: '购买 诱饵弹（ZE 电圈雷）',
    cmdDisplay: '.dec',
    desc: '购买诱饵弹（ZE 模式电圈雷）',
    defaultKey: 'F5',
    command: 'say .dec'
  },
  {
    id: 'exg_smoke',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '道具与补给',
    label: '购买 烟雾弹（PVE 阔剑地雷）',
    cmdDisplay: '.smoke',
    desc: '购买烟雾弹（PVE 模式阔剑地雷）',
    defaultKey: 'F8',
    command: 'say .smoke'
  },

  // 冲锋枪与机枪
  {
    id: 'exg_bizon',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '冲锋枪与机枪',
    label: '购买 野牛 Bizon',
    cmdDisplay: '.bizon',
    desc: 'ZE 守点常用高弹容冲锋枪',
    defaultKey: 'kp_1',
    command: 'say .bizon'
  },
  {
    id: 'exg_p90',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '冲锋枪与机枪',
    label: '购买 P90',
    cmdDisplay: '.p90',
    desc: '高机动守点大弹匣冲锋枪',
    defaultKey: 'kp_2',
    command: 'say .p90'
  },
  {
    id: 'exg_negev',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '冲锋枪与机枪',
    label: '购买 内格夫 Negev',
    cmdDisplay: '.negev',
    desc: '持续火力压制机枪',
    defaultKey: 'kp_3',
    command: 'say .negev'
  },
  {
    id: 'exg_m249',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '冲锋枪与机枪',
    label: '购买 M249',
    cmdDisplay: '.m249',
    desc: '重火力压制机枪',
    defaultKey: 'kp_4',
    command: 'say .m249'
  },
  {
    id: 'exg_mp9',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '冲锋枪与机枪',
    label: '购买 MP9',
    cmdDisplay: '.mp9',
    desc: '高射速轻型冲锋枪',
    defaultKey: 'kp_5',
    command: 'say .mp9'
  },
  {
    id: 'exg_mp5',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '冲锋枪与机枪',
    label: '购买 MP5',
    cmdDisplay: '.mp5',
    desc: '消音冲锋枪 MP5-SD',
    defaultKey: '',
    command: 'say .mp5'
  },
  {
    id: 'exg_mp7',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '冲锋枪与机枪',
    label: '购买 MP7',
    cmdDisplay: '.mp7',
    desc: '稳定控枪冲锋枪',
    defaultKey: '',
    command: 'say .mp7'
  },
  {
    id: 'exg_ump',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '冲锋枪与机枪',
    label: '购买 UMP45',
    cmdDisplay: '.ump',
    desc: '高单发伤害冲锋枪',
    defaultKey: '',
    command: 'say .ump'
  },
  {
    id: 'exg_mac',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '冲锋枪与机枪',
    label: '购买 Mac10',
    cmdDisplay: '.mac',
    desc: '高移速便携冲锋枪',
    defaultKey: '',
    command: 'say .mac'
  },

  // 步枪与狙击枪
  {
    id: 'exg_m4s',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '步枪与狙击枪',
    label: '购买 M4A1 消音',
    cmdDisplay: '.m4s',
    desc: '稳定精准消音步枪 M4A1-S',
    defaultKey: 'kp_6',
    command: 'say .m4s'
  },
  {
    id: 'exg_ak',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '步枪与狙击枪',
    label: '购买 AK47',
    cmdDisplay: '.ak',
    desc: '高伤害主力步枪',
    defaultKey: 'kp_7',
    command: 'say .ak'
  },
  {
    id: 'exg_m4',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '步枪与狙击枪',
    label: '购买 M4A4',
    cmdDisplay: '.m4',
    desc: '30 发弹容主力步枪',
    defaultKey: 'kp_8',
    command: 'say .m4'
  },
  {
    id: 'exg_scar',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '步枪与狙击枪',
    label: '购买 警连狙 Scar20',
    cmdDisplay: '.scar',
    desc: '远距离连发狙击步枪',
    defaultKey: 'kp_9',
    command: 'say .scar'
  },
  {
    id: 'exg_g3sg1',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '步枪与狙击枪',
    label: '购买 匪连狙 G3SG1',
    cmdDisplay: '.g3sg1',
    desc: '远距离连发狙击步枪',
    defaultKey: '',
    command: 'say .g3sg1'
  },
  {
    id: 'exg_awp',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '步枪与狙击枪',
    label: '购买 AWP',
    cmdDisplay: '.awp',
    desc: '高爆发重型狙击步枪',
    defaultKey: '',
    command: 'say .awp'
  },
  {
    id: 'exg_ssg',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '步枪与狙击枪',
    label: '购买 鸟狙 SSG08',
    cmdDisplay: '.ssg',
    desc: '高机动轻型狙击步枪',
    defaultKey: '',
    command: 'say .ssg'
  },
  {
    id: 'exg_aug',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '步枪与狙击枪',
    label: '购买 AUG',
    cmdDisplay: '.aug',
    desc: '带瞄具精准步枪',
    defaultKey: '',
    command: 'say .aug'
  },
  {
    id: 'exg_sg553',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '步枪与狙击枪',
    label: '购买 SG553',
    cmdDisplay: '.sg553',
    desc: '带瞄具步枪',
    defaultKey: '',
    command: 'say .sg553'
  },
  {
    id: 'exg_famas',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '步枪与狙击枪',
    label: '购买 法玛斯 Famas',
    cmdDisplay: '.famas',
    desc: '经济型步枪',
    defaultKey: '',
    command: 'say .famas'
  },
  {
    id: 'exg_galil',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '步枪与狙击枪',
    label: '购买 加列尔 GalilAR',
    cmdDisplay: '.galil',
    desc: '35 发经济型步枪',
    defaultKey: '',
    command: 'say .galil'
  },

  // 霰弹枪与手枪
  {
    id: 'exg_xm',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '霰弹枪与手枪',
    label: '购买 连喷 XM1014',
    cmdDisplay: '.xm',
    desc: '近距离高击退自动霰弹枪',
    defaultKey: '',
    command: 'say .xm'
  },
  {
    id: 'exg_mag',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '霰弹枪与手枪',
    label: '购买 警喷 Mag-7',
    cmdDisplay: '.mag',
    desc: '短管高爆发霰弹枪',
    defaultKey: '',
    command: 'say .mag'
  },
  {
    id: 'exg_nova',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '霰弹枪与手枪',
    label: '购买 Nova',
    cmdDisplay: '.nova',
    desc: '泵动霰弹枪',
    defaultKey: '',
    command: 'say .nova'
  },
  {
    id: 'exg_sawedoff',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '霰弹枪与手枪',
    label: '购买 匪喷 Sawedoff',
    cmdDisplay: '.sawedoff',
    desc: '短管霰弹枪',
    defaultKey: '',
    command: 'say .sawedoff'
  },
  {
    id: 'exg_deagle',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '霰弹枪与手枪',
    label: '购买 沙鹰 Deagle',
    cmdDisplay: '.deagle',
    desc: '高单发伤害副武器',
    defaultKey: '',
    command: 'say .deagle'
  },
  {
    id: 'exg_elite',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '霰弹枪与手枪',
    label: '购买 双枪 Elite',
    cmdDisplay: '.elite',
    desc: '高弹容双持手枪',
    defaultKey: '',
    command: 'say .elite'
  },
  {
    id: 'exg_usp',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '霰弹枪与手枪',
    label: '购买 USP 手枪',
    cmdDisplay: '.usp',
    desc: '消音精准手枪',
    defaultKey: '',
    command: 'say .usp'
  },
  {
    id: 'exg_p2000',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '霰弹枪与手枪',
    label: '购买 P2000 手枪',
    cmdDisplay: '.p2000',
    desc: 'CT 默认手枪',
    defaultKey: '',
    command: 'say .p2000'
  },
  {
    id: 'exg_glock',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '霰弹枪与手枪',
    label: '购买 格洛克 Glock',
    cmdDisplay: '.glock',
    desc: 'T 默认手枪',
    defaultKey: '',
    command: 'say .glock'
  },
  {
    id: 'exg_p250',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '霰弹枪与手枪',
    label: '购买 P250 手枪',
    cmdDisplay: '.p250',
    desc: '便携副武器',
    defaultKey: '',
    command: 'say .p250'
  },
  {
    id: 'exg_fn',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '霰弹枪与手枪',
    label: '购买 FN57 手枪',
    cmdDisplay: '.fn',
    desc: 'Five-SeveN 手枪',
    defaultKey: '',
    command: 'say .fn'
  },
  {
    id: 'exg_cz',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '霰弹枪与手枪',
    label: '购买 CZ75a 手枪',
    cmdDisplay: '.cz',
    desc: '全自动手枪 CZ75-Auto',
    defaultKey: '',
    command: 'say .cz'
  },
  {
    id: 'exg_r8',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '霰弹枪与手枪',
    label: '购买 左轮 R8 手枪',
    cmdDisplay: '.r8',
    desc: 'R8 左轮手枪',
    defaultKey: '',
    command: 'say .r8'
  },
  {
    id: 'exg_tec9',
    profile: 'exg',
    category: 'EXG 快捷买枪与道具',
    subGroup: '霰弹枪与手枪',
    label: '购买 Tec-9 手枪',
    cmdDisplay: '.tec9',
    desc: '高机动手枪',
    defaultKey: '',
    command: 'say .tec9'
  },

  // =========================================================================
  // 跨社区通用 — 游戏优化与操作
  // =========================================================================
  {
    id: 'common_mwheel',
    profile: 'common',
    category: '游戏优化与操作',
    label: '滚轮跳',
    cmdDisplay: 'mwheelup/down +jump',
    desc: '上下滚轮绑定跳跃，ZE 滑翔/连跳必备',
    defaultKey: '',
    command: 'bind "mwheelup" "+jump"\nbind "mwheeldown" "+jump"',
    isDirectCvar: true
  },
  {
    id: 'common_fps',
    profile: 'common',
    category: '游戏优化与操作',
    label: 'FPS 上限与网络优化',
    cmdDisplay: 'fps_max 0 / rate / 遥测',
    desc: 'fps_max 0 + 满带宽 rate + 右上角清爽遥测帧率/延迟显示（无左上角红字）',
    defaultKey: '',
    command: 'fps_max "0"\nrate "786432"\ncl_showfps "0"\ncl_hud_telemetry_frametime_show "2"\ncl_hud_telemetry_ping_show "2"',
    isDirectCvar: true
  },
  {
    id: 'common_voice',
    profile: 'common',
    category: '游戏优化与操作',
    label: '切屏不断音 + 指挥语音',
    cmdDisplay: 'snd_mute_losefocus 0',
    desc: '切回桌面保持声音，清晰接收 ZE 指挥',
    defaultKey: '',
    command: 'snd_mute_losefocus "0"\nsnd_voipvolume "0.85"',
    isDirectCvar: true
  },
  {
    id: 'common_jumpthrow',
    profile: 'common',
    category: '游戏优化与操作',
    label: '大跳 / 蹲跳辅助',
    cmdDisplay: '+duck; +jump',
    desc: '空格一键蹲跳，轻松上高箱子',
    defaultKey: 'space',
    command: '+duck; +jump',
    isDirectCvar: false
  },
  {
    id: 'common_jointeam_t',
    profile: 'common',
    category: '游戏优化与操作',
    label: '一键切换至 T 队伍（僵尸/匪）',
    cmdDisplay: 'jointeam 2',
    desc: '一键快速加入 T 阵营（社区服快速切 T / 僵尸阵营）',
    note: '附：jointeam 1 为观察者，jointeam 3 为 CT',
    defaultKey: '',
    command: 'jointeam 2'
  },

  // =========================================================================
  // 跨社区通用 — 颜文字表情 (Kaomoji chat binds)
  // =========================================================================
  // 开心 / 卖萌
  {
    id: 'kaomoji_happy_wave',
    profile: 'common',
    category: '颜文字表情',
    subGroup: '开心 / 卖萌',
    label: '开心撒花',
    cmdDisplay: 'ヾ(≧▽≦*)o',
    desc: '全局聊天发送开心颜文字',
    defaultKey: '',
    command: 'say ヾ(≧▽≦*)o'
  },
  {
    id: 'kaomoji_happy_cheers',
    profile: 'common',
    category: '颜文字表情',
    subGroup: '开心 / 卖萌',
    label: '超级开心',
    cmdDisplay: '✧*｡٩(ˊᗜˋ*)و✧*｡',
    desc: '全局聊天发送欢呼闪耀颜文字',
    defaultKey: '',
    command: 'say ✧*｡٩(ˊᗜˋ*)و✧*｡'
  },
  {
    id: 'kaomoji_happy_smile',
    profile: 'common',
    category: '颜文字表情',
    subGroup: '开心 / 卖萌',
    label: '灿烂微笑',
    cmdDisplay: '(*^▽^*)',
    desc: '全局聊天发送微笑颜文字',
    defaultKey: '',
    command: 'say (*^▽^*)'
  },
  {
    id: 'kaomoji_happy_love',
    profile: 'common',
    category: '颜文字表情',
    subGroup: '开心 / 卖萌',
    label: '比心打招呼',
    cmdDisplay: '(｡･ω･｡)ﾉ♡',
    desc: '全局聊天发送比心挥手颜文字',
    defaultKey: '',
    command: 'say (｡･ω･｡)ﾉ♡'
  },
  {
    id: 'kaomoji_happy_smug',
    profile: 'common',
    category: '颜文字表情',
    subGroup: '开心 / 卖萌',
    label: '得意开心',
    cmdDisplay: 'o(*￣▽￣*)ブ',
    desc: '全局聊天发送得意卖萌颜文字',
    defaultKey: '',
    command: 'say o(*￣▽￣*)ブ'
  },
  {
    id: 'kaomoji_happy_flower',
    profile: 'common',
    category: '颜文字表情',
    subGroup: '开心 / 卖萌',
    label: '撒花欢迎',
    cmdDisplay: 'ヽ(✿ﾟ▽ﾟ)ノ',
    desc: '全局聊天发送撒花颜文字',
    defaultKey: '',
    command: 'say ヽ(✿ﾟ▽ﾟ)ノ'
  },

  // 摊手 / 吃瓜 / 无奈
  {
    id: 'kaomoji_shrug',
    profile: 'common',
    category: '颜文字表情',
    subGroup: '摊手 / 吃瓜 / 无奈',
    label: '经典摊手',
    cmdDisplay: '¯\\_(ツ)_/¯',
    desc: '全局聊天发送无奈摊手颜文字',
    defaultKey: '',
    command: 'say ¯\\_(ツ)_/¯'
  },
  {
    id: 'kaomoji_stare',
    profile: 'common',
    category: '颜文字表情',
    subGroup: '摊手 / 吃瓜 / 无奈',
    label: '呆萌围观',
    cmdDisplay: '(´・ω・`)',
    desc: '全局聊天发送吃瓜围观颜文字',
    defaultKey: '',
    command: 'say (´・ω・`)'
  },
  {
    id: 'kaomoji_cheers_chill',
    profile: 'common',
    category: '颜文字表情',
    subGroup: '摊手 / 吃瓜 / 无奈',
    label: '微笑摸鱼',
    cmdDisplay: '(￣▽￣)~*',
    desc: '全局聊天发送轻松摸鱼颜文字',
    defaultKey: '',
    command: 'say (￣▽￣)~*'
  },
  {
    id: 'kaomoji_question',
    profile: 'common',
    category: '颜文字表情',
    subGroup: '摊手 / 吃瓜 / 无奈',
    label: '满头问号',
    cmdDisplay: '(⊙_⊙)?',
    desc: '全局聊天发送疑惑震惊颜文字',
    defaultKey: '',
    command: 'say (⊙_⊙)?'
  },
  {
    id: 'kaomoji_sideeye',
    profile: 'common',
    category: '颜文字表情',
    subGroup: '摊手 / 吃瓜 / 无奈',
    label: '无语斜眼',
    cmdDisplay: '(¬_¬)',
    desc: '全局聊天发送无语斜视颜文字',
    defaultKey: '',
    command: 'say (¬_¬)'
  },
  {
    id: 'kaomoji_awkward',
    profile: 'common',
    category: '颜文字表情',
    subGroup: '摊手 / 吃瓜 / 无奈',
    label: '尴尬流汗',
    cmdDisplay: '(-_-||)',
    desc: '全局聊天发送黑线流汗颜文字',
    defaultKey: '',
    command: 'say (-_-||)'
  },

  // 掀桌 / 生气 / 吐槽
  {
    id: 'kaomoji_tableflip',
    profile: 'common',
    category: '颜文字表情',
    subGroup: '掀桌 / 生气 / 吐槽',
    label: '愤怒掀桌',
    cmdDisplay: '(╯°□°）╯︵ ┻━┻',
    desc: '全局聊天发送经典掀桌颜文字',
    defaultKey: '',
    command: 'say (╯°□°）╯︵ ┻━┻'
  },
  {
    id: 'kaomoji_tableput',
    profile: 'common',
    category: '颜文字表情',
    subGroup: '掀桌 / 生气 / 吐槽',
    label: '冷静摆桌',
    cmdDisplay: '┬─┬ノ( º _ ºノ)',
    desc: '全局聊天发送把桌子放回去颜文字',
    defaultKey: '',
    command: 'say ┬─┬ノ( º _ ºノ)'
  },
  {
    id: 'kaomoji_angry',
    profile: 'common',
    category: '颜文字表情',
    subGroup: '掀桌 / 生气 / 吐槽',
    label: '气急败坏',
    cmdDisplay: '(╬▔皿▔)╯',
    desc: '全局聊天发送生气吐槽颜文字',
    defaultKey: '',
    command: 'say (╬▔皿▔)╯'
  },
  {
    id: 'kaomoji_rage',
    profile: 'common',
    category: '颜文字表情',
    subGroup: '掀桌 / 生气 / 吐槽',
    label: '怒吼抓狂',
    cmdDisplay: 'ヽ(#`Д´)ﾉ',
    desc: '全局聊天发送抓狂抗议颜文字',
    defaultKey: '',
    command: 'say ヽ(#`Д´)ﾉ'
  },
  {
    id: 'kaomoji_glare',
    profile: 'common',
    category: '颜文字表情',
    subGroup: '掀桌 / 生气 / 吐槽',
    label: '凶狠盯视',
    cmdDisplay: '(▼皿▼#)',
    desc: '全局聊天发送凶狠表情',
    defaultKey: '',
    command: 'say (▼皿▼#)'
  },

  // 委屈 / 哭泣 / 躺平
  {
    id: 'kaomoji_cry',
    profile: 'common',
    category: '颜文字表情',
    subGroup: '委屈 / 哭泣 / 躺平',
    label: '委屈抹泪',
    cmdDisplay: '(つД`)',
    desc: '全局聊天发送委屈哭泣颜文字',
    defaultKey: '',
    command: 'say (つД`)'
  },
  {
    id: 'kaomoji_tears',
    profile: 'common',
    category: '颜文字表情',
    subGroup: '委屈 / 哭泣 / 躺平',
    label: '泪流满面',
    cmdDisplay: '╥﹏╥',
    desc: '全局聊天发送大哭颜文字',
    defaultKey: '',
    command: 'say ╥﹏╥'
  },
  {
    id: 'kaomoji_sorry',
    profile: 'common',
    category: '颜文字表情',
    subGroup: '委屈 / 哭泣 / 躺平',
    label: '抱歉擦汗',
    cmdDisplay: '(；´д｀)ゞ',
    desc: '全局聊天发送不好意思擦汗颜文字（已使用全角分号防断句）',
    defaultKey: '',
    command: 'say (；´д｀)ゞ'
  },
  {
    id: 'kaomoji_dead',
    profile: 'common',
    category: '颜文字表情',
    subGroup: '委屈 / 哭泣 / 躺平',
    label: '倒地吐血',
    cmdDisplay: '_(´ཀ`」 ∠)_',
    desc: '全局聊天发送倒地寄了颜文字',
    defaultKey: '',
    command: 'say _(´ཀ`」 ∠)_'
  },
  {
    id: 'kaomoji_orz',
    profile: 'common',
    category: '颜文字表情',
    subGroup: '委屈 / 哭泣 / 躺平',
    label: '五体投地',
    cmdDisplay: 'orz',
    desc: '全局聊天发送经典拜服 / 跪了颜文字',
    defaultKey: '',
    command: 'say orz'
  },

  // 加油 / 互动 / 整活
  {
    id: 'kaomoji_cheer',
    profile: 'common',
    category: '颜文字表情',
    subGroup: '加油 / 互动 / 整活',
    label: '加油冲鸭',
    cmdDisplay: '(๑•̀ㅂ•́)و✧',
    desc: '全局聊天发送加油打气颜文字',
    defaultKey: '',
    command: 'say (๑•̀ㅂ•́)و✧'
  },
  {
    id: 'kaomoji_hug',
    profile: 'common',
    category: '颜文字表情',
    subGroup: '加油 / 互动 / 整活',
    label: '爱的抱抱',
    cmdDisplay: '(づ｡◕‿‿◕｡)づ',
    desc: '全局聊天发送求抱抱颜文字',
    defaultKey: '',
    command: 'say (づ｡◕‿‿◕｡)づ'
  },
  {
    id: 'kaomoji_chill',
    profile: 'common',
    category: '颜文字表情',
    subGroup: '加油 / 互动 / 整活',
    label: '悠闲躺平',
    cmdDisplay: '∠( ᐛ 」∠)＿',
    desc: '全局聊天发送惬意躺平颜文字',
    defaultKey: '',
    command: 'say ∠( ᐛ 」∠)＿'
  },
  {
    id: 'kaomoji_music',
    profile: 'common',
    category: '颜文字表情',
    subGroup: '加油 / 互动 / 整活',
    label: '哼歌开心',
    cmdDisplay: '♪(´▽｀)',
    desc: '全局聊天发送愉快哼歌颜文字',
    defaultKey: '',
    command: 'say ♪(´▽｀)'
  },
  {
    id: 'kaomoji_point',
    profile: 'common',
    category: '颜文字表情',
    subGroup: '加油 / 互动 / 整活',
    label: '就是你了',
    cmdDisplay: '(☞ﾟヮﾟ)☞',
    desc: '全局聊天发送指向互动颜文字',
    defaultKey: '',
    command: 'say (☞ﾟヮﾟ)☞'
  },
  {
    id: 'kaomoji_gg',
    profile: 'common',
    category: '颜文字表情',
    subGroup: '加油 / 互动 / 整活',
    label: '挥手 GG',
    cmdDisplay: '( ^_^)／~~ GG',
    desc: '全局聊天发送友好 GG 挥手颜文字',
    defaultKey: '',
    command: 'say ( ^_^)／~~ GG'
  }
]

export const FYS_ZE_RECOMMENDED_BUNDLE = [
  '// === 99x launcher FYS 风云社 ZE 推荐一键套装 (v5) ===',
  '// 视野与语音控制',
  'bind "h" "say .hide 500"',
  'bind "z" "say .ztele"',
  'bind "t" "say .tp"',
  'bind "n" "say .stopsound"',
  'bind "m" "say .sm"',
  'bind "," "say .su"',
  'bind "j" "say .ehud"',
  '// 补给与手雷快捷购买',
  'bind "F1" "say .h"',
  'bind "F2" "say .k"',
  'bind "F3" "say .if"',
  'bind "F4" "say .nade"',
  'bind "F5" "say .ices"',
  'bind "F6" "say .fire"',
  'bind "F7" "say .push"',
  'bind "F8" "say .hole"',
  'bind "v" "say .rebuy"',
  '// ZE 常用主力武器 (小键盘)',
  'bind "kp_1" "say .bizon"',
  'bind "kp_2" "say .p90"',
  'bind "kp_3" "say .negev"',
  'bind "kp_6" "say .m4a1"',
  'bind "kp_7" "say .ak47"',
  '// 通用操作与性能优化',
  'bind "mwheelup" "+jump"',
  'bind "mwheeldown" "+jump"',
  'snd_mute_losefocus "0"',
  'fps_max "0"',
  'host_writeconfig',
  'echo "[99x launcher] FYS ZE v5 config loaded!"'
].join('\n')

export const EXG_ZE_RECOMMENDED_BUNDLE = [
  '// === 99x launcher EXG ZE 推荐一键套装 ===',
  '// 必开：允许多重输入绑定（EXG 视角、防震动等脚本依赖）',
  'cl_allow_multi_input_binds true',
  '// 视野、语音与订图指令',
  'bind "h" "say .hide 200"',
  'bind "z" "say .ztele"',
  'bind "n" "say .qs 0"',
  'bind "m" "say .jy 1"',
  'bind "j" "say .hud"',
  'bind "l" "say .nv"',
  'bind "F6" "say rtv"',
  'bind "F7" "say .nomlist"',
  '// 补给、菜单与手雷快捷购买',
  'bind "F1" "say .xz"',
  'bind "F2" "say .fdy"',
  'bind "F3" "say .mm"',
  'bind "F4" "say .he"',
  'bind "F5" "say .dec"',
  'bind "F8" "say .smoke"',
  '// ZE 常用主力武器 (小键盘)',
  'bind "kp_1" "say .bizon"',
  'bind "kp_2" "say .p90"',
  'bind "kp_3" "say .negev"',
  'bind "kp_6" "say .m4s"',
  'bind "kp_7" "say .ak"',
  '// 右Ctrl 一键循环切换夜视仪、滤镜开关 4 种组合',
  'bind "rctrl" "ysylj"',
  'alias ysylj ysy0lj1',
  'alias ysy0lj1 "mat_fullbright 0;r_csgo_postprocess_enable 1;alias ysylj ysy0lj0"',
  'alias ysy0lj0 "mat_fullbright 0;r_csgo_postprocess_enable 0;alias ysylj ysy1lj0"',
  'alias ysy1lj0 "mat_fullbright 1;r_csgo_postprocess_enable 0;alias ysylj ysy1lj1"',
  'alias ysy1lj1 "mat_fullbright 1;r_csgo_postprocess_enable 1;alias ysylj ysy0lj1"',
  '// 新版第三人称（控制台输入 tp 生效；进服聊天可用 .tp 150 与 .tph 0 调镜头）',
  'bind "f9" "tp"',
  '// 缓解屏幕震动',
  'bind "w" "+forward;shake_stop"',
  'bind "s" "+back;shake_stop"',
  'bind "a" "+left;shake_stop"',
  'bind "d" "+right;shake_stop"',
  '// 控制台文本清理（屏蔽冗余刷屏日志）',
  'log_flags +Developer +donotecho',
  'log_flags "CL CommandQueue" +donotecho',
  'log_flags MaterialSystem +donotecho',
  'log_flags AnimResource +donotecho',
  'log_flags ResourceSystem +donotecho',
  'log_flags SoundSystem +donotecho',
  'log_flags SndOperators +donotecho',
  'log_flags Console +donotecho',
  '// 滚轮跳与通用优化',
  'bind "mwheelup" "+jump"',
  'bind "mwheeldown" "+jump"',
  'snd_mute_losefocus "0"',
  'fps_max "0"',
  'host_writeconfig',
  'echo "[99x launcher] EXG autoexec loaded!"'
].join('\n')
