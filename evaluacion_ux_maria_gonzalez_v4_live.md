# Evaluación UX en vivo — CredibanCo HOL V4 (RFP 10010806)
## Persona: usuaria de Credibanco, área UX, sin conocimiento técnico
**Método:** Sesión real en Snowsight (no simulada) contra la cuenta `credibanco-hol` (LEDZYD), usando las credenciales USER / ACCOUNTADMIN provistas. Navegación por clics siguiendo el `credibanco_overview_deck.html`, contrastando cada afirmación del deck contra lo que la UI realmente muestra hoy.
**Referencia:** este documento actualiza `evaluacion_ux_maria_gonzalez.md` (v3). No la reemplaza — la complementa con evidencia en vivo.

---

## 0. Primer contacto (antes de tocar el deck)

- **Login:** funcionó con las credenciales dadas, sin fricción.
- **⚠️ Rol por defecto al entrar = `OPENFLOW_ADMIN_RL`, no `ACCOUNTADMIN`.** El deck y la guía asumen que la evaluadora ya está en ACCOUNTADMIN. En la práctica, al iniciar sesión, el rol activo en la esquina superior derecha es OPENFLOW_ADMIN_RL. Una usuaria no técnica no sabrá que debe cambiar de rol antes de empezar, y varias vistas (Catalog, AI & ML, Governance) pueden verse vacías o con menos objetos hasta que cambie manualmente a ACCOUNTADMIN.
  - **Riesgo:** ALTO en el primer minuto de la evaluación — puede parecer que "no hay nada" en la cuenta.
  - **Fix sugerido:** fijar el rol default del usuario `USER` a `ACCOUNTADMIN` en la cuenta HOL, o agregar un paso 0 explícito en la guía: "verifica que el rol activo (arriba a la derecha) diga ACCOUNTADMIN; si no, cámbialo".

- **⚠️ Enrutamiento de Snowsight inestable en esta build.** Varias páginas internas devuelven **"Page not found" / "An unknown error occurred"** cuando se navega directo por URL o se refresca el navegador, aunque la misma página funciona si se llega haciendo clic dentro de la app:
  - `Data sharing > Shared by your account` (falla al refrescar, funciona al hacer clic desde "Shared with you")
  - `Admin > Cost Management > Resource Monitors` (falla consistentemente, incluso navegando por el menú)
  - `AI & ML > Models` (falla en la primera carga, se resuelve con refresh)
  - `Governance & security > Data protection policies` (falla en la primera carga)
  - **Riesgo:** MEDIO-ALTO. Si la evaluadora refresca la página, usa "atrás/adelante" del navegador, o guarda un enlace, puede aterrizar en una pantalla de error genérica sin ninguna pista de qué hacer. Esto no es específico de un track — es un problema transversal de la sesión/build actual.
  - **Fix sugerido:** validar la build de Snowsight antes del evento con un smoke test de "recargar cada página clave"; considerar advertir a los evaluadores "si ves 'Page not found', usa el menú lateral en vez de recargar".

---

## 1. Cambios confirmados desde v3 (fixes aplicados) ✅

| Fix P0/P1 recomendado en v3 | Estado verificado en vivo |
|---|---|
| Crear tab T3 en el overview deck (H10-H12) | ✅ **Aplicado.** El deck ahora tiene 7 tabs incluyendo "T3 — Data Products", con paths, mapa de navegación y 3 tarjetas de prueba completas. |
| Ejecutar las Tasks al menos 1 vez, incluir una falla intencional | ✅ **Aplicado, y mejor de lo pedido.** Task Graph Runs (últimos 7 días) muestra **46 succeeded / 5 failed**, con gráfico de barras visible y un run individual con "29 success / 5 fail". H08 ya tiene evidencia real de diagnóstico, no pantallas vacías. |
| Corregir contradicción Lineage/DTs en el deck | ✅ **Aplicado.** El texto ahora dice explícitamente: *"Las DTs NO tienen Lineage tab propio — aparecen en el grafo de otros objetos"*, sin la instrucción contradictoria de "click en DT > Lineage". |
| Diferenciar H17 vs H18 en el deck | ✅ **Aplicado.** El deck ahora aclara: *"H17 = pipeline y registro del modelo. H18 = monitoreo y drift en producción. Mismo dashboard, secciones distintas."* |
| Aclarar nombre CoWork/Intelligence | ⚠️ Parcial — ver hallazgo nuevo abajo (la ruta cambió, no solo el nombre). |
| Mini-demo visual de masking sin SQL | ❌ No se encontró un Streamlit dedicado a esto, pero el hallazgo de abajo muestra que **ya no se necesita** — el Access tab ahora es suficiente. |

