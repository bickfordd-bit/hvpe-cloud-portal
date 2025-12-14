"use client";

import { useState } from "react";
import { Film, Sparkles, Download, Play } from "lucide-react";
import { CONTENT_TEMPLATES, CINEMA_STORYLINES, VISUAL_PRESETS, AUDIO_TEMPLATES } from "@/lib/penelope/contentTemplates";

export default function PenelopePage() {
  const [prompt, setPrompt] = useState("");
  const [templateId, setTemplateId] = useState(CONTENT_TEMPLATES[0].id);
  const [storylineId, setStorylineId] = useState("");
  const [targetLength, setTargetLength] = useState<"short" | "medium" | "feature">("medium");
  const [visualPreset, setVisualPreset] = useState("CINEMATIC_DRAMA");
  const [audioStyle, setAudioStyle] = useState("EPIC_ORCHESTRAL");
  const [treatment, setTreatment] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const selectedTemplate = CONTENT_TEMPLATES.find(t => t.id === templateId);
  const selectedStoryline = storylineId 
    ? CINEMA_STORYLINES.find(s => s.id === storylineId)
    : selectedTemplate?.storyline;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/penelope/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          templateId,
          storylineId: storylineId || undefined,
          targetLength,
          visualPreset,
          audioStyle
        })
      });

      if (!response.ok) throw new Error("Generation failed");

      const data = await response.json();
      setTreatment(data);
    } catch (error) {
      console.error("Generation error:", error);
      alert("Failed to generate treatment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/20 bg-gradient-to-r from-purple-900/50 to-slate-900/50 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 shadow-lg">
              <Film className="h-8 w-8 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-200">
                Penelope
              </h1>
              <p className="text-sm text-purple-300 font-medium">Cinema-Quality Content Creation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Panel */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl border border-white/20 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                Content Brief
              </h2>

              <div className="space-y-4">
                {/* Prompt */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    What do you want to create?
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A powerful brand manifesto showing how our AI technology transforms businesses from intention to reality..."
                    className="w-full h-32 rounded-xl bg-white/10 border border-white/30 px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                  />
                </div>

                {/* Template Selection */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Content Template
                  </label>
                  <select
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                    className="w-full rounded-xl bg-white/10 border border-white/30 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    {CONTENT_TEMPLATES.map((template) => (
                      <option key={template.id} value={template.id} className="bg-slate-900">
                        {template.name} ({template.category})
                      </option>
                    ))}
                  </select>
                  {selectedTemplate && (
                    <p className="mt-2 text-xs text-white/60">{selectedTemplate.description}</p>
                  )}
                </div>

                {/* Storyline Override */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Storyline (Optional Override)
                  </label>
                  <select
                    value={storylineId}
                    onChange={(e) => setStorylineId(e.target.value)}
                    className="w-full rounded-xl bg-white/10 border border-white/30 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="" className="bg-slate-900">Use template default</option>
                    {CINEMA_STORYLINES.map((storyline) => (
                      <option key={storyline.id} value={storyline.id} className="bg-slate-900">
                        {storyline.title} ({storyline.genre})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Length */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Target Length
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['short', 'medium', 'feature'] as const).map((length) => (
                      <button
                        key={length}
                        onClick={() => setTargetLength(length)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          targetLength === length
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        {length.charAt(0).toUpperCase() + length.slice(1)}
                      </button>
                    ))}
                  </div>
                  {selectedStoryline && (
                    <p className="mt-2 text-xs text-white/60">
                      {selectedStoryline.targetLength[targetLength]}
                    </p>
                  )}
                </div>

                {/* Visual Preset */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Visual Style
                  </label>
                  <select
                    value={visualPreset}
                    onChange={(e) => setVisualPreset(e.target.value)}
                    className="w-full rounded-xl bg-white/10 border border-white/30 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    {Object.keys(VISUAL_PRESETS).map((preset) => (
                      <option key={preset} value={preset} className="bg-slate-900">
                        {preset.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Audio Style */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Audio/Music Style
                  </label>
                  <select
                    value={audioStyle}
                    onChange={(e) => setAudioStyle(e.target.value)}
                    className="w-full rounded-xl bg-white/10 border border-white/30 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    {Object.keys(AUDIO_TEMPLATES).map((style) => (
                      <option key={style} value={style} className="bg-slate-900">
                        {style.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-purple-500/50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      Generate Treatment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="space-y-6">
            {treatment ? (
              <>
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Creative Treatment</h2>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm text-white transition-all">
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                  </div>

                  <div className="prose prose-invert prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-white/90 text-sm leading-relaxed">
                      {treatment.treatment}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl border border-white/20 p-6">
                  <h3 className="text-lg font-bold text-white mb-3">Production Specs</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Template:</span>
                      <span className="text-white font-medium">{treatment.metadata.template}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Storyline:</span>
                      <span className="text-white font-medium">{treatment.metadata.storyline}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Length:</span>
                      <span className="text-white font-medium">{treatment.metadata.targetLength}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Resolution:</span>
                      <span className="text-white font-medium">{treatment.metadata.technicalSpecs.resolution}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Frame Rate:</span>
                      <span className="text-white font-medium">{treatment.metadata.technicalSpecs.frameRate}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl border border-white/20 p-12 text-center">
                <Film className="h-16 w-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/60">
                  Enter your content brief and click Generate to create a cinema-quality treatment
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/20 bg-gradient-to-r from-purple-900/30 to-slate-900/30 backdrop-blur-md mt-12">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="text-center text-xs text-white/70 space-y-2">
            <div className="font-semibold text-white/80">
              © 2025 Bickford Technologies LLC. All Rights Reserved.
            </div>
            <div className="flex items-center justify-center gap-3 text-white/60">
              <span>Penelope Content Engine</span>
              <span>•</span>
              <span>Cinema-Quality Templates</span>
              <span>•</span>
              <span>Professional Storylines</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
