# Prompt de Validación Integral — CredibanCo HOL V4
# Copiar y pegar completo en CoCo Desktop conectado a la cuenta a validar

Necesito que valides el ambiente pre-poblado de CredibanCo HOL V4 para el RFP 10010806.

## Contexto
- Hay 34 tareas de evaluación (H01-H34) en 9 tracks (T0-T8)
- T5 y T8 los lleva otro equipo — NO validar
- Las tareas están en `/Users/jcastaneda/Downloads/TAREAS_TRACK.xlsx`
- El deck de overview está en `/Users/jcastaneda/Documents/COCO/credibanco/v4/credibanco_overview_deck.html`
- La guía del participante está en `/Users/jcastaneda/Documents/COCO/credibanco/v4/guia_participante.html`
- El reporte de evaluación UX está en `/Users/jcastaneda/Documents/COCO/credibanco/v4/evaluacion_ux_maria_gonzalez.md`
- El análisis de cobertura está en `/Users/jcastaneda/Documents/COCO/credibanco/analisis_cobertura_v4.html`
- El script de validación SQL está en `/Users/jcastaneda/Documents/COCO/credibanco/v4/sql/validate_readiness.sql`
- El script de pre-warm está en `/Users/jcastaneda/Documents/COCO/credibanco/v4/sql/pre_warm.sql`

## Qué hacer

### Fase 1: Validación SQL (ejecutar en la cuenta conectada)
Ejecuta el contenido de `validate_readiness.sql` en la cuenta Snowflake activa. Reporta todos los checks que dan ❌ FAIL.

### Fase 2: Validación de rutas Snowsight
Lee el overview deck HTML y para cada ruta de navegación (los breadcrumb paths como `Catalog > Explorer > CREDIBANCO_HOL`), valida con SQL que los objetos referenciados existen:

1. **Schemas**: `SELECT SCHEMA_NAME FROM CREDIBANCO_HOL.INFORMATION_SCHEMA.SCHEMATA` — validar que existen los 16 schemas
2. **Tables con datos**: Para cada tabla mencionada, `SELECT COUNT(*) FROM <tabla>` — validar > 0 rows
3. **Dynamic Tables**: `SHOW DYNAMIC TABLES IN DATABASE CREDIBANCO_HOL` — validar 5 DTs
4. **Tasks**: `SHOW TASKS IN DATABASE CREDIBANCO_HOL` — validar 5 tasks con state=started
5. **Agents**: `SHOW AGENTS IN DATABASE CREDIBANCO_HOL` — validar 3 agentes
6. **Streamlits**: `SHOW STREAMLITS IN DATABASE CREDIBANCO_HOL` — validar 3 apps
7. **Semantic Views**: `SHOW SEMANTIC VIEWS IN DATABASE CREDIBANCO_HOL` — validar 2 SVs
8. **Cortex Search**: `SHOW CORTEX SEARCH SERVICES IN DATABASE CREDIBANCO_HOL` — validar 2 services
9. **Models**: `SHOW MODELS IN DATABASE CREDIBANCO_HOL` — validar 2 modelos
10. **Tags**: `SHOW TAGS IN DATABASE CREDIBANCO_HOL` — validar >= 8 tags
11. **Masking Policies**: `SHOW MASKING POLICIES IN DATABASE CREDIBANCO_HOL` — validar >= 5
12. **Row Access Policies**: `SHOW ROW ACCESS POLICIES IN DATABASE CREDIBANCO_HOL` — validar >= 2
13. **Shares**: `SHOW SHARES` filtrar OUTBOUND — validar >= 1
14. **Alerts**: `SHOW ALERTS IN DATABASE CREDIBANCO_HOL` — validar >= 3
15. **Resource Monitors**: `SHOW RESOURCE MONITORS` — validar >= 1
16. **Git Repos**: `SHOW GIT REPOSITORIES IN DATABASE CREDIBANCO_HOL` — validar >= 1
17. **dbt Projects**: `SHOW DBT PROJECTS IN DATABASE CREDIBANCO_HOL` — validar >= 1
18. **Iceberg Tables**: `SHOW ICEBERG TABLES IN DATABASE CREDIBANCO_HOL` — validar >= 1
19. **DMF**: `SHOW DATA METRIC FUNCTIONS IN DATABASE CREDIBANCO_HOL` — validar >= 1
20. **Task Run History**: `SELECT * FROM TABLE(INFORMATION_SCHEMA.TASK_HISTORY(SCHEDULED_TIME_RANGE_START => DATEADD('hour', -24, CURRENT_TIMESTAMP()))) LIMIT 5` — validar que hay al menos 1 ejecución

### Fase 3: Validación funcional
Prueba estas 5 funcionalidades clave:
1. **Cortex AI**: `SELECT SNOWFLAKE.CORTEX.AI_COMPLETE('mistral-7b', 'Di hola en español')` — debe retornar texto
2. **Masking**: `USE ROLE CRB_NEGOCIO; SELECT PAN_SINTETICO FROM CREDIBANCO_HOL.CLIENTES.TARJETAHABIENTES LIMIT 1;` — debe mostrar TOKEN-xxx (masked). Luego `USE ROLE ACCOUNTADMIN;` misma query — debe mostrar dato real
3. **DT con datos**: `SELECT COUNT(*) FROM CREDIBANCO_HOL.PAGOS.DT_AUTORIZACIONES_SILVER_USER` — debe ser > 0
4. **Lineage SQL**: `SELECT * FROM TABLE(SNOWFLAKE.CORE.GET_LINEAGE('CREDIBANCO_HOL.PAGOS.AUTORIZACIONES', 'TABLE', 'DOWNSTREAM', 2)) LIMIT 5` — debe mostrar dependencias downstream
5. **Git repo fetch**: `ALTER GIT REPOSITORY CREDIBANCO_HOL.PLATAFORMA.HOL_REPO FETCH` — debe ser exitoso

### Fase 4: Mapeo H-tasks
Lee la evaluación UX (`evaluacion_ux_maria_gonzalez.md`) y para cada task H que tiene verdict FAIL o CONDITIONAL, valida si el fix ya fue aplicado o si persiste el problema. Los fixes aplicados fueron:
- T3 tab agregado al deck (H10, H11, H12) → ya no debería ser FAIL
- Tasks ejecutados al menos 1 vez (H08) → Run History debe tener datos
- H17 vs H18 diferenciados en el deck

### Fase 5: Reporte final
Genera un reporte con formato:
```
✅ CHECK_NAME: OK (detalle)
❌ CHECK_NAME: FAIL (detalle y remediación)
⚠️ CHECK_NAME: WARNING (detalle)
```

Y un resumen: X/Y checks passed, Z warnings, W failures.

Para cada FAIL, sugiere el SQL o acción exacta para remediar.

## Conexiones disponibles
Las cuentas HOL se conectan con: `snow sql -c credibanco-hol` (o credibanco-erflec, credibanco-lmhrlk, etc.)
User: USER, Password: sn0wf@ll, Role: ACCOUNTADMIN

## Importante
- Usa `USE ROLE ACCOUNTADMIN` al inicio de cada bloque SQL
- Usa `USE WAREHOUSE CREDIBANCO_HOL_WH` antes de queries
- NO modifiques ni crees objetos — solo valida que existen
- Si un check falla, reporta el error exacto y la remediación sugerida
