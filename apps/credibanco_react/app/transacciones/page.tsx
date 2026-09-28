"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from "recharts";

const COLORS = ["#3b82f6","#8b5cf6","#06b6d4","#10b981","#f59e0b","#ef4444","#ec4899","#6366f1"];

function fmt(n: number) { return new Intl.NumberFormat("es-CO").format(n); }
function fmtCOP(n: number) { return "$" + new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(n); }

export default function TransaccionesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["transacciones"],
    queryFn: () => fetch("/api/transacciones").then(r => r.json()),
  });

  if (isLoading) return <Loading />;
  if (error) return <Err />;

  const { byResponse, hourly, byMCC, ticketByCiudad, channelTrend, channels } = data;

  const approved = (byResponse as any[]).filter((r: any) => r.ESTADO === "Aprobada");
  const rejected = (byResponse as any[]).filter((r: any) => r.ESTADO === "Rechazada");
  const totalApproved = approved.reduce((s: number, r: any) => s + r.TX, 0);
  const totalRejected = rejected.reduce((s: number, r: any) => s + r.TX, 0);
  const pieData = [
    { name: "Aprobadas", value: totalApproved },
    { name: "Rechazadas", value: totalRejected },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Transacciones</h1>
        <p className="text-muted-foreground mt-1">Análisis detallado de autorizaciones, canales y categorías</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Total Transacciones" value={fmt(totalApproved + totalRejected)} color="text-blue-500" />
        <KPI label="Aprobadas" value={fmt(totalApproved)} color="text-emerald-500" />
        <KPI label="Rechazadas" value={fmt(totalRejected)} color="text-red-500" />
        <KPI label="Tasa Aprobación" value={`${((totalApproved / (totalApproved + totalRejected)) * 100).toFixed(1)}%`} color="text-purple-500" />
      </div>

      {/* Row 1: Approval pie + Hourly volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Distribución Aprobadas vs Rechazadas">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}
                label={({name, percent}: any) => `${name} ${(percent*100).toFixed(0)}%`}>
                <Cell fill="#10b981" /><Cell fill="#ef4444" />
              </Pie>
              <Tooltip formatter={(v: number) => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Volumen por Hora del Día">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={hourly}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="HORA" tick={{fontSize:11}} />
              <YAxis tick={{fontSize:10}} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Bar dataKey="TX" name="Transacciones" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2: MCC + Ticket by city */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Top Categorías MCC por Volumen">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={byMCC} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tick={{fontSize:10}} tickFormatter={(v: number) => fmt(v)} />
              <YAxis dataKey="MCC" type="category" tick={{fontSize:10}} width={60} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Bar dataKey="TX" name="Transacciones" fill="#8b5cf6" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Ticket Promedio por Ciudad (COP)">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={ticketByCiudad}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="CIUDAD" tick={{fontSize:10}} />
              <YAxis tick={{fontSize:10}} tickFormatter={(v: number) => fmtCOP(v/1000)+"K"} />
              <Tooltip formatter={(v: number) => fmtCOP(v)} />
              <Bar dataKey="TICKET_PROM" name="Ticket Prom." fill="#06b6d4" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3: Channel mix trend */}
      <ChartCard title="Tendencia de Canales (Mix Diario)">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={channelTrend}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="FECHA" tick={{fontSize:10}} tickFormatter={(v: string) => v?.slice(5,10)} />
            <YAxis tick={{fontSize:10}} />
            <Tooltip labelFormatter={(l: string) => l?.slice(0,10)} />
            <Legend />
            {channels.map((ch: string, i: number) => (
              <Area key={ch} type="monotone" dataKey={ch} stackId="1" stroke={COLORS[i%COLORS.length]} fill={COLORS[i%COLORS.length]} fillOpacity={0.4} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Response code detail table */}
      <ChartCard title="Detalle por Código de Respuesta">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground">
              <th className="pb-2 pr-4">Código</th><th className="pb-2 pr-4">Estado</th><th className="pb-2 text-right">Transacciones</th>
            </tr></thead>
            <tbody>
              {(byResponse as any[]).map((r: any) => (
                <tr key={r.CODIGO_RESPUESTA} className="border-b border-border/50">
                  <td className="py-2 pr-4 font-mono">{r.CODIGO_RESPUESTA}</td>
                  <td className="py-2 pr-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${r.ESTADO === "Aprobada" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                      {r.ESTADO}
                    </span>
                  </td>
                  <td className="py-2 text-right">{fmt(r.TX)}</td>
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
  return <div className="p-6 text-center text-red-500 py-20">Error cargando datos de transacciones</div>;
}
