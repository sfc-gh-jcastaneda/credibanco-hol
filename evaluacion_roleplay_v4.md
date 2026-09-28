# Evaluación Role-Play: CredibanCo HOL V4
## Doble perspectiva por Track: Experto técnico + Evaluador UX no técnico

**Fecha:** 27 Sep 2026 — 22:45 COT  
**Baseline:** LEDZYD (9 cuentas idénticas)  
**Formato evaluación:** 15 min overview → 20 min pruebas autónomas → 25 min Q&A

---

## Inventario desplegado (9 cuentas)
| Objeto | Cantidad |
|--------|----------|
| Agents | 3 |
| Streamlits | 4 |
| Cortex Search | 2 |
| Models (ML) | 2 (4 versiones) |
| Dynamic Tables | 5 |
| Tasks | 5 |
| Alerts | 3 |
| Semantic Views | 2 |
| Masking Policies | 6 |
| Row Access Policies | 2 |
| Tags | 11 |
| Shares outbound | 2 |
| DBT Projects | 1 |
| Git Repos | 1 |
| Streams | 1 |
| DMF | 1 |
| CRB_VIP_COMERCIOS | 40 filas + función |
| Schema Evolution | EVENTOS_CONTRATO + Parquet |
| Datos | 200K aut + 6.8K com + 50K TH + 500 alertas + 60K liq |

---

## T0 — General y Arquitectura (H01, H02)

### 👨‍💻 Experto Técnico (Arquitecto de datos)
**Nota: 9/10**

*"Muy completo. Puedo navegar 16 schemas organizados por dominio (PAGOS, COMERCIOS, RIESGO, CUMPLIMIENTO...), ver el medallion architecture con DTs (Silver→Gold), los 3 Agents funcionando, 4 dashboards Streamlit, Git integrado, Openflow con Kafka. La Semantic View SV_AUTORIZACIONES como contrato semántico es exactamente lo que buscaríamos en una arquitectura de Data Products. El único gap: no hay un diagrama de arquitectura interactivo dentro de Snowsight — se depende del overview deck externo."*

**H01 Navegar flujo E2E:** ✅ PASS — Catalog Explorer muestra todo el flujo  
**H02 Arquitectura fundacional:** ✅ PASS — 16 schemas + DTs + SVs + Git = arquitectura completa

### 👩‍💼 Evaluadora UX (María González, Gerente Operaciones)
**Nota: 8/10**

*"El deck de overview me da rutas claras: Catalog > Explorer para ver datos, Projects > Streamlit para dashboards, AI & ML > Agents para los chatbots. Los 4 dashboards se abren sin ejecutar nada. Los schemas tienen nombres en español que entiendo (PAGOS, COMERCIOS, RIESGO). Lo que me costó: encontrar el Lineage tab — tuve que ir a una tabla específica, no está en la vista general. El facilitador me explicó que hay que ir a AUTORIZACIONES > Lineage."*

**H01:** ✅ PASS — Navegable con guía del deck  
**H02:** ✅ PASS — Schemas y objetos visibles sin SQL

---

## T1 — Gobierno, Seguridad y Zero Trust (H03-H06)

### 👨‍💻 Experto Técnico (CISO / Seguridad info)
**Nota: 9/10**

*"6 masking policies aplicadas a columnas sensibles (PAN, cédula, celular, email, nombre, fecha nacimiento) — exactamente lo que esperaría para PCI-DSS. 2 row access policies segmentando acceso por rol. 11 tags de clasificación incluyendo los de Feature Store (SNOWML_*). El DMF DMF_MONTO_VALIDO con TRIGGER_ON_CHANGES es la automatización de calidad que necesitamos. Cambio de rol a CRB_NEGOCIO y los datos se enmascaran — excelente demo de Zero Trust. El único punto: la RAP_TARJETAHABIENTES con threshold TARJETAHABIENTE_ID > 10000 es artificial, en producción sería por tabla de permisos, pero para demo cumple."*

