/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Terminal, 
  Smartphone, 
  Battery, 
  Wifi, 
  Signal, 
  LayoutDashboard, 
  Package2, 
  Wrench, 
  User, 
  ShieldAlert, 
  LogOut, 
  AlertTriangle, 
  Lock, 
  SlidersHorizontal,
  FolderOpen
} from 'lucide-react';
import { 
  INITIAL_PROJECTS, 
  INITIAL_PARTS, 
  INITIAL_ORDERS, 
  INITIAL_SUB_ACCOUNTS 
} from './data';
import { 
  Project, 
  SparePart, 
  WorkOrder, 
  SubAccount, 
  WorkOrderStatus, 
  UserPermissions 
} from './types';

// Import sub screens
import LoginScreen from './components/LoginScreen';
import DashboardScreen from './components/DashboardScreen';
import PartsLibraryScreen from './components/PartsLibraryScreen';
import WorkOrdersScreen from './components/WorkOrdersScreen';
import SubmitDefectScreen from './components/SubmitDefectScreen';
import StatsReportScreen from './components/StatsReportScreen';
import AdminCenterScreen from './components/AdminCenterScreen';

export default function App() {
  // Global Database state
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [parts, setParts] = useState<SparePart[]>(INITIAL_PARTS);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_ORDERS);
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>(INITIAL_SUB_ACCOUNTS);

  // Active Session State
  const [currentProject, setCurrentProject] = useState<Project>(INITIAL_PROJECTS[0]);
  const [currentUser, setCurrentUser] = useState<SubAccount | any>(null);

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('工作台'); // '工作台', '备件库', '工单', '我的'
  const [insideSection, setInsideSection] = useState<'none' | 'submit-defect' | 'statistics' | 'admin-center'>('none');
  
  // Work Order interaction pipeline
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [filterByMeOnly, setFilterByMeOnly] = useState<boolean>(false);

  // Quick Notification alert
  const [floatingAlert, setFloatingAlert] = useState<string | null>(null);

  // Tick top mock clock
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      let hrs = now.getHours();
      let mins = now.getMinutes();
      const minStr = mins < 10 ? `0${mins}` : `${mins}`;
      setCurrentTime(`${hrs}:${minStr}`);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const triggerNotification = (text: string) => {
    setFloatingAlert(text);
    setTimeout(() => {
      setFloatingAlert(null);
    }, 4000);
  };

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    setActiveTab('工作台');
    setInsideSection('none');
    triggerNotification(`安全会话已建立。欢迎您，${user.name}！`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedWorkOrder(null);
    setFilterByMeOnly(false);
    triggerNotification('安全会话已成功注销。');
  };

  // State update callbacks
  const handleAddProject = (p: Project) => {
    setProjects([p, ...projects]);
    triggerNotification(`项目“${p.name}”已成功录入系统网络！`);
  };

  const handleEditProject = (updatedProj: Project) => {
    setProjects(projects.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
    if (currentProject.id === updatedProj.id) {
      setCurrentProject(updatedProj);
    }
    triggerNotification(`项目“${updatedProj.name}”内容更新成功。`);
  };

  const handleDeleteProject = (projId: string) => {
    if (projects.length <= 1) {
      triggerNotification(`🚫 无法删除：系统中必须保留至少一个项目，请创建新项目后再行移除。`);
      return;
    }
    const projToDelete = projects.find(p => p.id === projId);
    const updatedProjects = projects.filter((p) => p.id !== projId);
    setProjects(updatedProjects);
    if (currentProject.id === projId) {
      setCurrentProject(updatedProjects[0]);
    }
    setSubAccounts(
      subAccounts.map((acc) => ({
        ...acc,
        assignedProjects: acc.assignedProjects.filter((id) => id !== projId)
      }))
    );
    triggerNotification(`项目“${projToDelete?.name || ''}”已从系统中完全移除。`);
  };

  const handleAddPart = (part: SparePart) => {
    setParts([part, ...parts]);
    triggerNotification(`备件耗材“${part.name}”条目已正常添加至库房登记！`);
  };

  const handleUpdatePart = (updated: SparePart) => {
    setParts(parts.map((p) => (p.id === updated.id ? updated : p)));
    triggerNotification(`备件“${updated.name}”最新的采购或报价历史已安全入账！`);
  };

  const handleAddWorkOrder = (order: WorkOrder) => {
    setWorkOrders([order, ...workOrders]);
    triggerNotification(`故障维修工单 #${order.id.slice(-6)} 提交成功，并已自动排派！`);
  };

  const handleUpdateWorkOrderStatus = (orderId: string, nextStatus: WorkOrderStatus) => {
    setWorkOrders(
      workOrders.map((o) => {
        if (o.id === orderId) {
          return { ...o, status: nextStatus };
        }
        return o;
      })
    );
    
    // Auto sync selected work order details on status change
    if (selectedWorkOrder?.id === orderId) {
      setSelectedWorkOrder({ ...selectedWorkOrder, status: nextStatus });
    }

    triggerNotification(`工单状态已安全流转为：[${nextStatus}]`);
  };

  const handleDeleteWorkOrder = (orderId: string) => {
    setWorkOrders(workOrders.filter((o) => o.id !== orderId));
    setSelectedWorkOrder(null);
    triggerNotification(`工单与关联的历史备份均已从网关中彻底删除。`);
  };

  const handleUpdateSubAccountPermissions = (id: string, perms: UserPermissions) => {
    setSubAccounts(
      subAccounts.map((acc) => {
        if (acc.id === id) {
          const updated = { ...acc, permissions: perms };
          // If edited user is the current active session user, immediately update active permission contexts!
          if (currentUser && currentUser.id === id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return acc;
      })
    );
    triggerNotification('子账号特异权限清单保存成功，即刻生效。');
  };

  const handleSwitchProject = (proj: Project) => {
    setCurrentProject(proj);
    triggerNotification(`已切换至工作区：${proj.name}`);
  };

  // Safe navigation checker wrapped to protect access lists
  const handleTabNavigate = (tab: string, onlyMe: boolean = false) => {
    // Check permission rules defined dynamically in Image 12
    if (!currentUser) return;
    
    if (tab === '备件库' && !currentUser.permissions.viewParts) {
      triggerNotification('🚫 权限限制: 您的子账号不具备“查看备件库”权能。');
      return;
    }
    if (tab === 'submit-defect' && !currentUser.permissions.fileDefectReport) {
      triggerNotification('🚫 权限限制: 您的子账号不具备“维修填报”权能。');
      return;
    }
    if (tab === 'statistics' && !currentUser.permissions.viewReports) {
      triggerNotification('🚫 权限限制: 您的子账号不具备“查看统计报表”权能。');
      return;
    }

    setFilterByMeOnly(onlyMe);
    setSelectedWorkOrder(null);

    if (tab === 'submit-defect') {
      setInsideSection('submit-defect');
    } else if (tab === 'statistics') {
      setInsideSection('statistics');
    } else if (tab === 'admin-center') {
      setInsideSection('admin-center');
    } else {
      setInsideSection('none');
      setActiveTab(tab);
    }
  };

  // Automatically adjust current project if user is assigned to specific projects and active has changed
  useEffect(() => {
    if (currentUser) {
      // Find latest user data from list to get dynamic assignedProjects update
      const latestUser = subAccounts.find((a) => a.id === currentUser.id) || currentUser;
      if (latestUser.role !== '管理员' && latestUser.assignedProjects && latestUser.assignedProjects.length > 0) {
        const isCurrentAccessible = latestUser.assignedProjects.includes(currentProject.id);
        if (!isCurrentAccessible) {
          const firstAllowed = projects.find((p) => latestUser.assignedProjects.includes(p.id));
          if (firstAllowed) {
            setCurrentProject(firstAllowed);
          }
        }
      }
    }
  }, [currentUser, subAccounts, projects, currentProject]);

  // Render sub page depending on selection
  const renderContainerContent = () => {
    // Dynamically filter projects based on current logged in user and project assignments
    const getFilteredProjectsForUser = () => {
      if (!currentUser) return projects;
      // Admins (role === '管理员') or empty assignments can view all projects
      if (currentUser.role === '管理员' || !currentUser.assignedProjects || currentUser.assignedProjects.length === 0) {
        return projects;
      }
      return projects.filter((p) => currentUser.assignedProjects.includes(p.id));
    };

    const filteredProjects = getFilteredProjectsForUser();

    if (!currentUser) {
      return <LoginScreen accounts={subAccounts} onLogin={handleLogin} />;
    }

    if (insideSection === 'submit-defect') {
      return (
        <SubmitDefectScreen
          currentUser={currentUser}
          currentProject={currentProject}
          allProjects={filteredProjects}
          onAddWorkOrder={handleAddWorkOrder}
          onNavigateHome={() => setInsideSection('none')}
        />
      );
    }

    if (insideSection === 'statistics') {
      return (
        <StatsReportScreen
          currentProject={currentProject}
          workOrders={workOrders}
          parts={parts}
          onNavigateHome={() => setInsideSection('none')}
        />
      );
    }

    if (insideSection === 'admin-center') {
      return (
        <AdminCenterScreen
          currentUser={currentUser}
          accounts={subAccounts}
          projects={projects}
          onAddProject={handleAddProject}
          onEditProject={handleEditProject}
          onDeleteProject={handleDeleteProject}
          onAddSubAccount={handleCreateSubAccountInternal}
          onDeleteSubAccount={handleDeleteSubAccount}
          onAssignProjects={handleAssignProjectsToSubAccount}
          onUpdateSubAccountPermissions={handleUpdateSubAccountPermissions}
          onNavigateHome={() => setInsideSection('none')}
        />
      );
    }

    switch (activeTab) {
      case '工作台':
        return (
          <DashboardScreen
            currentUser={currentUser}
            currentProject={currentProject}
            allProjects={filteredProjects}
            workOrders={workOrders}
            onNavigate={handleTabNavigate}
            onSelectWorkOrder={(order) => {
              setSelectedWorkOrder(order);
              setActiveTab('工单');
              setInsideSection('none');
            }}
            onLogout={handleLogout}
            onSwitchProject={handleSwitchProject}
          />
        );
      case '备件库':
        return (
          <PartsLibraryScreen
            currentUser={currentUser}
            parts={parts}
            onAddPart={handleAddPart}
            onUpdatePart={handleUpdatePart}
          />
        );
      case '工单':
        return (
          <WorkOrdersScreen
            currentUser={currentUser}
            currentProject={currentProject}
            workOrders={workOrders}
            filterByMeOnly={filterByMeOnly}
            selectedWorkOrder={selectedWorkOrder}
            onSelectWorkOrder={setSelectedWorkOrder}
            onUpdateWorkOrderStatus={handleUpdateWorkOrderStatus}
            onAddWorkOrder={handleAddWorkOrder}
            onNavigateToReport={() => handleTabNavigate('submit-defect')}
            onDeleteWorkOrder={handleDeleteWorkOrder}
          />
        );
      case '我的':
        return renderMeProfileTab();
      default:
        return <div className="p-8 text-center">未知视图</div>;
    }
  };

  const handleCreateSubAccountInternal = (acc: SubAccount) => {
    setSubAccounts([...subAccounts, acc]);
    triggerNotification(`子账号“${acc.name} (${acc.role})”基础数据已成功激活！`);
  };

  const handleDeleteSubAccount = (id: string) => {
    setSubAccounts(subAccounts.filter((acc) => acc.id !== id));
    triggerNotification('该子账号已成功注销并从安全网关中删除！');
  };

  const handleAssignProjectsToSubAccount = (id: string, projectIds: string[]) => {
    setSubAccounts(
      subAccounts.map((acc) => {
        if (acc.id === id) {
          const updated = { ...acc, assignedProjects: projectIds };
          // If we are updating the current user itself, update active session!
          if (currentUser && currentUser.id === id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return acc;
      })
    );
    triggerNotification('分配项目权限修定成功，即刻生效！');
  };

  // Profile View (Me) rendering details of current session and credentials
  const renderMeProfileTab = () => {
    const activeUserOrders = workOrders.filter((o) => o.assignee === currentUser.name && o.status !== '已完成');
    return (
      <div className="flex flex-col min-h-screen bg-[#faf9fe]">
        <header className="bg-white px-4 py-4 border-b border-[#eeedf3] flex justify-between items-center sticky top-0 z-30">
          <h1 className="text-lg font-black text-[#1a1b1f] font-sans">企业个人中心</h1>
          <button
            onClick={handleLogout}
            className="text-xs font-black text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 transition-colors cursor-pointer"
          >
            注销
          </button>
        </header>

        <main className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-120px)] pb-12 text-left">
          {/* Main User Card info block */}
          <div className="bg-white p-5 rounded-3xl border border-[#eeedf3] flex items-center gap-4 shadow-sm relative overflow-hidden">
            {/* Background design accents */}
            <div className="absolute right-0 bottom-0 top-0 opacity-5 text-indigo-500 pointer-events-none flex items-center pl-8">
              <User className="w-40 h-40" />
            </div>

            <div className="w-14 h-14 bg-[#0058bc] text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-md">
              {currentUser.name.slice(0, 2)}
            </div>

            <div className="flex-1 space-y-0.5 z-10 text-left">
              <h2 className="text-base font-bold text-[#1a1b1f]">
                {currentUser.name}
              </h2>
              <p className="text-xs text-gray-400 font-semibold">{currentUser.level || currentUser.role} • 资产配置科</p>
              <span className="inline-block text-[9px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-sm font-extrabold uppercase mt-1">
                会话在线
              </span>
            </div>
          </div>

          {/* Quick numbers summary bar */}
          <div className="bg-white p-4.5 rounded-2xl border border-[#eeedf3] grid grid-cols-2 gap-4 text-center divide-x divide-gray-100 shadow-2xs">
            <div>
              <p className="text-3xs text-gray-400 font-bold uppercase">我的当前派件任务</p>
              <h4 className="text-lg font-black text-[#0058bc] mt-1">{activeUserOrders.length} 件待办</h4>
            </div>
            <div>
              <p className="text-3xs text-gray-400 font-bold uppercase">默认维护项目数</p>
              <h4 className="text-lg font-black text-[#1a1b1f] mt-1">{projects.length} 基地</h4>
            </div>
          </div>

          {/* Role and system administrators privileges list */}
          <div className="bg-white p-4.5 rounded-2xl border border-[#eeedf3] space-y-3.5 text-left shadow-2xs">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-0.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#0058bc]" />
              当前账户安全特权范围
            </h4>

            <div className="space-y-2 text-xs font-medium text-slate-700">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-400">设备维修填报权限</span>
                <span className={currentUser.permissions.fileDefectReport ? 'text-green-600 font-extrabold' : 'text-gray-300'}>
                  {currentUser.permissions.fileDefectReport ? '✓ 具备允许' : '✕ 无授权'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-400">处理及修复派单权限</span>
                <span className={currentUser.permissions.processWorkOrder ? 'text-green-600 font-extrabold' : 'text-gray-300'}>
                  {currentUser.permissions.processWorkOrder ? '✓ 具备允许' : '✕ 无授权'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-400">管理设备备件耗材</span>
                <span className={currentUser.permissions.manageParts ? 'text-green-600 font-extrabold' : 'text-gray-300'}>
                  {currentUser.permissions.manageParts ? '✓ 具备允许' : '✕ 无授权'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">高危成本与查看报价历史</span>
                <span className={currentUser.permissions.viewCostAndQuotes ? 'text-green-600 font-extrabold' : 'text-gray-300'}>
                  {currentUser.permissions.viewCostAndQuotes ? '✓ 具备允许' : '✕ 无授权'}
                </span>
              </div>
            </div>
          </div>

          {/* Administrative console link triggers */}
          {currentUser.role === '管理员' || currentUser.name === '王刚' || currentUser.name === '陈伟' || currentUser.name.includes('管理员') ? (
            <div className="bg-[#eeedf3]/60 p-4.5 rounded-2xl border border-[#eeedf3] space-y-3 text-left">
              <h4 className="text-xs font-black text-blue-800 flex items-center gap-1">
                <SlidersHorizontal className="w-4 h-4 text-blue-500" />
                超级管制与行政功能
              </h4>
              <p className="text-3xs text-gray-500 leading-relaxed font-semibold">
                由于您的账户配置属于管理角色，您具有管理员中心的特定管制入口，可以分配新账号权限或增加维护工地。
              </p>
              
              <button
                onClick={() => handleTabNavigate('admin-center')}
                className="w-full bg-[#0058bc] text-white py-3 rounded-xl font-bold text-xs shadow-xs hover:bg-blue-700 cursor-pointer"
              >
                进入“管理员中心”面板 🚀
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 text-left space-y-2">
              <h4 className="text-xs font-black text-slate-500 flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4" />
                切换体验角色
              </h4>
              <p className="text-3xs text-slate-400 leading-relaxed">
                当前账户为普通技术组账户。您可以注销后并重新选择“王刚 (管理员)”作为体验账号，以评估企业中心的多人联动、新增工地及特异调权机制！
              </p>
              <button
                onClick={handleLogout}
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-xl font-bold text-xs"
              >
                立即注销并切换演示
              </button>
            </div>
          )}
        </main>
      </div>
    );
  };

  return (
    <div id="app-viewport-root" className="min-h-screen bg-[#dad9df] flex items-center justify-center font-sans py-0 sm:py-6 relative overflow-x-hidden select-none">
      
      {/* Floating global temporary slide animation warning message banner */}
      {floatingAlert && (
        <div className="fixed top-12 left-1/2 transform -translate-x-1/2 z-50 bg-[#1a1b1f] text-white text-xs font-bold py-3.5 px-6 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-bounce max-w-[90vw]">
          <span className="text-blue-400 font-extrabold animate-pulse">●</span>
          <span>{floatingAlert}</span>
        </div>
      )}

      {/* Main Core Emulated iOS Chassis Frame Wrapper (Image-Like Native Feeling) */}
      <div 
        id="ios-phone-chassis"
        className="w-full max-w-md bg-[#faf9fe] min-h-screen sm:min-h-[880px] sm:h-[880px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative border-x border-[#eeedf3] sm:border-4 sm:border-slate-800"
      >
        {/* iOS Physical Top Speaker Notch Simulation */}
        <div className="hidden sm:block absolute top-0 left-1/2 transform -translate-x-1/2 h-6 w-32 bg-slate-800 rounded-b-2xl z-50" />

        {/* System Emulated iOS Top Status Bar */}
        <div className="bg-[#faf9fe] px-5 pt-3 pb-1 flex justify-between items-center text-gray-800 text-xs font-bold select-none z-40 shrink-0">
          <span className="font-mono text-2xs scale-105">{currentTime}</span>
          
          <div className="flex items-center gap-1.5 scale-90">
            <Signal className="w-3.5 h-3.5" />
            <span className="text-3xs uppercase">5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 fill-gray-800 text-gray-800" />
          </div>
        </div>

        {/* Multi-view Router container frame scroll */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {renderContainerContent()}
        </div>

        {/* Global Bottom Tab-Bar controller (Restrained iOS style - Image 2 bottom-bar) */}
        {currentUser && insideSection === 'none' && (
          <nav 
            id="global-bottom-navigation"
            className="sticky bottom-0 bg-[#faf9fe]/85 backdrop-blur-xl border-t border-[#eeedf3] py-2 px-3 flex justify-around items-center select-none z-40 shrink-0"
          >
            {/* Tab 1 */}
            <button
              onClick={() => handleTabNavigate('工作台')}
              className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all ${
                activeTab === '工作台' ? 'text-[#0058bc]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <LayoutDashboard className="w-5.5 h-5.5 stroke-[2.2]" />
              <span className="text-[10px] font-extrabold tracking-tight">工作台</span>
            </button>

            {/* Tab 2 */}
            <button
              onClick={() => handleTabNavigate('备件库')}
              className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all ${
                activeTab === '备件库' ? 'text-[#0058bc]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Package2 className="w-5.5 h-5.5 stroke-[2.2]" />
              <span className="text-[10px] font-extrabold tracking-tight">备件库</span>
            </button>

            {/* Tab 3 */}
            <button
              onClick={() => handleTabNavigate('工单')}
              className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all ${
                activeTab === '工单' ? 'text-[#0058bc]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Wrench className="w-5.5 h-5.5 stroke-[2.2]" />
              <span className="text-[10px] font-extrabold tracking-tight">工单</span>
            </button>

            {/* Tab 4 */}
            <button
              onClick={() => handleTabNavigate('我的')}
              className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all ${
                activeTab === '我的' ? 'text-[#0058bc]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <User className="w-5.5 h-5.5 stroke-[2.2]" />
              <span className="text-[10px] font-extrabold tracking-tight">我的</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
