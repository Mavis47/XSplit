'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  Users,
  Receipt,
  Bell,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Check,
  TrendingDown
} from "lucide-react";

export default function HomePage() {
  const { status } = useSession();
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8f9fa]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % carouselSlides.length);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 antialiased font-sans pb-32">
      {/* 
        Expanded the container framework to standard 1600px high-fidelity viewports 
        and maximized horizontal padding for standard responsive frames.
      */}
      <main className="mx-auto max-w-[1600px] w-[94%] py-12 lg:py-16 space-y-28">
        
        {/* ================= HERO SPLIT SECTION (WIDE RATIO) ================= */}
        <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-xl border border-slate-100 min-h-170 lg:min-h-155 flex flex-col 
            md:flex-row transition-all duration-700 hover:shadow-emerald-500/2">
          
          {/* Left Dynamic Side Image Panel */}
          <div 
            className="relative flex-1 lg:flex-[1.2] bg-cover bg-center min-h-100 md:min-h-auto group"
            style={{ 
              backgroundImage: `url('https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1600&q=85')` 
            }}
          >
            <div className="absolute inset-0 bg-linear-to-r from-black/30 via-transparent to-transparent" />
            
            <div className="absolute bottom-10 left-10 hidden lg:flex items-center gap-8 text-sm font-bold text-white tracking-widest uppercase bg-slate-950/30 backdrop-blur-md py-3 px-6 rounded-xl border border-white/10">
              <span className="text-emerald-400">Expenses</span>
              <span className="text-white/30">•</span>
              <span>Friends</span>
              <span className="text-white/30">•</span>
              <span>Group Ledger</span>
            </div>
          </div>

          {/* Right Floating Dark Card Container - Widened Padding */}
          <div className="w-full md:w-[50%] lg:w-[45%] bg-[#0f172a] text-white p-10 sm:p-14 lg:p-20 flex flex-col justify-between z-10 relative 
            md:-ml-24 lg:-ml-36 my-auto rounded-[2rem] md:rounded-r-[2rem] md:rounded-l-none shadow-2xl border-l border-slate-800/60">
            <div className="space-y-8">
              <span className="inline-block text-xs font-extrabold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-4 py-1.5 
                  rounded-full border border-emerald-500/20">
                Next-Gen Shared Finances
              </span>
              
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1]! bg-linear-to-br from-white 
                  via-slate-100 to-slate-400 bg-clip-text text-transparent">
                If you can dream it, you can do it.
              </h1>

              <p className="text-slate-300 text-base lg:text-lg leading-relaxed font-normal">
                XSplit completely redefines how modern friends, roommates, and travel squads manage shared balances. No awkward chats, zero messy 
                  calculations—just effortless mathematical balance.
              </p>
            </div>
          </div>
        </div>

        {/* ================= INTERACTIVE PRESET UI CONTEXT (WIDE DASHBOARD) ================= */}
        <div className="grid lg:grid-cols-12 gap-12 xl:gap-20 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div className="h-1.5 w-16 bg-emerald-500 rounded-full" />
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl leading-tight!">
              Ditch complex, messy spreadsheets.
            </h2>
            <p className="text-base lg:text-lg text-slate-500 leading-relaxed">
              Why run multiple tracking sheets when you can handle group expenses inside a beautifully reactive ledger environment? Add bills on the fly
              and let XSplit balance out the equations instantly.
            </p>
            
            <div className="space-y-4 pt-4">
              {[
                "Calculate complex multi-party split shares instantly",
                "Settle up balances directly with zero tracking overhead",
                "Isolate your regular personal accounts from casual group logs"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3.5">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Check className="h-3.5 w-3.5 text-emerald-600 stroke-3" />
                  </div>
                  <span className="text-base font-semibold text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expanded Ledger Mock Widget */}
          <div className="lg:col-span-7 bg-slate-900 rounded-[2rem] p-6 sm:p-10 shadow-xl text-white border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-6">
              <div>
                <h4 className="font-bold text-xl">Japan Trip Squad 2026 🍣</h4>
                <p className="text-sm text-slate-400 mt-1">4 Members active balance</p>
              </div>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 font-mono font-bold px-4 py-2 rounded-xl border border-emerald-500/20 
                tracking-tight">
                Active System Ledger
              </span>
            </div>

            <div className="space-y-4 py-8">
              {[
                { name: "Alex K.", action: "Paid for Shinkansen Tickets", total: "$180.00", split: "You owe $45.00", color: "border-l-blue-500" },
                { name: "Sarah M.", action: "Paid for Shibuya Diner Dinner", total: "$120.00", split: "You owe $30.00", color: "border-l-emerald-500" },
                { name: "You", action: "Added Capsule Hotel Booking", total: "$340.00", split: "You are owed $255.00", color: "border-l-amber-500", highlight: true },
              ].map((item, i) => (
                <div 
                  key={i} 
                  className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${
                    item.highlight ? 'bg-slate-800/60 border-slate-700 shadow-lg' : 'bg-slate-950/40 border-slate-800/80'
                  } border-l-4 ${item.color}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-base text-slate-300">
                      {item.name[0]}
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-200">{item.name} <span className="text-slate-400 font-normal text-sm ml-1.5">{item.action}</span></p>
                      <p className="text-xs font-mono text-slate-400 mt-1">Total Amount: {item.total}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold tracking-tight ${item.highlight ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {item.split}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-slate-400 border-t border-slate-800/60 pt-6">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-emerald-400" />
                <span>Net balance calculations synchronized real-time</span>
              </div>
              <button className="inline-flex items-center gap-2 text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
                <PlusCircle className="h-4 w-4" /> Quick Add Expense
              </button>
            </div>
          </div>
        </div>

        {/* ================= PREMIUM LIFESTYLE WIDE CAROUSEL ================= */}
        <div className="space-y-10">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold tracking-widest text-emerald-600 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Built For Every Scenario
            </span>
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl lg:text-5xl">Designed for real-world interactions</h2>
            <p className="text-slate-500 text-base lg:text-lg">Discover common spaces and layouts where XSplit takes complex calculations completely out of the equation.</p>
          </div>

          <div className="relative mt-8 group overflow-hidden rounded-[2rem] bg-white shadow-xl border border-slate-100 min-h-120 md:min-h-100 flex flex-col md:flex-row">
            
            {/* Slide Image Panel - Proportionally wider on large screens */}
            <div 
              className="w-full md:w-[45%] lg:w-[40%] bg-cover bg-center min-h-62.5 md:min-h-auto transition-all duration-700 ease-in-out transform"
              style={{ backgroundImage: `url('${carouselSlides[activeSlide].image}')` }}
            />

            {/* Slide Content Box */}
            <div className="flex-1 p-8 sm:p-12 lg:p-16 flex flex-col justify-between bg-white relative">
              <div className="space-y-5">
                <div className="inline-flex rounded-xl bg-slate-50 p-3.5 border border-slate-100 text-slate-800">
                  {carouselSlides[activeSlide].icon}
                </div>
                <h3 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  {carouselSlides[activeSlide].title}
                </h3>
                <p className="text-slate-500 text-base lg:text-lg leading-relaxed max-w-3xl">
                  {carouselSlides[activeSlide].desc}
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-8">
                <div className="flex gap-2.5">
                  {carouselSlides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSlide(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${i === activeSlide ? 'w-10 bg-slate-900' : 'w-2 bg-slate-200'}`}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <button onClick={prevSlide} className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-slate-600 active:scale-95">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={nextSlide} className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-slate-600 active:scale-95">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

      <footer className="text-center text-sm text-slate-400 py-12 border-t border-slate-200/60 mx-auto max-w-[1600px] w-[94%]">
        &copy; {new Date().getFullYear()} XSplit Inc. All production rights reserved.
      </footer>
    </div>
  );
}

const carouselSlides = [
  {
    title: "Cozy Roommates & Shared Apartments",
    desc: "Divide grocery bills, utility meters, rent allocations, and home goods clean down to the exact cent without holding awkward household check-ins every calendar month.",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
    icon: <Users className="h-6 w-6" />
  },
  {
    title: "Global Wanderlust & Group Trips",
    desc: "From local street-food stalls to cross-continental transport bookings, manage varying currencies and uneven split shares smoothly across multiple jet-setters.",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
    icon: <Wallet className="h-6 w-6" />
  },
  {
    title: "Weekend Diners & Late Night Events",
    desc: "Stop manually itemizing multi-page receipts after a late-night diner visit. Broadcast instant debt alerts instantly through Kafka push streams the moment the table settles.",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
    icon: <Receipt className="h-6 w-6" />
  },
  {
    title: "Real-Time Transaction Pings",
    desc: "No delays, no missing values. Your personal micro-ledgers update concurrently with absolute accuracy, providing crisp layout interfaces accessible seamlessly via any smartphone browser.",
    image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=1200&q=80",
    icon: <Bell className="h-6 w-6" />
  }
];