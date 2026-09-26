# Evaluación UX — María González (CredibanCo)
## Simulación de validación autónoma de tareas H01–H34

**Perfil:** Project Manager / UX, no técnica. Evalúo desde Snowsight sin escribir SQL.
**Tiempo:** ~80 min para 26 tareas (excluyendo T5 H21-H23 y T8 H31-H34).
**Materiales:** Overview deck del facilitador + guía del participante + Snowsight.

---

## HALLAZGO CRÍTICO INICIAL

> **El overview deck NO tiene tab para T3 (Arquitectura, Data Fabric y Productos).**
>
> Las tareas H10, H11, H12 están en la matriz Excel pero el facilitador no tiene ninguna diapositiva preparada para ellas. El deck tiene tabs: T0, T1, T2, T4, T6, T7 — T3 está completamente ausente. Esto significa que yo, como evaluadora, no recibo ninguna orientación visual para 3 tareas completas.

---

## TRACK T0 — Arquitectura y Data Fabric (H01–H02)

*El facilitador me muestra el tab T0 del deck. Veo un mapa con "Catalog > Explorer > CREDIBANCO_HOL" y un árbol de navegación con 16 schemas.*

### H01 — Navegar el flujo end-to-end

**Mi experiencia:** El facilitador me señala "Catalog > Explorer > CREDIBANCO_HOL" y dice "haz clic en cada schema". Cuando quedo sola, abro Snowsight, encuentro "Catalog" en la barra lateral, luego "Explorer", busco CREDIBANCO_HOL. Veo los schemas listados. Puedo hacer clic y ver tablas dentro. Es bastante directo.

**Posible confusión:** "Flujo end-to-end" suena como un diagrama de proceso, pero lo que realmente verifico es que existen 16 schemas organizados. El nombre de la tarea no coincide exactamente con lo que hago.

| Criterio | Score | Nota |
|----------|-------|------|
| Clarity | 4 | Path claro en el deck, pero "flujo end-to-end" es ambiguo para UX |
| Findability | 5 | Catalog > Explorer es directo, schemas visibles inmediatamente |
| Evidence | 4 | 16 schemas visibles, aunque "flujo" implica algo más que una lista |
| **Verdict** | **PASS** | |

**Risk:** Evaluadora podría esperar un diagrama de flujo en vez de una lista de schemas.

---

### H02 — Mostrar arquitectura fundacional

**Mi experiencia:** Me dicen "ir a ARQUITECTURA > Views". Encuentro el schema ARQUITECTURA dentro de CREDIBANCO_HOL. Veo 3 vistas. El deck también dice que puedo hacer clic en una Dynamic Table y ver el tab "Lineage" para un flujo visual.

**Posible confusión:** El deck dice "Click en cualquier Dynamic Table > Lineage tab" pero luego aclara en letra pequeña que "Las DTs NO tienen Lineage tab propio — aparecen en el grafo de otros objetos." Esto es MUY confuso. Me dice que haga clic en una DT para ver Lineage, pero resulta que no funciona así. ¿En qué quedo?

| Criterio | Score | Nota |
|----------|-------|------|
| Clarity | 3 | La instrucción de Lineage contradice la nota al pie |
| Findability | 4 | Las 3 vistas se encuentran fácil, pero el Lineage de DTs confunde |
| Evidence | 3 | Las vistas existen pero son solo definiciones SQL, no diagramas visuales |
| **Verdict** | **CONDITIONAL** | |

**Risk:** La contradicción sobre Lineage de DTs causará confusión. La evaluadora hará clic en una DT, no verá tab Lineage, y pensará que algo está roto. Además, las "vistas de arquitectura" son SELECT statements — no son diagramas visuales bonitos.

---

## TRACK T1 — Gobierno, Seguridad y Zero Trust (H03–H06)

*El facilitador me muestra T1. Veo un prerequisito en rojo: "Para ver diferencias de masking, usar role CRB_SEGURIDAD_INFO o ACCOUNTADMIN en SQL Worksheet." Esto ya me preocupa — yo no hago SQL.*

### H03 — Aplicar políticas como código

