/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PartCategory, SparePart, WorkOrder, WorkOrderStatus, UrgencyLevel, Project, SubAccount } from './types';

// Predefined hotlink images for industrial assets to display high-fidelity aesthetics
export const INDUSTRIAL_IMAGES = {
  sensor: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400',
  valve: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
  datacenter: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600',
  factory: 'https://images.unsplash.com/photo-1394140024953-ad97ffade018?auto=format&fit=crop&q=80&w=600',
  pump: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400',
  relay: 'https://images.unsplash.com/photo-1601524909162-be87252be298?auto=format&fit=crop&q=80&w=400',
  robotArm: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&q=80&w=600',
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: '浦东研发中心一期',
    location: '上海市浦东新区张江高科园区',
    industry: '高新电子与半导体',
    startDate: '2023-11-20',
    endDate: '2026-12-31',
    leader: '张明 (项目组长)',
    description: '浦东核心研发中心一期设备维保项目，覆盖超净间动力、冷水机组、精密空调与净化气体管道检测。',
    image: INDUSTRIAL_IMAGES.factory,
    subAccountCount: 12
  },
  {
    id: 'proj-2',
    name: '中央科技广场',
    location: '北京市海淀区科技园路8号',
    industry: '智慧楼宇与绿色建筑',
    startDate: '2023-01-15',
    endDate: '2025-06-30',
    leader: '王刚 (管理员)',
    description: '核心中央大楼设施巡检查验，含高压配电房、多联机变频空调、智能排涝系统等。',
    image: INDUSTRIAL_IMAGES.datacenter,
    subAccountCount: 8
  },
  {
    id: 'proj-3',
    name: '西部物流中心',
    location: '成都市双流航空港综合保税区',
    industry: '现代仓储与智能物流',
    startDate: '2024-02-01',
    endDate: '2027-02-01',
    leader: '李薇 (采购员)',
    description: '西南枢纽智能物流仓储区。覆盖重型分拣传送机、AGV自动搬运小车、电梯年度巡检等动力控制系统。',
    image: INDUSTRIAL_IMAGES.robotArm,
    subAccountCount: 6
  },
  {
    id: 'proj-4',
    name: '智能工厂二期项目',
    location: '深圳市龙华科技新城2号厂区',
    industry: '汽车及重工业精密装配',
    startDate: '2024-05-10',
    endDate: '2028-05-10',
    leader: '张浩 (技术员)',
    description: '配备六轴机械手臂、高精度光电对色传感器、液压精密锻造冲压机的全自动化产线维护。',
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5efa6122?auto=format&fit=crop&q=80&w=400',
    subAccountCount: 15
  }
];

