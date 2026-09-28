"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#10b981","#3b82f6","#f59e0b","#ef4444","#8b5cf6","#ec4899"];
const STATUS_COLORS: Record<string,string> = {
  LIQUIDADO:"#10b981", PENDIENTE:"#f59e0b", EN_PROCESO:"#3b82f6", RECHAZADO:"#ef4444",
};

function fmt(n: number) { return new Intl.NumberFormat("es-CO").format(n); }
function fmtCOP(n: number) { return "$" + new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(n); }

export default function LiquidacionesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["liquidaciones"],
    queryFn: () => fetch("/api/liquidaciones").then(r => r.json()),
  });

  if (isLoading) return <Loading />;
  if (error) return <Err />;

  const { byEstado, byMerchant, authVsSettle, avgTime } = data;
  const totalLiq = (byEstado as any[]).reduce((s: number, r: any) => s + r.TOTAL, 0);
  const totalMonto = (byEstado as any[]).reduce((s: number, r: any) => s + r.MONTO, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Liquidaciones</h1>
        <p className="text-muted-foreground mt-1">Estado de liquidaciones, montos por comercio y tiempos de procesamiento</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Total Liquidaciones" value={fmt(totalLiq)} color="text-blue-500" />
        <KPI label="Monto Total" value={fmtCOP(totalMonto)} color="text-emerald-500" />
        <KPI label="Estados" value={fmt((byEstado as any[]).length)} color="text-purple-500" />
        <KPI label="Comercios" value={fmt((byMerchant as any[]).length)} color="text-cyan-500" />
      </div>

      {/* Row 1: Status distribution + by merchant */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Distribución por Estado">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={byEstado} dataKey="TOTAL" nameKey="ESTADO" cx="50%" cy="50%" outerRadius={100}
                label={({name, percent}: any) => `${name} ${(percent*100).toFixed(0)}%`}>
                {(byEstado as any[]).map((e: any, i: number) => <Cell key={i} fill={STATUS_COLORS[e.ESTADO] || COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(byEstado as any[]).map((r: any) => (
              <div key={r.ESTADO} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{background: STATUS_COLORS[r.ESTADO] || "#888"}} />
                <span>{r.ESTADO}:</span>
                <span className="font-medium">{fmt(r.TOTAL)}</span>
                <span className="text-muted-foreground text-xs">({fmtCOP(r.MONTO)})</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Top 15 Comercios por Monto Liquidado">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={byMerchant} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tick={{fontSize:10}} tickFormatter={(v: number) => fmtCOP(v/1e6)+"M"} />
              <YAxis dataKey="RAZON_SOCIAL" type="category" tick={{fontSize:9}} width={130} />
              <Tooltip formatter={(v: number) => fmtCOP(v)} />
              <Bar dataKey="MONTO_LIQ" name="Monto Liquidado" fill="#10b981" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2: Auth vs Settle + Avg time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Autorización vs Liquidación por Comercio">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={authVsSettle}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="RAZON_SOCIAL" tick={{fontSize:8, angle:-25}} height={80} interval={0} />
              <YAxis tick={{fontSize:10}} tickFormatter={(v: number) => fmtCOP(v/1e6)+"M"} />
              <Tooltip formatter={(v: number) => fmtCOP(v)} />
              <Legend />
              <Bar dataKey="MONTO_AUTH" name="Autorizado" fill="#3b82f6" radius={[4,4,0,0]} />
              <Bar dataKey="MONTO_LIQ" name="Liquidado" fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tiempo Promedio por Estado (días)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={avgTime}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="ESTADO" tick={{fontSize:11}} />
              <YAxis tick={{fontSize:10}} />
              <Tooltip formatter={(v: number) => `${v} días`} />
              <Bar dataKey="DIAS_PROM" name="Días Promedio" fill="#8b5cf6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground">
                <th className="pb-2">Estado</th><th className="pb-2 text-right">Días Prom.</th><th className="pb-2 text-right">Total</th>
              </tr></thead>
              <tbody>
                {(avgTime as any[]).map((r: any) => (
                  <tr key={r.ESTADO} className="border-b border-border/50">
                    <td className="py-1.5">{r.ESTADO}</td>
                    <td className="py-1.5 text-right font-semibold">{r.DIAS_PROM}</td>
                    <td className="py-1.5 text-right">{fmt(r.TOTAL)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
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
  return <div className="p-6 text-center text-red-500 py-20">Error cargando datos de liquidaciones</div>;
}