**Mi experiencia:** Me dicen "Governance & security > Tags & policies". Abro la sidebar, encuentro "Governance & security", y busco "Tags & policies". Debería ver 6 masking policies y 2 RAPs. También me sugieren ir a una tabla específica y ver el tab "Access".

**Posible confusión:** El concepto "políticas como código" no se demuestra visualmente — yo veo que existen políticas, pero no veo "código". Para mí es simplemente una lista de objetos.

| Criterio | Score | Nota |
|----------|-------|------|
| Clarity | 4 | Path en el deck es claro |
| Findability | 4 | Governance & security está en sidebar, 2-3 clics |
| Evidence | 4 | 6 policies + 2 RAPs son contables y visibles |
| **Verdict** | **PASS** | |

**Risk:** "Como código" queda sin demostrar visualmente. Pero al menos cuento los objetos.

---

### H04 — Gobernar datos sensibles E2E

**Mi experiencia:** Me piden ir a CLIENTES > TARJETAHABIENTES > Access tab para ver tags PII con masking. Hasta aquí bien, puedo navegar. PERO luego me piden hacer SQL: `USE ROLE CRB_NEGOCIO; SELECT * FROM ...` para ver datos enmascarados vs. completos. Yo no hago SQL.

**Posible confusión:** La parte visual (tags en Access tab) la puedo verificar. La parte de SQL (cambiar roles y ver masking en acción) es imposible para mí sin ayuda.

| Criterio | Score | Nota |
|----------|-------|------|
| Clarity | 3 | Path visual claro, pero la prueba SQL es intimidante |
| Findability | 4 | Access tab se encuentra bien |
| Evidence | 3 | Tags visibles, pero el masking en acción requiere SQL |
| **Verdict** | **CONDITIONAL** | |

**Risk:** La evaluadora verá tags pero NO podrá confirmar que el masking realmente funciona sin ejecutar SQL. La "prueba de fuego" del masking (CRB_NEGOCIO ve TOKEN-xxx, ACCOUNTADMIN ve todo) queda sin verificar.

---

### H05 — Validar linaje y calidad

**Mi experiencia:** Me dicen ir a PAGOS > AUTORIZACIONES > Lineage tab. Debería ver un grafo visual con la cadena de transformación. También me dicen ir al "Data Quality tab" para ver DMF_MONTO_VALIDO.

**Posible confusión:** La nota dice que las DTs no tienen Lineage tab propio. ¿Entonces desde AUTORIZACIONES (que es una tabla base) sí se ve? Necesito confiar en que la tabla base sí lo tiene. El "Data Quality tab" es un concepto que no conozco — ¿existe realmente ese tab en Snowsight?

| Criterio | Score | Nota |
|----------|-------|------|
| Clarity | 4 | El path es específico y el deck aclara la limitación de DTs |
| Findability | 3 | Lineage tab en tabla base debería existir, pero Data Quality tab es incierto |
| Evidence | 4 | Si el grafo se renderiza, es evidencia visual fuerte |
| **Verdict** | **CONDITIONAL** | |

**Risk:** El tab "Data Quality" puede no existir o estar vacío si el DMF no ha corrido recientemente. El grafo de Lineage podría no mostrar toda la cadena si no hay historial de ejecución.

---

### H06 — Gobernanza federada/multicloud

**Mi experiencia:** Me piden ver la tabla Iceberg ICE_AUTORIZACIONES_APROBADAS y luego ir a "Data sharing > External sharing > Shared by you". 

**Posible confusión:** "Gobernanza federada/multicloud" es un concepto enorme. Lo que realmente verifico es: (1) una tabla Iceberg existe, y (2) hay 2 shares configurados. ¿Eso demuestra "multicloud"? Para mí, una tabla Iceberg se ve igual que cualquier otra tabla. No hay nada visual que diga "esto es multicloud". Los shares tampoco dicen "multicloud" visualmente.

| Criterio | Score | Nota |
|----------|-------|------|
| Clarity | 3 | El path es claro pero la conexión con "multicloud" es abstracta |
| Findability | 4 | Tabla Iceberg y shares se encuentran |
| Evidence | 2 | No hay evidencia visual de "multicloud" — es una tabla normal a ojos UX |
| **Verdict** | **CONDITIONAL** | |