export const INITIAL_PARTS: SparePart[] = [
  {
    id: 'part-1',
    name: '专业传感器 X1',
    model: 'Mod-2024-V2',
    manufacturer: '西门子自动化',
    price: 1420.00,
    date: '2024-10-20',
    unit: 'PCS',
    image: INDUSTRIAL_IMAGES.sensor,
    brand: '西门子自动化',
    supplier: '科技环球有限公司',
    cas: '108-95-2',
    relatedProject: '智能工厂二期项目',
    category: PartCategory.PART,
    description: '高性能光电传感器，适用于恶劣工业环境。具有极高的抗干扰能力和精准的检测距离，专为食品包装、汽车组装及重型机械产线设计。外壳采用IP67防护等级材料，耐腐蚀、抗震动。',
    quoteHistory: [
      { id: 'q-1', date: '2024-10-20', price: 1420.00, quantity: 10, supplier: '科技环球有限公司', project: '智能工厂二期项目', buyer: '李薇 (采购员)' },
      { id: 'q-2', date: '2024-08-15', price: 1450.00, quantity: 50, supplier: '科技环球有限公司', project: '智能工厂二期项目', buyer: '李薇 (采购员)' },
      { id: 'q-3', date: '2024-05-30', price: 1480.00, quantity: 20, supplier: '远东设备供应部', project: '浦东研发中心一期', buyer: '王刚 (管理员)' }
    ]
  },
  {
    id: 'part-2',
    name: '液压阀 H-90',
    model: '高压 80Bar',
    manufacturer: '博世力士乐',
    price: 8900.00,
    date: '2024-10-20',
    unit: 'UNIT',
    image: INDUSTRIAL_IMAGES.valve,
    brand: '博世力士乐',
    supplier: '博世力士乐中国代理',
    cas: '1025-DF-90',
    relatedProject: '西部物流中心',
    category: PartCategory.PART,
    description: '高硬度碳钢比例液压阀。额定工作腔压力80Bar，最大流率120L/min。支持CAN-bus智能总线控制，在极端高温/高粉尘重工况下运行寿命长达20000小时。',
    quoteHistory: [
      { id: 'q-4', date: '2024-10-20', price: 8900.00, quantity: 2, supplier: '博世力士乐中国代理', project: '西部物流中心', buyer: '李薇 (采购员)' },
      { id: 'q-5', date: '2024-03-12', price: 9200.00, quantity: 5, supplier: '沪上阀门总库', project: '浦东研发中心一期', buyer: '陈伟 (技术专家)' }
    ]
  },
  {
    id: 'part-3',
    name: '电磁感应继电器 RY-24V',
    model: '24V DC / 10A',
    manufacturer: '施耐德电气',
    price: 320.00,
    date: '2024-09-18',
    unit: 'PCS',
    image: INDUSTRIAL_IMAGES.relay,
    brand: '施耐德电气',
    supplier: '得力工矿配件',
    cas: 'REL-24V-SCH',
    relatedProject: '浦东研发中心一期',
    category: PartCategory.PART,
    description: '工业级微型插座式电磁继电器。支持2组转换触点（2CO），内带LED指示灯及手动测试按钮。常用于配电控制柜内的PLC逻辑信号隔离和中小负载驱动。',
    quoteHistory: [
      { id: 'q-6', date: '2024-09-18', price: 320.00, quantity: 100, supplier: '得力工矿配件', project: '浦东研发中心一期', buyer: '王刚 (管理员)' }
    ]
  },
  {
    id: 'part-4',
    name: '三相变频驱动电机 M3',
    model: '3-Phase 15kW',
    manufacturer: 'ABB集团',
    price: 18500.00,
    date: '2024-11-05',
    unit: 'UNIT',
    image: INDUSTRIAL_IMAGES.pump,
    brand: 'ABB驱动',
    supplier: '瑞典ABB上海自贸区办事处',
    cas: 'M3BP-160-4A',
    relatedProject: '智能工厂二期项目',
    category: PartCategory.PART,
    description: 'IE4超高效率等级铸铁电动机。专为变频器调速应用优化，具备顶级散热设计和特种绕组绝缘屏障，能够在零速到超高转速段输出恒定平稳的扭矩。',
    quoteHistory: [
      { id: 'q-7', date: '2024-11-05', price: 18500.00, quantity: 1, supplier: '瑞典ABB上海自贸区办事处', project: '智能工厂二期项目', buyer: '李薇 (采购员)' }
    ]
  },
  {
    id: 'part-5',
    name: '耐高温无氟润滑硅脂 GPL-205',
    model: 'HT-LUB-205',
    manufacturer: '杜邦化学',
    price: 680.00,
    date: '2024-10-01',
    unit: 'PNT',
    image: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&q=80&w=400',
    brand: 'Krytox',
    supplier: '华东特种化学代理商',
    cas: '9002-84-0',
    relatedProject: '浦东研发中心一期',
    category: PartCategory.CONSUMABLE,
    description: '合成氟素脂，专用于极端高温、强腐蚀和无菌环境轴承、阀座的长期润滑。性能稳定，不气化，绝缘并对大部分橡胶和塑料无化学活性。',
    quoteHistory: [
      { id: 'q-8', date: '2024-10-01', price: 680.00, quantity: 15, supplier: '华东特种化学代理商', project: '浦东研发中心一期', buyer: '陈伟 (技术专家)' }
    ]
  }
];

