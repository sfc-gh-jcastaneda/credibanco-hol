import { querySnowflake } from "@/lib/snowflake";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const [topMerchants, byCiudad, approvalByMCC, pareto] = await Promise.all([
    querySnowflake(`SELECT c.RAZON_SOCIAL, c.CIUDAD, c.MCC, SUM(a.MONTO) AS MONTO, COUNT(*) AS TX,
      ROUND(SUM(CASE WHEN a.CODIGO_RESPUESTA='00' THEN 1 ELSE 0 END)::FLOAT/COUNT(*)*100,1) AS TASA_APROB
      FROM CREDIBANCO_HOL.PAGOS.AUTORIZACIONES a JOIN CREDIBANCO_HOL.COMERCIOS.COMERCIOS c ON a.COMERCIO_ID=c.COMERCIO_ID
      GROUP BY c.RAZON_SOCIAL, c.CIUDAD, c.MCC ORDER BY MONTO DESC LIMIT 20`),
    querySnowflake(`SELECT c.CIUDAD, COUNT(DISTINCT c.COMERCIO_ID) AS COMERCIOS, SUM(a.MONTO) AS MONTO
      FROM CREDIBANCO_HOL.COMERCIOS.COMERCIOS c
      LEFT JOIN CREDIBANCO_HOL.PAGOS.AUTORIZACIONES a ON c.COMERCIO_ID=a.COMERCIO_ID AND a.CODIGO_RESPUESTA='00'
      GROUP BY c.CIUDAD ORDER BY COMERCIOS DESC`),
    querySnowflake(`SELECT a.MCC, COUNT(*) AS TOTAL,
      ROUND(SUM(CASE WHEN a.CODIGO_RESPUESTA='00' THEN 1 ELSE 0 END)::FLOAT/COUNT(*)*100,1) AS TASA_APROB
      FROM CREDIBANCO_HOL.PAGOS.AUTORIZACIONES a
      GROUP BY a.MCC ORDER BY TOTAL DESC LIMIT 10`),
    querySnowflake(`SELECT c.RAZON_SOCIAL, SUM(a.MONTO) AS MONTO
      FROM CREDIBANCO_HOL.PAGOS.AUTORIZACIONES a JOIN CREDIBANCO_HOL.COMERCIOS.COMERCIOS c ON a.COMERCIO_ID=c.COMERCIO_ID
      WHERE a.CODIGO_RESPUESTA='00' GROUP BY c.RAZON_SOCIAL ORDER BY MONTO DESC`),
  ]);

  // Compute Pareto cumulative %
  const totalMonto = (pareto as any[]).reduce((s: number, r: any) => s + r.MONTO, 0);
  let cumul = 0;
  const paretoData = (pareto as any[]).map((r: any, i: number) => {
    cumul += r.MONTO;
    return { RANK: i + 1, RAZON_SOCIAL: r.RAZON_SOCIAL, MONTO: r.MONTO, PCT_ACUM: Math.round(cumul / totalMonto * 1000) / 10 };
  });

  return NextResponse.json({ topMerchants, byCiudad, approvalByMCC, paretoData, totalMerchants: paretoData.length });
}
