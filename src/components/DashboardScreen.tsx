/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Bell, ArrowRight, AlertTriangle, Package2, ClipboardList, BarChart3, Search, Clock, LogOut, ShieldAlert } from 'lucide-react';
import { WorkOrder, WorkOrderStatus, SubAccount, Project } from '../types';

interface DashboardScreenProps {
  currentUser: SubAccount | any;
  currentProject: Project;
  allProjects: Project[];
  workOrders: WorkOrder[];
  onNavigate: (tab: string, filterAssignee?: boolean) => void;
  onSelectWorkOrder: (order: WorkOrder) => void;
  onLogout: () => void;
  onSwitchProject: (proj: Project) => void;
}

export default function DashboardScreen({
  currentUser,
  currentProject,
  allProjects,
  workOrders,
  onNavigate,
  onSelectWorkOrder,
  onLogout,
  onSwitchProject
}: DashboardScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showBellNotification, setShowBellNotification] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);

  // Filter work orders relevant to current active project
  const projectOrders = workOrders.filter(
    (order) => order.project === currentProject.name
  );

  // Count active pending tasks
  const pendingOrders = projectOrders.filter(
    (o) => o.status !== WorkOrderStatus.COMPLETED
  );
  
  // Imminent deadline count (within today or Level 1)
  const urgentCount = pendingOrders.filter(
    (o) => o.urgency === 'Level 1 紧急'
  ).length;

  const quickFilterOrders = searchQuery.trim()
    ? pendingOrders.filter(
        (o) =>
          o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : pendingOrders.slice(0, 3); // Display top pending tasks

  return (
    <div id="dashboard-screen-root" className="flex flex-col min-h-screen bg-[#faf9fe]">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 bg-[#faf9fe]/80 backdrop-blur-xl border-b border-[#eeedf3] px-4 py-3 flex items-center justify-between">
        {/* Project Selector Title */}
        <div className="relative">
          <button 
            onClick={() => setShowProjectPicker(!showProjectPicker)}
            className="flex items-center gap-1.5 focus:outline-hidden group text-left"
          >
            <div>
              <p className="text-xs text-gray-400 font-sans font-medium">当前所在项目</p>
              <h2 className="text-sm font-bold text-[#1a1b1f] max-w-[180px] truncate group-hover:text-[#0058bc] flex items-center gap-1">
                {currentProject.name}
                <span className="text-[10px] text-gray-400">▼</span>
              </h2>
            </div>
          </button>

          {showProjectPicker && (
            <div className="absolute top-12 left-0 w-64 bg-white/95 rounded-2xl p-2 shadow-2xl border border-[#eeedf3] z-50 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="text-xs font-bold text-gray-400 px-3 py-2 border-b border-[#f4f3f8] mb-1">
                切换维护项目
              </p>
              {allProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSwitchProject(p);
                    setShowProjectPicker(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    p.id === currentProject.id
                      ? 'bg-[#0058bc]/10 text-[#0058bc] font-bold'
                      : 'hover:bg-[#f4f3f8] text-[#414755]'
                  }`}
                >
                  <div className="truncate">{p.name}</div>
                  <div className="text-[10px] text-gray-400 font-normal truncate mt-0.5">{p.location}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action icons & logout */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setShowBellNotification(!showBellNotification)}
              className="w-10 h-10 bg-[#eeedf3]/60 hover:bg-[#eeedf3] rounded-full flex items-center justify-center text-[#414755] relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {pendingOrders.length > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#ff3b30] rounded-full" />
              )}
            </button>

            {showBellNotification && (
              <div className="absolute top-12 right-0 w-72 bg-white rounded-2xl p-4 shadow-2xl border border-[#eeedf3] z-50">
                <div className="flex justify-between items-center mb-2.5">
                  <h4 className="text-xs font-bold text-gray-800">通知及预警</h4>
                  <button 
                    onClick={() => setShowBellNotification(false)}
                    className="text-[10px] text-blue-500 hover:underline"
                  >
                    全部已读
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {pendingOrders.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">当前无待办预警</p>
                  ) : (
                    pendingOrders.map((o) => (
                      <div 
                        key={o.id} 
                        onClick={() => {
                          onSelectWorkOrder(o);
                          setShowBellNotification(false);
                        }}
                        className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-100 text-left text-xs cursor-pointer"
                      >
                        <div className="font-semibold flex justify-between">
                          <span className="truncate max-w-[160px]">{o.title}</span>
                          <span className="text-[10px] text-red-500 font-bold">{o.urgency.replace('Level ', '')}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5 truncate">指派给: {o.assignee}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 pl-1.5 border-l border-gray-200">
            <button
              onClick={onLogout}
              title="注销登录"
              className="w-10 h-10 bg-red-50 hover:bg-red-100 rounded-full flex items-center justify-center text-red-500 cursor-pointer transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Greetings Area */}
      <main className="flex-1 px-4 py-5 space-y-6">
        <div>
          <p className="text-sm text-[#414755]/80 font-sans">
            早上好，{currentUser.level || currentUser.role}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1a1b1f] font-sans mt-0.5 flex items-center gap-1.5">
            工作台
            <span className="text-sm py-1 px-2 pb-1.5 bg-[#0058bc]/10 text-[#0058bc] rounded-md font-semibold font-mono">
              {currentUser.name}
            </span>
          </h1>
        </div>

        {/* Search Bar */}
        <div id="dashboard-search-layout" className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="搜索备件、工单或设备..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white shadow-xs rounded-2xl text-sm border border-[#eeedf3] focus:border-[#0058bc] focus:outline-hidden focus:ring-1 focus:ring-[#0058bc] transition-all font-sans text-gray-800 placeholder-gray-400"
          />
        </div>

        {/* Current Active Work Order Card Banner (Glassmorphic) */}
        <div 
          id="active-order-banner"
          onClick={() => onNavigate('工单')}
          className="relative overflow-hidden bg-linear-to-br from-[#0070eb] to-[#0058bc] rounded-3xl p-6 text-white shadow-xl shadow-[#0058bc]/15 cursor-pointer hover:opacity-98 active:scale-[0.99] transition-all"
        >
          {/* Subtle background industrial pattern overlay */}
          <div className="absolute right-0 bottom-0 top-0 opacity-15 pointer-events-none w-1/2 flex items-center justify-center">
            <Package2 className="w-36 h-36 stroke-[1]" />
          </div>

          <p className="text-sm font-semibold opacity-90 tracking-wide font-sans">
            当前待办工单
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-6xl font-extrabold tracking-tight font-sans">
              {String(pendingOrders.length).padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-white/20 mt-5 pt-3.5 text-xs">
            <span className="inline-flex items-center gap-1.5 font-medium opacity-90">
              <Clock className="w-3.5 h-3.5 animate-pulse text-yellow-300" />
              {urgentCount} 个工单为 LEVEL 1 紧急类别
            </span>
            <span className="flex items-center gap-1 font-semibold group">
              查看列表 <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        {/* Rapid Access Section (便捷入口) */}
        <div>
          <h3 className="text-base font-bold text-[#1a1b1f] mb-3.5 font-sans">
            便捷入口
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {/* Quick Link 1 */}
            <button
              onClick={() => onNavigate('submit-defect')}
              disabled={!currentUser.permissions.fileDefectReport}
              className={`flex flex-col items-center text-center space-y-2 p-2.5 bg-white rounded-2xl border border-[#eeedf3] transition-all relative ${
                currentUser.permissions.fileDefectReport
                  ? 'hover:shadow-md cursor-pointer active:scale-95'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="w-12 h-12 bg-red-50 text-[#ff3b30] rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="text-xs font-semibold text-gray-800 font-sans truncate w-full">维修填报</span>
              {!currentUser.permissions.fileDefectReport && (
                <ShieldAlert className="absolute top-0 right-0 w-3.5 h-3.5 text-red-500" />
              )}
            </button>

            {/* Quick Link 2 */}
            <button
              onClick={() => onNavigate('备件库')}
              disabled={!currentUser.permissions.viewParts}
              className={`flex flex-col items-center text-center space-y-2 p-2.5 bg-white rounded-2xl border border-[#eeedf3] transition-all relative ${
                currentUser.permissions.viewParts
                  ? 'hover:shadow-md cursor-pointer active:scale-95'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="w-12 h-12 bg-blue-50 text-[#0058bc] rounded-xl flex items-center justify-center">
                <Package2 className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="text-xs font-semibold text-gray-800 font-sans truncate w-full">备件查询</span>
              {!currentUser.permissions.viewParts && (
                <ShieldAlert className="absolute top-0 right-0 w-3.5 h-3.5 text-red-500" />
              )}
            </button>

            {/* Quick Link 3 */}
            <button
              onClick={() => onNavigate('工单', true)} // Filter to "my work orders"
              className="flex flex-col items-center text-center space-y-2 p-2.5 bg-white rounded-2xl border border-[#eeedf3] hover:shadow-md cursor-pointer active:scale-95 transition-all"
            >
              <div className="w-12 h-12 bg-[#ebebff] text-[#4c4aca] rounded-xl flex items-center justify-center">
                <ClipboardList className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="text-xs font-semibold text-gray-800 font-sans truncate w-full">我的工单</span>
            </button>

            {/* Quick Link 4 */}
            <button
              disabled={!currentUser.permissions.viewReports}
              className={`flex flex-col items-center text-center space-y-2 p-2.5 bg-white rounded-2xl border border-[#eeedf3] transition-all relative ${
                currentUser.permissions.viewReports
                  ? 'hover:shadow-md cursor-pointer active:scale-95'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => {
                if (currentUser.permissions.viewReports) {
                  onNavigate('statistics');
                }
              }}
            >
              <div className="w-12 h-12 bg-purple-50 text-[#8a2bb9] rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="text-xs font-semibold text-gray-800 font-sans truncate w-full">统计报表</span>
              {!currentUser.permissions.viewReports && (
                <ShieldAlert className="absolute top-0 right-0 w-3.5 h-3.5 text-red-500" />
              )}
            </button>
          </div>
        </div>

        {/* Pending Tasks Section (待办任务) */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-bold text-[#1a1b1f] font-sans">
              待办任务
            </h3>
            <span className="bg-gray-100 text-[#414755] text-xs font-semibold px-2 py-0.5 rounded-sm">
              最新
            </span>
          </div>

          <div className="space-y-3.5">
            {quickFilterOrders.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-2xl border border-[#eeedf3] text-gray-400 text-sm">
                🎉 暂无待办任务
              </div>
            ) : (
              quickFilterOrders.map((order) => {
                const isUrgent = order.urgency === 'Level 1 紧急';
                return (
                  <div
                    key={order.id}
                    onClick={() => onSelectWorkOrder(order)}
                    className="flex gap-4 p-4 bg-white rounded-2xl border border-[#eeedf3] hover:border-[#0058bc]/40 active:scale-[0.99] transition-all cursor-pointer shadow-xs hover:shadow-md text-left"
                  >
                    {/* Device icon wrapper representing type */}
                    <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center shrink-0 border border-gray-100">
                      {order.deviceType.includes('传感器') ? (
                        <Search className="w-6 h-6 text-blue-500 stroke-[2]" />
                      ) : order.deviceType.includes('空调') ? (
                        <Clock className="w-6 h-6 text-indigo-500 stroke-[2]" />
                      ) : (
                        <ClipboardList className="w-6 h-6 text-teal-500 stroke-[2]" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-[#1a1b1f] font-sans leading-tight">
                          {order.title}
                        </h4>
                        <span 
                          className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm tracking-wide shrink-0 ${
                            isUrgent 
                              ? 'bg-[#ff3b30]/10 text-[#ff3b30]' 
                              : 'bg-blue-50 text-[#0058bc]'
                          }`}
                        >
                          {isUrgent ? '紧急' : '普通'}
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 font-mono font-medium">
                        设备编号: {order.id.slice(0, 12)}
                      </p>

                      <p className="text-xs text-[#414755]/80 font-sans flex items-center gap-1 mt-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        截止: {order.dueDate}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
