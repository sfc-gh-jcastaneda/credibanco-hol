SELECT
    COMERCIO_ID,
    COUNT(*) AS total_transacciones,
    SUM(MONTO) AS monto_total,
    AVG(MONTO) AS ticket_promedio,
    COUNT(DISTINCT CIUDAD) AS ciudades_activas,
    MIN(FECHA_HORA) AS primera_transaccion,
    MAX(FECHA_HORA) AS ultima_transaccion
FROM {{ ref('stg_autorizaciones_aprobadas') }}
GROUP BY COMERCIO_ID
