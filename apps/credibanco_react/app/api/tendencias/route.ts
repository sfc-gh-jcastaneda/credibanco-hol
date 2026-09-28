import { querySnowflake } from "@/lib/snowflake";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const [dailyTrend, weekComparison, channelTrend] = await Promise.all([
    querySnowflake(`SELECT DATE(FECHA_HORA) AS FECHA, COUNT(*) AS TX, SUM(MONTO) AS MONTO,
      SUM(CASE WHEN CODIGO_RESPUESTA='00' THEN 1 ELSE 0 END) AS APROBADAS,
      SUM(CASE WHEN CODIGO_RESPUESTA!='00' THEN 1 ELSE 0 END) AS RECHAZADAS,
      ROUND(AVG(MONTO)) AS TICKET_PROM
      FROM CREDIBANCO_HOL.PAGOS.AUTORIZACIONES GROUP BY FECHA ORDER BY FECHA`),
    querySnowflake(`SELECT DAYOFWEEK(FECHA_HORA) AS DIA_SEM, DAYNAME(FECHA_HORA) AS DIA_NOMBRE,
      COUNT(*) AS TX, ROUND(AVG(MONTO)) AS TICKET_PROM
      FROM CREDIBANCO_HOL.PAGOS.AUTORIZACIONES GROUP BY DIA_SEM, DIA_NOMBRE ORDER BY DIA_SEM`),
    querySnowflake(`SELECT DATE(FECHA_HORA) AS FECHA, CANAL, COUNT(*) AS TX
      FROM CREDIBANCO_HOL.PAGOS.AUTORIZACIONES GROUP BY FECHA, CANAL ORDER BY FECHA`),
  ]);

  // 7-day moving average
  const trend = (dailyTrend as any[]).map((r: any, i: number, arr: any[]) => {
    const window = arr.slice(Math.max(0, i - 6), i + 1);
    const ma7 = Math.round(window.reduce((s: number, w: any) => s + w.TX, 0) / window.length);
    return { ...r, MA7: ma7 };
  });

  // Pivot channel trend
  const channelMap = new Map<string, Record<string, number>>();
  const channels = new Set<string>();
  for (const r of channelTrend as any[]) {
    channels.add(r.CANAL);
    if (!channelMap.has(r.FECHA)) channelMap.set(r.FECHA, {});
    channelMap.get(r.FECHA)![r.CANAL] = r.TX;
  }
  const channelSeries = Array.from(channelMap.entries()).map(([fecha, vals]) => ({ FECHA: fecha, ...vals }));

  return NextResponse.json({ dailyTrend: trend, weekComparison, channelSeries, channels: Array.from(channels) });
}