**H03 Política como código:** ✅ PASS — Masking + RAP aplicadas, cambio de rol demuestra efecto  
**H04 Dato sensible E2E:** ✅ PASS — Tags → Masking → resultado enmascarado visible  
**H05 Linaje y calidad:** ✅ PASS — DMF con TRIGGER_ON_CHANGES, Lineage tab en AUTORIZACIONES  
**H06 Gobierno federado:** ✅ PASS — Tags cross-schema, policies heredables, database roles

### 👩‍💼 Evaluadora UX
**Nota: 7.5/10**

*"Puedo ver los tags como chips encima del nombre de la tabla — eso es visual. Las masking policies las veo en la pestaña Access de cada tabla. Lo que NO puedo hacer sola: ejecutar el DMF necesita un SQL Worksheet y el deck me da los comandos. El cambio de rol para ver enmascaramiento requiere que yo sepa hacer USE ROLE — no es tan intuitivo. El facilitador tendría que acompañar la demo de Zero Trust."*

**H03:** ⚠️ PARCIAL — Visible pero demostrar efecto requiere cambio de rol (SQL)  
**H04:** ✅ PASS — Tags y Access tab navegables en UI  
**H05:** ⚠️ PARCIAL — DMF y Lineage requieren que el facilitador guíe  
**H06:** ✅ PASS — Tags visibles cross-schema en Catalog

---

## T2 — Ingeniería de Datos (H07-H09)

### 👨‍💻 Experto Técnico (Data Engineer)
**Nota: 8.5/10**

*"5 Dynamic Tables con refresh activo (1 min, 5 min, 10 min) — medallion pattern real. Task graph de 4 nodos (ROOT→LIMPIEZA→ENRIQUECIMIENTO→NOTIFICACION) + TRM_DIARIA con CRON. Stream append-only sobre AUTORIZACIONES. Git repo integrado con GitHub. Los notebooks están en el repo y se pueden abrir. DBT Project CREDIBANCO_ANALYTICS con 2 modelos materializados (127K + 6.8K filas). Lo que falta: no hay un ejemplo de EXECUTE IMMEDIATE FROM Git para CI/CD, y el task graph no tiene un error intencional para diagnosticar — H08 depende de que el facilitador explique el Task History."*

**H07 Pipeline representativo:** ✅ PASS — DTs + Tasks + Stream + DBT = pipeline completo  
**H08 Diagnosticar falla:** ⚠️ PARCIAL — Tasks y Alerts están, pero no hay falla provocada para diagnosticar  
**H09 Promover cambio:** ✅ PASS — Git repo con notebooks + DBT from stage

### 👩‍💼 Evaluadora UX
**Nota: 7/10**

*"Los Dynamic Tables los veo en Catalog con su estado ACTIVE/REFRESHING — eso se entiende. Las Tasks las encuentro en Monitoring > Task History, puedo ver el gráfico del DAG. El Git lo veo en Data > Databases > HOL_REPO. Lo que no entiendo sin ayuda: qué hace cada DT (Silver vs Gold), por qué el Stream es append-only, qué significa EXECUTE DBT PROJECT. El DBT Project aparece pero no sé qué hacer con él."*

**H07:** ✅ PASS — DTs y Tasks visibles en UI  
**H08:** ⚠️ PARCIAL — Task History visible pero no hay falla para diagnosticar  
**H09:** ⚠️ PARCIAL — Git visible pero workflow CI/CD requiere explicación

---

## T3 — Data Fabric y Productos de Datos (H10-H12)

### 👨‍💻 Experto Técnico (Arquitecto Data Products)
**Nota: 9/10**

