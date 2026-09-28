"use client";

import { useQuery } from "@tanstack/react-query";
import { Bot, Shield, BarChart3, ExternalLink } from "lucide-react";

function fmt(n: number) { return new Intl.NumberFormat("es-CO").format(n); }

const AGENTS = [
  {
    icon: Bot,
    title: "Agente Riesgo y Fraude",
    desc: "Combina datos transaccionales con documentos regulatorios SARLAFT. Detecta patrones de fraude y genera alertas contextualizadas.",
    tag: "Cortex Agent + RAG",
    color: "from-orange-500/10 to-red-500/10 border-orange-500/30",
    iconColor: "text-orange-500",
    questions: [
      "¿Cuáles son los comercios con más alertas críticas?",
      "Resumen de alertas SARLAFT del último mes",
      "¿Qué patrones de fraude se detectaron?",
    ],
  },
  {
    icon: BarChart3,
    title: "Agente Transacciones",
    desc: "NL-to-SQL sobre 200K+ autorizaciones reales. Pregunta en español sobre montos, canales, ciudades y tendencias.",
    tag: "Cortex Analyst",
    color: "from-blue-500/10 to-cyan-500/10 border-blue-500/30",
    iconColor: "text-blue-500",
    questions: [
      "¿Cuál es el ticket promedio en Bogotá?",
      "Top 5 comercios por volumen transaccional",
      "Tendencia semanal de rechazos por canal",
    ],
  },
  {
    icon: Shield,
    title: "Agente SARLAFT",
    desc: "Busca en documentos regulatorios de prevención de lavado de activos. Responde sobre procedimientos y normativa.",
    tag: "Cortex Search RAG",
    color: "from-red-500/10 to-pink-500/10 border-red-500/30",
    iconColor: "text-red-500",
    questions: [
      "¿Qué es un ROS y cuándo se debe reportar?",
      "Procedimiento de debida diligencia SARLAFT",
      "Umbrales de reporte a la UIAF",
    ],
  },
];

export default function AgentesPage() {
  const { data: governance } = useQuery({
    queryKey: ["riesgo"],
    queryFn: () => fetch("/api/riesgo").then(r => r.json()),
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Agentes de IA</h1>
        <p className="text-muted-foreground mt-1">Asistentes inteligentes conectados a Snowflake CoWork para analítica conversacional</p>
      </div>

      {/* CoWork CTA */}
      <div className="rounded-xl border bg-gradient-to-r from-blue-600/10 to-purple-600/10 p-6 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold">Snowflake CoWork</h2>
          <p className="text-muted-foreground mt-1">Conversa con los agentes de IA en lenguaje natural. Accede a datos, documentos y analítica desde una interfaz unificada.</p>
        </div>
        <a href="https://ai.snowflake.com" target="_blank"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform shadow-lg">
          <ExternalLink size={18} /> Abrir CoWork
        </a>
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {AGENTS.map((agent) => {
          const Icon = agent.icon;
          return (
            <div key={agent.title} className={`rounded-xl border p-6 bg-gradient-to-br ${agent.color} flex flex-col`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-card border ${agent.iconColor}`}><Icon size={24} /></div>
                <div>
                  <h3 className="font-semibold">{agent.title}</h3>
                  <span className="text-xs bg-background/50 border px-2 py-0.5 rounded font-medium">{agent.tag}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{agent.desc}</p>
              <div className="mt-auto space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Preguntas ejemplo:</p>
                {agent.questions.map((q) => (
                  <div key={q} className="text-xs p-2 rounded bg-card/50 border border-border/50 italic">&ldquo;{q}&rdquo;</div>
                ))}
              </div>
              <a href="https://ai.snowflake.com" target="_blank"
                className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-card transition-colors">
                <ExternalLink size={14} /> Conversar
              </a>
            </div>
          );
        })}
      </div>

      {/* AI Governance from riesgo API */}
      {governance?.governance && (
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold text-lg mb-4">📋 Registro de Gobernanza IA</h3>
          <p className="text-sm text-muted-foreground mb-4">Cada interacción con los agentes queda registrada en <code className="text-xs bg-muted px-1.5 py-0.5 rounded">GOBIERNO.REGISTRO_USO_IA</code> para auditoría y cumplimiento.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-4">Agente</th><th className="pb-2 pr-4">Modelo</th>
                <th className="pb-2 text-right pr-4">Interacciones</th><th className="pb-2 text-right pr-4">Tokens</th>
                <th className="pb-2">Último Uso</th>
              </tr></thead>
              <tbody>
                {(governance.governance as any[]).map((r: any, i: number) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 pr-4 font-medium">{r.AGENTE}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{r.MODELO_LLM}</td>
                    <td className="py-2 text-right pr-4 font-semibold">{fmt(r.USOS)}</td>
                    <td className="py-2 text-right pr-4">{fmt(r.TOKENS_TOTAL)}</td>
                    <td className="py-2 text-muted-foreground">{r.ULTIMO_USO?.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Model Registry Info */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-semibold text-lg mb-4">🧠 Registro de Modelos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border p-4 bg-gradient-to-br from-blue-500/5 to-transparent">
            <div className="text-sm font-semibold">Modelo de Scoring de Fraude</div>
            <div className="text-xs text-muted-foreground mt-1">XGBoost · Entrenado en autorizaciones históricas</div>
            <div className="flex gap-2 mt-2">
              <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded">v2 — DEFAULT</span>
              <span className="text-xs bg-muted px-2 py-0.5 rounded">v1 — Archivado</span>
            </div>
          </div>
          <div className="rounded-lg border p-4 bg-gradient-to-br from-purple-500/5 to-transparent">
            <div className="text-sm font-semibold">Modelo de Clasificación SARLAFT</div>
            <div className="text-xs text-muted-foreground mt-1">LightGBM · Clasificación de riesgo AML</div>
            <div className="flex gap-2 mt-2">
              <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded">v1 — DEFAULT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
