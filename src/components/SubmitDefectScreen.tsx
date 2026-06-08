/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, Clock, ClipboardList, CheckCircle2, User, HelpCircle, FileText, UploadCloud, Trash2, Paperclip, FileImage, X } from 'lucide-react';
import { Project, WorkOrder, WorkOrderStatus, UrgencyLevel, SubAccount } from '../types';

interface SubmitDefectScreenProps {
  currentUser: SubAccount | any;
  currentProject: Project;
  allProjects: Project[];
  onAddWorkOrder: (order: WorkOrder) => void;
  onNavigateHome: () => void;
}

interface AttachedFile {
  name: string;
  size: string;
  url: string;
  type: string;
}

export default function SubmitDefectScreen({
  currentUser,
  currentProject,
  allProjects,
  onAddWorkOrder,
  onNavigateHome
}: SubmitDefectScreenProps) {
  // Inputs matching Image 8 specifications
  const [selectedProjectId, setSelectedProjectId] = useState(currentProject.id);
  const [deviceCategory, setDeviceCategory] = useState('环境');
  const [maintenanceType, setMaintenanceType] = useState<'定期维护' | '据实结算' | '包干维修'>('定期维护');
  const [deviceType, setDeviceType] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [description, setDescription] = useState('');
  const [urgencyRating, setUrgencyRating] = useState<1 | 2 | 3>(3);
  const [maintenanceMode, setMaintenanceMode] = useState<'自行维修' | '外部维修'>('自行维修');

  // New Upload states
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const processFiles = (files: FileList) => {
    const fileListArray = Array.from(files);
    fileListArray.forEach((file) => {
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${(file.size / 1024).toFixed(0)} KB`;

      // Read images or other files to generate quick reactive UI presets
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            size: sizeStr,
            url: reader.result as string,
            type: file.type
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (indexToRemove: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceType.trim() || !description.trim()) {
      alert('请填写设备类型和详细故障描述');
      return;
    }

    const proj = allProjects.find((p) => p.id === selectedProjectId) || currentProject;
    
    // Choose appropriate assignee based on category / type
    let assignee = '张浩';
    if (deviceCategory === '控制') assignee = 'Sarah Miller';
    if (deviceCategory === '动力') assignee = 'David Chen';

    const urgencyMap = {
      1: UrgencyLevel.LEVEL1,
      2: UrgencyLevel.LEVEL2,
      3: UrgencyLevel.LEVEL3
    };

    // Choose primary image from attachments, or use fallback
    const primaryImg = attachments.length > 0 
      ? attachments[0].url 
      : (deviceCategory === '环境' 
          ? 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=400'
          : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400');

    // Auto-generate high-quality work order ID conforming to patterns: FZKJ2026xxxxxx
    const randomIdSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `FZKJ20260608${randomIdSuffix}`;

    const newOrder: WorkOrder = {
      id: orderId,
      title: `${proj.name} - ${deviceType}${maintenanceType}`,
      project: proj.name,
      deviceCategory: deviceCategory,
      deviceType: deviceType,
      brand: brand || '通用品牌',
      model: model || 'N/A',
      description: description,
      imageUrl: primaryImg,
      urgency: urgencyMap[urgencyRating],
      assignee: assignee,
      dueDate: '今天 18:00',
      status: WorkOrderStatus.NEW,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      defectLevel: urgencyRating,
      maintenanceMode: maintenanceMode,
      applicant: currentUser.name,
      applicantId: currentUser.id || '8829'
    };

    onAddWorkOrder(newOrder);
    setIsSuccess(true);
    
    // Reset form
    setDeviceType('');
    setBrand('');
    setModel('');
    setDescription('');
    setUrgencyRating(3);
    setAttachments([]);
  };

  const activeProject = allProjects.find((p) => p.id === selectedProjectId) || currentProject;

  return (
    <div id="submit-defect-root" className="flex flex-col min-h-screen bg-[#faf9fe]">
      {/* Header */}
      <header className="sticky top-0 z-35 bg-[#faf9fe]/85 backdrop-blur-md border-b border-[#eeedf3] px-4 py-3.5 flex items-center">
        <button
          onClick={onNavigateHome}
          className="text-[#414755] hover:text-[#1a1b1f] flex items-center gap-1 text-sm font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> 返回
        </button>
        <h2 className="text-sm font-black text-[#1a1b1f] ml-auto mr-12">设备维修填报</h2>
      </header>

      {isSuccess ? (
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center shadow-md">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>
          <h3 className="text-xl font-extrabold text-[#1a1b1f]">
            维修填报提交成功！
          </h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            工单已自动派属到系统总台账。技术专员将会在指派期限内进行到场勘查。
          </p>
          <div className="flex gap-3 pt-4 w-full max-w-xs">
            <button
              onClick={() => setIsSuccess(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-xs"
            >
              继续填报
            </button>
            <button
              onClick={onNavigateHome}
              className="flex-1 bg-[#0058bc] hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs shadow-xs"
            >
              返回首页
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex-grow p-4 space-y-4 max-h-[calc(100vh-60px)] overflow-y-auto pb-6 text-left">
          
          {/* Section 1: 项目信息 (Project Info) */}
          <div className="bg-white p-4 rounded-2xl border border-[#eeedf3] space-y-3">
            <h3 className="text-2xs font-extrabold tracking-wide uppercase text-gray-400">项目信息</h3>
            
            {/* Project Selection Dropdown */}
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium">所属项目</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-[#f4f3f8] border border-transparent hover:border-[#eeedf3] rounded-xl p-3 text-xs font-bold text-gray-800 focus:bg-white focus:border-[#0058bc] focus:outline-hidden"
              >
                {allProjects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: 设备与类型 (Device & Type) */}
          <div className="bg-white p-4 rounded-2xl border border-[#eeedf3] space-y-3.5">
            <h3 className="text-2xs font-extrabold tracking-wide uppercase text-gray-400">设备细节配置</h3>

            {/* Maintenance Type button array */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-medium">维护合同条款类型</label>
              <div className="grid grid-cols-3 gap-2 pt-0.5">
                {(['定期维护', '据实结算', '包干维修'] as const).map((type) => {
                  const isSel = maintenanceType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setMaintenanceType(type)}
                      className={`py-2.5 rounded-lg text-3xs font-black border transition-all ${
                        isSel
                          ? 'bg-[#0058bc] text-white border-[#0058bc] font-black'
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Device Detail Inputs (Image 8 fields) */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">设备类别名 *</label>
                <input
                  type="text"
                  required
                  placeholder="例如：精密质谱仪、变频冷水泵"
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value)}
                  className="w-full bg-[#faf9fe] border border-[#eeedf3] focus:bg-white focus:border-[#0058bc] rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1 font-sans">设备制造商品牌</label>
                  <input
                    type="text"
                    placeholder="例如：施耐德、Thermo"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-[#faf9fe] border border-[#eeedf3] focus:bg-white focus:border-[#0058bc] rounded-xl p-2.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1 font-sans">设备特异型号</label>
                  <input
                    type="text"
                    placeholder="请输入设备型号"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-[#faf9fe] border border-[#eeedf3] focus:bg-white focus:border-[#0058bc] rounded-xl p-2.5 text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: 故障详情 (Fault Details) Input & priority checkboxes */}
          <div className="bg-white p-4 rounded-2xl border border-[#eeedf3] space-y-3.5">
            <h3 className="text-2xs font-extrabold tracking-wide uppercase text-gray-400">故障及响应等级</h3>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium">请详细描述问题 *</label>
              <textarea
                rows={3}
                required
                placeholder="请详尽描述故障发生时的工况、报错代码（如有）及生产线受影响的程度..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#faf9fe] border border-[#eeedf3] focus:bg-white focus:border-[#0058bc] rounded-xl p-3 text-xs text-slate-800"
              />
            </div>

            {/* Circle rating checkbox indicators (1, 2, 3) */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-gray-400 font-semibold">响应预警紧急等级</span>
              <div className="flex items-center gap-3">
                {[1, 2, 3].map((num) => {
                  const isSel = urgencyRating === num;
                  const colorMap = {
                    1: 'border-red-500 bg-red-500 text-white',
                    2: 'border-amber-500 bg-amber-500 text-white',
                    3: 'border-green-500 bg-green-500 text-white'
                  };
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setUrgencyRating(num as 1 | 2 | 3)}
                      className={`w-9 h-9 rounded-full border-2 text-xs font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                        isSel
                          ? colorMap[num as 1 | 2 | 3]
                          : 'border-gray-200 text-gray-400 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3.5: 现场照片及证明文件附件上传 (Fault Photos & File Attachments Drag & Drop Zone) */}
          <div className="bg-white p-4 rounded-2xl border border-[#eeedf3] space-y-4 text-left">
            <div className="flex justify-between items-center">
              <h3 className="text-2xs font-extrabold tracking-wide uppercase text-gray-400">现场故障照片及相关附件</h3>
              <span className="text-[10px] bg-blue-50 text-[#0058bc] border border-blue-100 px-2 py-0.5 rounded-md font-bold font-sans">
                支持拖拽上传
              </span>
            </div>

            {/* Invisible Native Input */}
            <input 
              id="file-attachment-input"
              type="file" 
              multiple 
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Dynamic Drag and Drop Zone Container */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-attachment-input')?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-250 cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
                isDragging 
                  ? 'border-[#0058bc] bg-[#0058bc]/5 scale-[0.99] shadow-inner' 
                  : 'border-[#eeedf3] hover:border-[#0058bc]/40 bg-[#faf9fe] hover:bg-white'
              }`}
            >
              <div className="w-11 h-11 bg-[#0058bc]/8 rounded-full flex items-center justify-center text-[#0058bc] shadow-3xs">
                <UploadCloud className="w-5 h-5 animate-bounce" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-gray-700">拖拽文件到此处，或<span className="text-[#0058bc] hover:underline">点击浏览本地</span></p>
                <p className="text-[10px] text-gray-400 font-medium">支持多张故障实拍图、技术报告、检修签单 (单个最大 15MB)</p>
              </div>
            </div>



            {/* List of currently uploaded attachments */}
            {attachments.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#f4f3f8]">
                <p className="text-[10px] text-gray-400 font-bold">已挂载的附件({attachments.length}个):</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {attachments.map((file, idx) => {
                    const isImg = file.type.startsWith('image/');
                    return (
                      <div 
                        key={idx}
                        className="bg-gray-50 rounded-xl p-2.5 flex items-center justify-between border border-[#eeedf3] hover:border-gray-300 transition-all text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {isImg ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-150 shrink-0 bg-gray-200">
                              <img src={file.url} alt="attached preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 shrink-0 flex items-center justify-center text-[#0058bc]">
                              <Paperclip className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0 pr-2">
                            <p className="font-extrabold text-gray-700 text-3xs truncate" title={file.name}>{file.name}</p>
                            <span className="text-[9px] text-gray-400 font-bold block mt-0.5">{file.size} • 已挂载为首选凭证</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="移除附件"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: 后勤申报信息 (Logistics Info) (Image 8 rows) */}
          <div className="bg-white rounded-2xl border border-[#eeedf3] overflow-hidden divide-y divide-[#f4f3f8]">
            <div className="p-3 bg-gray-50/50">
              <h4 className="text-xs font-black text-gray-400 ml-1">维保后勤信息</h4>
            </div>

            {/* Maintenance Mode toggle row */}
            <div className="flex justify-between items-center py-3 px-4 text-xs font-medium bg-white">
              <span className="text-gray-400">基本维修模式</span>
              <div className="bg-gray-100 p-1 rounded-lg flex gap-1 border border-gray-100 shrink-0">
                {(['自行维修', '外部维修'] as const).map((mode) => {
                  const isSel = maintenanceMode === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setMaintenanceMode(mode)}
                      className={`px-3 py-1 text-3xs font-extrabold rounded-md transition-all ${
                        isSel
                          ? 'bg-white text-[#0058bc] shadow-xs font-black'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {mode}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Application User read-only logs */}
            <div className="flex justify-between items-center py-3.5 px-4 text-xs font-medium">
              <span className="text-gray-400">申请填报签字人</span>
              <span className="font-bold text-gray-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gray-400" />
                {currentUser.name} (ID: {currentUser.id})
              </span>
            </div>

            {/* Automated date timestamp */}
            <div className="flex justify-between items-center py-3.5 px-4 text-xs font-medium">
              <span className="text-gray-400">填报登记日期</span>
              <span className="font-semibold text-gray-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400 animate-pulse" />
                {new Date().toISOString().replace('T', ' ').substring(0, 16)} LST
              </span>
            </div>
          </div>

          <div className="text-[10px] text-gray-400 px-2 leading-relaxed text-center">
            提交即表示您确认填入的设备型号、制造供应商和故障详情完整，并对数据安全规范负有技术联签责任。
          </div>

          {/* Sticky submit button footer */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#0058bc] hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-xs shadow-md shadow-[#0058bc]/15 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-white hover:rotate-6 transition-transform" />
              提交新增填报
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