**Risk:** La evaluadora dirá "vi una tabla y 2 shares, pero no entiendo qué tiene de multicloud". La tabla Iceberg no se distingue visualmente de una tabla normal. Falta narrativa visual.

---

## TRACK T2 — Ingeniería de Datos (H07–H09)

*El facilitador me muestra T2. Veo "Transformation > Dynamic tables" y "Transformation > Tasks" con un DAG visual.*

### H07 — Pipeline representativo

**Mi experiencia:** Me dicen ir a "Transformation > Tasks" y hacer clic en TASK_INGESTA_ROOT para ver el DAG visual. También me dicen ir a "Transformation > Dynamic tables" para ver 5 DTs.

**Posible confusión:** "Transformation" en la sidebar — ¿existe? Snowsight ha cambiado su UI varias veces. Si existe, el DAG de Tasks es visual y potente. Las DTs también se listan.

| Criterio | Score | Nota |
|----------|-------|------|
| Clarity | 5 | Path muy claro, dos destinos específicos |
| Findability | 4 | Transformation > Tasks es directo |
| Evidence | 5 | DAG visual es prueba inmediata de un pipeline |
| **Verdict** | **PASS** | |

**Risk:** Si las Tasks están SUSPENDED, el DAG se ve pero no hay historial de ejecución. Las DTs pueden aparecer sin datos si el refresh no ha corrido.

---

### H08 — Diagnosticar y recuperar fallas

**Mi experiencia:** Me dicen ir a "Transformation > Tasks > TASK_INGESTA_ROOT > Run History". También verificar "Monitoring > Alerts" para ver 3 alertas.

**Posible confusión:** Si las Tasks nunca se han ejecutado (están suspended), el Run History estará vacío. Yo veré una pantalla sin datos y pensaré que algo falló en el setup.

| Criterio | Score | Nota |
|----------|-------|------|
| Clarity | 4 | Path claro |
| Findability | 4 | Run History tab existe si hay historial |
| Evidence | 2 | **MUY probable que Run History esté vacío si Tasks están suspended** |
| **Verdict** | **CONDITIONAL** | |

**Risk:** **ALTO.** Si las Tasks no se ejecutaron, no hay historial de SUCCESS/FAILED para mostrar. Las alertas en Monitoring pueden estar sin disparar. La evaluadora verá pantallas vacías.

---

### H09 — Promover cambios entre ambientes

**Mi experiencia:** Me piden ver el Git repo HOL_REPO y el dbt project CREDIBANCO_ANALYTICS.

**Posible confusión:** Git Repositories está dentro de Catalog > Explorer > PLATAFORMA (un schema), no en una sección de primer nivel. Encontrarlo requiere saber que "PLATAFORMA" es el schema correcto. El dbt project en "Transformation > dbt projects" es más directo.

| Criterio | Score | Nota |
|----------|-------|------|
| Clarity | 3 | Git repo path es largo y no intuitivo |
| Findability | 3 | Git repo enterrado en un schema específico |
| Evidence | 3 | Repo conectado se ve, pero "promover entre ambientes" no es visible |
| **Verdict** | **CONDITIONAL** | |

**Risk:** La evaluadora no encontrará fácilmente el repo Git dentro de PLATAFORMA. El concepto de "promover entre ambientes" no se evidencia visualmente — solo ve un repo conectado.

---

## TRACK T3 — Arquitectura, Data Fabric y Productos (H10–H12)

> **⚠️ PROBLEMA GRAVE: NO HAY TAB T3 EN EL OVERVIEW DECK.**
> El facilitador no tiene material visual para presentarme este track. Las tareas H10-H12 existen en el Excel pero no tienen orientación en el deck. Solo están en la guía del participante.

### H10 — Crear y publicar producto de datos

**Mi experiencia:** Sin orientación del facilitador, abro la guía del participante. Busco algo sobre "producto de datos". La guía debería tener una sección T3... pero no recibí ninguna presentación visual. Tendría que navegar por mi cuenta.

| Criterio | Score | Nota |
|----------|-------|------|
| Clarity | 1 | **Sin overview deck, no sé dónde ir** |
| Findability | 2 | Data Products requiere conocer Catalog > Internal Marketplace |
| Evidence | 2 | Si hay un share publicado, se puede ver, pero sin guía no sé qué buscar |
| **Verdict** | **FAIL** | |

