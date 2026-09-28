import { querySnowflake } from "@/lib/snowflake";
import DashboardCharts from "@/components/dashboard-charts";

export const dynamic = "force-dynamic";

export default async function Home() {
  return (
    <main className="container mx-auto p-6 space-y-8 max-w-7xl">
      {/* HEADER */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-500 text-xs font-medium px-3 py-1 rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          EN VIVO — Datos actualizados cada 60s
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
          CredibanCo Intelligence Portal
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Centro de analítica transaccional en tiempo real. Monitoreo de autorizaciones, riesgo, comercios y liquidaciones del ecosistema de pagos.
        </p>
      </div>

      {/* CoWork Button */}
      <div className="text-center">
        <a
          href="https://ai.snowflake.com"
          target="_blank"
          className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
        >
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
          Abrir Snowflake CoWork — Conversar con Agentes IA
        </a>
      </div>

      {/* DASHBOARD CHARTS - Client Component */}
      <DashboardCharts />

      {/* AGENTS CARDS */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Agentes de IA Disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "🤖", title: "Agente Riesgo y Fraude", desc: "Combina datos transaccionales con documentos regulatorios SARLAFT. Detecta patrones de fraude y genera alertas contextualizadas.", tag: "Cortex Agent + RAG", color: "from-orange-500/10 to-red-500/10 border-orange-500/30" },
            { icon: "📊", title: "Agente Transacciones", desc: "NL-to-SQL sobre 200K+ autorizaciones reales. Pregunta en español sobre montos, canales, ciudades y tendencias.", tag: "Cortex Analyst", color: "from-blue-500/10 to-cyan-500/10 border-blue-500/30" },
            { icon: "🛡️", title: "Agente SARLAFT", desc: "Busca en documentos regulatorios de prevención de lavado de activos. Responde sobre procedimientos y normativa.", tag: "Cortex Search RAG", color: "from-red-500/10 to-pink-500/10 border-red-500/30" },
          ].map((card) => (
            <a key={card.title} href="https://ai.snowflake.com" target="_blank"
              className={`rounded-xl border p-6 bg-gradient-to-br ${card.color} hover:scale-[1.02] transition-all cursor-pointer`}>
              <div className="text-4xl mb-3">{card.icon}</div>
              <h3 className="font-semibold text-lg">{card.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{card.desc}</p>
              <span className="inline-block mt-3 text-xs bg-background/50 border px-2 py-0.5 rounded font-medium">{card.tag}</span>
            </a>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center text-xs text-muted-foreground pt-4 border-t">
        CredibanCo Intelligence Portal — RFP 10010806 — Snowflake App Runtime (SPCS) — Sep 2026
        <br />Datos: CREDIBANCO_HOL · 200K+ autorizaciones · 6,888 comercios · 5 ciudades
      </div>
    </main>
  );
}
