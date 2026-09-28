import { querySnowflake } from "@/lib/snowflake";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const [byResponse, hourly, byMCC, ticketByCiudad, channelMix] = await Promise.all([
    querySnowflake(`SELECT CODIGO_RESPUESTA, COUNT(*) AS TX,
      CASE WHEN CODIGO_RESPUESTA='00' THEN 'Aprobada' ELSE 'Rechazada' END AS ESTADO
      FROM CREDIBANCO_HOL.PAGOS.AUTORIZACIONES GROUP BY CODIGO_RESPUESTA ORDER BY TX DESC LIMIT 10`),
    querySnowflake(`SELECT HOUR(FECHA_HORA) AS HORA, COUNT(*) AS TX
      FROM CREDIBANCO_HOL.PAGOS.AUTORIZACIONES GROUP BY HORA ORDER BY HORA`),
    querySnowflake(`SELECT MCC, COUNT(*) AS TX, SUM(MONTO) AS MONTO, ROUND(AVG(MONTO)) AS TICKET
      FROM CREDIBANCO_HOL.PAGOS.AUTORIZACIONES WHERE CODIGO_RESPUESTA='00'
      GROUP BY MCC ORDER BY TX DESC LIMIT 12`),
    querySnowflake(`SELECT CIUDAD, ROUND(AVG(MONTO)) AS TICKET_PROM, COUNT(*) AS TX
      FROM CREDIBANCO_HOL.PAGOS.AUTORIZACIONES WHERE CODIGO_RESPUESTA='00'
      GROUP BY CIUDAD ORDER BY TICKET_PROM DESC`),
    querySnowflake(`SELECT DATE(FECHA_HORA) AS FECHA, CANAL, COUNT(*) AS TX
      FROM CREDIBANCO_HOL.PAGOS.AUTORIZACIONES GROUP BY FECHA, CANAL ORDER BY FECHA`),
  ]);

  // Pivot channel mix for area chart
  const channelMap = new Map<string, Record<string, number>>();
  const channels = new Set<string>();
  for (const r of channelMix as any[]) {
    channels.add(r.CANAL);
    if (!channelMap.has(r.FECHA)) channelMap.set(r.FECHA, {});
    channelMap.get(r.FECHA)![r.CANAL] = r.TX;
  }
  const channelTrend = Array.from(channelMap.entries()).map(([fecha, vals]) => ({
    FECHA: fecha, ...vals,
  }));

  return NextResponse.json({
    byResponse, hourly, byMCC, ticketByCiudad, channelTrend,
    channels: Array.from(channels),
  });
}