**Risk:** **CRÍTICO.** Sin presentación del facilitador, la evaluadora está completamente perdida. "Producto de datos" no es un término que Snowsight use en su UI directamente.

---

### H11 — Gestionar cambio de contrato

**Mi experiencia:** "Cambio de contrato" — ¿qué es esto en Snowflake? ¿Se refiere a cambiar permisos de un share? ¿Modificar una vista? Sin overview deck, no tengo idea.

| Criterio | Score | Nota |
|----------|-------|------|
| Clarity | 1 | Sin deck, el concepto es opaco |
| Findability | 1 | No sé qué buscar ni dónde |
| Evidence | 1 | Sin navegación, sin evidencia |
| **Verdict** | **FAIL** | |

**Risk:** **CRÍTICO.** Tarea completamente abstracta sin orientación.

---

### H12 — Demostrar interoperabilidad

**Mi experiencia:** "Interoperabilidad" podría significar Iceberg tables, external tables, shares... Sin deck, adivino. Quizás la tabla Iceberg de T0?

| Criterio | Score | Nota |
|----------|-------|------|
| Clarity | 1 | Sin deck, solo puedo adivinar |
| Findability | 2 | Si es Iceberg, ya la vi en T0, pero no sé que aplica aquí |
| Evidence | 2 | Una tabla Iceberg no demuestra "interoperabilidad" visualmente |
| **Verdict** | **FAIL** | |

**Risk:** **CRÍTICO.** Sin material de facilitador.

---

## TRACK T4 — Analítica, ML, IA y GenAI (H13–H20)

*El facilitador me muestra T4. Veo "AI & ML" en la sidebar con Agents, Models, Cortex Search. También veo Streamlit dashboards y CoWork.*

### H13 — Construir/desplegar modelo

**Mi experiencia:** Me dicen "AI & ML > Models". Debería ver MODELO_FRAUDE_CREDIBANCO con versiones V1 y V2, y MODELO_CHURN_COMERCIOS.

| Criterio | Score | Nota |
|----------|-------|------|
| Clarity | 5 | Path directo y claro |
| Findability | 5 | AI & ML > Models es de primer nivel |
| Evidence | 4 | Modelos listados con versiones — buena evidencia visual |
| **Verdict** | **PASS** | |

**Risk:** Bajo. Si los modelos existen, se ven. Solo riesgo si el Model Registry está vacío.

---

### H14 — Gobernar ciclo de vida AI

**Mi experiencia:** Me piden clic en MODELO_FRAUDE_CREDIBANCO para ver versiones, métricas, aliases (champion/challenger).

| Criterio | Score | Nota |
|----------|-------|------|
| Clarity | 4 | Path claro, un clic adicional dentro del modelo |
| Findability | 4 | Dentro del modelo, versiones son navegables |
| Evidence | 4 | Si hay métricas y aliases, es evidencia fuerte |
| **Verdict** | **PASS** | |

**Risk:** Si las métricas no se registraron al crear el modelo, la vista de detalles podría estar vacía. Los aliases champion/challenger pueden no ser visibles en la UI sin SQL.

---

### H15 — Operar agente/RAG

**Mi experiencia:** Me dicen ir a "Snowflake Intelligence (CoWork)" y seleccionar AGENTE_SARLAFT. Luego preguntar algo en español.

**Posible confusión:** "Snowflake Intelligence (CoWork)" — ¿dónde está en la sidebar? El nombre ha cambiado varias veces. Puede aparecer como "Snowflake Intelligence" o "CoWork" o incluso "AI & ML > Agents" dependiendo de la versión.

| Criterio | Score | Nota |
|----------|-------|------|
| Clarity | 4 | El deck da el path y un ejemplo de pregunta |
| Findability | 3 | CoWork/Intelligence puede ser difícil de ubicar en la sidebar |
| Evidence | 5 | Si el agente responde, es la mejor evidencia posible — interactiva |
| **Verdict** | **PASS** | |

**Risk:** Si el Cortex Search Service no está corriendo o los documentos no se indexaron, el agente responderá genéricamente sin contexto SARLAFT. La evaluadora no sabrá distinguir una respuesta RAG real de una respuesta genérica del LLM.