export const INITIAL_ORDERS: WorkOrder[] = [
  {
    id: 'FZKJ20231027001',
    title: '数据中心空调维修',
    project: '中央科技广场',
    deviceCategory: '环境',
    deviceType: '空调',
    brand: '格力 (GREE)',
    model: 'KFR-72LW',
    description: '机房3号空调不制冷，伴有异响。自今日凌晨起，温度传感器报警，持续高位运行无法降温。请携带压力表以及R410A冷媒前往检修。',
    imageUrl: INDUSTRIAL_IMAGES.datacenter,
    urgency: UrgencyLevel.LEVEL1,
    assignee: 'David Chen',
    dueDate: '2026-06-08 14:00',
    status: WorkOrderStatus.PROCESSING,
    timestamp: '2026-06-08 09:12',
    defectLevel: 1,
    maintenanceMode: '自行维修',
    applicant: '陈伟',
    applicantId: '8829'
  },
  {
    id: 'MC-2024-0892',
    title: '主轴驱动系统定期维护',
    project: '智能工厂二期项目',
    deviceCategory: '动力',
    deviceType: '机械手臂轴驱动器',
    brand: '库卡 (KUKA)',
    model: 'KR C4 Controller',
    description: '设备编号: MC-2024-0892。主轴1号伺服器温度超过常温3度，由于今天生产计划排满，需要在今日 17:30 停机空档期进行滤波片和散热风扇除尘清理。',
    imageUrl: INDUSTRIAL_IMAGES.robotArm,
    urgency: UrgencyLevel.LEVEL1,
    assignee: 'David Chen',
    dueDate: '今天 17:30',
    status: WorkOrderStatus.NEW,
    timestamp: '2026-06-08 08:00',
    defectLevel: 1,
    maintenanceMode: '自行维修',
    applicant: '张明',
    applicantId: '1001'
  },
  {
    id: 'FZKJ20231027005',
    title: '电梯年度巡检',
    project: '西部物流中心',
    deviceCategory: '控制',
    deviceType: '重型电梯曳引机',
    brand: '通力 (KONE)',
    model: 'MonoSpace 500',
    description: '例行年度限速器检测和钢丝绳磨损层量探测。状态：等待到场。已指派维保合作队伍及随行业务员配额检查。',
    imageUrl: INDUSTRIAL_IMAGES.valve,
    urgency: UrgencyLevel.LEVEL2,
    assignee: 'Sarah Miller',
    dueDate: '2026-10-29 14:00',
    status: WorkOrderStatus.RECEIVED,
    timestamp: '2026-06-07 10:45',
    defectLevel: 2,
    maintenanceMode: '外部维修',
    applicant: '李梅',
    applicantId: '2042'
  },
  {
    id: 'FZKJ20231027012',
    title: '冷却循环泵压力异常检查',
    project: '浦东研发中心一期',
    deviceCategory: '环境',
    deviceType: '冷水外循环泵',
    brand: '威乐 (WILO)',
    model: 'MISO-80-200',
    description: '副泵压力指示低于设计基准 0.4Bar，伴有轻微喘振特征。需查验进水过滤器是否堵塞，气垫排气阀是否积水受潮。',
    imageUrl: INDUSTRIAL_IMAGES.pump,
    urgency: UrgencyLevel.LEVEL2,
    assignee: '张浩',
    dueDate: '2026-06-10 16:00',
    status: WorkOrderStatus.NEW,
    timestamp: '2026-06-08 11:20',
    defectLevel: 2,
    maintenanceMode: '自行维修',
    applicant: '陈伟',
    applicantId: '8829'
  },
  {
    id: 'FZKJ20231027099',
    title: '气体管路氮气减压阀更换',
    project: '浦东研发中心一期',
    deviceCategory: '控制',
    deviceType: '高纯氮气减压阀',
    brand: '世伟洛克 (Swagelok)',
    model: 'KPR Series',
    description: '阀腔调节螺杆磨损引起二级降压时压力出现抖动，对下游气相色谱仪构成安全威胁。已申请从备件库领取高纯阀体进行更换并经肥皂水气密测试通过。',
    imageUrl: INDUSTRIAL_IMAGES.sensor,
    urgency: UrgencyLevel.LEVEL3,
    assignee: '张浩',
    dueDate: '2026-06-05 12:00',
    status: WorkOrderStatus.COMPLETED,
    timestamp: '2026-06-05 09:00',
    defectLevel: 3,
    maintenanceMode: '自行维修',
    applicant: '张浩',
    applicantId: '7731'
  }
];

export const INITIAL_SUB_ACCOUNTS: SubAccount[] = [
  {
    id: 'sub-1',
    name: '张浩',
    role: '技术员',
    status: '在线',
    level: '',
    lastActive: '2小时前',
    permissions: {
      viewParts: true,
      manageParts: false,
      viewCostAndQuotes: false,
      fileDefectReport: true,
      processWorkOrder: true,
      viewReports: false,
      viewSupplierInfo: true
    },
    assignedProjects: ['proj-1', 'proj-4']
  },
  {
    id: 'sub-2',
    name: '李薇',
    role: '采购员',
    status: '离线',
    level: '',
    lastActive: '1天前',
    permissions: {
      viewParts: true,
      manageParts: true,
      viewCostAndQuotes: true,
      fileDefectReport: false,
      processWorkOrder: false,
      viewReports: true,
      viewSupplierInfo: true
    },
    assignedProjects: ['proj-3', 'proj-4']
  },
  {
    id: 'sub-3',
    name: '王刚',
    role: '管理员',
    status: '在线',
    level: '',
    lastActive: '5分钟前',
    permissions: {
      viewParts: true,
      manageParts: true,
      viewCostAndQuotes: true,
      fileDefectReport: true,
      processWorkOrder: true,
      viewReports: true,
      viewSupplierInfo: true
    },
    assignedProjects: ['proj-1', 'proj-2', 'proj-3', 'proj-4']
  },
  {
    id: 'sub-4',
    name: '陈默',
    role: '实习生',
    status: '等待激活',
    level: '',
    lastActive: '从未激活',
    permissions: {
      viewParts: true,
      manageParts: false,
      viewCostAndQuotes: false,
      fileDefectReport: true,
      processWorkOrder: false,
      viewReports: false,
      viewSupplierInfo: false
    },
    assignedProjects: ['proj-1']
  }
];