---

## 2. Verificación en vivo por track

### T0 — Arquitectura (H01, H02)
- **H01:** Catalog > Explorer > CREDIBANCO_HOL muestra 18 schemas totales (16 de dominio + INFORMATION_SCHEMA + PUBLIC). Coincide con el deck. **PASS**, confirmado con captura real.
- **H02:** ARQUITECTURA > Views muestra exactamente 3 vistas (PRODUCTO_LIQUI..., PRODUCTO_PAGO..., PRODUCTO_RIESG...). El Lineage tab de PAGOS.AUTORIZACIONES **sí renderiza un grafo visual** con nodos agrupados por schema (PAGOS 13, ANALITICA 3, MONETIZACION 1, ARQUITECTURA 1). **PASS**, mejor que lo esperado.
  - Matiz nuevo: el grafo por defecto agrupa por schema, no muestra los nombres de las DTs individuales hasta que se expande cada grupo — un clic adicional no documentado en el deck.

### T1 — Gobierno (H03–H06)
- **⚠️ Hallazgo nuevo:** el deck dice "Governance & security > **Tags & policies**", pero el sidebar actual ya no tiene esa etiqueta. Ahora dice **"Data protection policies (Preview)"** y "Tags" por separado. El concepto es el mismo pero el nombre cambió — fricción menor de findability.
- **H03:** Data protection policies > Policies muestra **8 políticas totales** (6 masking + 2 row access), coincide con el deck. **PASS**.
- **H04:** El Access tab de CLIENTES.TARJETAHABIENTES muestra **directamente y sin SQL** las 6 políticas de masking aplicadas (MASK_CEDULA, MASK_CELULAR, MASK_EMAIL, MASK_FECHA_NAC, MASK_NOMBRE, MASK_PAN) + RAP_TARJETAHABIENTES, cada una agrupada por rol. Esto es **mejor evidencia visual que la que asume el reporte v3** — la evaluadora puede confirmar que el masking está aplicado sin tocar SQL. Solo la "prueba de fuego" (ver el dato enmascarado vs. completo cambiando de rol) sigue requiriendo SQL. **Upgrade: CONDITIONAL → casi PASS.**
- **H05:** Confirmado — Lineage tab funciona (ver T0). El **Data Quality tab también existe** en AUTORIZACIONES y muestra la asociación DMF_MONTO_VALIDO ↔ columna MONTO, pero reporta **"0/1 association passing" y "1 with no checks"** — el DMF está configurado pero no tiene resultados recientes. Esto confirma parcialmente el riesgo de v3: el tab existe (mejor de lo que se temía), pero su contenido puede parecer "roto" o vacío a ojos de una evaluadora. **Sigue CONDITIONAL.**
  - **Fix sugerido:** ejecutar el DMF al menos una vez antes del evento (`ALTER TABLE ... ADD DATA METRIC FUNCTION` ya aplicado; falta forzar una ejecución o esperar el schedule).
- **H06:** No verificado en vivo en esta sesión (Iceberg + shares) — ver T3 abajo, que cubre el mismo objeto.

