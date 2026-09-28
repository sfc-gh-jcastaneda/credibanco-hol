"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, Legend,
} from "recharts";

const COLORS = ["#3b82f6","#8b5cf6","#06b6d4","#10b981","#f59e0b","#ef4444","#ec4899"];

function fmt(n: number) { return new Intl.NumberFormat("es-CO").format(n); }
function fmtCOP(n: number) { return "$" + new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(n); }

export default function TendenciasPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["tendencias"],
    queryFn: () => fetch("/api/tendencias").then(r => r.json()),
  });

  if (isLoading) return <Loading />;
  if (error) return <Err />;

  const { dailyTrend, weekComparison, channelSeries, channels } = data;

  const totalTx = (dailyTrend as any[]).reduce((s: number, r: any) => s + r.TX, 0);
  const avgDaily = Math.round(totalTx / (dailyTrend as any[]).length);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Tendencias</h1>
        <p className="text-muted-foreground mt-1">Series de tiempo, promedios móviles y análisis comparativo</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Días Analizados" value={fmt((dailyTrend as any[]).length)} color="text-blue-500" />
        <KPI label="Total Transacciones" value={fmt(totalTx)} color="text-purple-500" />
        <KPI label="Promedio Diario" value={fmt(avgDaily)} color="text-emerald-500" />
        <KPI label="Canales" value={fmt(channels.length)} color="text-cyan-500" />
      </div>

      {/* Main trend chart */}
      <ChartCard title="Tendencia Diaria con Media Móvil (7 días)">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={dailyTrend}>
            <defs>
              <linearGradient id="gradTxT" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="FECHA" tick={{fontSize:10}} tickFormatter={(v: string) => v?.slice(5,10)} />
            <YAxis tick={{fontSize:10}} />
            <Tooltip formatter={(v: number) => fmt(v)} labelFormatter={(l: string) => l?.slice(0,10)} />
            <Legend />
            <Area type="monotone" dataKey="TX" name="Transacciones" stroke="#3b82f6" fill="url(#gradTxT)" />
            <Line type="monotone" dataKey="MA7" name="Media Móvil 7d" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 3" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Row 2: Approved vs Rejected + Ticket trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Aprobadas vs Rechazadas (Diario)">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyTrend}>
              <defs>
                <linearGradient id="gradAp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gradRe" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="FECHA" tick={{fontSize:10}} tickFormatter={(v: string) => v?.slice(5,10)} />
              <YAxis tick={{fontSize:10}} />
              <Tooltip formatter={(v: number) => fmt(v)} labelFormatter={(l: string) => l?.slice(0,10)} />
              <Legend />
              <Area type="monotone" dataKey="APROBADAS" name="Aprobadas" stroke="#10b981" fill="url(#gradAp)" />
              <Area type="monotone" dataKey="RECHAZADAS" name="Rechazadas" stroke="#ef4444" fill="url(#gradRe)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Ticket Promedio Diario (COP)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="FECHA" tick={{fontSize:10}} tickFormatter={(v: string) => v?.slice(5,10)} />
              <YAxis tick={{fontSize:10}} tickFormatter={(v: number) => fmtCOP(v/1000)+"K"} />
              <Tooltip formatter={(v: number) => fmtCOP(v)} labelFormatter={(l: string) => l?.slice(0,10)} />
              <Line type="monotone" dataKey="TICKET_PROM" name="Ticket Prom." stroke="#8b5cf6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3: Weekly comparison + Channel trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Volumen por Día de la Semana">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weekComparison}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="DIA_NOMBRE" tick={{fontSize:11}} />
              <YAxis tick={{fontSize:10}} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Legend />
              <Bar dataKey="TX" name="Transacciones" fill="#3b82f6" radius={[4,4,0,0]} />
              <Bar dataKey="TICKET_PROM" name="Ticket Prom." fill="#06b6d4" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tendencia por Canal">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={channelSeries}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="FECHA" tick={{fontSize:10}} tickFormatter={(v: string) => v?.slice(5,10)} />
              <YAxis tick={{fontSize:10}} />
              <Tooltip labelFormatter={(l: string) => l?.slice(0,10)} />
              <Legend />
              {channels.map((ch: string, i: number) => (
                <Line key={ch} type="monotone" dataKey={ch} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Daily data table */}
      <ChartCard title="Datos Diarios (Últimos 30 días)">
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card"><tr className="border-b text-left text-muted-foreground">
              <th className="pb-2 pr-4">Fecha</th><th className="pb-2 text-right pr-4">TX</th>
              <th className="pb-2 text-right pr-4">Aprobadas</th><th className="pb-2 text-right pr-4">Rechazadas</th>
              <th className="pb-2 text-right pr-4">Monto</th><th className="pb-2 text-right">MA7</th>
            </tr></thead>
            <tbody>
              {(dailyTrend as any[]).slice().reverse().map((r: any) => (
                <tr key={r.FECHA} className="border-b border-border/50">
                  <td className="py-1.5 pr-4 font-mono text-xs">{r.FECHA?.slice(0, 10)}</td>
                  <td className="py-1.5 text-right pr-4 font-semibold">{fmt(r.TX)}</td>
                  <td className="py-1.5 text-right pr-4 text-emerald-500">{fmt(r.APROBADAS)}</td>
                  <td className="py-1.5 text-right pr-4 text-red-500">{fmt(r.RECHAZADAS)}</td>
                  <td className="py-1.5 text-right pr-4">{fmtCOP(r.MONTO)}</td>
                  <td className="py-1.5 text-right text-amber-500">{fmt(r.MA7)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-xl border bg-card p-5"><h3 className="font-semibold text-lg mb-4">{title}</h3>{children}</div>;
}
function KPI({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 text-center">
      <div className={`text-2xl md:text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">{label}</div>
    </div>
  );
}
function Loading() {
  return <div className="p-6 space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />)}</div>;
}
function Err() {
  return <div className="p-6 text-center text-red-500 py-20">Error cargando datos de tendencias</div>;
}
