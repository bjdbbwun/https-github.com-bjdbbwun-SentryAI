import { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ShieldAlert, ShieldCheck, Shield, AlertTriangle, TrendingUp, TrendingDown, Info } from 'lucide-react';

interface HistoryDashboardChartProps {
  history: any[];
  language: string;
  theme: 'light' | 'dark';
}

export function HistoryDashboardChart({ history, language, theme }: HistoryDashboardChartProps) {
  const isRTL = language === 'Arabic';

  // Group history items by the last 7 days
  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    // Generate the last 7 days from 6 days ago up to today
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);
      
      const dayIdx = d.getDay();
      const label = isRTL ? daysAr[dayIdx] : daysEn[dayIdx];
      const dateStr = d.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { month: 'numeric', day: 'numeric' });
      
      data.push({
        date: d,
        name: `${label} (${dateStr})`,
        shortLabel: label,
        High: 0,
        Medium: 0,
        Low: 0,
      });
    }
    
    // Fill counting distribution from history logs
    history.forEach((item: any) => {
      const itemDate = new Date(item.timestamp);
      const matchedDay = data.find(day => {
        return itemDate.getDate() === day.date.getDate() &&
               itemDate.getMonth() === day.date.getMonth() &&
               itemDate.getFullYear() === day.date.getFullYear();
      });
      
      if (matchedDay) {
        if (item.risk === 'High') matchedDay.High += 1;
        else if (item.risk === 'Medium') matchedDay.Medium += 1;
        else if (item.risk === 'Low') matchedDay.Low += 1;
      }
    });
    
    return data;
  }, [history, isRTL]);

  // Calculate high-level summary metrics
  const metrics = useMemo(() => {
    let totalScans = history.length;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;

    history.forEach((item: any) => {
      if (item.risk === 'High') highCount++;
      else if (item.risk === 'Medium') mediumCount++;
      else if (item.risk === 'Low') lowCount++;
    });

    const hasCriticalThreats = highCount > 0;
    
    let statusText = '';
    let statusColor = '';
    let statusBg = '';

    if (totalScans === 0) {
      statusText = isRTL ? 'خامل' : 'Idle';
      statusColor = 'text-slate-400';
      statusBg = theme === 'dark' ? 'bg-slate-500/10 border-slate-500/20' : 'bg-slate-100 border-slate-200 text-slate-700';
    } else if (hasCriticalThreats) {
      statusText = isRTL ? 'يتطلب اتخاذ إجراء' : 'Action Required';
      statusColor = 'text-red-500';
      statusBg = theme === 'dark' ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-100 text-red-700';
    } else if (mediumCount > 0) {
      statusText = isRTL ? 'تحذير نشط' : 'Active Warning';
      statusColor = 'text-amber-500';
      statusBg = theme === 'dark' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-100 text-amber-700';
    } else {
      statusText = isRTL ? 'محمي تماماً' : 'Fully Protected';
      statusColor = 'text-emerald-500';
      statusBg = theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100 text-emerald-700';
    }

    return {
      totalScans,
      highCount,
      mediumCount,
      lowCount,
      statusText,
      statusColor,
      statusBg,
    };
  }, [history, isRTL, theme]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-4 rounded-2xl border shadow-xl ${
          theme === 'dark' 
            ? 'bg-[#121417]/95 border-white/10 text-white' 
            : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <p className={`text-xs font-mono ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'} uppercase tracking-widest mb-2`}>{label}</p>
          <div className="space-y-1.5 text-xs font-bold">
            {payload.map((entry: any) => (
              <div key={entry.name} className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className={theme === 'dark' ? 'text-white/70' : 'text-slate-600'}>
                    {entry.name === 'High' && (isRTL ? 'تهديدات عالية الخطورة' : 'High Threat')}
                    {entry.name === 'Medium' && (isRTL ? 'تهديدات متوسطة الخطورة' : 'Medium Threat')}
                    {entry.name === 'Low' && (isRTL ? 'محتوى آمن / خطورة منخفضة' : 'Low / Safe Content')}
                  </span>
                </span>
                <span className="font-mono text-cyan-400 font-extrabold">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const hasData = metrics.totalScans > 0;

  return (
    <div className={`p-6 md:p-8 rounded-3xl border ${
      theme === 'dark' 
        ? 'bg-[#0E1012] border-white/10' 
        : 'bg-white border-slate-200 shadow-sm'
    } space-y-6`}>
      
      {/* Header Info */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 ${
        theme === 'dark' ? 'border-white/5' : 'border-slate-100'
      }`}>
        <div className="space-y-1">
          <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} uppercase tracking-[0.2em] block`}>
            {isRTL ? 'إحصائيات المراقبة السيبرانية' : 'Cyber Monitoring Analytics'}
          </span>
          <h3 className={`text-lg font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {isRTL ? 'تقرير توزيع مستويات الخطورة (7 أيام)' : '7-Day Threat Distribution Report'}
          </h3>
        </div>

        <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border font-black text-xs uppercase tracking-wider ${metrics.statusBg}`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            metrics.highCount > 0 ? 'bg-red-500' : metrics.mediumCount > 0 ? 'bg-amber-500' : metrics.totalScans > 0 ? 'bg-emerald-500' : 'bg-slate-400'
          }`} />
          <span>{isRTL ? 'حالة الأمان: ' : 'Security Status: '}</span>
          <span className={metrics.statusColor}>{metrics.statusText}</span>
        </div>
      </div>

      {/* Grid containing Metrics & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* KPI Mini Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className={`p-4 rounded-2xl border ${
            theme === 'dark' ? 'bg-white/[0.01] border-white/5' : 'bg-slate-50 border-slate-100'
          }`}>
            <span className={`text-[9px] font-mono ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} uppercase tracking-widest block mb-1`}>
              {isRTL ? 'إجمالي الفحوصات' : 'Total Audited Scans'}
            </span>
            <span className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'} tracking-tight`}>
              {metrics.totalScans}
            </span>
          </div>

          <div className={`p-4 rounded-2xl border ${
            theme === 'dark' ? 'bg-red-500/5 border-red-500/10 text-red-400' : 'bg-red-50/50 border-red-100 text-red-700'
          } flex items-center justify-between`}>
            <div>
              <span className={`text-[9px] font-mono uppercase tracking-widest block mb-1 ${theme === 'dark' ? 'text-red-400/50' : 'text-red-500/60'}`}>
                {isRTL ? 'تهديدات عالية' : 'High Threats'}
              </span>
              <span className="text-xl font-black tracking-tight">{metrics.highCount}</span>
            </div>
            <ShieldAlert className="w-5 h-5 opacity-40 shrink-0" />
          </div>

          <div className={`p-4 rounded-2xl border ${
            theme === 'dark' ? 'bg-amber-500/5 border-amber-500/10 text-amber-400' : 'bg-amber-50/50 border-amber-100 text-amber-700'
          } flex items-center justify-between`}>
            <div>
              <span className={`text-[9px] font-mono uppercase tracking-widest block mb-1 ${theme === 'dark' ? 'text-amber-400/50' : 'text-amber-500/60'}`}>
                {isRTL ? 'تهديدات متوسطة' : 'Medium Alerts'}
              </span>
              <span className="text-xl font-black tracking-tight">{metrics.mediumCount}</span>
            </div>
            <Info className="w-5 h-5 opacity-40 shrink-0" />
          </div>

          <div className={`p-4 rounded-2xl border ${
            theme === 'dark' ? 'bg-cyan-500/5 border-cyan-500/10 text-cyan-400' : 'bg-cyan-50/50 border-cyan-100 text-cyan-700'
          } flex items-center justify-between`}>
            <div>
              <span className={`text-[9px] font-mono uppercase tracking-widest block mb-1 ${theme === 'dark' ? 'text-cyan-400/50' : 'text-cyan-500/60'}`}>
                {isRTL ? 'آمن / منخفض' : 'Safe / Low Risk'}
              </span>
              <span className="text-xl font-black tracking-tight">{metrics.lowCount}</span>
            </div>
            <ShieldCheck className="w-5 h-5 opacity-40 shrink-0" />
          </div>
        </div>

        {/* Bar Chart Panel */}
        <div className="lg:col-span-3 flex flex-col justify-center">
          {hasData ? (
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  barGap={4}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    vertical={false}
                    stroke={theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0'} 
                  />
                  <XAxis 
                    dataKey="shortLabel" 
                    tickLine={false}
                    axisLine={false}
                    stroke={theme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : '#64748b'}
                    tick={{ fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' }}
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    stroke={theme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : '#64748b'}
                    tick={{ fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' }}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }} 
                  />
                  <Bar 
                    dataKey="High" 
                    name="High" 
                    fill="#ef4444" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="Medium" 
                    name="Medium" 
                    fill="#f59e0b" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="Low" 
                    name="Low" 
                    fill="#22d3ee" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className={`h-[240px] w-full border-2 border-dashed ${
              theme === 'dark' ? 'border-white/5 bg-white/[0.01]' : 'border-slate-200 bg-slate-50/50'
            } rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-3`}>
              <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
                <Shield className={`w-6 h-6 ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'}`} />
              </div>
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-white/60' : 'text-slate-700'}`}>
                  {isRTL ? 'بانتظار تشغيل عمليات الفحص' : 'Pending Threat Analysis Scan'}
                </p>
                <p className={`text-[10px] ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} mt-1`}>
                  {isRTL 
                    ? 'ستظهر هنا إحصاءات الخطورة بمجرد البدء في فحص الرسائل والنصوص.' 
                    : 'Analyze any suspicious email or SMS to populate daily safety telemetry diagnostics.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