### T2 — Ingeniería (H07–H09)
- **H07/H08:** **Task Graph Runs** confirma 46 éxitos / 5 fallos en 7 días con gráfico visual y desglose por task individual. Esto **revierte el Risk #2 de v3** — ya no hay pantallas vacías de "No runs". **PASS.**
- **H09:** No verificado en vivo (Git repo + dbt) en esta sesión.

### T3 — Data Products (H10–H12)
- **✅ El tab T3 existe y tiene contenido completo** (ver sección 1). Las 3 tarjetas de prueba (H10, H11, H12) tienen paths específicos: Data sharing > External sharing, KAFKA_EVENTOS_STREAMING > Overview (Schema Evolution), ICE_AUTORIZACIONES_APROBADAS > Overview.
- **H10 verificado:** Data sharing > External sharing > **"Shared by your account"** muestra **2 shares directos** (ambos con prefijo "CR..." = CredibanCo), tipo "Direct", coincide con el deck. **PASS** (con la salvedad del bug de navegación de la sección 0 — este tab falla al refrescar la URL directamente, solo funciona navegando por clic desde "Shared with you").
- H11/H12 no verificados visualmente en esta sesión pero los objetos referenciados (KAFKA_EVENTOS_STREAMING, ICE_AUTORIZACIONES_APROBADAS) ya se confirmaron existentes en el árbol de Catalog Explorer bajo PAGOS y STREAMING_DEMO.
- **Veredicto T3 completo: pasa de FAIL automático (v3) a evaluable con material de apoyo.** Sigue siendo el track más "conceptual" (data products, contratos, interoperabilidad son términos abstractos para una UX no técnica), pero ya no está huérfano de guía visual.

### T4 — IA/ML (H13–H20)
- **H13:** AI & ML > Models muestra **2 modelos**: MODELO_CHURN_COMERCIOS (v1) y MODELO_FRAUDE_CREDIBANCO (v2). Coincide con el deck. **PASS**.
- **⚠️ Hallazgo nuevo sobre navegación:** el deck dice ir a "AI & ML" para ver Agents; en la UI actual, el ítem de sidebar "AI & ML" lleva directamente a **"Agent Studio"** (la página de administración de agentes), que lista los agentes con nombres reales en español ("Agente Riesgo y Fraude", "Agente Transaccion..."). Para **usarlos** (hacer una pregunta), hay que ir a un enlace separado "Snowflake CoWork" que abre una app externa (`ai.snowflake.com`). Esto es un paso adicional no descrito explícitamente en el deck (que solo dice "Snowflake Intelligence (CoWork)" como si fuera un ítem de sidebar).
  - **Riesgo:** MEDIO. Una evaluadora podría quedarse en "Agent Studio" (vista de administración) sin darse cuenta de que debe cruzar a otra URL para chatear con el agente.

### T6/T7 — Marketplace/Admin (H24–H30)
- **H27:** Admin > Cost Management > Account Overview muestra Cost summary (59.9 credits MTD, avg 2.3/día), Monthly budget utilization, **Anomalies (1, sin nuevas en 24h)**, y **Optimization insights ("You are all optimized!")**. Esto **confirma que "Optimization Insights" SÍ existe** en esta cuenta — contradice la duda de v3 sobre si el feature estaría disponible. **H28 upgrade: CONDITIONAL → PASS.**
- **H25/H29 (Resource Monitors):** no se pudo verificar visualmente — el tab "Resource Monitors" dentro de Cost Management **devuelve "Page not found" de forma reproducible**, incluso navegando por el menú (no solo por URL directa). Este es un bug real de la build actual, no un error de la evaluadora.
  - **Riesgo:** ALTO para H25 y H29 específicamente — si este bug persiste el día del evento, esas dos tareas son un FAIL garantizado para cualquier evaluador, técnico o no.
  - **Fix sugerido URGENTE:** reproducir este error antes del evento (recargar la página de Resource Monitors en la cuenta real) y, si persiste, escalarlo como bug de producto o tener un plan B (mostrar el Resource Monitor vía `SHOW RESOURCE MONITORS` en un worksheet como respaldo).

