/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Search, Plus, ArrowLeft, ClipboardCheck, User, Calendar, ShieldCheck, XCircle, MapPin, Sparkles, X, Info, Download, Trash2 } from 'lucide-react';
import { WorkOrder, WorkOrderStatus, UrgencyLevel, SubAccount, Project } from '../types';
import ConfirmationModal from './ConfirmationModal';

interface WorkOrdersScreenProps {
  currentUser: SubAccount | any;
  currentProject: Project;
  workOrders: WorkOrder[];
  filterByMeOnly: boolean;
  selectedWorkOrder: WorkOrder | null;
  onSelectWorkOrder: (order: WorkOrder | null) => void;
  onUpdateWorkOrderStatus: (orderId: string, nextStatus: WorkOrderStatus) => void;
  onAddWorkOrder: (order: WorkOrder) => void;
  onNavigateToReport: () => void;
  onDeleteWorkOrder?: (orderId: string) => void;
}

export default function WorkOrdersScreen({
  currentUser,
  currentProject,
  workOrders,
  filterByMeOnly,
  selectedWorkOrder,
  onSelectWorkOrder,
  onUpdateWorkOrderStatus,
  onAddWorkOrder,
  onNavigateToReport,
  onDeleteWorkOrder
}: WorkOrdersScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'全部' | '待处理' | '处理中' | '已完成'>('全部');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Filter tasks
  const projectFiltered = workOrders.filter(
    (order) => order.project === currentProject.name
  );

  const finalFiltered = projectFiltered.filter((order) => {
    // 1. Me filter
    if (filterByMeOnly && order.assignee !== currentUser.name) {
      return false;
    }

    // 2. Tab filtering
    if (activeTab === '待处理' && order.status !== WorkOrderStatus.NEW && order.status !== WorkOrderStatus.RECEIVED) {
      return false;
    }
    if (activeTab === '处理中' && order.status !== WorkOrderStatus.PROCESSING) {
      return false;
    }
    if (activeTab === '已完成' && order.status !== WorkOrderStatus.COMPLETED) {
      return false;
    }

    // 3. Search query
    const matchesSearch =
      order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.assignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.deviceType.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Export current filtered work orders to beautifully structured CSV
  const exportToCSV = () => {
    const headers = [
      '工单编号',
      '工单标题',
      '所属项目',
      '设备大类',
      '设备类别',
      '品牌/制造商',
      '规格型号',
      '故障分级',
      '紧急程度',
      '指派负责人',
      '截止日期',
      '当前状态',
      '报修申请人',
      '申请人ID',
      '维修模式',
      '创建时间',
      '详细故障描述'
    ];

    const rows = finalFiltered.map(order => [
      order.id,
      order.title,
      order.project,
      order.deviceCategory,
      order.deviceType,
      order.brand,
      order.model,
      `LVL ${order.defectLevel}`,
      order.urgency,
      order.assignee,
      order.dueDate,
      order.status,
      order.applicant,
      order.applicantId,
      order.maintenanceMode,
      order.timestamp,
      order.description
    ]);

    const csvContent = 
      "\uFEFF" + 
      [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""').replace(/\n/g, ' ')}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `项目设备报修工单数据_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="work-orders-screen-root" className="flex flex-col min-h-screen bg-[#faf9fe]">
      {!selectedWorkOrder ? (
        <>
          {/* Work Order Lists Header (Image 6) */}
          <header className="sticky top-0 z-30 bg-[#faf9fe]/85 backdrop-blur-md px-4 py-3 flex flex-col space-y-3.5 border-b border-[#eeedf3]">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-extrabold text-[#1a1b1f] font-sans">
                  工单管理
                </h1>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {filterByMeOnly ? '我的派单备忘记录' : `当前工程: ${currentProject.name}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {currentUser?.role === '管理员' && (
                  <button
                    onClick={exportToCSV}
                    className="text-[10px] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold py-1.5 px-2.5 rounded-full flex items-center gap-1 transition-colors cursor-pointer shadow-3xs"
                    title="导出当前工单为 CSV 文件"
                  >
                    <Download className="w-3.5 h-3.5" />
                    导出工单 (CSV)
                  </button>
                )}
                {/* Visual badge indicator */}
                {filterByMeOnly && (
                  <span className="text-[10px] bg-blue-50 text-[#0058bc] border border-blue-100 font-bold py-1 px-2.5 rounded-full">
                    仅看我的
                  </span>
                )}
              </div>
            </div>

            {/* Search Input bar */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="搜索工单、编号、项目或执行者..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-xs font-medium border border-transparent focus:bg-white focus:border-[#0058bc] focus:outline-hidden transition-all text-gray-800 placeholder-gray-400 font-sans"
              />
            </div>

            {/* Stepper Status filter (Image 6 Tabs) */}
            <div className="bg-gray-100 p-1.5 rounded-xl flex gap-1 justify-between">
              {(['全部', '待处理', '处理中', '已完成'] as const).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 text-center py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                      isActive
                        ? 'bg-white text-[#1a1b1f] shadow-xs'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </header>

          {/* List content (Image 6 Cards) */}
          <main className="flex-grow p-4 space-y-4 max-h-[calc(100vh-170px)] overflow-y-auto relative">
            {finalFiltered.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">
                📋 没有符合筛选条件的工单记录
              </div>
            ) : (
              finalFiltered.map((order) => {
                const isL1 = order.urgency === UrgencyLevel.LEVEL1;
                const isL2 = order.urgency === UrgencyLevel.LEVEL2;
                
                // Progress status mapping to indexes (0 to 3) for horizontal stepper
                const statusIndexMap = {
                  [WorkOrderStatus.NEW]: 0,
                  [WorkOrderStatus.RECEIVED]: 1,
                  [WorkOrderStatus.PROCESSING]: 2,
                  [WorkOrderStatus.COMPLETED]: 3
                };
                const activeIdx = statusIndexMap[order.status];

                return (
                  <div
                    key={order.id}
                    onClick={() => onSelectWorkOrder(order)}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-[#eeedf3] hover:border-[#0058bc]/30 hover:shadow-md cursor-pointer transition-all flex flex-col space-y-4 text-left"
                  >
                    {/* Urgency Badge and Serial Block */}
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-gray-400 font-mono font-medium">
                        {order.id}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-sm uppercase tracking-wide ${
                          isL1
                            ? 'bg-[#ff3b30]/10 text-[#ff3b30]'
                            : isL2
                            ? 'bg-orange-50 text-orange-600'
                            : 'bg-green-50 text-green-700'
                        }`}
                      >
                        {order.urgency}
                      </span>
                    </div>

                    {/* Order Title */}
                    <div>
                      <h3 className="text-base font-bold text-[#1a1b1f] font-sans leading-snug">
                        {order.title}
                      </h3>
                    </div>

                    {/* Meta info tags */}
                    <div className="grid grid-cols-2 gap-3 text-xs text-[#414755]/85 border-b border-[#f4f3f8] pb-3 pt-1">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">指派给: <strong className="text-gray-700">{order.assignee}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-end">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">截止: <strong className="text-gray-700">{order.dueDate.replace('2026-', '')}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate text-[11px] text-gray-400 font-medium">项目: {order.project}</span>
                      </div>
                    </div>

                    {/* Stepper progress representation (Image 6 card bottom timeline) */}
                    <div className="pt-1.5 space-y-2">
                      <div className="relative flex justify-between items-center">
                        {/* Connecting Line */}
                        <div className="absolute left-2 right-2 top-1.5 h-0.5 bg-gray-100 z-0">
                          <div 
                            className="bg-[#0058bc] h-full transition-all duration-300"
                            style={{ width: `${(activeIdx / 3) * 100}%` }}
                          />
                        </div>

                        {/* Timeline Nodes */}
                        {['新建', '已接收', '处理中', '已完成'].map((nodeText, idx) => {
                          const isDoneOrActive = idx <= activeIdx;
                          return (
                            <div key={nodeText} className="flex flex-col items-center relative z-10">
                              <div
                                className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                                  isDoneOrActive
                                    ? 'bg-[#005bc1] border-[#005bc1]'
                                    : 'bg-white border-gray-300'
                                }`}
                              >
                                {isDoneOrActive && <div className="w-1 h-1 bg-white rounded-full" />}
                              </div>
                              <span
                                className={`text-[9px] font-bold mt-1 tracking-tight transition-colors ${
                                  idx === activeIdx
                                    ? 'text-[#0058bc]'
                                    : idx < activeIdx
                                    ? 'text-gray-700'
                                    : 'text-gray-400'
                                }`}
                              >
                                {nodeText}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Fab Add button (Image 6 bottom right +) */}
            {currentUser.permissions.fileDefectReport && (
              <button
                onClick={onNavigateToReport}
                className="fixed bottom-20 right-6 w-14 h-14 bg-[#0058bc] hover:bg-[#0058bc]/95 text-white rounded-full flex items-center justify-center shadow-lg shadow-[#0058bc]/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all z-40 cursor-pointer"
              >
                <Plus className="w-7 h-7 stroke-[2.5]" />
              </button>
            )}
          </main>
        </>
      ) : (
        /* Work Order Details presentation (Image 7) */
        <div className="flex flex-col min-h-screen bg-[#faf9fe] text-left">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-white border-b border-[#eeedf3] px-4 py-3.5 flex items-center justify-between">
            <button
              onClick={() => onSelectWorkOrder(null)}
              className="text-[#414755] hover:text-[#1a1b1f] flex items-center gap-1 text-sm font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> 返回
            </button>
            <h2 className="text-sm font-black text-gray-800">工单详情</h2>
            {currentUser?.role === '管理员' ? (
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-xl transition-colors cursor-pointer"
                title="永久删除此工单"
              >
                <Trash2 className="w-4.5 h-4.5 text-red-500 animate-pulse" />
              </button>
            ) : (
              <div className="w-12 h-4" />
            )}
          </header>

          {/* Detailed Layout content scroll */}
          <main className="flex-grow p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto pb-4">
            {/* 1. Header Linear Stepper Indicator (Image 7 stepper) */}
            <div className="bg-white p-4 rounded-2xl border border-[#eeedf3] space-y-2">
              <div className="relative flex justify-between items-center px-4">
                {/* Line */}
                <div className="absolute left-6 right-6 top-4 h-0.5 bg-gray-100 z-0">
                  <div 
                    className="bg-[#0058bc] h-full transition-all duration-400"
                    style={{
                      width: selectedWorkOrder.status === WorkOrderStatus.NEW ? '0%' :
                             selectedWorkOrder.status === WorkOrderStatus.RECEIVED ? '33.3%' :
                             selectedWorkOrder.status === WorkOrderStatus.PROCESSING ? '66.6%' : '100%'
                    }}
                  />
                </div>

                {/* Nodes */}
                {['新建', '已接收', '处理中', '已完成'].map((stepName, stepIndex) => {
                  const nodeStatusMap = {
                    '新建': WorkOrderStatus.NEW,
                    '已接收': WorkOrderStatus.RECEIVED,
                    '处理中': WorkOrderStatus.PROCESSING,
                    '已完成': WorkOrderStatus.COMPLETED
                  };
                  
                  const statusMapList = [
                    WorkOrderStatus.NEW,
                    WorkOrderStatus.RECEIVED,
                    WorkOrderStatus.PROCESSING,
                    WorkOrderStatus.COMPLETED
                  ];
                  
                  const currentStatusIndex = statusMapList.indexOf(selectedWorkOrder.status);
                  const isChecked = stepIndex <= currentStatusIndex;
                  const isActive = stepIndex === currentStatusIndex;

                  return (
                    <div key={stepName} className="flex flex-col items-center relative z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          isChecked
                            ? 'bg-[#005bc1] border-[#005bc1] text-white shadow-xs'
                            : 'bg-white border-gray-200 text-gray-400'
                        }`}
                      >
                        {isChecked ? (
                          <span className="text-[11px] font-black font-sans">✓</span>
                        ) : (
                          <span className="text-2xs font-extrabold">{stepIndex + 1}</span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold mt-1.5 transition-colors ${
                          isActive 
                            ? 'text-[#0058bc] font-black' 
                            : isChecked 
                            ? 'text-gray-700' 
                            : 'text-gray-400'
                        }`}
                      >
                        {stepName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Work Order serial details */}
            <div className="bg-white p-4 rounded-2xl border border-[#eeedf3] space-y-1">
              <p className="text-[10px] font-mono text-gray-400">
                工单编号: {selectedWorkOrder.id}
              </p>
              <div className="flex justify-between items-start gap-4">
                <h3 className="text-lg font-extrabold text-[#1a1b1f] tracking-tight">
                  {selectedWorkOrder.title}
                </h3>
                <span className="text-[10px] bg-[#ff3b30]/10 text-[#ff3b30] font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wide shrink-0">
                  {selectedWorkOrder.urgency.replace('Level ', 'LVL ')}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-semibold pt-1">
                派属项目: {selectedWorkOrder.project}
              </p>
            </div>

            {/* 3. Trouble Fault description details with Photo & Timestamp (Image 7) */}
            <div className="bg-white p-4 rounded-2xl border border-[#eeedf3] space-y-3.5">
              <h4 className="text-xs font-black text-gray-400 flex items-center gap-1 ml-0.5">
                <Info className="w-3.5 h-3.5 text-[#0058bc]" />
                故障详情
              </h4>

              <p className="text-xs text-[#414755] leading-relaxed font-medium bg-[#f4f3f8] p-3 rounded-xl border border-gray-100">
                {selectedWorkOrder.description}
              </p>

              {/* Server data room proof photo */}
              {selectedWorkOrder.imageUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-xs">
                  <img
                    src={selectedWorkOrder.imageUrl}
                    alt="Fault Screen"
                    referrerPolicy="no-referrer"
                    className="w-full h-48 object-cover brightness-95"
                  />
                  {/* Proof watermark overlay matching Image 7 */}
                  <div className="absolute bottom-2 right-2 bg-[#1a1b1f]/75 text-white text-[9px] font-bold font-mono px-2 py-0.5 rounded-md backdrop-blur-xs">
                    {selectedWorkOrder.timestamp} 拍摄
                  </div>
                </div>
              )}
            </div>

            {/* 4. Equipment Details Information list rows (Image 7) */}
            <div className="bg-white rounded-2xl border border-[#eeedf3] overflow-hidden">
              <div className="p-3 bg-gray-50/60 border-b border-[#f4f3f8]">
                <h4 className="text-xs font-black text-gray-500 ml-1">设备信息</h4>
              </div>

              <div className="divide-y divide-[#f4f3f8]">
                <div className="flex justify-between py-3.5 px-4 text-xs font-medium">
                  <span className="text-gray-400">设备分类</span>
                  <span className="font-extrabold text-[#1a1b1f]">
                    {selectedWorkOrder.deviceCategory}
                  </span>
                </div>
                <div className="flex justify-between py-3.5 px-4 text-xs font-medium">
                  <span className="text-gray-400">设备类型</span>
                  <span className="font-extrabold text-[#1a1b1f]">
                    {selectedWorkOrder.deviceType}
                  </span>
                </div>
                <div className="flex justify-between py-3.5 px-4 text-xs font-medium">
                  <span className="text-gray-400">维保品牌公司</span>
                  <span className="font-black text-blue-600 cursor-pointer">
                    {selectedWorkOrder.brand}
                  </span>
                </div>
                <div className="flex justify-between py-3.5 px-4 text-xs font-medium">
                  <span className="text-gray-400">特定型号</span>
                  <span className="font-mono font-bold text-gray-700">
                    {selectedWorkOrder.model}
                  </span>
                </div>
                <div className="flex justify-between py-3.5 px-4 text-xs font-medium">
                  <span className="text-gray-400">维保申领人</span>
                  <span className="font-bold text-gray-700">
                    {selectedWorkOrder.applicant} (ID: {selectedWorkOrder.applicantId})
                  </span>
                </div>
                <div className="flex justify-between py-3.5 px-4 text-xs font-medium">
                  <span className="text-gray-400">执行责任人</span>
                  <span className="font-extrabold text-[#005bc1]">
                    {selectedWorkOrder.assignee}
                  </span>
                </div>
              </div>
            </div>

            {/* Stepper advancement helper block for admins & technicians */}
            <div className="bg-[#eeedf3]/10 border border-[#eeedf3] p-4 rounded-2xl space-y-3.5 text-xs text-slate-600">
              <p className="font-black text-slate-800 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                工单调度面板 (当前状态: <strong className="text-[#0058bc] font-mono">{selectedWorkOrder.status}</strong>)
              </p>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onUpdateWorkOrderStatus(selectedWorkOrder.id, WorkOrderStatus.RECEIVED)}
                  disabled={selectedWorkOrder.status === WorkOrderStatus.COMPLETED}
                  className={`py-2 px-1.5 rounded-lg font-bold border rounded-md text-3xs text-center transition-all ${
                    selectedWorkOrder.status === WorkOrderStatus.RECEIVED
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                >
                  设为: 已接收
                </button>
                <button
                  onClick={() => onUpdateWorkOrderStatus(selectedWorkOrder.id, WorkOrderStatus.PROCESSING)}
                  disabled={selectedWorkOrder.status === WorkOrderStatus.COMPLETED}
                  className={`py-2 px-1.5 rounded-lg font-bold border rounded-md text-3xs text-center transition-all ${
                    selectedWorkOrder.status === WorkOrderStatus.PROCESSING
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                >
                  设为: 处理中
                </button>
                <button
                  onClick={() => onUpdateWorkOrderStatus(selectedWorkOrder.id, WorkOrderStatus.COMPLETED)}
                  className={`py-2 px-1.5 rounded-lg font-bold border rounded-md text-3xs text-center transition-all ${
                    selectedWorkOrder.status === WorkOrderStatus.COMPLETED
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                >
                  设为: 已完成
                </button>
              </div>
            </div>
          </main>

          {/* Sticky Bottom Actions Bar (Image 7) */}
          {currentUser.permissions.processWorkOrder && (
            <div className="sticky bottom-0 bg-white border-t border-[#eeedf3] p-4 flex gap-3.5 z-40">
              {selectedWorkOrder.status !== WorkOrderStatus.COMPLETED ? (
                <>
                  <button
                    onClick={() => {
                      onUpdateWorkOrderStatus(selectedWorkOrder.id, WorkOrderStatus.NEW);
                      onSelectWorkOrder(null);
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs transition-colors"
                  >
                    <XCircle className="w-4 h-4 text-red-500" />
                    驳回工单
                  </button>
                  
                  <button
                    onClick={() => {
                      onUpdateWorkOrderStatus(selectedWorkOrder.id, WorkOrderStatus.COMPLETED);
                      onSelectWorkOrder(null);
                    }}
                    className="flex-1 bg-[#0058bc] hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm shadow-[#0058bc]/10 transition-colors"
                  >
                    <ClipboardCheck className="w-4 h-4 text-white" />
                    完成修复，结算处理
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onSelectWorkOrder(null)}
                  className="w-full bg-[#0058bc] hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-xs"
                >
                  已在历史存档，关闭页面
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Reusable Visual Confirmation Modal for deleting Work Orders */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="高危确认：永久删除当前设备报修工单"
        type="danger"
        confirmText="确认彻底删除"
        cancelText="保留并取消"
        description={
          <div className="space-y-2">
            <p className="font-bold text-red-600">⚠️ 注意：这是一项高危且物理不可逆的操作！</p>
            <p>为了保障资产完整，删除前请仔细考量以下后果：</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>此工单实体将立即从<strong className="text-gray-900">系统数据网格</strong>中全面剥离</li>
              <li>相关的实拍故障凭证、现场日志及材料结转记录将<strong className="text-gray-900 font-extrabold">永久物理消除</strong>，不可再行找回</li>
              <li>删除后该工单将不在统计报表上作为活跃或历史数据呈现，可能影响绩效审计</li>
            </ul>
            {selectedWorkOrder && (
              <div className="mt-3 p-2 bg-gray-100 rounded-lg border border-gray-200 text-3xs font-mono text-gray-500">
                <p className="font-bold text-gray-700">待删工单：{selectedWorkOrder.id}</p>
                <p className="truncate">工单名称：{selectedWorkOrder.title}</p>
                <p>所属项目：{selectedWorkOrder.project}</p>
              </div>
            )}
          </div>
        }
        onConfirm={() => {
          setIsDeleteModalOpen(false);
          if (selectedWorkOrder) {
            onDeleteWorkOrder?.(selectedWorkOrder.id);
          }
        }}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