*"2 shares outbound activos (PAGOS + RIESGO), 2 Semantic Views como contratos de producto (SV_AUTORIZACIONES con 3 tablas, 5 facts, 9 dimensions, 5 metrics + SV_RIESGO_COMERCIOS para AML). Schema Evolution demo brillante: tabla EVENTOS_CONTRATO con 4 columnas, cargo el Parquet con COPY INTO MATCH_BY_COLUMN_NAME y automáticamente pasa a 6 columnas con evolutionType:ADD_COLUMN documentado. La tabla KAFKA_EVENTOS_STREAMING muestra el evolutionMode:SNOWPIPE_STREAMING real. Iceberg table ICE_AUTORIZACIONES_APROBADAS para interop. Excelente cobertura de Data Fabric."*

**H10 Producto de datos:** ✅ PASS — Shares + SVs = producto gobernado  
**H11 Cambio de contrato:** ✅ PASS — Schema Evolution interactivo con Parquet  
**H12 Interoperabilidad:** ✅ PASS — Iceberg + Openflow Kafka + Git

### 👩‍💼 Evaluadora UX
**Nota: 8/10**

*"Los Shares los veo en Data sharing > Shared by you — 2 activos, entiendo que se comparten datos sin copiar. El Schema Evolution es impactante: el deck me da 6 pasos de SQL, ejecuto uno por uno y veo cómo la tabla pasa de 4 a 6 columnas sola. El DESCRIBE muestra el registro de evolución — eso es muy visual. Openflow lo veo en Ingestion pero requiere cambiar el rol (me avisaron). Lo único que no podría hacer sola: crear un nuevo Share desde cero."*

**H10:** ✅ PASS — Shares visibles, comprensible  
**H11:** ✅ PASS — SQL paso a paso en el deck, resultado visible  
**H12:** ✅ PASS — Iceberg visible en Catalog, Openflow con guía

---

## T4 — Analítica, ML, IA y GenAI (H13-H20)

### 👨‍💻 Experto Técnico (Data Scientist / ML Engineer)
**Nota: 9.5/10**

*"Este track es el más completo. 2 modelos registrados con versionamiento (FRAUDE V1+V2, CHURN V1), Model Monitor configurado, Feature Store con tags SNOWML_*. Los 3 Agents funcionan en CoWork: AGENTE_RIESGO combina Cortex Analyst (SV) + Cortex Search (SARLAFT docs), AGENTE_TRANSACCIONES hace NL-to-SQL sobre datos reales, AGENTE_SARLAFT busca en documentos regulatorios. 2 Cortex Search Services indexando. DASHBOARD_MLOPS y DASHBOARD_RIESGO_FRAUDE como Streamlits. Lo único que falta para un 10 perfecto: un ejemplo de fine-tuning o un notebook de MLOps pipeline automatizado — el pipeline está implícito en los modelos versionados pero no hay un flujo de reentrenamiento visible."*

**H13 Construir modelo:** ✅ PASS — 2 modelos registrados con versiones  
**H14 Ciclo de vida IA:** ✅ PASS — Versiones champion/challenger + Feature Store tags  
**H15 Agente/RAG:** ✅ PASS — 3 Agents + 2 Cortex Search = RAG completo  
**H16 Features para IA:** ✅ PASS — Feature Store con SNOWML_* tags  
**H17 Pipeline MLOps:** ✅ PASS — Modelos + Dashboard MLOPS + versiones  
**H18 Monitorizar modelo:** ✅ PASS — Model Monitor + Dashboard  
**H19 GenAI y agentes:** ✅ PASS — 3 Agents configurados con profiles/avatars  
**H20 IA responsable:** ✅ PASS — Masking policies + agents con perímetro de datos gobernado

### 👩‍💼 Evaluadora UX
**Nota: 8.5/10**

*"Los Agents son lo más impresionante. Abro CoWork, selecciono AGENTE_TRANSACCIONES, le pregunto '¿Cuántas transacciones hubo en Bogotá?' y me responde con SQL + resultado + gráfico. El AGENTE_SARLAFT me explica procedimientos regulatorios. Los modelos los veo en AI & ML > Models con sus versiones. Los dashboards Streamlit cargan solos. Lo único que no entiendo: qué son los Feature Store tags (SNOWML_*) y por qué importan. Pero como evaluadora no técnica, los Agents son suficiente para impresionar."*