---

## 3. Tabla comparativa de veredictos (v3 → v4 en vivo)

| ID | Track | Veredicto v3 | Veredicto v4 (en vivo) | Cambio |
|----|-------|--------------|------------------------|--------|
| H01 | T0 | PASS | PASS | = |
| H02 | T0 | CONDITIONAL | PASS | ↑ mejora |
| H03 | T1 | PASS | PASS | = |
| H04 | T1 | CONDITIONAL | CONDITIONAL (casi PASS) | ↑ mejora |
| H05 | T1 | CONDITIONAL | CONDITIONAL | = (tab existe, DMF sin resultados) |
| H07 | T2 | PASS | PASS | = |
| H08 | T2 | CONDITIONAL (riesgo alto) | **PASS** | ↑↑ mejora fuerte |
| H10 | T3 | FAIL | PASS (con caveat de bug de navegación) | ↑↑ mejora fuerte |
| H11 | T3 | FAIL | No verificado, pero material de apoyo existe | ↑ probable mejora |
| H12 | T3 | FAIL | No verificado, pero material de apoyo existe | ↑ probable mejora |
| H13 | T4 | PASS | PASS | = |
| H17/H18 | T4 | CONDITIONAL (confusión) | Diferenciados en el deck; dashboard no verificado en vivo | ↑ mejora en texto |
| H27 | T7 | PASS | PASS | = |
| H28 | T7 | CONDITIONAL | **PASS** | ↑ mejora |
| H25/H29 | T6/T7 | PASS (asumido) | **BLOQUEADO — página rota** | ↓↓ regresión nueva |

---

## 4. Nuevos riesgos detectados en la sesión en vivo (no estaban en v3)

### 🔴 Riesgo nuevo #1: Rol por defecto incorrecto al iniciar sesión
Ya descrito en sección 0. **Fix:** cambiar el default role del usuario a ACCOUNTADMIN, o agregar advertencia en la guía.

### 🔴 Riesgo nuevo #2: Páginas rotas ("Page not found") en navegación core, reproducible
"Resource Monitors" dentro de Cost Management no carga. Esto bloquea H25 y H29 por completo, no por confusión de la evaluadora sino por un error real de la aplicación. **Severidad crítica** porque afecta a cualquier perfil de usuario, no solo a los no técnicos.

### 🟡 Riesgo nuevo #3: Ruta a CoWork tiene un salto adicional no documentado
AI & ML ahora lleva a "Agent Studio" (administración), y usar el agente requiere cruzar a una app externa vía el enlace "Snowflake CoWork". El deck no aclara este salto de dos pasos.

### 🟡 Riesgo nuevo #4: Etiqueta de sidebar desalineada con el deck
"Tags & policies" (deck) vs. "Data protection policies (Preview)" (UI real). Concepto igual, nombre distinto — fricción de búsqueda de 5-10 segundos, no bloqueante.

---

## 5. Recomendaciones priorizadas (actualizadas)

### P0 — Urgente, antes del evento
1. **Verificar y arreglar el bug de "Page not found" en Resource Monitors** (Admin > Cost Management). Si no se puede arreglar a tiempo, preparar un respaldo (captura de pantalla o SQL de contingencia) para H25/H29.
2. **Fijar el rol default del usuario `USER` a ACCOUNTADMIN** en las cuentas HOL, para eliminar la fricción del primer minuto.
3. **Ejecutar `DMF_MONTO_VALIDO` al menos una vez** para que el Data Quality tab de AUTORIZACIONES no muestre "0/1 passing, 1 with no checks".