---

### H16 — Gobernar datos y features para AI

**Mi experiencia:** Me piden ir a ANALITICA > FEATURES_RIESGO_COMERCIO > Access tab para ver tags SNOWML_FEATURE_*.

**Posible confusión:** Necesito navegar: Catalog > Explorer > CREDIBANCO_HOL > ANALITICA > FEATURES_RIESGO_COMERCIO > Access tab. Son 5+ clics. Los tags "SNOWML_FEATURE_*" son un concepto técnico.

| Criterio | Score | Nota |
|----------|-------|------|
| Clarity | 3 | Path largo, concepto técnico |
| Findability | 3 | Muchos clics para llegar |
| Evidence | 3 | Tags existen pero su significado para ML no es obvio visualmente |
| **Verdict** | **CONDITIONAL** | |

**Risk:** La evaluadora verá tags pero no entenderá qué significa "SNOWML_FEATURE_" para el gobierno de AI. Falta contexto visual.

---

### H17 — Ejecutar pipeline MLOps

**Mi experiencia:** Me dicen "Projects > Streamlit > DASHBOARD_MLOPS". Un dashboard interactivo.

| Criterio | Score | Nota |
|----------|-------|------|
| Clarity | 5 | Path directo |
| Findability | 4 | Projects > Streamlit es claro |
| Evidence | 4 | Si el dashboard carga con datos, es excelente |
| **Verdict** | **PASS** | |

**Risk:** Si el Streamlit no carga (error de warehouse, permisos), la evaluadora ve una pantalla de error. Los dashboards Streamlit pueden ser frágiles.

---

### H18 — Monitorear modelo en producción

**Mi experiencia:** Mismo path que H17 — DASHBOARD_MLOPS. Se supone que muestra métricas de accuracy/precision/recall y drift.

**Posible confusión:** H17 y H18 van al MISMO dashboard. ¿Cómo distingo "ejecutar pipeline MLOps" de "monitorear modelo"? Son secciones diferentes del mismo Streamlit, pero el deck no diferencia.

| Criterio | Score | Nota |
|----------|-------|------|
| Clarity | 3 | Mismo destino que H17, diferenciación confusa |
| Findability | 4 | Ya sé dónde está |
| Evidence | 3 | Depende de que el dashboard tenga secciones diferenciadas |
| **Verdict** | **CONDITIONAL** | |

**Risk:** La evaluadora no sabrá qué parte del dashboard corresponde a H17 vs H18. Si el dashboard tiene tabs internos, bien; si es una sola vista, ambas tareas se confunden.

---

### H19 — Gestionar GenAI y agentes

**Mi experiencia:** Me dicen "AI & ML > Agents" para ver 3 agentes y su configuración. Luego probar en CoWork.

| Criterio | Score | Nota |
|----------|-------|------|
| Clarity | 4 | Path claro a dos destinos |
| Findability | 4 | AI & ML > Agents directo |
| Evidence | 4 | 3 agentes listados con configuración visible |
| **Verdict** | **PASS** | |

**Risk:** La "configuración" del agente puede no ser visible en la UI sin editar el YAML. Lo que se ve es el nombre y quizás la descripción.

---

### H20 — Validar AI responsable

**Mi experiencia:** Me dicen probar AGENTE_SARLAFT (ya lo hice en H15) y luego ver masking en TARJETAHABIENTES (ya lo vi en H04). Esta tarea reutiliza evidencia de otras tareas.

**Posible confusión:** "AI responsable" es un concepto amplio. Lo que realmente verifico es: (1) un agente orientado a compliance, y (2) masking previene uso de datos sensibles. No hay un dashboard de "AI Ethics" ni métricas de bias/fairness.

| Criterio | Score | Nota |
|----------|-------|------|
| Clarity | 3 | Reutiliza paths de H04 y H15 |
| Findability | 4 | Ya conozco los destinos |
| Evidence | 2 | La conexión entre masking y "AI responsable" es interpretativa |
| **Verdict** | **CONDITIONAL** | |

**Risk:** La evaluadora sentirá que está verificando lo mismo que ya vio. "AI responsable" como concepto queda débilmente cubierto.

---

## TRACK T6 — Marketplace, Autoservicio y BI (H24–H26)