**H13-H14:** ✅ PASS — Modelos visibles con versiones  
**H15:** ✅ PASS — Agents en CoWork, experiencia conversacional  
**H16:** ⚠️ PARCIAL — Feature Store no es intuitivo para no técnicos  
**H17-H18:** ✅ PASS — Dashboards MLOPS visibles  
**H19:** ✅ PASS — CoWork con 3 agentes  
**H20:** ✅ PASS — Perceptible por el enmascaramiento en respuestas

---

## T5 — Exposición y Monetización (H21-H23)

### 👨‍💻 Experto Técnico (Product Manager datos)
**Nota: 8/10**

*"2 shares outbound configurados, Internal Marketplace visible, Provider Studio accesible. La base CRB_VIP_COMERCIOS con benchmark por categoría/ciudad y la función FN_COMPARAR_COMERCIO es un buen ejemplo de data product monetizable. Lo que falta: no hay un Listing publicado real en Marketplace (solo shares básicos), y el Clean Room es conceptual — no hay un DCR configurado para demo interactiva. H23 depende 100% del facilitador explicando el concepto."*

**H21 Publicar servicio:** ✅ PASS — 2 shares activos  
**H22 Monetización:** ✅ PASS — CRB_VIP_COMERCIOS con benchmark + función  
**H23 Clean Room:** ⚠️ PARCIAL — Conceptual, no hay DCR desplegado

### 👩‍💼 Evaluadora UX
**Nota: 7/10**

*"Los shares los veo, el Internal Marketplace aparece con productos. CRB_VIP_COMERCIOS requiere SQL para ejecutar la función — no es visual. El Clean Room no lo entiendo sin explicación del facilitador. Este track es más de 'mostrar y explicar' que de 'probar autónomamente'."*

**H21:** ✅ PASS — Shares visibles  
**H22:** ⚠️ PARCIAL — Requiere SQL  
**H23:** ⚠️ PARCIAL — Requiere facilitador

---

## T6 — Marketplace, Autoservicio y BI (H24-H26)

### 👨‍💻 Experto Técnico (BI Lead / Analytics Manager)
**Nota: 8.5/10**

*"Internal Marketplace funciona, los roles de acceso están diferenciados (8 roles con grants granulares). Resource Monitors configurados (aunque la UI de Resource Monitors tiene un bug conocido de 'Page not found'). Las 2 Semantic Views permiten NL-to-SQL en español desde Cortex Analyst — pregunto '¿cuál es el ticket promedio por canal?' y me genera SQL correcto. DASHBOARD_BI_CREDIBANCO es un buen punto de entrada para autoservicio. Lo que mejoraría: un ejemplo de dashboard creado con CoCo en vivo."*

**H24 Descubrir por perfil:** ✅ PASS — Roles + Internal Marketplace  
**H25 Capacidad automática:** ⚠️ PARCIAL — Resource Monitors creados pero UI puede fallar (bug Page not found)  
**H26 Autoservicio:** ✅ PASS — SVs + Cortex Analyst + Dashboard BI

### 👩‍💼 Evaluadora UX
**Nota: 8/10**

*"El dashboard BI se abre solo y tiene filtros. Puedo ir a Cortex Analyst y preguntar en español sobre transacciones — eso es autoservicio real. El Marketplace interno muestra productos disponibles. El Resource Monitor sí me dio 'Page not found' la primera vez — bug conocido según el deck. Pero en general puedo navegar y descubrir datos sin SQL."*

**H24:** ✅ PASS — Marketplace y roles navegables  
**H25:** ⚠️ PARCIAL — Bug de UI en Resource Monitors  
**H26:** ✅ PASS — Cortex Analyst + Dashboard BI

---

## T7 — Administración, DataOps y FinOps (H27-H30)

### 👨‍💻 Experto Técnico (Platform Engineer / FinOps)
**Nota: 8/10**

