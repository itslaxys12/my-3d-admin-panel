import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  Monitor,
  Eye,
  Camera,
  Layers,
  Palette,
  Check,
  Save,
  RotateCcw,
} from 'lucide-react';
import GlassCard from '../components/UI/GlassCard';
import AnimatedButton from '../components/UI/AnimatedButton';

export function Settings({ quality, updateQuality, bloomEnabled, setBloomEnabled }) {
  const [activeTheme, setActiveTheme] = useState('cyan');
  const [fov, setFov] = useState(60);
  const [antialiasing, setAntialiasing] = useState(true);
  const [shadows, setShadows] = useState(true);
  const [audioFeedback, setAudioFeedback] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const themes = [
    { id: 'cyan', name: 'Cyan Cyberpunk', color: '#00f0ff', border: 'border-cyan-400' },
    { id: 'purple', name: 'Neon Synthwave', color: '#a855f7', border: 'border-purple-400' },
    { id: 'pink', name: 'Hyper Magenta', color: '#ff007f', border: 'border-pink-400' },
    { id: 'green', name: 'Matrix Emerald', color: '#00ff9d', border: 'border-emerald-400' },
  ];

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/70 border border-cyan-500/20 backdrop-blur-xl">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-heading">System & 3D Render Settings</h2>
          <p className="text-xs text-slate-400 mt-0.5">Customize WebGL shaders, visual fidelity, camera controls, and interface themes</p>
        </div>

        <div className="flex items-center gap-3">
          <AnimatedButton
            variant="secondary"
            size="sm"
            icon={RotateCcw}
            onClick={() => {
              updateQuality('low');
              setBloomEnabled(false);
              setFov(60);
            }}
          >
            Reset Defaults
          </AnimatedButton>

          <AnimatedButton
            variant="primary"
            size="sm"
            triggerConfetti={true}
            icon={Save}
            onClick={handleSave}
          >
            {savedSuccess ? 'Settings Applied!' : 'Save Changes'}
          </AnimatedButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3D Graphics Quality & Post-Processing */}
        <GlassCard
          title="3D Render Fidelity"
          subtitle="Adjust GPU rendering workload and shader effects"
          icon={Monitor}
          glowColor="cyan"
        >
          <div className="space-y-5 pt-2">
            {/* Quality Preset Buttons */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Graphics Quality Preset</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'low', label: 'Low (Battery)', desc: '800 Particles • No Bloom' },
                  { id: 'medium', label: 'Balanced', desc: '1800 Particles • Standard' },
                  { id: 'high', label: 'Ultra (60 FPS)', desc: '3500 Particles • Max FX' },
                ].map((q) => (
                  <button
                    key={q.id}
                    onClick={() => updateQuality(q.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      quality === q.id
                        ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-200">{q.label}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{q.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="space-y-3 border-t border-slate-800/80 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-200">Volumetric Bloom & Glow</span>
                  <p className="text-[11px] text-slate-400">Post-processing neon glow on high-energy materials</p>
                </div>
                <button
                  onClick={() => setBloomEnabled(!bloomEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                    bloomEnabled ? 'bg-cyan-500 shadow-[0_0_10px_#00f0ff]' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                      bloomEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-200">FXAA Anti-Aliasing</span>
                  <p className="text-[11px] text-slate-400">Smooth polygon edges and reduce geometric jaggies</p>
                </div>
                <button
                  onClick={() => setAntialiasing(!antialiasing)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                    antialiasing ? 'bg-cyan-500 shadow-[0_0_10px_#00f0ff]' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                      antialiasing ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-200">Dynamic Shadows & Reflections</span>
                  <p className="text-[11px] text-slate-400">Real-time soft shadow mapping for 3D viewports</p>
                </div>
                <button
                  onClick={() => setShadows(!shadows)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                    shadows ? 'bg-cyan-500 shadow-[0_0_10px_#00f0ff]' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                      shadows ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* 3D Camera Controls & Interface Theme */}
        <div className="space-y-6">
          {/* Camera Configuration */}
          <GlassCard
            title="3D Camera & Viewport Controls"
            subtitle="Configure perspective and orbit sensitivity"
            icon={Camera}
            glowColor="purple"
          >
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-200">Field of View (FOV): {fov}°</span>
                  <span className="font-mono text-purple-400">{fov < 50 ? 'Narrow' : fov > 75 ? 'Wide-Angle' : 'Standard'}</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="90"
                  value={fov}
                  onChange={(e) => setFov(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div>
                  <span className="text-xs font-semibold text-slate-200">Audio Feedback & Clicks</span>
                  <p className="text-[11px] text-slate-400">Subtle futuristic sound effects on UI interaction</p>
                </div>
                <button
                  onClick={() => setAudioFeedback(!audioFeedback)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                    audioFeedback ? 'bg-purple-500 shadow-[0_0_10px_#a855f7]' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                      audioFeedback ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Theme Color Selector */}
          <GlassCard
            title="Cyber Theme Palette"
            subtitle="Global accent gradients and neon highlights"
            icon={Palette}
            glowColor="pink"
          >
            <div className="grid grid-cols-2 gap-3 pt-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTheme(t.id)}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    activeTheme === t.id
                      ? `bg-slate-900 ${t.border} shadow-lg`
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: t.color }}
                    />
                    <span className="text-xs font-semibold text-slate-200">{t.name}</span>
                  </div>
                  {activeTheme === t.id && <Check className="w-4 h-4 text-cyan-400" />}
                </button>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export default Settings;
