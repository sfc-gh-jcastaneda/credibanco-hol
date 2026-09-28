"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, Legend } from "recharts";

const COLORS = ["#3b82f6","#8b5cf6","#06b6d4","#10b981","#f59e0b","#ef4444","#ec4899","#6366f1"];
const SEVERITY_COLORS: Record<string,string> = { CRITICA:"#ef4444", ALTA:"#f59e0b", MEDIA:"#3b82f6", BAJA:"#10b981" };

function fmt(n: number) { return new Intl.NumberFormat("es-CO").format(n); }
function fmtCOP(n: number) { return "$" + new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(n); }

export default function DashboardCharts() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => fetch("/api/analytics").then(r => r.json()),
    refetchInterval: 60000,
  });

  if (isLoading) return <div className="text-center py-20 text-muted-foreground">Cargando analítica en tiempo real...</div>;
  if (error) return <div className="text-center py-20 text-red-500">Error cargando datos</div>;

  const { kpis, porCanal, porCiudad, tendenciaDiaria, tasaRechazo, topComerciosMonto, alertasSeveridad, modelosFraude } = data;

  const tasaAprobacion = kpis.TOTAL_AUT > 0 ? ((kpis.APROBADAS / kpis.TOTAL_AUT) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-8">
      {/* KPI GRID */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Autorizaciones", value: fmt(kpis.TOTAL_AUT), sub: `${fmt(kpis.APROBADAS)} aprobadas`, color: "text-blue-500" },
          { label: "Tasa Aprobación", value: `${tasaAprobacion}%`, sub: "código 00", color: "text-emerald-500" },
          { label: "Monto Autorizado", value: fmtCOP(kpis.MONTO_TOTAL), sub: "COP total aprobado", color: "text-purple-500" },
          { label: "Ticket Promedio", value: fmtCOP(kpis.TICKET_PROM), sub: "por transacción", color: "text-cyan-500" },
          { label: "Alertas de Riesgo", value: fmt(kpis.ALERTAS), sub: `${kpis.ALERTAS_CRITICAS} críticas`, color: kpis.ALERTAS_CRITICAS > 0 ? "text-red-500" : "text-amber-500" },
        ].map(k => (
          <div key={k.label} className="rounded-xl border bg-card p-4 text-center hover:shadow-md transition-shadow">
            <div className={`text-2xl md:text-3xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">{k.label}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ROW 2: Liquidaciones */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-indigo-500">{fmt(kpis.COMERCIOS)}</div>
          <div className="text-xs text-muted-foreground uppercase">Comercios Afiliados</div>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-teal-500">{kpis.CIUDADES}</div>
          <div className="text-xs text-muted-foreground uppercase">Ciudades</div>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-orange-500">{fmt(kpis.LIQUIDACIONES)}</div>
          <div className="text-xs text-muted-foreground uppercase">Liquidaciones</div>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-pink-500">{fmtCOP(kpis.MONTO_LIQUIDADO)}</div>
          <div className="text-xs text-muted-foreground uppercase">Monto Liquidado</div>
        </div>
      </div>

      {/* CHARTS ROW 1: Tendencia + Canal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold text-lg mb-4">Tendencia Diaria de Transacciones</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={tendenciaDiaria}>
              <defs>
                <linearGradient id="gradTx" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gradRech" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="FECHA" tick={{fontSize:10}} tickFormatter={(v:string)=>v?.slice(5,10)} />
              <YAxis tick={{fontSize:10}} />
              <Tooltip formatter={(v:number)=>fmt(v)} labelFormatter={(l:string)=>l?.slice(0,10)} />
              <Legend />
              <Area type="monotone" dataKey="TX" name="Transacciones" stroke="#3b82f6" fill="url(#gradTx)" />
              <Area type="monotone" dataKey="RECHAZADAS" name="Rechazadas" stroke="#ef4444" fill="url(#gradRech)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold text-lg mb-4">Distribución por Canal</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={porCanal} dataKey="TX" nameKey="CANAL" cx="50%" cy="50%" outerRadius={100} label={({name,percent}:{name:string,percent:number})=>`${name} ${(percent*100).toFixed(0)}%`}>
                {porCanal.map((_:any,i:number)=>(<Cell key={i} fill={COLORS[i%COLORS.length]}/>))}
              </Pie>
              <Tooltip formatter={(v:number)=>fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHARTS ROW 2: Ciudad + Rechazo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold text-lg mb-4">Volumen por Ciudad (Aprobadas)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={porCiudad} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tick={{fontSize:10}} tickFormatter={(v:number)=>fmt(v)} />
              <YAxis dataKey="CIUDAD" type="category" tick={{fontSize:11}} width={100} />
              <Tooltip formatter={(v:number)=>fmt(v)} />
              <Bar dataKey="TX" name="Transacciones" fill="#8b5cf6" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold text-lg mb-4">Tasa de Rechazo por Ciudad (%)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tasaRechazo} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tick={{fontSize:10}} domain={[0,'auto']} />
              <YAxis dataKey="CIUDAD" type="category" tick={{fontSize:11}} width={100} />
              <Tooltip formatter={(v:number)=>`${v}%`} />
              <Bar dataKey="TASA_RECHAZO" name="% Rechazo" fill="#ef4444" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHARTS ROW 3: Top Comercios + Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold text-lg mb-4">Top 10 Comercios por Monto</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={topComerciosMonto}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="RAZON_SOCIAL" tick={{fontSize:8,angle:-35}} height={80} interval={0} />
              <YAxis tick={{fontSize:10}} tickFormatter={(v:number)=>fmtCOP(v/1e6)+"M"} />
              <Tooltip formatter={(v:number)=>fmtCOP(v)} />
              <Bar dataKey="MONTO_TOTAL" name="Monto COP" fill="#06b6d4" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold text-lg mb-4">Alertas por Severidad</h3>
          <div className="flex items-center justify-center gap-8">
            <ResponsiveContainer width="50%" height={250}>
              <PieChart>
                <Pie data={alertasSeveridad} dataKey="TOTAL" nameKey="SEVERIDAD" cx="50%" cy="50%" innerRadius={50} outerRadius={90} label={({name,value}:{name:string,value:number})=>`${name}: ${value}`}>
                  {alertasSeveridad.map((entry:any,i:number)=>(<Cell key={i} fill={SEVERITY_COLORS[entry.SEVERIDAD]||COLORS[i]}/>))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {alertasSeveridad.map((a:any)=>(
                <div key={a.SEVERIDAD} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{background:SEVERITY_COLORS[a.SEVERIDAD]||"#888"}} />
                  <span className="text-sm font-medium">{a.SEVERIDAD}</span>
                  <span className="text-sm text-muted-foreground">({a.TOTAL})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS ROW 4: Tipos de alerta + Ticket por canal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold text-lg mb-4">Tipos de Alerta AML/Fraude</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={modelosFraude}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="TIPO_ALERTA" tick={{fontSize:8,angle:-20}} height={60} interval={0} />
              <YAxis tick={{fontSize:10}} />
              <Tooltip />
              <Bar dataKey="TOTAL" name="Alertas" fill="#f59e0b" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold text-lg mb-4">Ticket Promedio por Canal (COP)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={porCanal}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="CANAL" tick={{fontSize:11}} />
              <YAxis tick={{fontSize:10}} tickFormatter={(v:number)=>fmtCOP(v/1000)+"K"} />
              <Tooltip formatter={(v:number)=>fmtCOP(v)} />
              <Bar dataKey="TICKET" name="Ticket Prom." fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* INSIGHTS */}
      <div className="rounded-xl border bg-gradient-to-br from-blue-500/5 to-purple-500/5 p-6">
        <h3 className="font-semibold text-lg mb-3">🔍 Insights Automáticos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-card border">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>Tasa de aprobación del <strong>{tasaAprobacion}%</strong> — {Number(tasaAprobacion) > 90 ? "excelente rendimiento operativo" : "oportunidad de mejora en autorización"}</span>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-card border">
            <span className="text-amber-500 font-bold">⚠</span>
            <span><strong>{kpis.ALERTAS_CRITICAS}</strong> alertas críticas de riesgo activas — requieren atención inmediata del equipo SARLAFT</span>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-card border">
            <span className="text-blue-500 font-bold">📊</span>
            <span>Ticket promedio de <strong>{fmtCOP(kpis.TICKET_PROM)}</strong> COP — {Number(kpis.TICKET_PROM) > 500000 ? "alto valor por transacción" : "volumen de micropagos dominante"}</span>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-card border">
            <span className="text-purple-500 font-bold">💰</span>
            <span><strong>{fmt(kpis.LIQUIDACIONES)}</strong> liquidaciones procesadas por <strong>{fmtCOP(kpis.MONTO_LIQUIDADO)}</strong> COP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
