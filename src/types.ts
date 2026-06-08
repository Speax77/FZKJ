/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum PartCategory {
  ALL = '全部',
  PART = '备件',
  CONSUMABLE = '耗材'
}

export interface QuoteHistory {
  id: string;
  date: string;
  price: number;
  quantity: number;
  supplier: string;
  project: string;
  buyer: string;
}

export interface SparePart {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  price: number;
  date: string;
  unit: string;
  image: string;
  brand: string;
  supplier: string;
  cas: string;
  relatedProject: string;
  category: PartCategory;
  description: string;
  quoteHistory: QuoteHistory[];
}

export enum WorkOrderStatus {
  NEW = '新建',
  RECEIVED = '已接收',
  PROCESSING = '处理中',
  COMPLETED = '已完成'
}

export enum UrgencyLevel {
  LEVEL1 = 'Level 1 紧急',
  LEVEL2 = 'Level 2 普通',
  LEVEL3 = 'Level 3 低'
}

export interface WorkOrder {
  id: string; // e.g. FZKJ20231027001
  title: string;
  project: string;
  deviceCategory: string; // e.g. 环境, 控制, 动力
  deviceType: string; // e.g. 空调, 传感器, 液压泵
  brand: string;
  model: string;
  description: string;
  imageUrl?: string;
  urgency: UrgencyLevel;
  assignee: string;
  dueDate: string;
  status: WorkOrderStatus;
  timestamp: string;
  defectLevel: 1 | 2 | 3;
  maintenanceMode: '自行维修' | '外部维修';
  applicant: string;
  applicantId: string;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  industry: string;
  startDate: string;
  endDate: string;
  leader: string;
  description: string;
  image: string;
  subAccountCount: number;
}

export interface UserPermissions {
  viewParts: boolean;
  manageParts: boolean;
  viewCostAndQuotes: boolean;
  fileDefectReport: boolean;
  processWorkOrder: boolean;
  viewReports: boolean;
  viewSupplierInfo: boolean;
}

export interface SubAccount {
  id: string;
  name: string;
  role: string;
  status: '在线' | '离线' | '等待激活';
  level: string; // e.g. 高级技师, 资产管理, 审批权限, 实习生
  lastActive: string;
  permissions: UserPermissions;
  assignedProjects?: string[];
}
