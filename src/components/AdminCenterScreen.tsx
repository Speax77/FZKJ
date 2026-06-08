/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, UserPlus, FolderPlus, Users2, ShieldCheck, Mail, MapPin, AlignLeft, CalendarRange, Trash2, Camera, Compass, Plus, KeyRound, Pencil } from 'lucide-react';
import { SubAccount, Project, UserPermissions, PartCategory } from '../types';
import ConfirmationModal from './ConfirmationModal';

interface AdminCenterScreenProps {
  currentUser: SubAccount | any;
  accounts: SubAccount[];
  projects: Project[];
  onAddProject: (p: Project) => void;
  onEditProject?: (p: Project) => void;
  onDeleteProject?: (id: string) => void;
  onAddSubAccount: (acc: SubAccount) => void;
  onDeleteSubAccount?: (id: string) => void;
  onAssignProjects?: (id: string, projectIds: string[]) => void;
  onUpdateSubAccountPermissions: (id: string, perms: UserPermissions) => void;
  onNavigateHome: () => void;
}

export default function AdminCenterScreen({
  currentUser,
  accounts,
  projects,
  onAddProject,
  onEditProject,
  onDeleteProject,
  onAddSubAccount,
  onDeleteSubAccount,
  onAssignProjects,
  onUpdateSubAccountPermissions,
  onNavigateHome
}: AdminCenterScreenProps) {
  // Navigation states within the Admin Panel
  const [adminSubView, setAdminSubView] = useState<'hub' | 'add-project' | 'edit-project' | 'sub-accounts' | 'permission-config'>('hub');
  
  // Member & Project states
  const [editingAccount, setEditingAccount] = useState<SubAccount | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // 1. ADD NEW PROJECT FORM states (Image 10)
  const [newProjName, setNewProjName] = useState('');
  const [newProjLocation, setNewProjLocation] = useState('');
  const [newProjStartDate, setNewProjStartDate] = useState('2026-06-08');
  const [newProjEndDate, setNewProjEndDate] = useState('');
  const [newProjLeader, setNewProjLeader] = useState('张明 (项目组长)');
  const [newProjDesc, setNewProjDesc] = useState('');

  // 2. ADD SUB ACCOUNT FORM states (Image 11 popup simulation)
  const [newAccName, setNewAccName] = useState('');
  const [newAccRole, setNewAccRole] = useState('技术员');
  const [newAccLevel, setNewAccLevel] = useState('');

  // Permission toggles (Image 12 layout fields)
  const [permViewParts, setPermViewParts] = useState(true);
  const [permManageParts, setPermManageParts] = useState(false);
  const [permViewCostAndQuotes, setPermViewCostAndQuotes] = useState(false);
  const [permFileDefect, setPermFileDefect] = useState(true);
  const [permProcessWork, setPermProcessWork] = useState(true);
  const [permViewReports, setPermViewReports] = useState(false);
  const [permViewSupplier, setPermViewSupplier] = useState(true);

  // Selected project IDs for the editingAccount
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  // Sub accounts search
  const [accSearchQuery, setAccSearchQuery] = useState('');

  // Confirmation modal states
  const [accountToDelete, setAccountToDelete] = useState<SubAccount | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isPermissionsConfirmOpen, setIsPermissionsConfirmOpen] = useState(false);
  const [pendingPermissionsToSave, setPendingPermissionsToSave] = useState<UserPermissions | null>(null);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName || !newProjLocation) return;
    
    const proj: Project = {
      id: 'proj-' + Date.now(),
      name: newProjName,
      location: newProjLocation,
      industry: '',
      startDate: newProjStartDate,
      endDate: newProjEndDate || '2028-12-31',
      leader: newProjLeader,
      description: newProjDesc || '设备故障、维修保养总台账项目。',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400',
      subAccountCount: 1
    };

    onAddProject(proj);
    
    // reset & back
    setNewProjName('');
    setNewProjLocation('');
    setNewProjDesc('');
    setAdminSubView('hub');
  };

  const handleEditProjectInit = (proj: Project) => {
    setEditingProject(proj);
    setNewProjName(proj.name);
    setNewProjLocation(proj.location);
    setNewProjStartDate(proj.startDate || '2026-06-08');
    setNewProjEndDate(proj.endDate || '');
    setNewProjLeader(proj.leader);
    setNewProjDesc(proj.description);
    setAdminSubView('edit-project');
  };

  const handleUpdateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !newProjName || !newProjLocation) return;

    const updatedProj: Project = {
      ...editingProject,
      name: newProjName,
      location: newProjLocation,
      startDate: newProjStartDate,
      endDate: newProjEndDate,
      leader: newProjLeader,
      description: newProjDesc,
    };

    onEditProject?.(updatedProj);

    // reset & back
    setEditingProject(null);
    setNewProjName('');
    setNewProjLocation('');
    setNewProjDesc('');
    setAdminSubView('hub');
  };

  const handleCreateSubAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName) return;

    const acc: SubAccount = {
      id: 'sub-' + Date.now(),
      name: newAccName,
      role: newAccRole,
      status: '在线',
      level: '',
      lastActive: '刚刚',
      permissions: {
        viewParts: true,
        manageParts: newAccRole === '管理员' || newAccRole === '采购员',
        viewCostAndQuotes: newAccRole === '管理员' || newAccRole === '采购员',
        fileDefectReport: true,
        processWorkOrder: newAccRole !== '采购员',
        viewReports: newAccRole === '管理员' || newAccRole === '采购员',
        viewSupplierInfo: true
      },
      assignedProjects: projects.map((p) => p.id) // Default assigned to all projects initially
    };

    onAddSubAccount(acc);
    setNewAccName('');
    setAdminSubView('sub-accounts');
  };

  const handleEditPermissionsInit = (acc: SubAccount) => {
    setEditingAccount(acc);
    setPermViewParts(acc.permissions.viewParts);
    setPermManageParts(acc.permissions.manageParts);
    setPermViewCostAndQuotes(acc.permissions.viewCostAndQuotes);
    setPermFileDefect(acc.permissions.fileDefectReport);
    setPermProcessWork(acc.permissions.processWorkOrder);
    setPermViewReports(acc.permissions.viewReports);
    setPermViewSupplier(acc.permissions.viewSupplierInfo);
    setSelectedProjectIds(acc.assignedProjects || []);
    setAdminSubView('permission-config');
  };

  const handleSavePermissions = () => {
    if (!editingAccount) return;
    const updatedPerms: UserPermissions = {
      viewParts: permViewParts,
      manageParts: permManageParts,
      viewCostAndQuotes: permViewCostAndQuotes,
      fileDefectReport: permFileDefect,
      processWorkOrder: permProcessWork,
      viewReports: permViewReports,
      viewSupplierInfo: permViewSupplier
    };

    // Evaluate high-risk permissions being granted/active
    const risksToAlert: string[] = [];
    if (updatedPerms.processWorkOrder) {
      risksToAlert.push('“处理及修复派单权限” —— 拥有工单阶段流转（新建、接单、处理、结算归档及工单驳回）的核心控制权。');
    }
    if (updatedPerms.manageParts) {
      risksToAlert.push('“各层级库存及备件管理权” —— 允许其修改仓库储备限额、增减物料台账并作废旧件，极大影响供应链存量报表。');
    }
    if (updatedPerms.viewCostAndQuotes) {
      risksToAlert.push('“采购成本及报价历史查看权” —— 包含各型号备件敏感价格、维保费率及厂家供应折扣，属机密财务信息。');
    }

    if (risksToAlert.length > 0) {
      setPendingPermissionsToSave(updatedPerms);
      setIsPermissionsConfirmOpen(true);
    } else {
      executePermissionsSave(updatedPerms);
    }
  };

  const executePermissionsSave = (permsToSave: UserPermissions) => {
    if (!editingAccount) return;
    onUpdateSubAccountPermissions(editingAccount.id, permsToSave);
    if (onAssignProjects) {
      onAssignProjects(editingAccount.id, selectedProjectIds);
    }
    setEditingAccount(null);
    setAdminSubView('sub-accounts');
  };

  const filteredAccounts = accounts.filter(
    (acc) =>
      acc.name.toLowerCase().includes(accSearchQuery.toLowerCase()) ||
      acc.role.toLowerCase().includes(accSearchQuery.toLowerCase())
  );

  return (
    <div id="admin-center-root" className="flex flex-col min-h-screen bg-[#faf9fe]">
      {/* ----------------- SUB-VIEW A: HUB HOME (Image 9) ----------------- */}
      {adminSubView === 'hub' && (
        <>
          <header className="sticky top-0 z-30 bg-[#faf9fe]/85 backdrop-blur-md border-b border-[#eeedf3] px-4 py-3.5 flex items-center justify-between">
            <button
              onClick={onNavigateHome}
              className="text-[#414755] hover:text-[#1a1b1f] flex items-center gap-1 text-sm font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> 返回工作台
            </button>
            <h2 className="text-sm font-black text-gray-800">管理员中心</h2>
            <div className="w-10" />
          </header>

          <main className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-60px)]">
            
            {/* Account Management Segment (账号管理) */}
            <div className="space-y-3.5 text-left">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black text-[#1a1b1f] font-sans">
                  账号管理
                </h3>
                <button
                  onClick={() => setAdminSubView('sub-accounts')}
                  className="text-xs font-bold text-[#0058bc] flex items-center gap-0.5 hover:underline"
                >
                  <UserPlus className="w-4 h-4" />
                  管理子账号 &gt;
                </button>
              </div>

              {/* Quick staff preview cards */}
              <div className="bg-white rounded-3xl border border-[#eeedf3] divide-y divide-[#f4f3f8] overflow-hidden shadow-xs">
                {accounts.slice(0, 2).map((acc) => (
                  <div
                    key={acc.id}
                    onClick={() => handleEditPermissionsInit(acc)}
                    className="flex justify-between items-center p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#0058bc]/10 text-[#005bc1] rounded-full flex items-center justify-center font-bold">
                        {acc.name.slice(0, 2)}
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-gray-800">{acc.name} ({acc.role})</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">
                          最近活跃: {acc.lastActive}
                        </p>
                      </div>
                    </div>
                    <span className="text-2xs font-extrabold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-all">
                      权限管理 &gt;
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Management segment (项目管理) */}
            <div className="space-y-3.5 text-left">
              <h3 className="text-sm font-black text-[#1a1b1f] font-sans">
                项目管理
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {projects.map((proj, idx) => (
                  <div key={proj.id} className="relative rounded-3xl overflow-hidden border border-[#eeedf3] shadow-md group">
                    <img
                      src={proj.image || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400'}
                      alt={proj.name}
                      className="w-full h-36 object-cover brightness-60"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-4 flex flex-col justify-end text-white text-left">
                      {idx === 0 && (
                        <span className="absolute top-3 left-3 bg-[#0058bc] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                          主维护项目
                        </span>
                      )}
                      
                      {/* Edit / Delete action overlay */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProjectInit(proj);
                          }}
                          className="bg-black/50 hover:bg-[#0058bc] p-1.5 rounded-xl text-white backdrop-blur-xs transition-colors cursor-pointer"
                          title="编辑项目"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectToDelete(proj);
                          }}
                          className="bg-black/50 hover:bg-red-600 p-1.5 rounded-xl text-white backdrop-blur-xs transition-colors cursor-pointer"
                          title="删除项目"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-3xs font-extrabold opacity-70 uppercase font-sans">
                        主管: {proj.leader}
                      </p>
                      <h4 className="text-sm font-black font-sans mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[85%]">
                        {proj.name}
                      </h4>
                      <p className="text-2xs text-white/70 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-blue-400" />
                        {proj.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Project click launcher */}
              <button
                onClick={() => {
                  setNewProjName('');
                  setNewProjLocation('');
                  setNewProjStartDate('2026-06-08');
                  setNewProjEndDate('');
                  setNewProjLeader('张明 (项目组长)');
                  setNewProjDesc('');
                  setAdminSubView('add-project');
                }}
                className="w-full bg-white hover:bg-slate-50 text-gray-700 py-4 rounded-3xl border border-dashed border-gray-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4 text-[#0058bc]" />
                新增项目
              </button>
            </div>

            {/* Subaccounts summary metrics (总子账号) */}
            <div className="bg-white p-4.5 rounded-3xl border border-[#eeedf3] flex justify-between items-center text-left shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-blue-50 text-[#0058bc] rounded-xl flex items-center justify-center">
                  <Users2 className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400">系统总活跃子账号</h4>
                  <p className="text-lg font-black text-[#1a1b1f] font-mono mt-0.5">{accounts.length} 人</p>
                </div>
              </div>
              <div className="bg-green-50 text-green-700 text-3xs font-black px-2 py-1 rounded-md border border-green-200 uppercase tracking-widest animate-pulse">
                运维网关在线
              </div>
            </div>
          </main>
        </>
      )}

      {/* ----------------- SUB-VIEW B: ADD PROJECT (Image 10) ----------------- */}
      {adminSubView === 'add-project' && (
        <>
          <header className="sticky top-0 z-30 bg-[#faf9fe]/85 backdrop-blur-md border-b border-[#eeedf3] px-4 py-3.5 flex items-center">
            <button
              onClick={() => setAdminSubView('hub')}
              className="text-[#414755] hover:text-[#1a1b1f] flex items-center gap-1 text-sm font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> 返回
            </button>
            <h2 className="text-sm font-black text-[#1a1b1f] ml-auto mr-12">新增项目</h2>
          </header>

          <form onSubmit={handleCreateProject} className="flex-grow p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-60px)] pb-8 text-left">
            {/* Form Inputs (Image 10) */}
            <div className="bg-white p-4 rounded-3xl border border-[#eeedf3] space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">项目名称</label>
                <input
                  type="text"
                  required
                  placeholder="输入项目完整名称"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  className="w-full bg-[#f4f3f8] border border-transparent rounded-xl p-3 text-xs focus:bg-white focus:border-[#0058bc] focus:outline-hidden text-gray-800"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-bold text-gray-500">项目地点</label>
                  <span className="text-[10px] text-[#0058bc] font-semibold flex items-center gap-0.5">
                    <Compass className="w-3 h-3 animate-spin duration-1000" />
                    调取经纬度
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="选择或输入地理位置"
                    value={newProjLocation}
                    onChange={(e) => setNewProjLocation(e.target.value)}
                    className="w-full bg-[#f4f3f8] border border-transparent rounded-xl pl-3 pr-10 py-3 text-xs focus:bg-white focus:border-[#0058bc] focus:outline-hidden text-gray-800"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#0058bc]">
                    <MapPin className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>

            {/* Secondary Form Inputs (Image 10) */}
            <div className="bg-white p-4 rounded-3xl border border-[#eeedf3] space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">启动日期</label>
                  <input
                    type="date"
                    value={newProjStartDate}
                    onChange={(e) => setNewProjStartDate(e.target.value)}
                    className="w-full bg-[#f4f3f8] border border-transparent rounded-xl p-2.5 text-xs text-gray-800 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#005bc1] block mb-1">结束日期至</label>
                  <input
                    type="date"
                    value={newProjEndDate}
                    onChange={(e) => setNewProjEndDate(e.target.value)}
                    className="w-full bg-[#f4f3f8] border border-transparent rounded-xl p-2.5 text-xs text-gray-800 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">工程负责人</label>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  <span className="bg-blue-100 text-[#0058bc] text-xs font-bold py-1 px-2.5 rounded-full flex items-center gap-1.5 border border-blue-200">
                    {newProjLeader}
                    <span className="text-[10px] cursor-pointer hover:text-red-500" onClick={() => setNewProjLeader('暂不指派')}>✕</span>
                  </span>
                  <button 
                    type="button" 
                    onClick={() => {
                      const ans = prompt('输入新组长名称：', '李薇 (采购员)');
                      if (ans) setNewProjLeader(ans);
                    }}
                    className="bg-gray-50 text-gray-500 text-xs font-semibold py-1 px-3.5 rounded-full border border-dashed border-gray-300 hover:bg-gray-100 cursor-pointer"
                  >
                    + 添加成员
                  </button>
                </div>
              </div>
            </div>

            {/* Project description */}
            <div className="bg-white p-4 rounded-3xl border border-[#eeedf3] space-y-2">
              <label className="text-xs font-bold text-gray-500 block">项目描述</label>
              <textarea
                rows={3}
                placeholder="请输入项目的核心目标、设备规模及特殊资质审核要求..."
                value={newProjDesc}
                onChange={(e) => setNewProjDesc(e.target.value)}
                className="w-full bg-[#f4f3f8] border border-transparent rounded-xl p-3 text-xs focus:bg-white focus:border-[#0058bc] text-gray-800"
              />
            </div>

            {/* Automatic camera preview mockup (Image 10 robot preview) */}
            <div className="bg-white rounded-3xl border border-[#eeedf3] overflow-hidden p-4 space-y-3 relative">
              <label className="text-xs font-bold text-gray-500 block">项目环境效果</label>
              <div className="relative rounded-2xl overflow-hidden h-36">
                <img
                  src="https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&q=80&w=400"
                  alt="Automatic camera"
                  className="w-full h-full object-cover grayscale brightness-50"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <p className="text-white text-xs font-bold font-sans flex items-center gap-1.5 bg-black/60 py-2 px-4 rounded-full backdrop-blur-xs">
                    <Camera className="w-4 h-4 text-blue-400 animate-pulse" />
                    项目环境预览将根据地点自动生成
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0058bc] hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-xs shadow-md shadow-[#0058bc]/10 cursor-pointer text-center"
            >
              提交新增项目
            </button>
          </form>
        </>
      )}

      {/* ----------------- SUB-VIEW: EDIT PROJECT ----------------- */}
      {adminSubView === 'edit-project' && editingProject && (
        <>
          <header className="sticky top-0 z-30 bg-[#faf9fe]/85 backdrop-blur-md border-b border-[#eeedf3] px-4 py-3.5 flex items-center">
            <button
              onClick={() => {
                setEditingProject(null);
                setAdminSubView('hub');
              }}
              className="text-[#414755] hover:text-[#1a1b1f] flex items-center gap-1 text-sm font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> 返回
            </button>
            <h2 className="text-sm font-black text-[#1a1b1f] ml-auto mr-12">编辑项目</h2>
          </header>

          <form onSubmit={handleUpdateProjectSubmit} className="flex-grow p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-60px)] pb-8 text-left">
            {/* Form Inputs */}
            <div className="bg-white p-4 rounded-3xl border border-[#eeedf3] space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">项目名称</label>
                <input
                  type="text"
                  required
                  placeholder="输入项目完整名称"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  className="w-full bg-[#f4f3f8] border border-transparent rounded-xl p-3 text-xs focus:bg-white focus:border-[#0058bc] focus:outline-hidden text-gray-800"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-bold text-gray-500">项目地点</label>
                  <span className="text-[10px] text-[#0058bc] font-semibold flex items-center gap-0.5">
                    <Compass className="w-3 h-3 animate-spin duration-1000" />
                    调取经纬度
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="选择或输入地理位置"
                    value={newProjLocation}
                    onChange={(e) => setNewProjLocation(e.target.value)}
                    className="w-full bg-[#f4f3f8] border border-transparent rounded-xl pl-3 pr-10 py-3 text-xs focus:bg-white focus:border-[#0058bc] focus:outline-hidden text-gray-800"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#0058bc]">
                    <MapPin className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>

            {/* Secondary Form Inputs */}
            <div className="bg-white p-4 rounded-3xl border border-[#eeedf3] space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">启动日期</label>
                  <input
                    type="date"
                    value={newProjStartDate}
                    onChange={(e) => setNewProjStartDate(e.target.value)}
                    className="w-full bg-[#f4f3f8] border border-transparent rounded-xl p-2.5 text-xs text-gray-800 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#005bc1] block mb-1">结束日期至</label>
                  <input
                    type="date"
                    value={newProjEndDate}
                    onChange={(e) => setNewProjEndDate(e.target.value)}
                    className="w-full bg-[#f4f3f8] border border-transparent rounded-xl p-2.5 text-xs text-gray-800 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">工程负责人</label>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  <span className="bg-blue-100 text-[#0058bc] text-xs font-bold py-1 px-2.5 rounded-full flex items-center gap-1.5 border border-blue-200">
                    {newProjLeader}
                    <span className="text-[10px] cursor-pointer hover:text-red-500" onClick={() => setNewProjLeader('暂不指派')}>✕</span>
                  </span>
                  <button 
                    type="button" 
                    onClick={() => {
                      const ans = prompt('输入新组长名称：', '李薇 (采购员)');
                      if (ans) setNewProjLeader(ans);
                    }}
                    className="bg-gray-50 text-gray-500 text-xs font-semibold py-1 px-3.5 rounded-full border border-dashed border-gray-300 hover:bg-gray-100 cursor-pointer"
                  >
                    + 添加成员
                  </button>
                </div>
              </div>
            </div>

            {/* Project description */}
            <div className="bg-white p-4 rounded-3xl border border-[#eeedf3] space-y-2">
              <label className="text-xs font-bold text-gray-500 block">项目描述</label>
              <textarea
                rows={3}
                placeholder="请输入项目的核心目标、设备规模及特殊资质审核要求..."
                value={newProjDesc}
                onChange={(e) => setNewProjDesc(e.target.value)}
                className="w-full bg-[#f4f3f8] border border-transparent rounded-xl p-3 text-xs focus:bg-white focus:border-[#0058bc] text-gray-800"
              />
            </div>

            {/* Automatic camera preview mockup */}
            <div className="bg-white rounded-3xl border border-[#eeedf3] overflow-hidden p-4 space-y-3 relative">
              <label className="text-xs font-bold text-gray-500 block">项目环境效果</label>
              <div className="relative rounded-2xl overflow-hidden h-36">
                <img
                  src="https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&q=80&w=400"
                  alt="Automatic camera"
                  className="w-full h-full object-cover grayscale brightness-50"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <p className="text-white text-xs font-bold font-sans flex items-center gap-1.5 bg-black/60 py-2 px-4 rounded-full backdrop-blur-xs">
                    <Camera className="w-4 h-4 text-blue-400 animate-pulse" />
                    项目环境预览将根据地点自动生成
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0058bc] hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-xs shadow-md shadow-[#0058bc]/10 cursor-pointer text-center"
            >
              保存修改并更新
            </button>
          </form>
        </>
      )}

      {/* ----------------- SUB-VIEW C: SUB-ACCOUNTS LISTING (Image 11) ----------------- */}
      {adminSubView === 'sub-accounts' && (
        <>
          <header className="sticky top-0 z-30 bg-[#faf9fe]/85 backdrop-blur-md border-b border-[#eeedf3] px-4 py-3.5 flex items-center">
            <button
              onClick={() => setAdminSubView('hub')}
              className="text-[#414755] hover:text-[#1a1b1f] flex items-center gap-1 text-sm font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> 返回
            </button>
            <h2 className="text-sm font-black text-gray-800 ml-auto mr-12">子账号管理</h2>
          </header>

          <main className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-60px)] pb-12">
            
            {/* Search Input bar */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <Compass className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="搜索子账号名称或职务..."
                value={accSearchQuery}
                onChange={(e) => setAccSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-xs border border-transparent focus:bg-white focus:border-[#0058bc] text-gray-800 placeholder-gray-400 font-sans"
              />
            </div>

            {/* Quick action button to simulate adding worker */}
            <div className="bg-white p-4 rounded-3xl border border-[#eeedf3] text-left space-y-3 shadow-xs">
              <h4 className="text-xs font-extrabold text-blue-600 flex items-center gap-1">
                <UserPlus className="w-4 h-4 text-[#0058bc]" />
                快速录入子账号
              </h4>
              
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="真实姓名"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="bg-[#faf9fe] border border-[#eeedf3] rounded-lg p-2 text-xs"
                />
                <select
                  value={newAccRole}
                  onChange={(e) => setNewAccRole(e.target.value)}
                  className="bg-[#faf9fe] border border-[#eeedf3] rounded-lg p-2 text-xs"
                >
                  <option value="技术员">技术员</option>
                  <option value="采购员">采购员</option>
                  <option value="管理员">管理员</option>
                  <option value="实习生">实习生</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleCreateSubAccount}
                className="w-full bg-[#0058bc] hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs transition-colors"
              >
                + 添加并设定初始权限
              </button>
            </div>

            {/* List header count (所有子账号 (4)) */}
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-black text-gray-400">所有子账号 ({filteredAccounts.length})</span>
            </div>

            {/* Loop Sub-accounts (Image 11) */}
            <div className="space-y-3">
              {filteredAccounts.map((acc) => {
                const isActive = acc.status === '在线';
                const isOff = acc.status === '离线';
                const isWait = acc.status === '等待激活';

                return (
                  <div
                    key={acc.id}
                    className="bg-white rounded-3xl p-4.5 border border-[#eeedf3] space-y-4 text-left shadow-2xs hover:border-[#0058bc]/30 transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        {/* Circle initial placeholder logo */}
                        <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 text-[#4c4aca] rounded-full flex items-center justify-center font-bold text-sm">
                          {acc.name}
                        </div>
                        
                        <div className="space-y-0.5 text-left">
                          <h4 className="text-sm font-extrabold text-[#1a1b1f] font-sans">
                            {acc.name} <span className="text-xs text-gray-400 font-bold ml-1">({acc.role})</span>
                          </h4>
                          <div className="flex items-center gap-1.5 pt-0.5">
                            {/* Online or status Badge */}
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm uppercase ${
                                isActive
                                  ? 'bg-green-50 text-green-700'
                                  : isOff
                                  ? 'bg-gray-150 text-gray-500'
                                  : 'bg-red-50 text-red-600'
                              }`}
                            >
                              {acc.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right active invitation or edit buttons with Delete safety */}
                      <div className="text-right flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 font-medium font-sans">
                          活动: {acc.lastActive}
                        </span>
                        {currentUser && acc.id !== currentUser.id && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAccountToDelete(acc);
                            }}
                            className="bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 p-1.5 rounded-lg border border-red-150 transition-colors cursor-pointer"
                            title="注销并删除账号"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Permission management click row */}
                    <div className="flex justify-between items-center pt-3 border-t border-[#f4f3f8]">
                      {isWait ? (
                        <button
                          onClick={() => alert(`邀请邀请激活链接已通过内部企业邮箱重发：${acc.name}@gree.industrial.com`)}
                          className="flex items-center gap-1 text-[10px] text-blue-600 font-extrabold hover:underline cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
                          发送邀请 ✈
                        </button>
                      ) : (
                        <div className="text-[9px] text-gray-400 font-medium">
                          具有 {Object.values(acc.permissions).filter(Boolean).length} 项安全特异权能
                        </div>
                      )}

                      <button
                        onClick={() => handleEditPermissionsInit(acc)}
                        className="text-xs text-[#0058bc] font-bold flex items-center hover:underline cursor-pointer"
                      >
                        权限管理 &gt;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom info banner (团队效能管理) */}
            <div className="bg-blue-50/50 p-4.5 rounded-3xl border border-blue-100 text-left space-y-1.5">
              <h4 className="text-xs font-black text-[#0058bc]">团队效能管理</h4>
              <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                通过合理的权限配置，可以提升备件库及工单流转流失率。请定期查对每位技术人员的审核、核查和入库签署权限。
              </p>
            </div>
          </main>
        </>
      )}

      {/* ----------------- SUB-VIEW D: PERMISSIONS CONFIG (Image 12) ----------------- */}
      {adminSubView === 'permission-config' && editingAccount && (
        <>
          <header className="sticky top-0 z-35 bg-white border-b border-[#eeedf3] px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setAdminSubView('sub-accounts')}
              className="text-gray-500 hover:text-gray-800 text-sm font-semibold cursor-pointer"
            >
              取消
            </button>
            <h2 className="text-sm font-black text-gray-800">权限配置</h2>
            <button
              onClick={handleSavePermissions}
              className="text-[#0058bc] font-extrabold text-sm hover:underline cursor-pointer"
            >
              保存
            </button>
          </header>

          <main className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-50px)] pb-24 text-left">
            {/* Header info card of selected user (Image 12 header) */}
            <div className="bg-white p-4 rounded-3xl border border-[#eeedf3] flex items-center gap-3.5 shadow-2xs">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                {editingAccount.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="space-y-0.5 text-left">
                <h3 className="text-base font-black text-gray-800 leading-snug">
                  {editingAccount.name}
                </h3>
                <p className="text-xs text-gray-400 font-semibold font-sans">
                  {editingAccount.role} • 资产维护组
                </p>
              </div>
            </div>

            {/* List Groups of Toggles (Image 12 layout) */}
            
            {/* Group 1: 备件耗材管理 */}
            <div className="space-y-2.5 text-left">
              <span className="text-2xs font-extrabold text-gray-400 uppercase tracking-wider ml-1.5">
                备件耗材管理
              </span>
              <div className="bg-white rounded-3xl border border-[#eeedf3] divide-y divide-[#f4f3f8] overflow-hidden">
                {/* Switch Row 1 */}
                <div className="flex justify-between items-center p-4">
                  <div className="text-left space-y-0.5 pr-4">
                    <span className="text-xs font-extrabold text-gray-700 block">查看备件耗材信息</span>
                    <span className="text-[10px] text-gray-400 font-medium">允许该成员浏览备件总库，并搜索耗材CAS码信息</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={permViewParts}
                    onChange={(e) => setPermViewParts(e.target.checked)}
                    className="w-10 h-5 bg-gray-200 checked:bg-[#0058bc] rounded-full appearance-none relative before:content-[''] before:absolute before:w-5 before:h-5 before:bg-white before:rounded-full before:transition-all checked:before:translate-x-5 shadow-inner transition-colors duration-200 cursor-pointer"
                  />
                </div>

                {/* Switch Row 2 */}
                <div className="flex justify-between items-center p-4">
                  <div className="text-left space-y-0.5 pr-4">
                    <span className="text-xs font-extrabold text-gray-700 block">管理备件耗材信息</span>
                    <span className="text-[10px] text-gray-400 font-medium">授权创建新备件，修改库房剩余配额，注销旧物资</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={permManageParts}
                    onChange={(e) => setPermManageParts(e.target.checked)}
                    className="w-10 h-5 bg-gray-200 checked:bg-[#0058bc] rounded-full appearance-none relative before:content-[''] before:absolute before:w-5 before:h-5 before:bg-white before:rounded-full before:transition-all checked:before:translate-x-5 shadow-inner transition-colors duration-200 cursor-pointer"
                  />
                </div>

                {/* Switch Row 3 */}
                <div className="flex justify-between items-center p-4">
                  <div className="text-left space-y-0.5 pr-4">
                    <span className="text-xs font-extrabold text-gray-700 block">查看备件成本与报价</span>
                    <span className="text-[10px] text-gray-400 font-medium">授权公开采购历史、供应商报价明细，管理预算扣额</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={permViewCostAndQuotes}
                    onChange={(e) => setPermViewCostAndQuotes(e.target.checked)}
                    className="w-10 h-5 bg-gray-200 checked:bg-[#0058bc] rounded-full appearance-none relative before:content-[''] before:absolute before:w-5 before:h-5 before:bg-white before:rounded-full before:transition-all checked:before:translate-x-5 shadow-inner transition-colors duration-200 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Group 2: 设备报修工单 */}
            <div className="space-y-2.5 text-left">
              <span className="text-2xs font-extrabold text-gray-400 uppercase tracking-wider ml-1.5">
                设备报修工单
              </span>
              <div className="bg-white rounded-3xl border border-[#eeedf3] divide-y divide-[#f4f3f8] overflow-hidden">
                {/* Switch Row 4 */}
                <div className="flex justify-between items-center p-4">
                  <div className="text-left space-y-0.5 pr-4">
                    <span className="text-xs font-extrabold text-gray-700 block">填报设备报修工单</span>
                    <span className="text-[10px] text-gray-400 font-medium">允许该成员提报维修故障通知单，并申领检修援助</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={permFileDefect}
                    onChange={(e) => setPermFileDefect(e.target.checked)}
                    className="w-10 h-5 bg-gray-200 checked:bg-[#0058bc] rounded-full appearance-none relative before:content-[''] before:absolute before:w-5 before:h-5 before:bg-white before:rounded-full before:transition-all checked:before:translate-x-5 shadow-inner transition-colors duration-200 cursor-pointer"
                  />
                </div>

                {/* Switch Row 5 */}
                <div className="flex justify-between items-center p-4">
                  <div className="text-left space-y-0.5 pr-4">
                    <span className="text-xs font-extrabold text-gray-700 block">处理设备报修工单</span>
                    <span className="text-[10px] text-gray-400 font-medium">授权开始接单处理任务，修改故障阶段，并签署修复结论</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={permProcessWork}
                    onChange={(e) => setPermProcessWork(e.target.checked)}
                    className="w-10 h-5 bg-gray-200 checked:bg-[#0058bc] rounded-full appearance-none relative before:content-[''] before:absolute before:w-5 before:h-5 before:bg-white before:rounded-full before:transition-all checked:before:translate-x-5 shadow-inner transition-colors duration-200 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Group 3: 统计报表 */}
            <div className="space-y-2.5 text-left">
              <span className="text-2xs font-extrabold text-gray-400 uppercase tracking-wider ml-1.5">
                统计报表
              </span>
              <div className="bg-white rounded-3xl border border-[#eeedf3] overflow-hidden">
                {/* Switch Row 6 */}
                <div className="flex justify-between items-center p-4">
                  <div className="text-left space-y-0.5 pr-4">
                    <span className="text-xs font-extrabold text-gray-700 block">查看与导出统计报表</span>
                    <span className="text-[10px] text-gray-400 font-medium">可见总台账看板，掌握活跃工程数占比以及成本趋势图</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={permViewReports}
                    onChange={(e) => setPermViewReports(e.target.checked)}
                    className="w-10 h-5 bg-gray-200 checked:bg-[#0058bc] rounded-full appearance-none relative before:content-[''] before:absolute before:w-5 before:h-5 before:bg-white before:rounded-full before:transition-all checked:before:translate-x-5 shadow-inner transition-colors duration-200 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Group 4: 其他 */}
            <div className="space-y-2.5 text-left">
              <span className="text-2xs font-extrabold text-gray-400 uppercase tracking-wider ml-1.5">
                其他
              </span>
              <div className="bg-white rounded-3xl border border-[#eeedf3] overflow-hidden">
                {/* Switch Row 7 */}
                <div className="flex justify-between items-center p-4">
                  <div className="text-left space-y-0.5 pr-4">
                    <span className="text-xs font-extrabold text-gray-700 block">查看供应商信息</span>
                    <span className="text-[10px] text-gray-400 font-medium font-sans">授权可见其产品源供货和签署代理商企业联系名录</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={permViewSupplier}
                    onChange={(e) => setPermViewSupplier(e.target.checked)}
                    className="w-10 h-5 bg-gray-200 checked:bg-[#0058bc] rounded-full appearance-none relative before:content-[''] before:absolute before:w-5 before:h-5 before:bg-white before:rounded-full before:transition-all checked:before:translate-x-5 shadow-inner transition-colors duration-200 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Group 5: 项目分配 */}
            <div className="space-y-2.5 text-left">
              <span className="text-2xs font-extrabold text-blue-600 uppercase tracking-wider ml-1.5 flex items-center gap-1">
                📁 分配维护项目/工地
              </span>
              <div className="bg-white rounded-3xl border border-[#eeedf3] divide-y divide-[#f4f3f8] overflow-hidden shadow-xs">
                {projects.map((proj) => {
                  const isChecked = selectedProjectIds.includes(proj.id);
                  return (
                    <div key={proj.id} className="flex justify-between items-center p-4 hover:bg-[#faf9fe] transition-colors">
                      <div className="text-left space-y-0.5 pr-4 flex-1">
                        <span className="text-xs font-extrabold text-gray-800 block">{proj.name}</span>
                        <span className="text-[10px] text-gray-400 font-medium font-sans block">
                          📍 {proj.location}{proj.industry ? ` • ${proj.industry}` : ''}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProjectIds([...selectedProjectIds, proj.id]);
                          } else {
                            setSelectedProjectIds(selectedProjectIds.filter(id => id !== proj.id));
                          }
                        }}
                        className="w-10 h-5 bg-gray-200 checked:bg-[#0058bc] rounded-full appearance-none relative before:content-[''] before:absolute before:w-5 before:h-5 before:bg-white before:rounded-full before:transition-all checked:before:translate-x-5 shadow-inner transition-colors duration-200 cursor-pointer"
                      />
                    </div>
                  );
                })}
                {projects.length === 0 && (
                  <div className="p-4 text-xs text-center text-gray-400">
                    暂无可分配的项目，请先创建。
                  </div>
                )}
              </div>
            </div>

            {/* Bottom notification comment */}
            <div className="text-[10px] text-gray-400 text-center px-4 pt-2">
              修改项目分配和特异权限后，该用户在相应关联工地中将即刻应用其特异权能。请务必核对。
            </div>
          </main>
        </>
      )}

      {/* Confirmation Modal for Project Deletion */}
      <ConfirmationModal
        isOpen={projectToDelete !== null}
        title="高危确认：下线并彻底删除建筑工程项目"
        type="danger"
        confirmText="确认彻底删除"
        cancelText="保留并取消"
        description={
          <div className="space-y-2 text-xs">
            <p className="font-bold text-red-600">⚠️ 注意：删除项目将擦除其下属的所有安全关联！</p>
            <p>该操作不仅会下线该工地，还将发生以下变更：</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>此工地实体的一切基本档案及分配记录将被<strong className="text-gray-900">全面解约并物理清除</strong></li>
              <li>所有关联技术人员的关联项目列表、工单流转档案将不再包含此项目</li>
              <li className="text-[#0058bc] font-semibold">安全限制：如果这是系统中唯一的项目，系统将主动阻止此行为</li>
            </ul>
            {projectToDelete && (
              <div className="mt-3 p-2.5 bg-gray-100 rounded-lg border border-gray-200 text-3xs font-mono text-gray-500">
                <p className="font-bold text-gray-700">项目名称：{projectToDelete.name}</p>
                <p>所在地：{projectToDelete.location}</p>
              </div>
            )}
          </div>
        }
        onConfirm={() => {
          if (projectToDelete) {
            onDeleteProject?.(projectToDelete.id);
            setProjectToDelete(null);
          }
        }}
        onCancel={() => setProjectToDelete(null)}
      />

      {/* Confirmation Modal for Sub-Account Deletion */}
      <ConfirmationModal
        isOpen={accountToDelete !== null}
        title="安全确认：注销并彻底删除子账号"
        type="danger"
        confirmText="注销并删除"
        cancelText="取消"
        description={
          <div className="space-y-2 text-xs">
            <p className="font-bold text-red-600">⚠️ 注意：这是一项针对技术组账户的安全注销动作！</p>
            <p>注销账号将立即应用以下安全锁：</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>该成员的登录安全凭索将失效，且<strong className="text-gray-900">立即被踢出系统</strong></li>
              <li>其专属的特异维修填报权限、备件申请权等将会被<strong className="text-gray-900">彻底撤销且无法追溯</strong></li>
              <li>历史中由他指派并处理完成的设备工单、备件单将不被删除，但执行者代号将被归属于静态档案</li>
            </ul>
            {accountToDelete && (
              <div className="mt-3 p-2.5 bg-gray-100 rounded-lg border border-gray-200 text-3xs font-mono text-gray-500">
                <p className="font-bold text-gray-700">注销成员：{accountToDelete.name}</p>
                <p>系统角色：{accountToDelete.role}</p>
              </div>
            )}
          </div>
        }
        onConfirm={() => {
          if (accountToDelete) {
            onDeleteSubAccount?.(accountToDelete.id);
            setAccountToDelete(null);
          }
        }}
        onCancel={() => setAccountToDelete(null)}
      />

      {/* Confirmation Modal for High-Risk Permission Configuration */}
      <ConfirmationModal
        isOpen={isPermissionsConfirmOpen}
        title="高危权限授予核验"
        type="warning"
        confirmText="授权并通过"
        cancelText="返回重新对齐"
        description={
          <div className="space-y-2 text-xs">
            <p className="font-bold text-orange-600">🛡️ 特异授权核验：当前正准备授予该子账号敏感/高危权能！</p>
            <p>请仔细核对，被勾选的高危能力包括：</p>
            <div className="p-2.5 bg-orange-50 text-orange-800 rounded-lg border border-orange-100 text-3xs space-y-2">
              {pendingPermissionsToSave?.processWorkOrder && (
                <p className="font-semibold">• 🛠️ 工单处理及修复结算权（赋予该用户签发并完成工单的控制权）</p>
              )}
              {pendingPermissionsToSave?.manageParts && (
                <p className="font-semibold">• 📦 备件及零件库管理权（赋予该用户修改存量配额及耗材台账的特权）</p>
              )}
              {pendingPermissionsToSave?.viewCostAndQuotes && (
                <p className="font-semibold">• 💰 敏感采购报价及耗材清单查看权（赋予该用户了解商业结算价格的权限）</p>
              )}
            </div>
            <p className="text-gray-500 text-3xs mt-2 leading-relaxed">
              根据工地下发职责安全标准，任何非系统管理员被分配上述权限时，应经过安全网关确认。请确保该账号已接受相关安全实操规范培训。
            </p>
          </div>
        }
        onConfirm={() => {
          if (pendingPermissionsToSave) {
            executePermissionsSave(pendingPermissionsToSave);
            setPendingPermissionsToSave(null);
            setIsPermissionsConfirmOpen(false);
          }
        }}
        onCancel={() => {
          setPendingPermissionsToSave(null);
          setIsPermissionsConfirmOpen(false);
        }}
      />
    </div>
  );
}