### P1 — Importante
4. Actualizar el deck: reemplazar "Governance & security > Tags & policies" por "Data protection policies" para que coincida con la UI real.
5. Aclarar en el deck el salto de dos pasos para usar agentes: "AI & ML > Agent Studio (para ver/administrar) → botón/enlace 'Snowflake CoWork' (para conversar con el agente)".
6. Advertir a los facilitadores sobre la inestabilidad de refresh/URL directa en esta build de Snowsight: "si ves un error, usa el menú lateral, no recargues la página".

### P2 — Nice to have
7. Confirmar en vivo H11, H12, H06, H09, H17/H18 (dashboard), H24, H30 — esta sesión no llegó a cubrirlos con captura de pantalla, aunque los objetos subyacentes ya se confirmaron existentes vía Catalog Explorer.

---

## 6. Conclusión

La v4 del HOL corrigió exitosamente los 3 hallazgos P0 de la evaluación anterior (tab T3, historial de Tasks, contradicción de Lineage) y además mejoró sin que se pidiera explícitamente: el Access tab de gobernanza ahora es una prueba visual fuerte de masking sin SQL, y el Cost Management sí tiene Optimization Insights funcionando.

Sin embargo, la sesión en vivo reveló un problema nuevo y más grave que cualquiera de los anteriores: **partes de la navegación core de Snowsight (Resource Monitors, y en menor medida otras páginas) devuelven errores de "Page not found" de forma reproducible**, independientemente del perfil del usuario. Esto no es un problema de claridad del deck — es un bug de la aplicación que puede bloquear tareas de evaluación completas el día del evento. Se recomienda una prueba de humo específica sobre esa página antes del RFP.

---

## 7. Addendum — Verificación por SQL de las tareas no cubiertas en el browser (post-sesión)

Tras cerrar la sesión de navegador, se verificó vía `snow sql -c credibanco-hol` (rol ACCOUNTADMIN directo) la existencia real de los objetos subyacentes para las tareas que quedaron marcadas como "no verificado en vivo", y se diagnosticó el bug de Resource Monitors. Esto **no reemplaza** la prueba de UI (la UI puede seguir fallando aunque el dato exista, como pasó con Resource Monitors) pero **descarta que el problema sea de datos o de permisos**.

### 7.1 Diagnóstico del bug de Resource Monitors (hallazgo clave)

```sql
SHOW RESOURCE MONITORS;
```
**Resultado:** existen 2 resource monitors, ambos correctamente configurados — `MONITOR_CREDIBANCO` (credit_quota=100, notify_at 75%/90%, frequency MONTHLY) y `RM_HOL_CREDIBANCO` (credit_quota=100, notify_at 75%/90%, frequency MONTHLY, coincide exactamente con lo que el deck promete para H25/H29).

**Conclusión:** el dato existe y está bien configurado. El error "Page not found" en Snowsight **es 100% un bug de la SPA/routing de Snowsight**, no un problema de permisos, de rol (ni siquiera con ACCOUNTADMIN puro vía CLI hay problema de acceso) ni de que el objeto no exista. Esto sube la severidad del hallazgo: es un bug de producto reproducible, no un artefacto de la sesión de browser. **Se mantiene como P0**, pero ahora con causa raíz descartada del lado de datos/config — hay que escalarlo como bug de Snowsight, no de la cuenta HOL.

### 7.2 Tareas verificadas por SQL (objetos subyacentes confirmados)

