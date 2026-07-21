import { Shield, ShieldCheck, ShieldAlert, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface LayerReport {
  status: 'safe' | 'warning' | 'threat';
  details: string;
}

interface SevenLayers {
  layer1: LayerReport;
  layer2: LayerReport;
  layer3: LayerReport;
  layer4: LayerReport;
  layer5: LayerReport;
  layer6: LayerReport;
  layer7: LayerReport;
  layer8?: LayerReport;
}

interface SevenLayerVisualizerProps {
  sevenLayers?: SevenLayers;
  language: string;
  theme: 'light' | 'dark';
}

export function SevenLayerVisualizer({ sevenLayers, language, theme }: SevenLayerVisualizerProps) {
  if (!sevenLayers) return null;

  const isRTL = language === 'Arabic';

  const layerNames: Record<string, string> = {
    layer1: isRTL ? 'الطبقة 1: سمعة النطاق و TLD' : 'L1: Domain & TLD Reputation',
    layer2: isRTL ? 'الطبقة 2: انتحال الماركات' : 'L2: Brand Typosquatting',
    layer3: isRTL ? 'الطبقة 3: بنية الرابط والتشفير' : 'L3: URL Structural Forensics',
    layer4: isRTL ? 'الطبقة 4: التحليل الدلالي (ذكاء اصطناعي)' : 'L4: AI Semantic NLP Intent',
    layer5: isRTL ? 'الطبقة 5: الهندسة الاجتماعية والضغط' : 'L5: Social Urgency & Pressure',
    layer6: isRTL ? 'الطبقة 6: تجاوز التحقق والالتفاف' : 'L6: Anti-Circumvention Rules',
    layer7: isRTL ? 'الطبقة 7: قواعد بيانات التهديدات' : 'L7: Threat Intel Correlation',
    layer8: isRTL ? 'الطبقة 8: ارتباط السلوك المعرفي' : 'L8: Behavior Correlation'
  };

  const getStatusConfig = (status: 'safe' | 'warning' | 'threat') => {
    switch (status) {
      case 'safe':
        return {
          bg: theme === 'dark' 
            ? 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/10 hover:border-emerald-500/30 text-emerald-400' 
            : 'bg-emerald-50 border-emerald-100 hover:border-emerald-300 text-emerald-700',
          dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
          icon: ShieldCheck
        };
      case 'warning':
        return {
          bg: theme === 'dark' 
            ? 'bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/10 hover:border-amber-500/30 text-amber-400' 
            : 'bg-amber-50 border-amber-100 hover:border-amber-300 text-amber-700',
          dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
          icon: Info
        };
      case 'threat':
        return {
          bg: theme === 'dark' 
            ? 'bg-red-500/5 hover:bg-red-500/10 border-red-500/10 hover:border-red-500/30 text-red-400' 
            : 'bg-red-50 border-red-100 hover:border-red-300 text-red-700',
          dot: 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]',
          icon: ShieldAlert
        };
    }
  };

  const hasLayer8 = !!sevenLayers.layer8;

  return (
    <div className={`px-8 py-8 border-t ${theme === 'dark' ? 'border-white/5 bg-[#121417]/30' : 'border-slate-100 bg-slate-50/50'}`}>
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-cyan-400 animate-pulse" />
          <h3 className={`text-xs font-black uppercase tracking-[0.25em] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {isRTL 
              ? (hasLayer8 ? 'درع فحص الطبقات الثماني المتكامل' : 'درع فحص الطبقات السبع المتكامل')
              : (hasLayer8 ? 'AMANOVA 8-Layer Defense Matrix Report' : 'AMANOVA 7-Layer Forensic Scan Report')}
          </h3>
        </div>
        <span className="self-start sm:self-auto text-[10px] font-mono text-cyan-400 uppercase tracking-widest bg-cyan-400/10 border border-cyan-400/20 px-3 py-1 rounded-full">
          {isRTL 
            ? (hasLayer8 ? 'تحليل 8 طبقات نشط' : 'تحليل 7 طبقات نشط')
            : (hasLayer8 ? '8/8 Layers Audited' : '7/7 Layers Audited')}
        </span>
      </div>
      
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 ${hasLayer8 ? 'lg:grid-cols-8' : 'lg:grid-cols-7'} gap-4`}>
        {Object.entries(sevenLayers).map(([key, value], idx) => {
          const config = getStatusConfig(value.status);
          const StatusIcon = config.icon;
          const translatedName = layerNames[key] || key;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between min-h-[140px] ${config.bg}`}
              title={value.details}
            >
              <div>
                <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                  <StatusIcon className="w-4 h-4 opacity-70" />
                </div>
                <h4 className="text-[11px] font-black uppercase tracking-tight leading-tight line-clamp-2">
                  {translatedName}
                </h4>
              </div>
              <p className={`text-[10px] opacity-75 line-clamp-3 leading-relaxed mt-2 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                {value.details}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