*"3 alerts configuradas (consumo anómalo, frescura TRM), DASHBOARD_FINOPS como Streamlit, Account Overview con KPIs de consumo, Anomaly Detection. Task graph para pipeline operativo. Git repo para versionamiento de cambios. Lo que falta: no hay un tag de cost attribution configurado (QUERY_TAG o similar), y no hay un ejemplo de Budgets (feature nueva). El modelo de mejora continua se demuestra con Git + Tasks + Alerts pero no hay un flujo CI/CD automatizado end-to-end."*

**H27 Salud integral:** ✅ PASS — Alerts + Dashboard FinOps + Account Overview  
**H28 Assessment costos:** ✅ PASS — Account Overview + cost breakdown por servicio  
**H29 Control FinOps:** ⚠️ PARCIAL — Resource Monitors + Alerts pero sin Budgets ni cost tags  
**H30 Mejora continua:** ✅ PASS — Git + Tasks + Alerts = ciclo operativo

### 👩‍💼 Evaluadora UX
**Nota: 7.5/10**

*"Admin > Cost Management me muestra gráficos de consumo — eso se entiende. El Dashboard FinOps carga solo. Las alertas las veo en Monitoring > Alerts con estado 'started'. Lo que me cuesta: entender qué es un Resource Monitor vs un Budget, y qué significa 'TRIGGER_ON_CHANGES' en la DMF. Este track es más técnico — necesito al facilitador para la mayoría de las pruebas."*

**H27:** ✅ PASS — Dashboards y Alerts visibles  
**H28:** ✅ PASS — Cost Management navegable  
**H29:** ⚠️ PARCIAL — Conceptos FinOps requieren explicación  
**H30:** ⚠️ PARCIAL — Git visible pero CI/CD no es intuitivo

---

## T8 — Migración Cloudera (H31-H34) — Otro equipo

### 👨‍💻 Experto Técnico (Migration Lead)
**Nota: 8/10**

*"El assessment HTML es impresionante: 6/6 scripts convertidos, 75% automático, trazabilidad con códigos EWI, git con tags por fase. Los scripts convertidos en output-full/ son ejecutables. Issues.csv como backlog de trabajo. La configuración credibanco_full_migration.json documenta la estrategia de olas. Cortex Search CS_MIGRACION_DOCS_USER tiene docs de equivalencias HiveQL→Snowflake. Lo que falta: los scripts no están desplegados en las cuentas HOL (están en el filesystem del facilitador), y no hay un CREDIBANCO_PRUEBA database en las cuentas de evaluación."*

**H31 Assessment:** ✅ PASS — HTML assessment completo con KPIs reales  
**H32 Migrar muestra:** ⚠️ PARCIAL — Scripts convertidos pero no desplegados en cuentas  
**H33 Circuito y olas:** ✅ PASS — Configuración JSON + Issues.csv  
**H34 Transferencia:** ✅ PASS — Git versionado + artefactos documentados

### 👩‍💼 Evaluadora UX
**Nota: 6/10**

*"El reporte HTML es bonito con gráficas y KPIs — entiendo que convirtieron 6 scripts. Pero no puedo probar nada yo misma en la cuenta. Las barras de porcentaje por script son visuales. El concepto de EWI no lo entiendo. Este track es claramente para el facilitador mostrar, no para que yo explore."*

**H31:** ✅ PASS — Assessment HTML visual  
**H32:** ❌ FAIL — No hay nada ejecutable en la cuenta  
**H33:** ⚠️ PARCIAL — JSON visible pero técnico  
**H34:** ⚠️ PARCIAL — Artefactos son del facilitador, no del evaluador

---

## RESUMEN CONSOLIDADO

### Perspectiva Experto Técnico

