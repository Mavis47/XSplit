'use client';

import { useState } from 'react';
import { Eye, EyeOff, Wallet, TrendingUp, ShieldCheck } from "lucide-react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { ToastContainer, toast } from 'react-toastify';

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
       const response = await fetch(`/api/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name:fullName, username, email, password }),
      });
      if(response.ok){
        toast.success("Registration successful! Redirecting to login...");
      }
      setLoading(false);
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    }
    setLoading(true);
  };

  return (
    
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50">
      
      {/* Left Column: Finance Themed Branding Hero (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:col-span-5 bg-slate-900 p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent)]" />
        
        {/* Brand Header */}
        <div className="flex items-center gap-2 z-10">
          <div className="p-2 bg-emerald-500 rounded-lg text-slate-900">
            <Wallet size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">SpendWise</span>
        </div>

        {/* Marketing/Feature Text */}
        <div className="space-y-6 z-10 my-auto">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Start your financial freedom journey.
          </h1>
          <p className="text-slate-400 text-lg">
            Join thousands of smart stackers optimizing their budgets, slashing hidden expenses, and hitting saving targets effortlessly.
          </p>
          
          {/* Quick Features List */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-slate-800 rounded-md text-emerald-400">
                <TrendingUp size={18} />
              </div>
              <span className="text-sm text-slate-300">Set dynamic budgets & track asset allocations</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-slate-800 rounded-md text-emerald-400">
                <ShieldCheck size={18} />
              </div>
              <span className="text-sm text-slate-300">Secure cloud syncing across all your devices</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-xs text-slate-500 z-10">
          &copy; 2026 SpendWise Inc. All rights reserved.
        </p>
      </div>

      {/* Right Column: Clean Register Form */}
      <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-6 sm:p-12 md:p-16">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl shadow-slate-100 border border-slate-100">
          
          {/* Mobile Brand View (Shows only on smaller screens) */}
          <div className="flex lg:hidden items-center gap-2 mb-6">
            <div className="p-2 bg-emerald-500 rounded-lg text-white">
              <Wallet size={20} />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">SpendWise</span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
            <p className="text-sm text-slate-500 mt-1">Get started for free today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="alex_morgan"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-12 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition text-slate-900 placeholder:text-slate-400"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/10 active:transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {loading ? "Creating account..." : "Get Started Free"}
            </button>

            {/* Visual Divider */}
            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-slate-100"></div>
              <span className="shrink mx-4 text-xs text-slate-400 uppercase tracking-wider font-medium">or register with</span>
              <div className="grow border-t border-slate-100"></div>
            </div>

            {/* Google Signup Button */}
            <button
              type="button"
              onClick={() => signIn("google",{
                               callbackUrl: "/",
                            })}
              className="w-full flex items-center justify-center gap-2.5 border border-slate-200 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition active:transform active:scale-[0.99]"
            >
              <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-5 h-5" alt="Google" />
              Google Account
            </button>
          </form>

          {/* Bottom Redirect Link */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Already tracking with us?{' '}
            <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}