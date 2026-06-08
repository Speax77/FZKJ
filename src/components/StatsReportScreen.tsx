/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ArrowLeft, BarChart3, TrendingUp, Notebook, HelpCircle, Calendar, Download } from 'lucide-react';
import { Project, WorkOrder, SparePart } from '../types';

interface StatsReportScreenProps {
  currentProject: Project;
  workOrders: WorkOrder[];
  parts: SparePart[];
  onNavigateHome: () => void;
}

export default function StatsReportScreen({
  currentProject,
  workOrders,
  parts,
  onNavigateHome
}: StatsReportScreenProps) {
  const [selectedMonth, setSelectedMonth] = useState('2026-06');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Dynamic calculations based on state to make statistics real
  const activeOrdersCount = workOrders.length;
  const pendingOrdersCount = workOrders.filter((o) => o.status !== '已完成').length;

  // Let's compute spare parts total investment cost
  const totalCostValue = parts.reduce((sum, part) => {
    // Collect quote prices from histories
    const partsAccumulated = part.quoteHistory.reduce((acc, q) => acc + (q.price * q.quantity), 0);
    return sum + partsAccumulated;
  }, 0) + (activeOrdersCount * 320); // add baseline labor overhead

  // Chart dataset representing 5 infrastructure core projects (matching Image 4 horizontal labels)
  const chartData = [
    { name: '浦东研发一期', maintenance: 45, emergency: 12, cost: 12400, share: '28.9%', activeProjectsCount: 14, iconCode: 'factory' },
    { name: '中央科技广场', maintenance: 32, emergency: 18, cost: 9800, share: '22.8%', activeProjectsCount: 8, iconCode: 'building' },
    { name: '西部物流中心', maintenance: 28, emergency: 8, cost: 7420, share: '17.3%', activeProjectsCount: 12, iconCode: 'warehouse' },
    { name: '智能工厂二期', maintenance: 50, emergency: 22, cost: 10430, share: '24.3%', activeProjectsCount: 15, iconCode: 'robot' },
    { name: '通用工程中心', maintenance: 15, emergency: 4, cost: 2800, share: '6.7%', activeProjectsCount: 3, iconCode: 'tool' }
  ];

  return (
    <div id="stats-report-root" className="flex flex-col min-h-screen bg-[#faf9fe]">
      {/* Header */}
      <header className="sticky top-0 z-35 bg-[#faf9fe]/85 backdrop-blur-md border-b border-[#eeedf3] px-4 py-3.5 flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="text-[#414755] hover:text-[#1a1b1f] flex items-center gap-1 text-sm font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> 返回
        </button>
        <h2 className="text-sm font-extrabold text-[#1a1b1f] font-sans">统计报表</h2>
        <button 
          onClick={() => alert('正在导出当前报表账目至 CSV 便签...')}
          className="p-2 text-[#0058bc] hover:bg-blue-50 rounded-full cursor-pointer"
          title="导出报表"
        >
          <Download className="w-4.5 h-4.5" />
        </button>
      </header>

      {/* Content Scroll */}
      <main className="flex-grow p-4 space-y-5 max-h-[calc(100vh-60px)] overflow-y-auto pb-8 text-left">
        
        {/* Total Cost Highlight Card (Image 4 top widget) */}
        <div className="bg-linear-to-br from-white to-[#f4f3f8] p-5 rounded-3xl border border-[#eeedf3] shadow-xs relative overflow-hidden">
          {/* Faded background representation */}
          <div className="absolute right-[-10px] bottom-[-10px] opacity-10 text-blue-500 pointer-events-none">
            <BarChart3 className="w-32 h-32" />
          </div>

          <div className="space-y-1">
            <p className="text-xs text-gray-400 font-bold tracking-wide uppercase">备件及运维总投入</p>
            <h3 className="text-3xl font-black text-[#005bc1] tracking-tight">
              ¥{(totalCostValue || 42850.0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-green-500 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              +12.5% 环比上月正常维增
            </p>
          </div>
        </div>

        {/* Binary cards for numeric stats (Image 4 middle widgets) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#eeedf3] flex gap-3 text-left shadow-2xs">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
              <Notebook className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-3xs font-extrabold text-[#414755]/80 uppercase">累计总工单数</p>
              <h4 className="text-lg font-black text-[#1a1b1f] mt-0.5">{1280 + activeOrdersCount}</h4>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#eeedf3] flex gap-3 text-left shadow-2xs">
            <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-3xs font-extrabold text-[#414755]/80 uppercase">待处理险情</p>
              <h4 className="text-lg font-black text-[#ff3b30] mt-0.5">{pendingOrdersCount}</h4>
            </div>
          </div>
        </div>

        {/* Standalone Custom SVG bar chart component (Image 4 middle Chart) */}
        <div className="bg-white p-4 rounded-3xl border border-[#eeedf3] space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <h4 className="text-sm font-black text-[#1a1b1f] font-sans">项目统计分析</h4>
              <p className="text-3xs text-gray-400 font-medium font-sans">
                5个核心维保场所的数据情况对比
              </p>
            </div>
            {/* Legend indicators */}
            <div className="flex gap-2.5 text-3xs font-bold text-[#414755]/90 mt-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#0058bc]" />
                日常运维
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#8a2bb9]" />
                紧急报修
              </span>
            </div>
          </div>

          {/* Interactive Chart drawings using customizable SVG bars with tooltips on hover */}
          <div className="relative pt-2">
            <svg viewBox="0 0 500 220" className="w-full overflow-visible font-sans">
              {/* Backgrid reference lines */}
              <line x1="20" y1="30" x2="480" y2="30" stroke="#f4f3f8" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="20" y1="80" x2="480" y2="80" stroke="#f4f3f8" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="20" y1="130" x2="480" y2="130" stroke="#f4f3f8" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="20" y1="180" x2="480" y2="180" stroke="#f4f3f8" strokeWidth="1" />

              {/* Draw Bar Series for 5 Categories */}
              {chartData.map((data, idx) => {
                const xBase = 35 + idx * 90; // partition coordinates
                
                // transform quantities to heights
                const maxVal = 60;
                const hMaint = (data.maintenance / maxVal) * 130;
                const hEmerg = (data.emergency / maxVal) * 130;
                
                const yMaint = 180 - hMaint;
                const yEmerg = 180 - hEmerg;

                const isHovered = hoveredBar === idx;

                return (
                  <g 
                    key={data.name} 
                    onMouseEnter={() => setHoveredBar(idx)} 
                    onMouseLeave={() => setHoveredBar(null)}
                    className="cursor-pointer transition-all duration-200"
                  >
                    {/* Shadow highlight background on hover */}
                    {isHovered && (
                      <rect 
                        x={xBase - 15} 
                        y="10" 
                        width="70" 
                        height="185" 
                        rx="12" 
                        fill="#0058bc" 
                        fillOpacity="0.03" 
                      />
                    )}

                    {/* Bar 1: Daily Maintenance (Blue) */}
                    <rect
                      x={xBase}
                      y={yMaint}
                      width="16"
                      height={hMaint}
                      rx="6"
                      fill={isHovered ? '#0070eb' : '#0058bc'}
                      className="transition-all duration-300"
                    />

                    {/* Bar 2: Emergency Repair (Purple) */}
                    <rect
                      x={xBase + 20}
                      y={yEmerg}
                      width="16"
                      height={hEmerg}
                      rx="6"
                      fill={isHovered ? '#a649d5' : '#8a2bb9'}
                      className="transition-all duration-300"
                    />

                    {/* Text values above when hovered */}
                    {isHovered && (
                      <g>
                        <text x={xBase + 8} y={yMaint - 6} fill="#0058bc" fontSize="9" fontWeight="900" textAnchor="middle">
                          {data.maintenance}
                        </text>
                        <text x={xBase + 28} y={yEmerg - 6} fill="#8a2bb9" fontSize="9" fontWeight="900" textAnchor="middle">
                          {data.emergency}
                        </text>
                      </g>
                    )}

                    {/* Horizontal axis label */}
                    <text
                      x={xBase + 18}
                      y="200"
                      fill={isHovered ? '#0058bc' : '#717786'}
                      fontSize="9.5"
                      fontWeight={isHovered ? '900' : '500'}
                      textAnchor="middle"
                    >
                      {data.name.split('')[0] + data.name.split('')[2] + data.name.split('')[4] || data.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip display */}
            {hoveredBar !== null && (
              <div className="absolute top-[80px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900/95 text-white text-3xs rounded-xl p-3 shadow-xl space-y-1 border border-slate-700 pointer-events-none z-20 font-sans tracking-wide">
                <p className="font-bold border-b border-white/10 pb-1">{chartData[hoveredBar].name}</p>
                <div className="flex justify-between gap-5 text-[10px]">
                  <span>日常运维工单:</span>
                  <span className="font-mono font-bold text-blue-400">{chartData[hoveredBar].maintenance}份</span>
                </div>
                <div className="flex justify-between gap-5 text-[10px]">
                  <span>突发故障抢修:</span>
                  <span className="font-mono font-bold text-purple-400">{chartData[hoveredBar].emergency}份</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cost Distribution Details (Image 4 bottom rows) */}
        <div>
          <h3 className="text-sm font-black text-[#1a1b1f] mb-3.5 font-sans">
            产线成本分布明细
          </h3>
          <div className="bg-white rounded-3xl border border-[#eeedf3] overflow-hidden divide-y divide-[#f4f3f8]">
            {chartData.map((project) => (
              <div
                key={project.name}
                className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
              >
                {/* Visual Icon indicator */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-[#0058bc] rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-base font-logo font-black">
                      {project.name.split('')[0]}
                    </span>
                  </div>

                  <div className="text-left space-y-0.5">
                    <h4 className="text-xs font-bold text-gray-800 leading-snug">
                      {project.name}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {project.activeProjectsCount} 活跃维保点
                    </span>
                  </div>
                </div>

                {/* Amount / Proportion column */}
                <div className="text-right">
                  <p className="text-xs font-black text-gray-800 font-sans">
                    ¥{project.cost.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-purple-600 font-bold font-mono">
                    占比 {project.share}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
