'use client';

import { useState } from 'react';
import { Eye, EyeOff, Wallet, TrendingUp, ShieldCheck } from "lucide-react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from "next-auth/react";
import { toast } from 'react-toastify';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/",
    });

    console.log("SignIn Result:", result);

    setLoading(false);

    if (result?.error) {
      toast.error("Invalid email or password");
      return;
    }

    toast.success("Login successful!");

    router.push("/");
    router.refresh();
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
          <span className="text-xl font-bold tracking-tight">XSplit</span>
        </div>

        {/* Marketing/Feature Text */}
        <div className="space-y-6 z-10 my-auto">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Take absolute control of your money.
          </h1>
          <p className="text-slate-400 text-lg">
            Track expenses, set intuitive budgets, and unlock smart insights to grow your net worth.
          </p>

          {/* Quick Features List */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-slate-800 rounded-md text-emerald-400">
                <TrendingUp size={18} />
              </div>
              <span className="text-sm text-slate-300">Real-time expense insights & analytics</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-slate-800 rounded-md text-emerald-400">
                <ShieldCheck size={18} />
              </div>
              <span className="text-sm text-slate-300">Bank-grade security & encryption</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-xs text-slate-500 z-10">
          &copy; 2026 SpendWise Inc. All rights reserved.
        </p>
      </div>

      {/* Right Column: Clean Login Form */}
      <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-6 sm:p-12 md:p-20">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl shadow-slate-100 border border-slate-100">

          {/* Mobile Brand View (Shows only on smaller screens) */}
          <div className="flex lg:hidden items-center gap-2 mb-6">
            <div className="p-2 bg-emerald-500 rounded-lg text-white">
              <Wallet size={20} />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">XSplit</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
            <p className="text-sm text-slate-500 mt-1">Log in to monitor your financial goals.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <Link href="/forgot-password" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
                  Forgot?
                </Link>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition text-slate-900 placeholder:text-slate-400"
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
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/10 active:transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Signing in..." : "Sign in to Dashboard"}
            </button>

            {/* Visual Divider */}
            <div className="relative flex py-2 items-center">
              <div className="grow border-t border-slate-100"></div>
              <span className="shrink mx-4 text-xs text-slate-400 uppercase tracking-wider font-medium">or continue with</span>
              <div className="grow border-t border-slate-100"></div>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={() => signIn("google", {
                callbackUrl: "/",
              })}
              className="w-full flex items-center justify-center gap-2.5 border border-slate-200 py-3 rounded-xl font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition active:transform active:scale-[0.99]"
            >
              <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-5 h-5" alt="Google" />
              Google Account
            </button>
          </form>

          {/* Bottom Link */}
          <p className="text-center text-sm text-slate-500 mt-8">
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
              Sign up free
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}