### H24 — Descubrir y solicitar acceso por perfil

**Mi experiencia:** Me dicen buscar "autorizaciones" en Catalog > Explorer y ver tags en el Access tab.

| Criterio | Score | Nota |
|----------|-------|------|
| Clarity | 4 | Búsqueda en Explorer es intuitiva |
| Findability | 4 | La barra de búsqueda funciona |
| Evidence | 3 | Tags visibles pero "solicitar acceso por perfil" no se demuestra |
| **Verdict** | **CONDITIONAL** | |

**Risk:** "Solicitar acceso" implica un flujo de request/approval que probablemente no existe en el HOL. La evaluadora buscará un botón "Request Access" que no hay.

---

### H25 — Auto-provisionar capacidad

**Mi experiencia:** Me piden ver "Admin > Cost Management > Resource Monitors" y luego el warehouse con AUTO_SUSPEND/AUTO_RESUME.

| Criterio | Score | Nota |
|----------|-------|------|
| Clarity | 4 | Dos paths claros en el deck |
| Findability | 4 | Admin > Cost Management es directo |
| Evidence | 4 | Resource Monitor con umbrales es evidencia visual clara |
| **Verdict** | **PASS** | |

**Risk:** "Auto-provisionar" sugiere algo dinámico (auto-scaling). Un Resource Monitor es más "auto-limitar". El warehouse AUTO_RESUME es lo más cercano a auto-provisioning.

---

### H26 — Query y reporteo self-service

**Mi experiencia:** Me dicen abrir DASHBOARD_BI_CREDIBANCO en Streamlit y probar CoWork con preguntas de negocio.

| Criterio | Score | Nota |
|----------|-------|------|
| Clarity | 5 | Path directo + ejemplo de uso |
| Findability | 4 | Projects > Streamlit claro |
| Evidence | 5 | Dashboard interactivo es la mejor evidencia de self-service |
| **Verdict** | **PASS** | |

**Risk:** Si el Streamlit no carga. Siempre es el riesgo con dashboards.

---

## TRACK T7 — Administración, DataOps, FinOps (H27–H30)

### H27 — Observar salud integral

**Mi experiencia:** "Admin > Cost Management > Account Overview". Snowflake nativo.

| Criterio | Score | Nota |
|----------|-------|------|
| Clarity | 5 | Path directo a función nativa de Snowflake |
| Findability | 5 | Admin es primer nivel en sidebar |
| Evidence | 5 | Snowflake Cost Management tiene KPIs y gráficos built-in |
| **Verdict** | **PASS** | |

**Risk:** Mínimo. Es funcionalidad nativa de la plataforma. Siempre tiene datos.

---

### H28 — Assessment de optimización de costos

**Mi experiencia:** Me dicen ir al mismo Account Overview y buscar "Optimization Insights".

**Posible confusión:** "Optimization Insights" puede no existir como sección visible en todas las versiones de Snowsight. Puede ser un feature flag o estar en beta.

| Criterio | Score | Nota |
|----------|-------|------|
| Clarity | 4 | Path claro pero "Optimization Insights" podría no existir |
| Findability | 3 | Depende de si el feature está habilitado |
| Evidence | 3 | Si existe, las recomendaciones son buenas; si no, pantalla sin sección |
| **Verdict** | **CONDITIONAL** | |

**Risk:** "Optimization Insights" puede no estar disponible en la cuenta HOL. La evaluadora scrolleará buscando algo que quizás no existe.

---

### H29 — Configurar control FinOps

**Mi experiencia:** Me piden ver RM_HOL_CREDIBANCO con sus umbrales 75/90/100%.

| Criterio | Score | Nota |
|----------|-------|------|
| Clarity | 5 | Path directo, objeto específico nombrado |
| Findability | 4 | Admin > Cost Management > Resource Monitors |
| Evidence | 5 | Umbrales porcentuales son evidencia visual inmediata |
| **Verdict** | **PASS** | |

**Risk:** Bajo. Si el Resource Monitor existe, los umbrales se ven.

---

### H30 — Modelo de mejora continua

**Mi experiencia:** Me piden ver alertas en "Monitoring > Alerts" y el repo Git en PLATAFORMA.

