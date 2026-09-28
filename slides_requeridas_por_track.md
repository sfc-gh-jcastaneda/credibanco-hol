# CredibanCo HOL V4 — Slides Requeridas por Track

> **Objetivo:** Cada track tiene 15 min de overview. Este documento lista los decks oficiales, slides específicas, URLs de docs y screenshots necesarios para cada facilitador.
>
> **Convención:** 🟢 = disponible y listo | 🟡 = buscar en Glean/Drive | 🔴 = crear custom

---

## Fuentes de Decks Oficiales

| Fuente | Descripción | Acceso |
|--------|-------------|--------|
| **Knowledge Base Catalog (CE Org)** | Biblioteca modular oficial de Snowflake (SFXX_LnZZ) | [Confluence](https://snowflakecomputing.atlassian.net/wiki/spaces/CEOrg/pages/555222222/Knowledge+Base+Catalog) |
| **Glean** | Buscar "L200 customer deck" + tema | https://snowflake-be.glean.com |
| **SKE Confluence** | Field CTO articles, FinOps Framework, reference architectures | Confluence spaces: SKE, SFCTO |
| **Google Drive (Cart Template)** | Template maestro para cherry-pick slides | [Cart Template](https://drive.google.com/open?id=1Fdq-Tj2EtwCBYCdyZ9go5h0dEE76N76cI6aprLhnwhQ) |

---

## T0 — Arquitectura y Data Fabric (H01-H02)

### A. Deck Principal Recomendado
- 🟢 **SFSA_L201: Architecture Overview** — 8 slides, 10 min
  - [Google Slides](https://drive.google.com/open?id=1oxRZ2gzMd59cNZ999zyV8UEeS1GkcCorNjYL-3a4Uk0)
  - Cubre: arquitectura 3 capas, storage/compute separation, Data Cloud
- 🟢 **SFSA_L101: Key Concepts** — 4 slides, 10-15 min
  - [Google Slides](https://drive.google.com/open?id=1iuZxEbzUVGfx6bWYoORrXcjC9b18ttQbGExpeqeVx0A)

### B. Slides Específicas a Usar (5 min de slides)
1. SFSA_L201 slides 1-3: Arquitectura 3 capas (Storage, Compute, Cloud Services)
2. SFSA_L101 slide 2: Virtual Warehouses y escalabilidad
3. 1 slide custom: Diagrama de 16 schemas por dominio de CredibanCo (screenshot de Catalog)

### C. Deck Complementario
- 🟡 **Horizon Catalog Overview** (external-facing deck)
  - [Google Slides](https://docs.google.com/presentation/d/1Ry2tCvZGWJIhj-N5WouH3LO6v1HEJS1tFsxKRl66_Po/edit)
  - Fuente: [Confluence - Horizon Catalog](https://snowflakecomputing.atlassian.net/wiki/spaces/EN/pages/3742138501/Horizon+Catalog)
  - Usar slides sobre Horizon como "catalog of catalogs" y Data Fabric

### D. URLs de Snowflake Docs (referencia en vivo)
1. https://docs.snowflake.com/en/user-guide/intro-key-concepts — Conceptos clave de arquitectura
2. https://docs.snowflake.com/en/user-guide/tables-iceberg — Apache Iceberg Tables
3. https://docs.snowflake.com/en/user-guide/data-catalog — Horizon Catalog overview

### E. Screenshots Necesarios de Snowsight
1. **Catalog > Explorer > CREDIBANCO_HOL** — Vista de 16 schemas organizados por dominio
2. **ARQUITECTURA > Views** — 3 vistas de producto documentando Data Fabric
3. **PAGOS > AUTORIZACIONES > Lineage tab** — Grafo visual de datos downstream
4. **PAGOS > ICE_AUTORIZACIONES_APROBADAS > Overview** — Tabla Iceberg

### F. Flujo de 15 min
| Min | Actividad | Material |
|-----|-----------|----------|
| 0-5 | Slides: Arquitectura 3 capas + Horizon Catalog | SFSA_L201 (3 slides) + Horizon deck (2 slides) |
| 5-10 | Demo en vivo: Navegar Catalog > 16 schemas > Lineage | Snowsight live |
| 10-15 | Exploración guiada: Tabla Iceberg + Git repo | Snowsight live + screenshot Git |

---

## T1 — Gobierno, Seguridad y Zero Trust (H03-H06)

### A. Deck Principal Recomendado
- 🟢 **SFAC_L203: Introduction to Roles** — 18 slides, 30 min
  - [Google Slides](https://drive.google.com/open?id=104zgUELf3OvXjmtyIygF-zpwmZ_CQY5m)
  - Seleccionar slides sobre RBAC y gobernanza
- 🟢 **SFAC_L201: Data Encryption** 
  - [Google Slides](https://drive.google.com/open?id=1uat55rJ1l8z53_ShM8-Kb_mGMPH86Y90-t77FBqp-6A)

### B. Slides Específicas a Usar (5 min)
1. 1 slide: Modelo Zero Trust de Snowflake (diagrama de capas de protección)
2. 1 slide: Masking + Row Access + Tags como pirámide de gobernanza
3. 1 slide custom: Tabla resumen de 6 masking policies + 2 RAPs + 11 tags de CredibanCo

### C. Deck Complementario
- 🟡 **Snowflake Security Deep Dive** — Buscar en Glean: "Security Deep Dive customer deck"
  - Referencia: [Confluence - Archive of Security Deck Presentations](https://snowflakecomputing.atlassian.net/wiki/spaces/SFCTO/pages/1195835653/Archive+of+Recorded+Security+Deck+Presentations)
- 🟡 **Snowflake in a Zero Trust Enterprise Architecture**
  - [Confluence SFCTO](https://snowflakecomputing.atlassian.net/wiki/spaces/SFCTO/pages/1879184028/Snowflake+in+a+Zero+Trust+Enterprise+Architecture)
  - Documento con posicionamiento de Zero Trust

### D. URLs de Snowflake Docs (referencia en vivo)
1. https://docs.snowflake.com/en/guides-overview-govern — Data Governance overview
2. https://docs.snowflake.com/en/user-guide/security-column-ddm-intro — Dynamic Data Masking
3. https://docs.snowflake.com/en/user-guide/security-row-intro — Row Access Policies
4. https://docs.snowflake.com/en/user-guide/object-tagging/introduction — Object Tagging

### E. Screenshots Necesarios de Snowsight
1. **Governance & security > Data protection policies** — Lista de 6 masking + 2 RAPs
2. **Governance & security > Tags** — 11 tags aplicados
3. **CLIENTES > TARJETAHABIENTES > Access tab** — Tags PII + masking visible
4. **SQL Worksheet**: Side-by-side CRB_NEGOCIO (masked) vs ACCOUNTADMIN (visible)
5. **PAGOS > AUTORIZACIONES > Data Quality tab** — DMF_MONTO_VALIDO

### F. Flujo de 15 min
| Min | Actividad | Material |
|-----|-----------|----------|
| 0-3 | Slides: Zero Trust + Gobernanza como código | SFAC slides (2-3) + custom resumen |
| 3-8 | Demo en vivo: Governance UI > Masking > Tags | Snowsight live |
| 8-12 | Demo: Cambio de roles en SQL (CRB_NEGOCIO vs ACCOUNTADMIN) | SQL Worksheet live |
| 12-15 | Exploración: Lineage + Data Quality DMF | Snowsight live |

---

## T2 — Ingeniería de Datos (H07-H09)

### A. Deck Principal Recomendado
- 🟡 **Buscar en Glean**: "Data Engineering L200 customer deck" / "Dynamic Tables deep dive"
  - Search terms: `dynamic tables customer deck`, `data pipelines snowflake L200`, `streaming ingestion deck`
- 🟢 **SFDI_L203: Continuous Data Loading** — 8 slides, 10 min
  - [Google Slides](https://drive.google.com/open?id=13v6BGkBFBxbtN3FTMEfWSlOnJ8SfRwfs)
  - Cubre Snowpipe y streaming

### B. Slides Específicas a Usar (5 min)
1. 1 slide: Pipeline medallion (Bronze → Silver → Gold) con Dynamic Tables
2. 1 slide: Tasks DAG visual (ROOT → LIMPIEZA → ENRIQUECIMIENTO → NOTIFICACION)
3. 1 slide: Streams (CDC) + Kafka streaming real-time
4. 1 slide custom: Diagrama de pipeline E2E de CredibanCo

### C. Deck Complementario
- 🟢 **SFSA_L206: Cloning** — para CI/CD y promoción entre ambientes
  - [Google Slides](https://drive.google.com/open?id=1S7EiU5i3xKLlWwOacpVcoQzRjz2Cq0Xz0x9hyDuhXlM)
  - 6 slides, 10 min
- 🟡 **Buscar en Glean**: "Openflow NiFi customer deck", "Kafka Snowflake streaming"

### D. URLs de Snowflake Docs (referencia en vivo)
1. https://docs.snowflake.com/en/user-guide/dynamic-tables-about — Dynamic Tables
2. https://docs.snowflake.com/en/user-guide/tasks-intro — Tasks y DAGs
3. https://docs.snowflake.com/en/user-guide/streams-intro — Streams (CDC)
4. https://docs.snowflake.com/en/user-guide/data-load-snowpipe-streaming-overview — Snowpipe Streaming

### E. Screenshots Necesarios de Snowsight
1. **Transformation > Dynamic Tables** — 5 DTs con auto-refresh status
2. **Transformation > Tasks > TASK_INGESTA_ROOT** — DAG visual (el más impactante)
3. **TASK_INGESTA_ROOT > Run History** — Historial con SUCCESS/FAILED
4. **PAGOS > Streams > STREAM_AUTORIZACIONES** — Stream CDC activo
5. **STREAMING_DEMO > KAFKA_EVENTOS_STREAMING** — 104K+ rows real-time
6. **Ingestion > Openflow** — Conector Kafka corriendo (requiere role OPENFLOW_ADMIN_RL)
7. **Git Repositories > HOL_REPO** — Código versionado en GitHub

### F. Flujo de 15 min
| Min | Actividad | Material |
|-----|-----------|----------|
| 0-4 | Slides: Pipeline medallion + Streams + Tasks | Custom + SFDI_L203 (2 slides) |
| 4-9 | Demo en vivo: Tasks DAG + Run History + Dynamic Tables | Snowsight live |
| 9-13 | Demo: Stream CDC + Kafka streaming | Snowsight live |
| 13-15 | Exploración: Git repo + dbt project | Snowsight live |

---

## T3 — Data Fabric y Productos de Datos (H10-H12)

### A. Deck Principal Recomendado
- 🟡 **Buscar en Glean**: "Data Sharing 5-Slide by Vinay Srihari"
  - Memory c39f8482: Confirmado que existe
- 🟡 **Buscar en Glean**: "Collaboration L200 Customer Deck 2024"
  - Memory c39f8482: Confirmado que existe
- 🟡 **Buscar en Glean**: "Data Sharing Reference Architecture by Mike Mitrowski"

### B. Slides Específicas a Usar (5 min)
1. Data Sharing 5-Slide deck completo (5 slides = perfecto para 5 min de contexto)
2. 1 slide extra: Semantic Views como contrato semántico del producto de datos
3. 1 slide: Iceberg interoperability (Spark/Trino/Databricks)

### C. Deck Complementario
- 🟢 **Horizon Catalog Overview** (external-facing deck)
  - [Google Slides](https://docs.google.com/presentation/d/1Ry2tCvZGWJIhj-N5WouH3LO6v1HEJS1tFsxKRl66_Po/edit)
  - Slides sobre productos de datos y catálogo
- 🟢 **SFDS_L101: Data Sharing Overview** (de Knowledge Base Catalog)
  - Nivel básico, como intro

### D. URLs de Snowflake Docs (referencia en vivo)
1. https://docs.snowflake.com/en/guides-overview-sharing — Data Sharing overview
2. https://docs.snowflake.com/en/user-guide/views-semantic — Semantic Views
3. https://docs.snowflake.com/en/user-guide/tables-iceberg — Iceberg Tables interoperabilidad

### E. Screenshots Necesarios de Snowsight
1. **Data sharing > External sharing > Shared by you** — 2 shares outbound
2. **PAGOS > Semantic Views > SV_AUTORIZACIONES** — Contrato semántico visible
3. **PAGOS > ICE_AUTORIZACIONES_APROBADAS** — Tabla Iceberg (tipo visible en propiedades)
4. **SQL Worksheet**: `SHOW TABLES LIKE 'KAFKA%'` — Schema Evolution = Y
5. **SQL Worksheet**: `DESCRIBE TABLE KAFKA_EVENTOS_STREAMING` — Columnas con evolutionType
6. **Data sharing > Provider Studio** — Interfaz de creación de listings

### F. Flujo de 15 min
| Min | Actividad | Material |
|-----|-----------|----------|
| 0-5 | Slides: Data Sharing + Semantic Views + Iceberg | Data Sharing 5-Slide + Horizon (2 slides) |
| 5-10 | Demo en vivo: Shares outbound + Semantic Views | Snowsight live |
| 10-13 | Demo: Schema Evolution Kafka + Iceberg table | SQL Worksheet live |
| 13-15 | Exploración: Internal Marketplace + Provider Studio | Snowsight live |

---

## T4 — Analítica, ML, IA y GenAI (H13-H20)

### A. Deck Principal Recomendado
- 🟡 **Buscar en Glean**: "Cortex AI customer deck L200" / "Snowflake AI ML overview deck"
  - Search terms: `Cortex Agents customer deck`, `Snowflake ML customer presentation`, `GenAI cortex L200`
- 🟡 **Buscar en Glean**: "Model Registry customer deck" / "MLOps Snowflake deck"

### B. Slides Específicas a Usar (5 min)
1. 1 slide: Snowflake AI/ML stack completo (Cortex AI + Snowflake ML)
2. 1 slide: Cortex Agents = Analyst (structured) + Search (unstructured) + Custom tools
3. 1 slide: Model Registry lifecycle (train → register → deploy → monitor)
4. 1 slide custom: 3 agentes + 2 modelos + 3 dashboards de CredibanCo

### C. Deck Complementario
- 🟡 **Buscar en Glean**: "Cortex Search RAG customer deck"
- Referencia de best practices: [Jira TAM-1111: Cortex Agents Deployment Best Practices](https://snowflakecomputing.atlassian.net/browse/TAM-1111)

### D. URLs de Snowflake Docs (referencia en vivo)
1. https://docs.snowflake.com/en/guides-overview-ai-features — AI & ML Overview
2. https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents — Cortex Agents
3. https://docs.snowflake.com/en/developer-guide/snowflake-ml/model-registry/overview — Model Registry
4. https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst — Cortex Analyst

### E. Screenshots Necesarios de Snowsight
1. **AI & ML > Agents** — 3 agentes listados con sus configuraciones
2. **AI & ML > Models > MODELO_FRAUDE_CREDIBANCO** — Versiones V1 champion + V2 challenger
3. **Snowflake CoWork > AGENTE_SARLAFT** — Conversación ejemplo sobre SARLAFT
4. **Snowflake CoWork > AGENTE_TRANSACCIONES** — Query en lenguaje natural
5. **Projects > Streamlit > DASHBOARD_MLOPS** — Pipeline + Observabilidad
6. **Projects > Streamlit > DASHBOARD_RIESGO_FRAUDE** — Analítica visual
7. **ANALITICA > FEATURES_RIESGO_COMERCIO > Access tab** — Tags SNOWML_FEATURE_*

### F. Flujo de 15 min
| Min | Actividad | Material |
|-----|-----------|----------|
| 0-4 | Slides: AI/ML stack + Cortex Agents + Model Registry | Custom slides (3-4) |
| 4-8 | Demo en vivo: Cortex Agents + CoWork conversación | Snowsight live |
| 8-12 | Demo: Model Registry versiones + Dashboard MLOps | Snowsight live |
| 12-15 | Exploración: Dashboard Fraude + Features gobernados | Snowsight live |

---

## T6 — Marketplace, Autoservicio y BI (H24-H26)

### A. Deck Principal Recomendado
- 🟢 **SFDS_L101: Data Sharing Overview** (de Knowledge Base Catalog)
  - Incluye marketplace y autoservicio
- 🟡 **Buscar en Glean**: "Snowflake Marketplace customer deck" / "self-service BI deck"
  - Search terms: `marketplace overview customer deck`, `Snowflake Intelligence CoWork deck`

### B. Slides Específicas a Usar (5 min)
1. 1 slide: Horizon Catalog como marketplace interno (descubrir datos)
2. 1 slide: Semantic Views + Cortex Analyst = self-service SQL en lenguaje natural
3. 1 slide: Resource Monitors + Auto-suspend/resume = auto-provisioning
4. 1 slide custom: 3 dashboards Streamlit listos de CredibanCo

### C. Deck Complementario
- 🟢 **Horizon Catalog Overview** — slides sobre catálogo interno
  - [Google Slides](https://docs.google.com/presentation/d/1Ry2tCvZGWJIhj-N5WouH3LO6v1HEJS1tFsxKRl66_Po/edit)

### D. URLs de Snowflake Docs (referencia en vivo)
1. https://docs.snowflake.com/en/user-guide/data-catalog — Horizon Catalog
2. https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst — Cortex Analyst (self-service)
3. https://docs.snowflake.com/en/user-guide/resource-monitors — Resource Monitors

### E. Screenshots Necesarios de Snowsight
1. **Catalog > Explorer** — Búsqueda "autorizaciones" mostrando data products
2. **Snowflake CoWork > AGENTE_TRANSACCIONES** — Query self-service en español
3. **Projects > Streamlit > DASHBOARD_BI_CREDIBANCO** — Dashboard interactivo
4. **Admin > Cost Management > Resource Monitors > RM_HOL_CREDIBANCO** — Umbrales
5. **Compute > Warehouses > CREDIBANCO_HOL_WH** — Auto-suspend/resume config

### F. Flujo de 15 min
| Min | Actividad | Material |
|-----|-----------|----------|
| 0-4 | Slides: Horizon Catalog + Self-service + Auto-provisioning | Custom + Horizon deck (2 slides) |
| 4-8 | Demo en vivo: Catalog search + Streamlit dashboard | Snowsight live |
| 8-12 | Demo: CoWork self-service + Resource Monitor | Snowsight live |
| 12-15 | Exploración: Zero-copy sharing + Benchmark comercios | Snowsight live |

---

## T7 — Administración, DataOps, FinOps (H27-H30)

### A. Deck Principal Recomendado
- 🟡 **Buscar en Glean**: "Snowflake FinOps customer deck" / "Cost Management overview"
  - Search terms: `FinOps framework customer deck`, `cost optimization snowflake presentation`, `Budgets product overview deck`
  - Referencia: [Jira TAM-1127: Snowflake Budgets deck](https://snowflakecomputing.atlassian.net/browse/TAM-1127) — Existe un "Snowflake Budgets product overview deck"
- 🟡 **Confluencia**: [OP - FinOps Framework - OPTIMIZATION](https://snowflakecomputing.atlassian.net/wiki/spaces/SKE/pages/3717562369/OP+-+FinOps+Framework+-+OPTIMIZATION)
  - Framework de FinOps con Budgets y Cost Centers

### B. Slides Específicas a Usar (5 min)
1. 1 slide: Los 3 pilares de costo (Compute, Cloud Services, Storage)
2. 1 slide: Resource Monitors + Alertas + Budgets = control automatizado
3. 1 slide: Cost Management UI nativo (Account Overview + Anomalies)
4. 1 slide custom: 3 alertas proactivas + RM de CredibanCo

### C. Deck Complementario
- 🟡 **Snowflake Cost Optimization Office Hours** — Material de Tannia
  - [Confluence CT](https://snowflakecomputing.atlassian.net/wiki/spaces/CT/pages/5334335771/Snowflake+Cost+Optimization)
  - Cubre: Compute, Cloud Services, Storage optimization strategies
- 🟢 **SFAM_L202: Resource Monitors** (de Knowledge Base Catalog)
  - Nivel intermedio sobre resource monitors

### D. URLs de Snowflake Docs (referencia en vivo)
1. https://docs.snowflake.com/en/guides-overview-cost — Cost Management overview
2. https://docs.snowflake.com/en/user-guide/resource-monitors — Resource Monitors
3. https://docs.snowflake.com/en/user-guide/alerts — Alerts (alertas proactivas)
4. https://docs.snowflake.com/en/sql-reference/sql/create-budget — Budgets

### E. Screenshots Necesarios de Snowsight
1. **Admin > Cost Management > Account Overview** — KPIs y tendencia
2. **Admin > Cost Management > Anomalies tab** — Detección estadística
3. **Admin > Cost Management > Resource Monitors > RM_HOL_CREDIBANCO** — Umbrales 75/90/100%
4. **Monitoring > Alerts** — 3 alertas proactivas configuradas
5. **Git Repositories > HOL_REPO** — CI/CD con código versionado
6. **Transformation > dbt projects > CREDIBANCO_ANALYTICS** — dbt para mejora continua

### F. Flujo de 15 min
| Min | Actividad | Material |
|-----|-----------|----------|
| 0-4 | Slides: 3 pilares de costo + FinOps framework + alertas | Custom + FinOps slides (2-3) |
| 4-8 | Demo en vivo: Cost Management UI + Account Overview | Snowsight live |
| 8-12 | Demo: Resource Monitor + Alertas + Anomalías | Snowsight live |
| 12-15 | Exploración: CoCo FinOps query + Git/dbt CI/CD | Snowsight live + CoCo |

---

## Resumen de Búsquedas Pendientes en Glean

> **Prioridad alta** — Buscar estos decks antes del HOL para cada track.

| # | Query de búsqueda en Glean | Para Track | Prioridad |
|---|----------------------------|------------|-----------|
| 1 | `"Data Sharing 5-Slide" Vinay Srihari` | T3 | Alta |
| 2 | `"Collaboration L200 Customer Deck"` | T3 | Alta |
| 3 | `"Cortex AI" OR "Cortex Agents" customer deck L200` | T4 | Alta |
| 4 | `"FinOps" OR "Cost Management" customer deck` | T7 | Alta |
| 5 | `"Dynamic Tables" OR "Data Engineering" customer deck` | T2 | Media |
| 6 | `"Security Deep Dive" customer deck 2024 2025` | T1 | Media |
| 7 | `"Model Registry" OR "MLOps" customer deck` | T4 | Media |
| 8 | `"Snowflake Budgets" product overview deck` | T7 | Media |
| 9 | `"Marketplace" OR "self-service" customer deck` | T6 | Baja |
| 10 | `"Openflow" OR "NiFi" customer deck` | T2 | Baja |

---

## Inventario Consolidado de Screenshots por Tomar

> Total: ~30 screenshots. Prioridad: los del flujo min 5-10 de cada track.

| Track | Screenshot | Prioridad |
|-------|-----------|-----------|
| T0 | Catalog > Explorer > 16 schemas | Alta |
| T0 | PAGOS > AUTORIZACIONES > Lineage tab | Alta |
| T0 | ICE_AUTORIZACIONES_APROBADAS (Iceberg) | Media |
| T1 | Governance > Data protection policies (6 masking + 2 RAP) | Alta |
| T1 | Governance > Tags (11 tags) | Alta |
| T1 | SQL side-by-side: CRB_NEGOCIO vs ACCOUNTADMIN | Alta |
| T1 | Data Quality tab con DMF | Media |
| T2 | Tasks > TASK_INGESTA_ROOT (DAG visual) | Alta |
| T2 | Dynamic Tables (5 DTs) | Alta |
| T2 | KAFKA_EVENTOS_STREAMING (104K+ rows) | Media |
| T2 | Openflow conector Kafka | Media |
| T3 | Data sharing > Shared by you (2 shares) | Alta |
| T3 | Semantic Views (SV_AUTORIZACIONES) | Alta |
| T3 | Schema Evolution = Y en SQL | Media |
| T4 | AI & ML > Agents (3 agentes) | Alta |
| T4 | Models > MODELO_FRAUDE (V1 + V2) | Alta |
| T4 | CoWork > AGENTE_SARLAFT conversación | Alta |
| T4 | Dashboard MLOps (pipeline + observabilidad) | Media |
| T6 | Catalog search "autorizaciones" | Alta |
| T6 | CoWork self-service query | Alta |
| T6 | Dashboard BI interactivo | Media |
| T7 | Cost Management > Account Overview | Alta |
| T7 | Resource Monitor umbrales | Alta |
| T7 | Monitoring > Alerts (3 alertas) | Media |

---

## Decks Confirmados Disponibles (Google Drive links)

| Código | Título | Slides | Tiempo | Link |
|--------|--------|--------|--------|------|
| SFSA_L101 | Key Concepts | 4 | 10-15 min | [Link](https://drive.google.com/open?id=1iuZxEbzUVGfx6bWYoORrXcjC9b18ttQbGExpeqeVx0A) |
| SFSA_L201 | Architecture Overview | 8 | 10 min | [Link](https://drive.google.com/open?id=1oxRZ2gzMd59cNZ999zyV8UEeS1GkcCorNjYL-3a4Uk0) |
| SFSA_L206 | Cloning | 6 | 10 min | [Link](https://drive.google.com/open?id=1S7EiU5i3xKLlWwOacpVcoQzRjz2Cq0Xz0x9hyDuhXlM) |
| SFAC_L201 | Data Encryption | - | - | [Link](https://drive.google.com/open?id=1uat55rJ1l8z53_ShM8-Kb_mGMPH86Y90-t77FBqp-6A) |
| SFAC_L203 | Introduction to Roles | 18 | 30 min | [Link](https://drive.google.com/open?id=104zgUELf3OvXjmtyIygF-zpwmZ_CQY5m) |
| SFDI_L203 | Continuous Data Loading | 8 | 10 min | [Link](https://drive.google.com/open?id=13v6BGkBFBxbtN3FTMEfWSlOnJ8SfRwfs) |
| Horizon | Horizon Catalog Overview | - | - | [Link](https://docs.google.com/presentation/d/1Ry2tCvZGWJIhj-N5WouH3LO6v1HEJS1tFsxKRl66_Po/edit) |

---

*Generado: Sept 2026 — CredibanCo HOL V4 — RFP 10010806*
