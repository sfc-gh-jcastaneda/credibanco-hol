"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, ComposedChart, Area,
} from "recharts";

const COLORS = ["#3b82f6","#8b5cf6","#06b6d4","#10b981","#f59e0b","#ef4444","#ec4899","#6366f1"];

function fmt(n: number) { return new Intl.NumberFormat("es-CO").format(n); }
function fmtCOP(n: number) { return "$" + new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(n); }

export default function ComerciosPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["comercios"],
    queryFn: () => fetch("/api/comercios").then(r => r.json()),
  });

  if (isLoading) return <Loading />;
  if (error) return <Err />;

  const { topMerchants, byCiudad, approvalByMCC, paretoData, totalMerchants } = data;

  // Find the 80% mark for Pareto
  const idx80 = (paretoData as any[]).findIndex((r: any) => r.PCT_ACUM >= 80);
  const top20pct = Math.round(totalMerchants * 0.2);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Comercios</h1>
        <p className="text-muted-foreground mt-1">Rendimiento, distribución y concentración del ecosistema de afiliados</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Total Comercios" value={fmt(totalMerchants)} color="text-blue-500" />
        <KPI label="Ciudades" value={fmt((byCiudad as any[]).length)} color="text-purple-500" />
        <KPI label="Top 20% genera" value={idx80 >= 0 ? `${(paretoData as any[])[Math.min(idx80, top20pct)]?.PCT_ACUM ?? '>80'}%` : ">80%"} color="text-amber-500" />
        <KPI label="Top Merchant" value={(topMerchants as any[])[0]?.RAZON_SOCIAL?.slice(0, 20) || "—"} color="text-emerald-500" />
      </div>

      {/* Row 1: Top merchants + distribution by city */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Top 20 Comercios por Ingreso">
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={topMerchants} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tick={{fontSize:10}} tickFormatter={(v: number) => fmtCOP(v/1e6)+"M"} />
              <YAxis dataKey="RAZON_SOCIAL" type="category" tick={{fontSize:9}} width={130} />
              <Tooltip formatter={(v: number) => fmtCOP(v)} />
              <Bar dataKey="MONTO" name="Monto COP" fill="#3b82f6" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Comercios por Ciudad">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={byCiudad} dataKey="COMERCIOS" nameKey="CIUDAD" cx="50%" cy="50%" outerRadius={100}
                label={({name, percent}: any) => `${name} ${(percent*100).toFixed(0)}%`}>
                {(byCiudad as any[]).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-muted-foreground text-left">
                <th className="pb-2">Ciudad</th><th className="pb-2 text-right">Comercios</th><th className="pb-2 text-right">Monto</th>
              </tr></thead>
              <tbody>
                {(byCiudad as any[]).map((r: any) => (
                  <tr key={r.CIUDAD} className="border-b border-border/50">
                    <td className="py-1.5">{r.CIUDAD}</td>
                    <td className="py-1.5 text-right">{fmt(r.COMERCIOS)}</td>
                    <td className="py-1.5 text-right">{fmtCOP(r.MONTO)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>

      {/* Row 2: Approval by MCC + Pareto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Tasa Aprobación por Categoría MCC">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={approvalByMCC}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="MCC" tick={{fontSize:10}} />
              <YAxis tick={{fontSize:10}} domain={[0, 100]} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Bar dataKey="TASA_APROB" name="% Aprobación" fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Concentración Pareto (Acumulado %)">
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={(paretoData as any[]).slice(0, 50)}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="RANK" tick={{fontSize:10}} label={{value:"Rank Comercio", position:"insideBottom", offset:-5, fontSize:11}} />
              <YAxis tick={{fontSize:10}} domain={[0, 100]} />
              <Tooltip formatter={(v: number, name: string) => name === "% Acumulado" ? `${v}%` : fmtCOP(v)} />
              <Legend />
              <Area type="monotone" dataKey="PCT_ACUM" name="% Acumulado" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
              <Line type="monotone" dataKey="PCT_ACUM" name="Curva Pareto" stroke="#f59e0b" dot={false} strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top Merchants Table */}
      <ChartCard title="Detalle Top 20 Comercios">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground">
              <th className="pb-2 pr-4">Comercio</th><th className="pb-2 pr-4">Ciudad</th><th className="pb-2 pr-4">MCC</th>
              <th className="pb-2 pr-4 text-right">Monto</th><th className="pb-2 pr-4 text-right">TX</th><th className="pb-2 text-right">% Aprob.</th>
            </tr></thead>
            <tbody>
              {(topMerchants as any[]).map((r: any, i: number) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium">{r.RAZON_SOCIAL}</td>
                  <td className="py-2 pr-4">{r.CIUDAD}</td>
                  <td className="py-2 pr-4 font-mono text-xs">{r.MCC}</td>
                  <td className="py-2 pr-4 text-right">{fmtCOP(r.MONTO)}</td>
                  <td className="py-2 pr-4 text-right">{fmt(r.TX)}</td>
                  <td className="py-2 text-right">
                    <span className={r.TASA_APROB >= 90 ? "text-emerald-500" : r.TASA_APROB >= 80 ? "text-amber-500" : "text-red-500"}>
                      {r.TASA_APROB}%
                    </span>
                  </td>
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
  return <div className="p-6 text-center text-red-500 py-20">Error cargando datos de comercios</div>;
}