**Posible confusión:** "Mejora continua" es abstracto. Verifico: (1) alertas existen, (2) repo Git existe. ¿Eso es mejora continua? Es interpretativo.

| Criterio | Score | Nota |
|----------|-------|------|
| Clarity | 3 | Dos destinos claros pero concepto abstracto |
| Findability | 3 | Monitoring > Alerts claro, pero Git repo enterrado en schema |
| Evidence | 3 | Alertas + Git = "mejora continua" requiere interpretación |
| **Verdict** | **CONDITIONAL** | |

**Risk:** La evaluadora verá alertas y un repo pero la conexión a "mejora continua" es narrativa, no visual.

---

## 1. SCORE SUMMARY TABLE

| ID | Track | Clarity | Findability | Evidence | Verdict |
|----|-------|---------|-------------|----------|---------|
| H01 | T0 | 4 | 5 | 4 | **PASS** |
| H02 | T0 | 3 | 4 | 3 | **CONDITIONAL** |
| H03 | T1 | 4 | 4 | 4 | **PASS** |
| H04 | T1 | 3 | 4 | 3 | **CONDITIONAL** |
| H05 | T1 | 4 | 3 | 4 | **CONDITIONAL** |
| H06 | T1 | 3 | 4 | 2 | **CONDITIONAL** |
| H07 | T2 | 5 | 4 | 5 | **PASS** |
| H08 | T2 | 4 | 4 | 2 | **CONDITIONAL** |
| H09 | T2 | 3 | 3 | 3 | **CONDITIONAL** |
| H10 | T3 | 1 | 2 | 2 | **FAIL** |
| H11 | T3 | 1 | 1 | 1 | **FAIL** |
| H12 | T3 | 1 | 2 | 2 | **FAIL** |
| H13 | T4 | 5 | 5 | 4 | **PASS** |
| H14 | T4 | 4 | 4 | 4 | **PASS** |
| H15 | T4 | 4 | 3 | 5 | **PASS** |
| H16 | T4 | 3 | 3 | 3 | **CONDITIONAL** |
| H17 | T4 | 5 | 4 | 4 | **PASS** |
| H18 | T4 | 3 | 4 | 3 | **CONDITIONAL** |
| H19 | T4 | 4 | 4 | 4 | **PASS** |
| H20 | T4 | 3 | 4 | 2 | **CONDITIONAL** |
| H24 | T6 | 4 | 4 | 3 | **CONDITIONAL** |
| H25 | T6 | 4 | 4 | 4 | **PASS** |
| H26 | T6 | 5 | 4 | 5 | **PASS** |
| H27 | T7 | 5 | 5 | 5 | **PASS** |
| H28 | T7 | 4 | 3 | 3 | **CONDITIONAL** |
| H29 | T7 | 5 | 4 | 5 | **PASS** |
| H30 | T7 | 3 | 3 | 3 | **CONDITIONAL** |

### Summary counts:
- **PASS:** 13 tasks (50%)
- **CONDITIONAL:** 10 tasks (38.5%)
- **FAIL:** 3 tasks (11.5%)

---

## 2. TOP 5 RISKS (Puntos de falla más probables)

### 🔴 Risk #1: T3 COMPLETO SIN OVERVIEW DECK (H10, H11, H12)
**Severidad: CRÍTICA**
El overview deck no tiene tab T3. El facilitador no tiene material para presentar 3 tareas. La evaluadora queda sin orientación. **3 tareas automáticas FAIL.**
**Fix:** Crear tab T3 en el overview deck con paths a shares, data products, e Iceberg interoperability.

### 🔴 Risk #2: Tasks sin historial de ejecución (H08)
**Severidad: ALTA**
Si las 5 Tasks del DAG están SUSPENDED y nunca se ejecutaron, el Run History está vacío. La evaluadora ve "No runs" y no puede validar diagnóstico ni recuperación de fallas.
**Fix:** Ejecutar las Tasks al menos 1 vez antes del evento (incluir una falla intencional para mostrar FAILED en el historial).

