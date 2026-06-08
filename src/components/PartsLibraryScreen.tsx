/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, History, ArrowLeft, X, ShoppingBag, Plus, Sparkles, Check, Upload, Download, FileDown, AlertCircle } from 'lucide-react';
import { SparePart, PartCategory, SubAccount, QuoteHistory } from '../types';

interface PartsLibraryScreenProps {
  currentUser: SubAccount | any;
  parts: SparePart[];
  onAddPart: (part: SparePart) => void;
  onUpdatePart: (part: SparePart) => void;
}

export default function PartsLibraryScreen({
  currentUser,
  parts,
  onAddPart,
  onUpdatePart
}: PartsLibraryScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PartCategory>(PartCategory.ALL);
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  // States for adding/editing a spare part
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPartName, setNewPartName] = useState('');
  const [newPartModel, setNewPartModel] = useState('');
  const [newPartBrand, setNewPartBrand] = useState('');
  const [newPartPrice, setNewPartPrice] = useState('');
  const [newPartCas, setNewPartCas] = useState('');
  const [newPartSupplier, setNewPartSupplier] = useState('');
  const [newPartUnit, setNewPartUnit] = useState('PCS');
  const [newPartDesc, setNewPartDesc] = useState('');
  const [newPartCategory, setNewPartCategory] = useState<PartCategory>(PartCategory.PART);

  // States for importing
  const [importPreviewParts, setImportPreviewParts] = useState<any[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Helper code for custom lightweight CSV parser (handles double quotes properly)
  const parseCSV = (text: string): string[][] => {
    const lines: string[][] = [];
    const rows = text.split(/\r?\n/);
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i].trim();
      if (!row) continue;
      
      const cells: string[] = [];
      let insideQuote = false;
      let currentCell = '';
      
      for (let j = 0; j < row.length; j++) {
        const char = row[j];
        if (char === '"') {
          insideQuote = !insideQuote;
        } else if (char === ',' && !insideQuote) {
          cells.push(currentCell.trim());
          currentCell = '';
        } else {
          currentCell += char;
        }
      }
      cells.push(currentCell.trim());
      lines.push(cells);
    }
    return lines;
  };

  // Export visible/all parts to beautifully structured CSV with Excel Bom header
  const exportToCSV = (dataList: SparePart[]) => {
    const headers = [
      '备件ID',
      '备件名称',
      '规格型号',
      '制造品牌',
      '生产厂家',
      '最新单价',
      '最近报价时间',
      '所有报价日期',
      '单位',
      'CAS货号',
      '供应商',
      '大类分类',
      '关联核定工程',
      '历史报价完整明细(包含价格/数量/供应商/经办人/工程)',
      '描述'
    ];
    const rows = dataList.map(part => {
      // Find the latest date from part.date or quoteHistory
      let latestDate = part.date;
      if (part.quoteHistory && part.quoteHistory.length > 0) {
        const sortedHistory = [...part.quoteHistory].sort((a, b) => b.date.localeCompare(a.date));
        latestDate = sortedHistory[0].date;
      }
      
      const allQuoteDatesStr = part.quoteHistory && part.quoteHistory.length > 0
        ? part.quoteHistory.map(q => q.date).join('; ')
        : latestDate;
      
      // Build a string for historical quote details
      const historyStr = part.quoteHistory && part.quoteHistory.length > 0
        ? part.quoteHistory.map(q => `[${q.date}] 单价:¥${q.price}, 数量:${q.quantity || 1}, 供应商:${q.supplier || '无'}, 经办:${q.buyer || '巡检员'}, 项目:${q.project || '无'}`).join('; ')
        : '暂无报价历史记录';

      return [
        part.id,
        part.name,
        part.model,
        part.brand,
        part.manufacturer || part.brand,
        part.price,
        latestDate,
        allQuoteDatesStr,
        part.unit,
        part.cas,
        part.supplier,
        part.category,
        part.relatedProject,
        historyStr,
        part.description.replace(/\n/g, ' ')
      ];
    });

    const csvContent = 
      "\uFEFF" + // UTF-8 BOM
      [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `工业备件耗材数据库备份_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download official custom template for smooth bulk importing
  const downloadTemplate = () => {
    const headers = ['备件名称', '规格型号', '制造品牌', '最新单价', '报价时间', '单位', 'CAS货号', '供应商', '大类(备件/耗材)', '描述'];
    const sample1 = ['数字传感器变送器', 'SEN-DIGI-X1', 'Schneider', '620.00', '2026-06-08', 'PCS', 'CAS-44211', '智慧工业传感网', '备件', '24V高精度数字采集元件配合总线模组'];
    const sample2 = ['精密液压动力阀', 'VALVE-HD-09', 'REXROTH', '1450.00', '2026-06-05', 'PCS', 'CAS-31034', '液力传动仓', '备件', '极高压力负载下平稳开启的三通路先导控制阀'];
    const sample3 = ['耐高温绝缘防护手套', 'PRO-G-H3', '杜邦防护', '35.00', '2026-06-01', '双', 'CAS-88122', '精细耗材分拨仓', '耗材', '防潮耐热抗静电符合CE工业防护安全标准'];

    const csvContent = 
      "\uFEFF" + // UTF-8 BOM
      [headers.join(','), sample1.map(val => `"${val}"`).join(','), sample2.map(val => `"${val}"`).join(','), sample3.map(val => `"${val}"`).join(',')].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "工业备件批量调入模板.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          setImportError('无法正确读取导入文件内容！');
          return;
        }

        const rows = parseCSV(text);
        if (rows.length < 2) {
          setImportError('数据表中除了表头，未有任何数据行或为空。');
          return;
        }

        const parsedRowsData: any[] = [];
        
        // Dynamically match headers to indices for perfect flexibility
        const headerRow = rows[0].map(h => h.trim());
        const getIdx = (keywords: string[], defaultIdx: number) => {
          const idx = headerRow.findIndex(h => keywords.some(k => h.includes(k)));
          return idx >= 0 ? idx : defaultIdx;
        };

        const nameIdx = getIdx(['名称'], 0);
        const modelIdx = getIdx(['型号'], 1);
        const brandIdx = getIdx(['品牌'], 2);
        const priceIdx = getIdx(['单价'], 3);
        const dateIdx = getIdx(['时间', '日期', '天'], 4);
        const unitIdx = getIdx(['单位'], 5);
        const casIdx = getIdx(['货号', 'CAS'], 6);
        const supplierIdx = getIdx(['供应商'], 7);
        const categoryIdx = getIdx(['大类', '分类'], 8);
        const descIdx = getIdx(['描述', '说明'], 9);
        
        for (let i = 1; i < rows.length; i++) {
          const rowData = rows[i];
          if (rowData.length < 2 || !rowData[0]) continue; // skip empty lines

          const name = rowData[nameIdx] || '默认备件';
          const model = rowData[modelIdx] || 'SH-SPEC';
          const brand = rowData[brandIdx] || '通用工业';
          const priceRaw = rowData[priceIdx] || '0';
          const quoteDateRaw = dateIdx < rowData.length ? (rowData[dateIdx] || '') : '';
          const unit = rowData[unitIdx] || 'PCS';
          const cas = rowData[casIdx] || 'CAS-GEN';
          const supplier = rowData[supplierIdx] || '联锁调拨仓';
          const categoryString = rowData[categoryIdx] || '';
          const description = rowData[descIdx] || '通过极速CSV批量导入加载入库。';

          // parse category string to PartCategory Enum
          let category: PartCategory = PartCategory.PART;
          if (categoryString.includes('耗') || categoryString.toLowerCase().includes('consumable')) {
            category = PartCategory.CONSUMABLE;
          } else {
            category = PartCategory.PART;
          }

          const price = parseFloat(priceRaw.replace(/[^\d.]/g, '')) || 0;

          // Format clean, beautiful quote date string
          let quoteDate = quoteDateRaw.trim();
          if (!quoteDate || !/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/.test(quoteDate)) {
            const d = new Date(quoteDate);
            if (!isNaN(d.getTime())) {
              quoteDate = d.toISOString().split('T')[0];
            } else {
              quoteDate = new Date().toISOString().split('T')[0];
            }
          }

          parsedRowsData.push({
            name,
            model,
            brand,
            price,
            quoteDate,
            unit,
            cas,
            supplier,
            category,
            description
          });
        }

        if (parsedRowsData.length === 0) {
          alert('⚠️ 无效的数据。请确认没有空行，并按照首张模板格式书写。');
          return;
        }

        setImportPreviewParts(parsedRowsData);
        setImportError(null);
        setShowImportModal(true);
      } catch (err: any) {
        alert(`❌ 数据解析异常失败: ${err?.message || '未知错误'}`);
      }
      
      e.target.value = '';
    };

    reader.readAsText(file, 'utf-8');
  };

  const handleConfirmImport = () => {
    if (importPreviewParts.length === 0) return;

    importPreviewParts.forEach((item, idx) => {
      const partObj: SparePart = {
        id: 'part-import-' + Date.now() + '-' + idx,
        name: item.name,
        model: item.model,
        manufacturer: item.brand,
        price: item.price,
        date: item.quoteDate,
        unit: item.unit,
        image: item.category === PartCategory.CONSUMABLE 
          ? 'https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80&w=400' 
          : 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400', 
        brand: item.brand,
        supplier: item.supplier,
        cas: item.cas,
        relatedProject: '智能工厂二期项目',
        category: item.category,
        description: item.description,
        quoteHistory: [
          {
            id: 'q-import-' + Date.now() + '-' + idx,
            date: item.quoteDate,
            price: item.price,
            quantity: 1,
            supplier: item.supplier,
            project: '智能工厂二期项目',
            buyer: currentUser?.name || '管理员'
          }
        ]
      };
      onAddPart(partObj);
    });

    setShowImportModal(false);
    setImportPreviewParts([]);
  };

  // Filter logic
  const filteredParts = parts.filter((part) => {
    const matchesCategory =
      selectedCategory === PartCategory.ALL || part.category === selectedCategory;

    const matchesSearch =
      part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.cas.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.supplier.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleCreatePart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartName || !newPartPrice) return;

    // Create a new high fidelity mock spare part
    const partObj: SparePart = {
      id: 'part-' + Date.now(),
      name: newPartName,
      model: newPartModel || '通用标准',
      manufacturer: newPartBrand || '通用制造',
      price: parseFloat(newPartPrice) || 0,
      date: new Date().toISOString().split('T')[0],
      unit: newPartUnit,
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400',
      brand: newPartBrand || '通用制造',
      supplier: newPartSupplier || '联合备件商务部',
      cas: newPartCas || 'CAS-' + Math.floor(Math.random() * 1000),
      relatedProject: '智能工厂二期项目',
      category: newPartCategory,
      description: newPartDesc || '由维护人员手动录入的备件。符合标准工业规格。',
      quoteHistory: [
        {
          id: 'q-' + Date.now(),
          date: new Date().toISOString().split('T')[0],
          price: parseFloat(newPartPrice) || 0,
          quantity: 1,
          supplier: newPartSupplier || '联合备件商务部',
          project: '智能工厂二期项目',
          buyer: currentUser.name
        }
      ]
    };

    onAddPart(partObj);
    setShowAddModal(false);
    
    // Clear form
    setNewPartName('');
    setNewPartModel('');
    setNewPartBrand('');
    setNewPartPrice('');
    setNewPartCas('');
    setNewPartSupplier('');
    setNewPartUnit('PCS');
    setNewPartDesc('');
  };

  const handleAddQuotation = (part: SparePart, priceInput: string, qtyInput: string) => {
    const p = parseFloat(priceInput);
    const q = parseInt(qtyInput);
    if (isNaN(p) || isNaN(q)) return;

    const newQuote: QuoteHistory = {
      id: 'q-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      price: p,
      quantity: q,
      supplier: part.supplier,
      project: part.relatedProject,
      buyer: currentUser.name
    };

    const updatedPart = {
      ...part,
      price: p, // Update to latest price
      date: new Date().toISOString().split('T')[0],
      quoteHistory: [newQuote, ...part.quoteHistory]
    };

    onUpdatePart(updatedPart);
    setSelectedPart(updatedPart); // refresh current selection view
  };

  return (
    <div id="parts-library-screen-root" className="flex flex-col min-h-screen bg-[#faf9fe]">
      {/* Search and Navigation Headers */}
      <header className="sticky top-0 z-30 bg-[#faf9fe]/85 backdrop-blur-md px-4 py-3 flex flex-col space-y-3.5 border-b border-[#eeedf3]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-extrabold text-[#1a1b1f] font-sans">
              备件耗材数据库
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {currentUser.permissions.manageParts && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-[#0058bc] text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 hover:bg-[#0058bc]/90 active:scale-95 transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                添加备件
              </button>
            )}
          </div>
        </div>

        {/* Input Bar */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="搜索组件、CAS号、品牌、供应商..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-xs font-medium border border-transparent focus:bg-white focus:border-[#0058bc] focus:outline-hidden transition-all text-gray-800 placeholder-gray-400 font-sans"
          />
        </div>

        {/* Data Tools Panel (Import / Export / Template) */}
        <div className="flex gap-2 justify-between items-center bg-white/50 p-2 rounded-xl border border-gray-200/60 shadow-2xs">
          <span className="text-[10px] text-gray-400 font-bold ml-1 flex items-center gap-1 shrink-0">
            🔧 数据管理:
          </span>

          <div className="flex items-center gap-1.5 overflow-x-auto select-none no-scrollbar">
            {/* hidden file input */}
            <input
              type="file"
              id="parts-csv-file-input"
              className="hidden"
              accept=".csv"
              onChange={handleCSVImport}
            />

            {/* Template Download */}
            <button
              onClick={downloadTemplate}
              className="text-[10px] font-extrabold bg-[#0058bc]/5 text-[#0058bc] border border-[#0058bc]/20 hover:bg-[#0058bc]/10 px-2 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer active:scale-95"
            >
              <FileDown className="w-3 h-3" />
              下载模板
            </button>

            {/* CSV Import */}
            {currentUser.permissions.manageParts && (
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('parts-csv-file-input');
                  if (input) (input as HTMLInputElement).click();
                }}
                className="text-[10px] font-extrabold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 px-2 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer active:scale-95"
              >
                <Upload className="w-3 h-3" />
                表格导入
              </button>
            )}

            {/* Export data */}
            <button
              onClick={() => exportToCSV(parts)}
              className="text-[10px] font-extrabold bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 px-2 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-3 h-3" />
              导出台账
            </button>
          </div>
        </div>

        {/* Category Toggling tabs */}
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-0.5">
          {Object.values(PartCategory).map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-[#0058bc] text-white shadow-sm shadow-[#0058bc]/10'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Parts List Scroll */}
      <main className="flex-grow p-4 space-y-3.5 max-h-[calc(100vh-170px)] overflow-y-auto">
        {filteredParts.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            🔍 没有找到符合要求的备件
          </div>
        ) : (
          filteredParts.map((part) => (
            <div
              key={part.id}
              onClick={() => setSelectedPart(part)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-[#eeedf3] hover:shadow-md cursor-pointer hover:border-[#0058bc]/30 transition-all flex flex-col space-y-3 text-left"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#1a1b1f] font-sans">
                    {part.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-sans">
                    {part.model} • {part.brand}
                  </p>
                </div>
                
                {/* Price Display */}
                <div className="text-right">
                  <p className="text-base font-extrabold text-[#0058bc] font-sans">
                    ¥{part.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {(() => {
                      if (part.quoteHistory && part.quoteHistory.length > 0) {
                        const sortedHistory = [...part.quoteHistory].sort((a, b) => b.date.localeCompare(a.date));
                        return sortedHistory[0].date;
                      }
                      return part.date;
                    })()}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[#f4f3f8]">
                {/* Unit badge */}
                <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  单位: {part.unit}
                </span>

                {/* Quotation history link */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPart(part);
                    setShowHistoryModal(true);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-[#0058bc] font-bold hover:underline"
                >
                  <History className="w-3.5 h-3.5" />
                  报价历史
                </button>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Detailed Modal/Bottomsheet for Spare Part (Image 5) */}
      {selectedPart && !showHistoryModal && (
        <div className="fixed inset-0 bg-[#1a1b1f]/40 backdrop-blur-xs z-50 flex items-end sm:items-center sm:justify-center p-0 sm:p-4">
          <div className="bg-[#faf9fe] w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-250">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-4 border-b border-[#eeedf3] bg-white">
              <button
                onClick={() => setSelectedPart(null)}
                className="text-[#414755] hover:text-[#1a1b1f] flex items-center gap-1 text-sm font-semibold"
              >
                <ArrowLeft className="w-4 h-4" /> 返回
              </button>
              <h2 className="text-sm font-bold text-gray-800">备件详情</h2>
              <button onClick={() => setSelectedPart(null)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content Body */}
            <div className="overflow-y-auto p-4 space-y-4">
              {/* Product Visual */}
              <div className="flex gap-4 bg-white p-4 rounded-2xl border border-[#eeedf3]">
                <img
                  src={selectedPart.image}
                  alt={selectedPart.name}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-xl object-cover shrink-0 border border-gray-100 shadow-xs"
                />
                <div className="flex flex-col justify-between py-1 text-left">
                  <div>
                    <h3 className="text-lg font-bold text-[#1a1b1f]">
                      {selectedPart.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">{selectedPart.model}</p>
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-[#0058bc]">
                      ¥{selectedPart.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-gray-400">最新单价</p>
                  </div>
                </div>
              </div>

              {/* Table details (Image 5 specification rows) */}
              <div className="bg-white rounded-2xl border border-[#eeedf3] overflow-hidden divide-y divide-[#f4f3f8]">
                <div className="flex justify-between items-center py-3.5 px-4 text-xs text-left">
                  <span className="text-gray-400 font-medium">品牌</span>
                  <span className="font-bold text-[#1a1b1f]">{selectedPart.brand}</span>
                </div>
                <div className="flex justify-between items-center py-3.5 px-4 text-xs text-left">
                  <span className="text-gray-400 font-medium">供应商</span>
                  <span className="font-bold text-blue-600 hover:underline cursor-pointer">{selectedPart.supplier}</span>
                </div>
                <div className="flex justify-between items-center py-3.5 px-4 text-xs text-left">
                  <span className="text-gray-400 font-medium">最近报价日期</span>
                  <span className="font-bold text-[#1a1b1f]">
                    {(() => {
                      if (selectedPart.quoteHistory && selectedPart.quoteHistory.length > 0) {
                        const sortedHistory = [...selectedPart.quoteHistory].sort((a, b) => b.date.localeCompare(a.date));
                        return sortedHistory[0].date;
                      }
                      return selectedPart.date;
                    })()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3.5 px-4 text-xs text-left">
                  <span className="text-gray-400 font-medium">货号/CAS号</span>
                  <span className="font-mono text-gray-600 font-semibold">{selectedPart.cas}</span>
                </div>
                <div className="flex justify-between items-center py-3.5 px-4 text-xs text-left">
                  <span className="text-gray-400 font-medium">单位</span>
                  <span className="font-bold text-[#1a1b1f] uppercase">{selectedPart.unit}</span>
                </div>
                <div className="flex justify-between items-center py-3.5 px-4 text-xs text-left">
                  <span className="text-gray-400 font-medium">项目名称</span>
                  <span className="font-semibold text-gray-400 truncate max-w-[200px]">{selectedPart.relatedProject}</span>
                </div>
              </div>

              {/* Product description (Image 5 detail panel) */}
              <div className="space-y-2 text-left">
                <span className="text-xs font-bold text-gray-400 ml-1">备件描述</span>
                <div className="bg-[#eeedf3]/50 p-4 rounded-2xl border border-[#eeedf3]/60 text-xs text-[#414755]/90 leading-relaxed font-sans">
                  {selectedPart.description}
                </div>
              </div>

              {/* Authorized Quick Log quotation feature */}
              {currentUser.permissions.viewCostAndQuotes && (
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-3 text-left">
                  <p className="text-xs font-bold text-[#0058bc] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    更新报价
                  </p>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">新单价 (元)</label>
                      <input 
                        type="number" 
                        id="quick-quote-price"
                        placeholder={String(selectedPart.price)}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      const pEl = document.getElementById('quick-quote-price') as HTMLInputElement;
                      const pVal = pEl?.value || String(selectedPart.price);
                      handleAddQuotation(selectedPart, pVal, '1');
                      if (pEl) pEl.value = '';
                    }}
                    className="w-full bg-[#0058bc] text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-700"
                  >
                    提交变动，计入报价历史
                  </button>
                </div>
              )}
            </div>

            {/* Sticky Bottom Actions */}
            <div className="p-4 bg-white border-t border-[#eeedf3]">
              <button
                onClick={() => setShowHistoryModal(true)}
                className="w-full bg-[#0058bc] text-white py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <History className="w-4 h-4" />
                查看并管理报价历史
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Quotation History Modal (Image 5 "报价历史") */}
      {showHistoryModal && selectedPart && (
        <div className="fixed inset-0 bg-[#1a1b1f]/40 backdrop-blur-xs z-50 flex items-end sm:items-center sm:justify-center p-0 sm:p-4">
          <div className="bg-[#faf9fe] w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-4 border-b border-[#eeedf3] bg-white">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-[#414755] hover:text-[#1a1b1f] flex items-center gap-1 text-sm font-semibold"
              >
                <ArrowLeft className="w-4 h-4" /> 返回
              </button>
              <h2 className="text-sm font-bold text-gray-800">报价历史 - {selectedPart.name}</h2>
              <button onClick={() => { setShowHistoryModal(false); setSelectedPart(null); }} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Quote History list logs */}
            <div className="p-4 overflow-y-auto space-y-3.5 flex-grow">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 ml-1.5 justify-between">
                <span>采购与报价记录 ({selectedPart.quoteHistory.length})</span>
                <span>计价货币: CNY (¥)</span>
              </div>

              <div className="space-y-2.5">
                {selectedPart.quoteHistory.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="bg-white p-4 rounded-xl border border-[#eeedf3] space-y-2 text-left"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] bg-blue-50 text-[#0058bc] px-1.5 py-0.5 rounded-sm font-bold font-mono">
                          报价批次 #{selectedPart.quoteHistory.length - idx}
                        </span>
                        <p className="text-xs text-gray-400 font-sans mt-1">报价时间: {q.date}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-black text-[#ff3b30]">
                          ¥{q.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] text-gray-400">数量: {q.quantity} {selectedPart.unit}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-dashed border-[#eeedf3] text-[10px] text-gray-500 grid grid-cols-2 gap-1.5">
                      <div>
                        <span className="text-gray-400 block">供货渠道</span>
                        <span className="font-bold text-gray-700">{q.supplier}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">隶属工程</span>
                        <span className="font-bold text-gray-700">{q.project}</span>
                      </div>
                      <div className="col-span-2 mt-1 border-t border-gray-100 pt-1 flex justify-between items-center bg-gray-50 px-2 py-1 rounded-sm">
                        <span className="text-gray-400">账套录入签署人:</span>
                        <span className="font-semibold text-gray-800">{q.buyer}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions button */}
            <div className="p-4 bg-white border-t border-[#eeedf3]">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-full bg-[#0058bc] text-white py-3.5 rounded-xl text-xs font-bold shadow-xs"
              >
                理解返回，查验备件
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Part Custom Sheet (Allowed for ManageParts permission) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#1a1b1f]/40 backdrop-blur-xs z-50 flex items-end sm:items-center sm:justify-center p-0 sm:p-4">
          <form
            onSubmit={handleCreatePart}
            className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-4 border-b border-[#eeedf3]">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-1">
                <ShoppingBag className="w-4 h-4 text-[#0058bc]" />
                新增备件耗材入库
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Input list */}
            <div className="p-4 overflow-y-auto space-y-4 text-left">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">备件名称 *</label>
                <input
                  type="text"
                  required
                  placeholder="如：超声波流量变送器 F3"
                  value={newPartName}
                  onChange={(e) => setNewPartName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-[#0058bc]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">规格型号</label>
                  <input
                    type="text"
                    placeholder="如：US-FLOW-800"
                    value={newPartModel}
                    onChange={(e) => setNewPartModel(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-[#0058bc]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">制造品牌</label>
                  <input
                    type="text"
                    placeholder="如：施耐德、ABB"
                    value={newPartBrand}
                    onChange={(e) => setNewPartBrand(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-[#0058bc]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">计价单价 * (¥)</label>
                  <input
                    type="number"
                    required
                    placeholder="4500"
                    value={newPartPrice}
                    onChange={(e) => setNewPartPrice(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-[#0058bc]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">单位</label>
                  <input
                    type="text"
                    placeholder="PCS"
                    value={newPartUnit}
                    onChange={(e) => setNewPartUnit(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-[#0058bc]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">CAS号/物资货号</label>
                  <input
                    type="text"
                    placeholder="如：3401-2051"
                    value={newPartCas}
                    onChange={(e) => setNewPartCas(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-[#0058bc]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">主营供应商</label>
                  <input
                    type="text"
                    placeholder="如：博世力士乐中国代理"
                    value={newPartSupplier}
                    onChange={(e) => setNewPartSupplier(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-[#0058bc]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">所属大类</label>
                  <select
                    value={newPartCategory}
                    onChange={(e) => setNewPartCategory(e.target.value as PartCategory)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-[#0058bc]"
                  >
                    <option value={PartCategory.PART}>备件</option>
                    <option value={PartCategory.CONSUMABLE}>耗材</option>
                  </select>
                </div>
                <div />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">备件详细特征描述</label>
                <textarea
                  rows={3}
                  placeholder="请输入描述，包括材质、绝缘等级、测试规范等"
                  value={newPartDesc}
                  onChange={(e) => setNewPartDesc(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-[#0058bc]"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-white border-t border-[#eeedf3] flex gap-3.5">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-bold text-xs"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#0058bc] text-white py-3 rounded-xl font-bold text-xs shadow-xs"
              >
                提交建立入库
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Import CSV Preview Modal */}
      {showImportModal && importPreviewParts.length > 0 && (
        <div className="fixed inset-0 bg-[#1a1b1f]/40 backdrop-blur-xs z-50 flex items-end sm:items-center sm:justify-center p-0 sm:p-4 animate-fade-in font-sans">
          <div className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-4 border-b border-[#eeedf3]">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-green-600" />
                核对导入备件数据清单
              </h2>
              <button
                type="button"
                onClick={() => { setShowImportModal(false); setImportPreviewParts([]); }}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* List preview details */}
            <div className="p-3.5 overflow-y-auto space-y-4 flex-grow text-left">
              <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-xs text-green-800 font-semibold leading-relaxed">
                📢 台账网关已成功解析并初步校验了格式。以下是拟载入库房的备件列表（共 {importPreviewParts.length} 件）。请在仔细核对后点击下方“确认导入”。
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-[#f4f3f8]">
                <div className="grid grid-cols-12 gap-1 p-2.5 bg-gray-50 text-[10px] font-bold text-gray-400">
                  <div className="col-span-5">备件名称/型号</div>
                  <div className="col-span-3">品牌/货号</div>
                  <div className="col-span-2 text-right">单价</div>
                  <div className="col-span-2 text-center">分类</div>
                </div>

                {importPreviewParts.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-1 p-2.5 items-center text-[11px] hover:bg-gray-50">
                    <div className="col-span-5 text-gray-800 font-bold">
                      <p className="truncate">{item.name}</p>
                      <p className="text-[9px] text-gray-400 truncate">{item.model}</p>
                      <p className="text-[9px] text-indigo-600 font-bold mt-0.5 whitespace-nowrap">🗓 报价时间: {item.quoteDate}</p>
                    </div>
                    <div className="col-span-3 text-gray-600 truncate">
                      <p className="truncate">{item.brand}</p>
                      <p className="text-[9px] text-mono truncate">{item.cas}</p>
                    </div>
                    <div className="col-span-2 text-right font-bold text-[#005bc1]">
                      ¥{item.price.toFixed(2)}
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-[9px] px-1.5 py-0.5 rounded-sm font-bold bg-indigo-50 text-indigo-700">
                        {item.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons footer */}
            <div className="p-4 bg-white border-t border-[#eeedf3] flex gap-3.5">
              <button
                type="button"
                onClick={() => { setShowImportModal(false); setImportPreviewParts([]); }}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-bold text-xs"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-xs shadow-xs"
              >
                确认建立批量导入
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
