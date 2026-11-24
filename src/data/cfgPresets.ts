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
  /** Optional parameter support for commands like .hide <范围>, .epos <x> <y>, .bet <阵营> <助力值> */
  hasParam?: boolean
  paramPlaceholder?: string
  defaultParam?: string
  paramRequired?: boolean
}

export const FYS_CATEGORIES = [
  'ZE 买枪与道具',
  'ZE 核心与指挥',
  '玩家通用指令',
  '全模式专有',
  '游戏优化与操作'
] as const

export const EXG_CATEGORIES = [
  'EXG ZE 核心指令',
  'EXG 快捷买枪',
  '游戏优化与操作'
] as const

export const FYS_REFERENCE_URL = 'https://bbs.fyscs.cn/t-162844-1.html'

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
  // EXG / ZED 社区指令 (! 前缀)
  // =========================================================================
  {
    id: 'exg_hide',
    profile: 'exg',
    category: 'EXG ZE 核心指令',
    label: '隐藏队友',
    cmdDisplay: '!hide',
    desc: '大幅提升帧数并防止队友挡视线',
    defaultKey: 'h',
    command: 'say !hide'
  },
  {
    id: 'exg_ztele',
    profile: 'exg',
    category: 'EXG ZE 核心指令',
    label: '卡住回城',
    cmdDisplay: '!ztele',
    desc: '卡模型/卡地形时紧急传送回出生点',
    defaultKey: 'z',
    command: 'say !ztele'
  },
  {
    id: 'exg_tp',
    profile: 'exg',
    category: 'EXG ZE 核心指令',
    label: '第三人称',
    cmdDisplay: '!tp',
    desc: '切换第一/第三人称视角（跳刀必备）',
    defaultKey: 't',
    command: 'say !tp'
  },
  {
    id: 'exg_rtv',
    profile: 'exg',
    category: 'EXG ZE 核心指令',
    label: '投票换图',
    cmdDisplay: '!rtv',
    desc: '发起或参与本图提前换图投票',
    defaultKey: 'F6',
    command: 'say !rtv'
  },
  {
    id: 'exg_nominate',
    profile: 'exg',
    category: 'EXG ZE 核心指令',
    label: '预定地图',
    cmdDisplay: '!nominate',
    desc: '打开 EXG 预定下一张地图菜单',
    defaultKey: 'F7',
    command: 'say !nominate'
  },
  {
    id: 'exg_shop',
    profile: 'exg',
    category: 'EXG ZE 核心指令',
    label: '社区商店',
    cmdDisplay: '!shop',
    desc: '打开 EXG 积分商城与模型菜单',
    defaultKey: 'F8',
    command: 'say !shop'
  },
  {
    id: 'exg_stopsound',
    profile: 'exg',
    category: 'EXG ZE 核心指令',
    label: '静音枪声',
    cmdDisplay: '!stopsound',
    desc: '屏蔽队友枪声，清晰听清指挥语音',
    defaultKey: 'n',
    command: 'say !stopsound'
  },
  {
    id: 'exg_hud',
    profile: 'exg',
    category: 'EXG ZE 核心指令',
    label: '开关 HUD',
    cmdDisplay: '!hud',
    desc: '切换 EXG 社区状态栏显示',
    defaultKey: 'j',
    command: 'say !hud'
  },
  {
    id: 'exg_spec',
    profile: 'exg',
    category: 'EXG ZE 核心指令',
    label: '切换观察者',
    cmdDisplay: '!spec',
    desc: '快速进入观察者挂机/观战',
    defaultKey: 'F9',
    command: 'say !spec'
  },
  {
    id: 'exg_zclass',
    profile: 'exg',
    category: 'EXG ZE 核心指令',
    label: '僵尸皮肤',
    cmdDisplay: '!zclass',
    desc: '切换僵尸模型或职业菜单',
    defaultKey: 'F10',
    command: 'say !zclass'
  },
  {
    id: 'exg_bizon',
    profile: 'exg',
    category: 'EXG 快捷买枪',
    label: '买野牛',
    cmdDisplay: '!bizon',
    desc: 'ZE 守点常用高弹容冲锋枪',
    defaultKey: 'F1',
    command: 'say !bizon'
  },
  {
    id: 'exg_p90',
    profile: 'exg',
    category: 'EXG 快捷买枪',
    label: '买 P90',
    cmdDisplay: '!p90',
    desc: '高机动守点冲锋枪',
    defaultKey: 'F2',
    command: 'say !p90'
  },
  {
    id: 'exg_negev',
    profile: 'exg',
    category: 'EXG 快捷买枪',
    label: '买内格夫',
    cmdDisplay: '!negev',
    desc: '火力压制机枪',
    defaultKey: 'F3',
    command: 'say !negev'
  },
  {
    id: 'exg_he',
    profile: 'exg',
    category: 'EXG 快捷买枪',
    label: '买高爆手雷',
    cmdDisplay: '!he',
    desc: '一键购买高爆雷减速僵尸',
    defaultKey: 'F4',
    command: 'say !he'
  },
  {
    id: 'exg_kevlar',
    profile: 'exg',
    category: 'EXG 快捷买枪',
    label: '买护甲',
    cmdDisplay: '!kevlar',
    desc: '快速补充护甲防抓',
    defaultKey: 'F5',
    command: 'say !kevlar'
  },
  {
    id: 'exg_ammo',
    profile: 'exg',
    category: 'EXG 快捷买枪',
    label: '补充弹药',
    cmdDisplay: '!ammo',
    desc: '一键补满当前武器备弹',
    defaultKey: 'v',
    command: 'say !ammo'
  },
  {
    id: 'exg_ak',
    profile: 'exg',
    category: 'EXG 快捷买枪',
    label: '买 AK47',
    cmdDisplay: '!ak',
    desc: '步枪火力输出',
    defaultKey: 'kp_1',
    command: 'say !ak'
  },
  {
    id: 'exg_m4',
    profile: 'exg',
    category: 'EXG 快捷买枪',
    label: '买 M4A1',
    cmdDisplay: '!m4a1',
    desc: '稳定精准步枪',
    defaultKey: 'kp_2',
    command: 'say !m4a1'
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
    cmdDisplay: 'fps_max 0 / rate',
    desc: 'fps_max 0 + 满带宽 rate + 帧率显示',
    defaultKey: '',
    command: 'fps_max "0"\nrate "786432"\ncl_showfps "1"\ncq_netgraph "1"',
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
  'bind "h" "say !hide"',
  'bind "z" "say !ztele"',
  'bind "t" "say !tp"',
  'bind "v" "say !ammo"',
  'bind "n" "say !stopsound"',
  'bind "F1" "say !bizon"',
  'bind "F2" "say !p90"',
  'bind "F3" "say !negev"',
  'bind "F4" "say !he"',
  'bind "F5" "say !kevlar"',
  'bind "F6" "say !rtv"',
  'bind "F7" "say !nominate"',
  'bind "mwheelup" "+jump"',
  'bind "mwheeldown" "+jump"',
  'snd_mute_losefocus "0"',
  'fps_max "0"',
  'host_writeconfig',
  'echo "[99x launcher] EXG autoexec loaded!"'
].join('\n')