### 🟡 Risk #3: Masking requiere SQL para demostrar (H04)
**Severidad: MEDIA-ALTA**
La prueba clave de H04 (ver datos masked con CRB_NEGOCIO vs. completos con ACCOUNTADMIN) requiere escribir SQL. Una evaluadora UX no hará esto autónomamente.
**Fix:** Pre-crear un Streamlit mini que muestre side-by-side la misma tabla con dos roles, o incluir capturas de pantalla en el deck.

### 🟡 Risk #4: Lineage tab contradicción en DTs (H02, H05)
**Severidad: MEDIA**
El deck dice "Click en cualquier Dynamic Table > Lineage tab" pero luego aclara que DTs no tienen Lineage tab. La evaluadora hará clic en una DT, no verá Lineage, y se confundirá.
**Fix:** Eliminar la contradicción. Decir claramente: "Ir a PAGOS > AUTORIZACIONES (tabla base) > Lineage tab para ver el flujo completo incluyendo DTs downstream."

### 🟡 Risk #5: H17 y H18 apuntan al mismo dashboard sin diferenciación
**Severidad: MEDIA**
Ambas tareas dicen "Projects > Streamlit > DASHBOARD_MLOPS". La evaluadora no sabrá qué sección del dashboard corresponde a cada tarea.
**Fix:** Agregar instrucciones: "H17 = tab Pipeline/Training" y "H18 = tab Monitoring/Drift", o separar en dos dashboards distintos.

---

## 3. COVERAGE VERDICT

| Métrica | Valor |
|---------|-------|
| Total tareas evaluadas | 26 |
| PASS autónomo | 13 (50%) |
| CONDITIONAL (necesita facilitador cerca) | 10 (38.5%) |
| FAIL (imposible autónomo) | 3 (11.5%) |
| **Coverage autónomo real** | **~50%** |
| **Coverage con facilitador disponible** | **~88%** |

**Veredicto:** Una evaluadora UX no técnica puede validar autónomamente la mitad de las tareas. Para el otro 38.5% necesitará que el facilitador intervenga en momentos clave (SQL, navegación compleja, interpretación de conceptos técnicos). El 11.5% restante (T3 completo) es imposible sin material de presentación.

---

## 4. RECOMMENDATIONS (Fixes antes del evento)

### P0 — Urgente (bloquean la evaluación)

1. **Crear tab T3 en el overview deck** con paths para H10 (Internal Marketplace / shares), H11 (share permissions/contracts), H12 (Iceberg + external tables). Sin esto, 3 tareas son FAIL automático.

2. **Ejecutar las Tasks del DAG al menos 1 vez** para que Run History tenga datos. Idealmente incluir una ejecución fallida intencional para demostrar capacidad de diagnóstico (H08).

3. **Corregir contradicción Lineage/DTs** en el overview deck. La instrucción "click DT > Lineage" genera frustración cuando no funciona. Cambiar a: "click tabla base AUTORIZACIONES > Lineage tab."

### P1 — Importante (mejoran significativamente la experiencia)

4. **Agregar mini-demo visual de masking** — un Streamlit de 10 líneas que muestre la misma tabla con CRB_NEGOCIO (masked) y ACCOUNTADMIN (full) side by side. Esto elimina la dependencia de SQL para H04.

5. **Diferenciar H17 vs H18** en el deck — indicar qué sección/tab del DASHBOARD_MLOPS corresponde a cada tarea.

6. **Agregar nombre de Snowsight UI exacto** para CoWork/Intelligence en el deck — el nombre cambia entre versiones; poner ambos: "Snowflake Intelligence (también llamado CoWork)".

### P2 — Nice to have (refinamiento)

7. **Renombrar H01** de "Navegar flujo end-to-end" a algo como "Verificar organización de datos por dominio" — más preciso sobre lo que realmente se evalúa.

8. **Para H06 (multicloud)**, agregar una nota en el deck que explique QUÉ hace diferente a la tabla Iceberg visualmente — quizás mostrar las propiedades de la tabla donde dice "ICEBERG" como tipo.

9. **Para H24 (solicitar acceso)**, aclarar que "solicitar acceso" se demuestra a través de tags y roles, no un flujo de request/approval — o crear un flujo real si el ambiente lo soporta.

10. **Pre-cargar el DASHBOARD_BI y DASHBOARD_MLOPS** antes del evento para que los Streamlits no necesiten "warm-up" del warehouse al abrirlos por primera vez.
