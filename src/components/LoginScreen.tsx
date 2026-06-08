/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Wrench, User, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import { SubAccount } from '../types';

interface LoginScreenProps {
  accounts: SubAccount[];
  onLogin: (user: SubAccount | { name: string; role: string; id: string; status: string; level: string; permissions: any }) => void;
}

export default function LoginScreen({ accounts, onLogin }: LoginScreenProps) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('password123'); // Default mock password
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) {
      setErrorMsg('请输入手机号或工号');
      return;
    }
    // Try to find a mock account matching name or id, otherwise log in as guest expert
    const found = accounts.find(
      (a) => a.name === userId || a.id === userId || a.role === userId
    );

    if (found) {
      if (found.status === '等待激活') {
        setErrorMsg('该账号处于“等待激活”状态，请联系管理员。');
        return;
      }
      onLogin(found);
    } else {
      // Allow custom typing helper: if they write anything, create a simulated Administrator/Expert session
      onLogin({
        id: 'user-expert',
        name: userId,
        role: '技术专家',
        status: '在线',
        level: '专家组长',
        permissions: {
          viewParts: true,
          manageParts: true,
          viewCostAndQuotes: true,
          fileDefectReport: true,
          processWorkOrder: true,
          viewReports: true,
          viewSupplierInfo: true,
        },
      });
    }
  };

  const selectQuickDemo = (acc: SubAccount) => {
    setUserId(acc.name);
    setErrorMsg('');
  };

  return (
    <div id="login-screen-root" className="flex flex-col min-h-screen bg-linear-to-b from-[#faf9fe] to-[#dad9df] px-6 py-12 justify-between">
      {/* Top spacing / Title Area */}
      <div className="flex flex-col items-center text-center mt-8">
        <div 
          id="login-logo-container"
          className="w-16 h-16 bg-[#0058bc] rounded-2xl flex items-center justify-center shadow-lg shadow-[#0058bc]/20 mb-6"
        >
          <Wrench className="w-8 h-8 text-white stroke-[2.5]" />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight text-[#1a1b1f] mb-2 font-sans">
          欢迎回来
        </h1>
        <p className="text-base text-[#414755]/80 font-sans">
          登录以管理备件与工单
        </p>
      </div>

      {/* Main card */}
      <div className="my-auto py-8">
        <form onSubmit={handleLoginSubmit} className="bg-white rounded-3xl p-6 shadow-xl shadow-[#1a1b1f]/5 border border-[#eeedf3] space-y-5">
          {errorMsg && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 font-sans">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Account Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#1a1b1f] ml-1">
              手机号或工号
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="输入您的账号（如：张浩 或 王刚）"
                className="w-full pl-11 pr-4 py-3.5 bg-[#f4f3f8] text-[#1a1b1f] rounded-2xl border border-transparent focus:bg-white focus:border-[#0058bc] focus:outline-hidden transition-all text-base placeholder-gray-400 font-sans"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="block text-sm font-semibold text-[#1a1b1f]">
                密码
              </label>
              <button 
                type="button" 
                className="text-xs font-semibold text-[#0058bc] hover:underline"
                onClick={() => setErrorMsg('请联系管理员张明（ID: 1001）重置密码')}
              >
                忘记密码？
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="输入您的密码"
                className="w-full pl-11 pr-10 py-3.5 bg-[#f4f3f8] text-[#1a1b1f] rounded-2xl border border-transparent focus:bg-white focus:border-[#0058bc] focus:outline-hidden transition-all text-base placeholder-gray-400 font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#0058bc] text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-[#0058bc]/95 active:scale-[0.98] transition-all text-base shadow-lg shadow-[#0058bc]/25 font-sans cursor-pointer mt-2"
          >
            <span>登录</span>
            <span className="text-lg">→</span>
          </button>
        </form>

        {/* Demo Accounts Quick-Click Shortcut Panel */}
        <div className="mt-6 bg-[#eeedf3]/60 backdrop-blur-md rounded-2xl p-4 border border-[#eeedf3]">
          <p className="text-xs font-semibold text-[#414755] mb-2 flex items-center gap-1">
            <KeyRound className="w-3.5 h-3.5 text-[#0058bc]" />
            演示快捷登录（不同角色对应的权限不同）：
          </p>
          <div className="grid grid-cols-2 gap-2">
            {accounts.map((acc) => (
              <button
                key={acc.id}
                onClick={() => selectQuickDemo(acc)}
                className={`text-xs text-left p-2.5 rounded-xl border transition-all ${
                  userId === acc.name
                    ? 'bg-[#0058bc]/10 border-[#0058bc] text-[#0058bc] font-semibold'
                    : 'bg-white hover:bg-gray-50 border-[#eeedf3] text-gray-700'
                }`}
              >
                <div className="font-semibold">{acc.name} ({acc.role})</div>
                <div className="text-[10px] text-gray-400 mt-0.5 truncate">{acc.level}</div>
              </button>
            ))}
          </div>
        </div>
      </div>


    </div>
  );
}
