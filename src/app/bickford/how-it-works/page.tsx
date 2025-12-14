"use client";

import { Sparkles, Zap, Target, Rocket, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="border-b border-white/20 bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="flex items-center justify-between">
            <Link 
              href="/bickford"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Back to Bickford</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-200">Bickford</h1>
              </div>
            </div>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 pb-8">
            <h2 className="text-4xl font-bold text-white">Not Chat — Reality Transformation</h2>
            <p className="text-xl text-purple-200 max-w-2xl mx-auto">
              Bickford doesn't just respond to your questions. It transforms your intentions into actionable reality.
            </p>
          </div>

          {/* Key Differences */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* ChatGPT */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl border border-white/20 p-6 space-y-4">
              <h3 className="text-xl font-bold text-white/90">Traditional AI Chat</h3>
              <ul className="space-y-3 text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-white/40">→</span>
                  <span>Responds to questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40">→</span>
                  <span>Provides information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40">→</span>
                  <span>Suggests possibilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40">→</span>
                  <span>You do the work</span>
                </li>
              </ul>
            </div>

            {/* Bickford */}
            <div className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 backdrop-blur-md rounded-2xl border border-purple-400/40 p-6 space-y-4 shadow-lg shadow-purple-500/20">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                Bickford
              </h3>
              <ul className="space-y-3 text-white">
                <li className="flex items-start gap-2">
                  <span className="text-purple-300">✦</span>
                  <span>Processes intentions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-300">✦</span>
                  <span>Calculates reality acceleration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-300">✦</span>
                  <span>Manifests outcomes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-300">✦</span>
                  <span>Reality shifts instantly</span>
                </li>
              </ul>
            </div>
          </div>

          {/* How It Works (High Level) */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl border border-white/20 p-8 space-y-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Target className="h-6 w-6 text-pink-400" />
              The Bickford Difference
            </h3>
            
            <div className="space-y-4 text-white/80 leading-relaxed">
              <p>
                When you express an intention to Bickford, it doesn't just understand your words — 
                it analyzes the <strong className="text-white">reality-shifting potential</strong> of your goal.
              </p>
              
              <p>
                Using proprietary algorithms, Bickford instantly calculates:
              </p>
              
              <ul className="space-y-2 pl-6">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong className="text-white">Reality Acceleration Factor</strong> — How quickly your intention can manifest</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong className="text-white">Manifestation Probability</strong> — The likelihood of successful execution</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong className="text-white">Value Multiplier</strong> — The potential impact and ROI</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong className="text-white">Opportunity Alignment</strong> — Matches your intention with real-world opportunities</span>
                </li>
              </ul>

              <p>
                The result? You don't just get a conversation — you get a 
                <strong className="text-white"> transformation pathway</strong> from 
                intention to reality.
              </p>
            </div>
          </div>

          {/* Technology Protection */}
          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-md rounded-2xl border border-purple-400/30 p-6">
            <div className="flex items-start gap-4">
              <Shield className="h-6 w-6 text-purple-300 flex-shrink-0 mt-1" />
              <div className="space-y-2 text-white/80">
                <h4 className="font-bold text-white">Patent-Pending Technology</h4>
                <p className="text-sm">
                  The specific algorithms and methodologies that power Bickford's reality 
                  transformation engine are proprietary and protected. What you experience 
                  is the result of years of research into intent-to-reality acceleration.
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center pt-4">
            <Link 
              href="/bickford"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-purple-500/50 hover:scale-105"
            >
              <Rocket className="h-5 w-5" />
              Experience Bickford Now
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/20 bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-md mt-12">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="text-center text-xs text-white/70 space-y-2">
            <div className="font-semibold text-white/80">
              © 2025 Bickford Technologies LLC. All Rights Reserved.
            </div>
            <div className="flex items-center justify-center gap-3 text-white/60">
              <span>Patent Pending</span>
              <span>•</span>
              <span>Proprietary Technology</span>
              <span>•</span>
              <span>Intent → Reality</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