| Tarea | Objeto verificado | Resultado SQL |
|---|---|---|
| **H06 / H12** | `PAGOS.ICE_AUTORIZACIONES_APROBADAS` | `IS_ICEBERG = YES` confirmado en `INFORMATION_SCHEMA.TABLES`. Coincide con lo que promete el deck. |
| **H09** | `PLATAFORMA.HOL_REPO` (Git) | `SHOW GIT REPOSITORIES` → repo conectado a `https://github.com/sfc-gh-jcastaneda/credibanco-hol.git`, integración `GITHUB_GIT_INTEGRATION`, owner ACCOUNTADMIN. Existe y está vivo. |
| **H09** | dbt project `CREDIBANCO_ANALYTICS` | `SHOW DBT PROJECTS` → confirmado, con `default_version` configurado. |
| **H11** | `PAGOS.SV_AUTORIZACIONES` (Semantic View) | `SHOW SEMANTIC VIEWS` → existe, comentario "Vista semántica CredibanCo: transacciones, comercios y liquidaciones", extension `["AI"]`. |
| **H11** | `STREAMING_DEMO.KAFKA_EVENTOS_STREAMING` | Confirmado que es tabla Iceberg (parámetros `EXTERNAL_VOLUME`, `CATALOG`, `ICEBERG_MERGE_ON_READ_BEHAVIOR` presentes). ⚠️ No se pudo confirmar el flag específico de `ENABLE_SCHEMA_EVOLUTION` por SQL en esta sesión (no aparece en `SHOW PARAMETERS IN TABLE`) — **queda pendiente verificar este punto puntual en el browser**, el resto de la afirmación (tabla Iceberg activa) sí está confirmado. |
| **H16** | `ANALITICA.FEATURES_RIESGO_COMERCIO` | Tabla existe (confirmado en `INFORMATION_SCHEMA.TABLES` tras corregir un falso negativo de un `SHOW TABLES LIKE` mal filtrado). No se confirmaron tags `SNOWML_FEATURE_*` por timeout de contexto — **pendiente de una pasada rápida en el Access tab**. |
| **H19 / H20** | Agentes en `ANALITICA` | `SHOW AGENTS IN ACCOUNT` confirma exactamente los 3 agentes de CredibanCo que promete el deck: `AGENTE_RIESGO`, `AGENTE_SARLAFT`, `AGENTE_TRANSACCIONES` (más `SNOWFLAKE_DCR_AGENT`, que es un agente default de la plataforma, no de CredibanCo — el deck dice "3 agentes" y es correcto si no se cuenta el default). |
| **H24** | Tags/policies sobre `AUTORIZACIONES` | Ya confirmado en la sesión de browser (Access tab con 6 masking + 1 row access policy sobre `TARJETAHABIENTES`); el mecanismo de búsqueda en Catalog Explorer no se probó por texto libre, pero el objeto y sus metadatos de gobernanza sí están ahí. |
| **H30** | Alertas en `PLATAFORMA` | `SHOW ALERTS IN ACCOUNT` confirma `ALERTA_CONSUMO_ANOMALO` y `ALERTA_FRESCURA_DATOS` (ambas `state = started`), exactamente como promete el deck. Bonus: existe una tercera, `ALERTA_CONSUMO_ANOMALO_USER`, no mencionada en el deck pero también activa. |

### 7.3 Impacto en el veredicto

Ninguna de estas verificaciones cambia un PASS/FAIL de la tabla comparativa de la Sección 3 — siguen marcadas como "no verificado en vivo en UI" porque **la prueba de UI es la que realmente importa para la evaluación UX** (un bug de routing como el de Resource Monitors demuestra que "el dato existe" no garantiza "la usuaria lo puede ver"). Lo que sí cambian estas verificaciones:

- **Descartan una causa alternativa** para el bug de Resource Monitors (no es falta de datos ni de permisos) → sube la confianza de que es un bug de plataforma a escalar, no algo que se arregle regenerando el HOL.
- **Reducen el riesgo real** de H06, H09, H11 (parcial), H12, H19, H20, H30 — los objetos subyacentes existen y coinciden con el deck, por lo que si la UI se comporta igual que en el resto de tracks verificados en vivo (la mayoría PASS), es razonable esperar PASS también aquí. Quedan como **"probable PASS, pendiente de captura visual"** en vez de "no verificado".
- **Deja abiertos dos puntos finos** para una próxima pasada corta en browser: el flag de schema evolution en `KAFKA_EVENTOS_STREAMING` (H11) y los tags `SNOWML_FEATURE_*` visibles en el Access tab de `FEATURES_RIESGO_COMERCIO` (H16).
