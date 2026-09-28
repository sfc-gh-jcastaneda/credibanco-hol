"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const SEVERITY_COLORS: Record<string,string> = { CRITICA:"#ef4444", ALTA:"#f59e0b", MEDIA:"#3b82f6", BAJA:"#10b981" };
const COLORS = ["#ef4444","#f59e0b","#3b82f6","#10b981","#8b5cf6","#ec4899","#06b6d4","#6366f1"];

function fmt(n: number) { return new Intl.NumberFormat("es-CO").format(n); }

export default function RiesgoPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["riesgo"],
    queryFn: () => fetch("/api/riesgo").then(r => r.json()),
  });

  if (isLoading) return <Loading />;
  if (error) return <Err />;

  const { byTipo, bySeveridad, byCiudad, highRisk, governance } = data;
  const totalAlertas = (bySeveridad as any[]).reduce((s: number, r: any) => s + r.TOTAL, 0);
  const criticas = (bySeveridad as any[]).find((r: any) => r.SEVERIDAD === "CRITICA")?.TOTAL || 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Riesgo & Fraude</h1>
        <p className="text-muted-foreground mt-1">Alertas AML/SARLAFT, patrones de fraude y gobernanza de IA</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Total Alertas" value={fmt(totalAlertas)} color="text-amber-500" />
        <KPI label="Alertas Críticas" value={fmt(criticas)} color="text-red-500" />
        <KPI label="Tipos de Alerta" value={fmt((byTipo as any[]).length)} color="text-blue-500" />
        <KPI label="Ciudades Afectadas" value={fmt((byCiudad as any[]).length)} color="text-purple-500" />
      </div>

      {/* Row 1: Tipo + Severidad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Distribución por Tipo de Alerta">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={byTipo} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tick={{fontSize:10}} />
              <YAxis dataKey="TIPO" type="category" tick={{fontSize:9}} width={160} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Bar dataKey="TOTAL" name="Alertas" fill="#f59e0b" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Severidad de Alertas">
          <div className="flex items-center justify-center gap-6">
            <ResponsiveContainer width="55%" height={280}>
              <PieChart>
                <Pie data={bySeveridad} dataKey="TOTAL" nameKey="SEVERIDAD" cx="50%" cy="50%" innerRadius={55} outerRadius={95}
                  label={({name, value}: any) => `${name}: ${value}`}>
                  {(bySeveridad as any[]).map((e: any, i: number) => <Cell key={i} fill={SEVERITY_COLORS[e.SEVERIDAD] || COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {(bySeveridad as any[]).map((a: any) => (
                <div key={a.SEVERIDAD} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{background: SEVERITY_COLORS[a.SEVERIDAD] || "#888"}} />
                  <span className="text-sm font-medium">{a.SEVERIDAD}</span>
                  <span className="text-sm text-muted-foreground">({a.TOTAL})</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Row 2: City heatmap + High risk merchants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Alertas por Ciudad">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={byCiudad}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="CIUDAD" tick={{fontSize:10}} />
              <YAxis tick={{fontSize:10}} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Bar dataKey="ALERTAS" name="Alertas" fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Comercios de Alto Riesgo (>10% Rechazo)">
          <div className="overflow-x-auto max-h-[340px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card"><tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-3">Comercio</th><th className="pb-2 pr-3">Ciudad</th>
                <th className="pb-2 text-right pr-3">% Rechazo</th><th className="pb-2 text-right">Alertas</th>
              </tr></thead>
              <tbody>
                {(highRisk as any[]).map((r: any, i: number) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-1.5 pr-3 font-medium truncate max-w-[150px]">{r.RAZON_SOCIAL}</td>
                    <td className="py-1.5 pr-3">{r.CIUDAD}</td>
                    <td className="py-1.5 pr-3 text-right">
                      <span className={r.TASA_RECHAZO > 20 ? "text-red-500 font-semibold" : "text-amber-500"}>{r.TASA_RECHAZO}%</span>
                    </td>
                    <td className="py-1.5 text-right">{fmt(r.ALERTAS)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>

      {/* AI Governance */}
      <ChartCard title="🤖 Gobernanza de IA — Registro de Uso de Agentes">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground">
              <th className="pb-2 pr-4">Agente</th><th className="pb-2 pr-4">Modelo LLM</th>
              <th className="pb-2 text-right pr-4">Usos</th><th className="pb-2 text-right pr-4">Tokens Total</th>
              <th className="pb-2 pr-4">Primer Uso</th><th className="pb-2">Último Uso</th>
            </tr></thead>
            <tbody>
              {(governance as any[]).map((r: any, i: number) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 pr-4">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="font-medium">{r.AGENTE}</span>
                    </span>
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs">{r.MODELO_LLM}</td>
                  <td className="py-2 text-right pr-4 font-semibold">{fmt(r.USOS)}</td>
                  <td className="py-2 text-right pr-4">{fmt(r.TOKENS_TOTAL)}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{r.PRIMERA_USO?.slice(0, 10)}</td>
                  <td className="py-2 text-muted-foreground">{r.ULTIMO_USO?.slice(0, 10)}</td>
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
  return <div className="p-6 text-center text-red-500 py-20">Error cargando datos de riesgo</div>;
}
