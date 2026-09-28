# Openflow Kafka — Consumer Groups por Cuenta
## Instrucciones para actualizar Topic y Consumer Group ID

**Importante:** Los consumer groups deben ser distintos por cuenta para que cada una consuma independientemente del mismo cluster MSK.

### Configuración Kafka MSK
- **Bootstrap servers:** `b-{1,2,3}-public.credibancoholmsk.vwiygz.c2.kafka.us-east-1.amazonaws.com:9196`
- **SASL user:** `credibanco_demo`
- **Security protocol:** SASL_SSL

---

### Asignación por Cuenta

| # | Cuenta | Conexión | Kafka Topic | Consumer Group ID |
|---|--------|----------|-------------|-------------------|
| 1 | LEDZYD (JuanPa) | credibanco-hol | `credibanco-hol-demo` | `hol-demo-cuenta1` |
| 2 | ERFLEC | credibanco-erflec | `credibanco-hol-demo-1` | `hol-demo-cuenta2` |
| 3 | LMHRLK (Millán) | credibanco-lmhrlk | `credibanco-hol-demo-2` | `hol-demo-cuenta3` |
| 4 | TGDHMK | credibanco-tgdhmk | `credibanco-hol-demo-3` | `hol-demo-cuenta4` |
| 5 | DWCAGR | credibanco-dwcagr | `credibanco-hol-demo-4` | `hol-demo-cuenta5` |
| 6 | FEZWLC (Mario) | credibanco-fezwlc | `credibanco-hol-demo-5` | `hol-demo-cuenta6` |

**Nota:** xmfvmb, zbbalw y acnlgf NO tienen Openflow configurado.

---

### Pasos para actualizar (por cuenta)

1. **Login** en Snowsight con USER / sn0wf@ll
2. Cambiar rol a **OPENFLOW_ADMIN_RL**:
   - Click en nombre de usuario (esquina inferior izquierda) → Switch Role → OPENFLOW_ADMIN_RL
3. Ir a **Ingestion > Openflow**
4. Abrir el **flow** del runtime Kafka (CRB_HOL_DEPLOYMENT / KAFKA_RUNTIME)
5. **Detener** el procesador ConsumeKafka (click derecho → Stop)
6. **Editar** el procesador ConsumeKafka (click derecho → Configure):
   - **Topic Name(s):** cambiar al topic asignado según la tabla
   - **Group ID:** cambiar al consumer group asignado según la tabla
7. **Aplicar** los cambios
8. **Iniciar** el procesador (click derecho → Start)
9. **Verificar** que los datos fluyen: revisar la tabla `CREDIBANCO_HOL.STREAMING_DEMO.KAFKA_EVENTOS_STREAMING`
10. **Restaurar rol:** cambiar de vuelta a ACCOUNTADMIN

### Verificación SQL (después de actualizar)
```sql
-- Verificar datos recientes
SELECT COUNT(*) AS TOTAL, MAX(INGESTED_AT) AS ULTIMO
FROM CREDIBANCO_HOL.STREAMING_DEMO.KAFKA_EVENTOS_STREAMING
WHERE INGESTED_AT > DATEADD('minute', -5, CURRENT_TIMESTAMP());
```