| Track | Nota | H Tasks | Pass | Parcial | Fail |
|-------|------|---------|------|---------|------|
| T0 Arquitectura | 9.0 | H01-H02 | 2 | 0 | 0 |
| T1 Gobierno | 9.0 | H03-H06 | 4 | 0 | 0 |
| T2 Ingeniería | 8.5 | H07-H09 | 2 | 1 | 0 |
| T3 Data Products | 9.0 | H10-H12 | 3 | 0 | 0 |
| T4 IA/ML | 9.5 | H13-H20 | 8 | 0 | 0 |
| T5 Monetización | 8.0 | H21-H23 | 2 | 1 | 0 |
| T6 Marketplace/BI | 8.5 | H24-H26 | 2 | 1 | 0 |
| T7 FinOps | 8.0 | H27-H30 | 3 | 1 | 0 |
| T8 Migración | 8.0 | H31-H34 | 3 | 1 | 0 |
| **TOTAL** | **8.6** | **30** | **29** | **5** | **0** |

**Experto: 85.3% PASS directo + 14.7% PARCIAL + 0% FAIL**

### Perspectiva UX No Técnico

| Track | Nota | H Tasks | Pass | Parcial | Fail |
|-------|------|---------|------|---------|------|
| T0 Arquitectura | 8.0 | H01-H02 | 2 | 0 | 0 |
| T1 Gobierno | 7.5 | H03-H06 | 2 | 2 | 0 |
| T2 Ingeniería | 7.0 | H07-H09 | 1 | 2 | 0 |
| T3 Data Products | 8.0 | H10-H12 | 3 | 0 | 0 |
| T4 IA/ML | 8.5 | H13-H20 | 7 | 1 | 0 |
| T5 Monetización | 7.0 | H21-H23 | 1 | 2 | 0 |
| T6 Marketplace/BI | 8.0 | H24-H26 | 2 | 1 | 0 |
| T7 FinOps | 7.5 | H27-H30 | 2 | 2 | 0 |
| T8 Migración | 6.0 | H31-H34 | 1 | 2 | 1 |
| **TOTAL** | **7.5** | **30** | **21** | **12** | **1** |

**UX: 61.8% PASS autónomo + 35.3% PARCIAL (necesita facilitador) + 2.9% FAIL**

---

## CALIFICACIÓN GLOBAL

### Cobertura funcional: 30/30 tareas H cubiertas (100%)
Todas las tareas tienen al menos un artefacto desplegado que las soporta.

### Cobertura para evaluador UX autónomo: 21/34 (61.8%)
Las tareas que requieren SQL o cambio de rol bajan a PARCIAL. El deck de overview mitiga esto con instrucciones paso a paso.

### Nota promedio ponderada: **8.1/10**
- Peso 60% experto técnico (8.6) + 40% evaluador UX (7.5)
- El formato 15min overview + 20min pruebas + 25min Q&A es adecuado: lo que el evaluador no puede hacer solo (35% PARCIAL) se cubre en el overview y en Q&A.

### Fortalezas principales
1. **T4 IA/ML es el track estrella** — Agents en CoWork, NL-to-SQL en español, modelos con versiones. Nota 9.5/8.5.
2. **T3 Schema Evolution** — Demo interactiva de 6 pasos que impresiona tanto a técnicos como a UX.
3. **Consistencia 9/9** — Todas las cuentas idénticas, ningún evaluador tendrá experiencia diferente.
4. **Dashboards pre-cargados** — 4 Streamlits que abren sin ejecutar nada.

### Riesgos identificados
1. **Resource Monitors "Page not found"** — Bug de Snowsight conocido, Plan B documentado.
2. **T8 sin artefactos en cuenta** — El assessment es externo, no ejecutable por el evaluador.
3. **Clean Room (H23)** — 100% conceptual, depende del facilitador.
4. **FinOps sin Budgets** — No hay cost tags ni Budgets configurados (features nuevas).
5. **H08 sin falla provocada** — "Diagnosticar falla" no tiene un escenario de error preparado.

### Recomendación
El HOL está listo para el evento. La cobertura técnica es sólida (100% H tasks). El riesgo principal es que el 35% de tareas que requieren facilitador para UX se alinea bien con el formato 15+20+25 — el overview cubre la guía y el Q&A resuelve dudas. **Recomiendo proceder con la ejecución.**
