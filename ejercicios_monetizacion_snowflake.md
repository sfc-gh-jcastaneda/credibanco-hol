# Ejercicios Prácticos en Snowflake

---

## Ejercicio 1: Consumir un producto de datos desde el Marketplace

### Objetivo

El Snowflake Marketplace es un catálogo donde proveedores de datos publican conjuntos de datos listos para consumir. En lugar de descargar archivos o configurar integraciones, puedes acceder a datos de terceros directamente desde tu cuenta de Snowflake, sin mover ni copiar datos. En este ejercicio explorarás el Marketplace y consumirás un producto de datos geoespaciales de puntos de interés (POI) en Estados Unidos, que quedará disponible como una base de datos en tu cuenta.

### Pasos

1. Inicia sesión en **Snowsight** (la interfaz web de Snowflake).

2. En el menú lateral izquierdo, haz clic en **Data Products** y luego en **Marketplace**.

3. En la barra de búsqueda, escribe **POI (Points of Interest) Counts - US** y presiona Enter.

4. Selecciona el **primer resultado** que aparezca en la lista.

5. Haz clic en el botón **Start Trial** para comenzar la prueba gratuita del producto de datos.

6. Confirma la operación en el diálogo que aparece. Snowflake creará automáticamente una nueva base de datos en tu cuenta con los datos compartidos.

7. Una vez completado, verifica que la base de datos aparece en tu cuenta navegando a **Data** > **Databases** en el menú lateral.

---

## Ejercicio 2: Crear un Listing como proveedor de datos

### Objetivo

Ahora cambiarás de rol: pasarás de consumidor a **proveedor** de datos. Usando el Provider Studio de Snowflake, crearás un Listing para compartir datos de benchmark transaccional de Credibanco con cuentas específicas. Esto permite que otras organizaciones consulten tus datos directamente desde sus propias cuentas de Snowflake, sin que los datos se copien ni salgan de tu entorno.

### Prerequisito

Antes de comenzar, es necesario crear la base de datos, la tabla y la función que se van a compartir. Para ello, ejecuta el archivo **`crb_vip_comercios_setup.sql`** en un Worksheet de Snowflake:

1. En Snowsight, ve a **Projects** > **Worksheets**.
2. Haz clic en **+** para crear un nuevo Worksheet.
3. Copia y pega el contenido completo del archivo `crb_vip_comercios_setup.sql`.
4. Ejecuta todo el script (selecciona todo con `Ctrl+A` y haz clic en **Run**).
5. Verifica que se creó la base de datos `CRB_VIP_COMERCIOS` navegando a **Data** > **Databases**.

Este script crea:
- La base de datos `CRB_VIP_COMERCIOS`
- La tabla `ANALYTICS.BENCHMARK_CATEGORIA` con datos de benchmark por ciudad y categoría
- La función `ANALYTICS.FN_COMPARAR_COMERCIO` que permite a un comercio compararse contra su categoría

### Información del Listing

- **Título:** CRB VIP Comercios - Benchmark Transaccional por Categoría
- **Base de datos:** `CRB_VIP_COMERCIOS`
- **Objetos incluidos:**
  - Tabla: `CRB_VIP_COMERCIOS.ANALYTICS.BENCHMARK_CATEGORIA`
  - Función: `CRB_VIP_COMERCIOS.ANALYTICS.FN_COMPARAR_COMERCIO(ciudad, categoría, facturación)`

### Parte A: Crear el Listing

1. En el menú lateral izquierdo, haz clic en **Data Products** > **Marketplace**.

2. Haz clic en **Provider Studio**.

3. Haz clic en **Create Listing**.

4. Selecciona **Specified Consumers**.

5. Selecciona el rol **Administrador**.

6. En el campo de nombre, escribe **CREDIBANCO**.

7. Haz clic en **Save**.

### Parte B: Agregar el Data Product

1. Haz clic en **Add Data Product** y luego en **Select**.

2. Selecciona **CRB-VIP-Comercios**.

3. Selecciona **Analytics**.

4. Selecciona la tabla **BENCHMARK_CATEGORIA**.

5. Selecciona la función **FN_COMPARAR_COMERCIO**.

6. Haz clic en **Done**.

7. Haz clic en **Save**.

### Parte C: Configurar el Listing

1. En **Access Type**, selecciona **Free**.

2. En **Data Product**, escribe la siguiente descripción:

   > Credibanco pone a disposición de sus comercios afiliados datos agregados y anonimizados de benchmark transaccional por ciudad y categoría de comercio en Colombia. Incluye promedios de facturación, ticket promedio, volumen de transacciones y distribución por percentiles. Adicionalmente, se provee una función analítica que permite a cada comercio compararse contra el promedio de su categoría y recibir un diagnóstico automático con recomendaciones.

3. En **Data Dictionary**:
   - Selecciona **Analytics**.
   - Selecciona **Tablas**.
   - Selecciona la función y haz clic en **Add to Feature Save**.

4. En **Business Needs**, agrega los siguientes casos de uso:

   | Caso de uso | Descripción |
   |---|---|
   | Benchmarking competitivo | Compara la facturación de tu comercio contra el promedio de tu categoría y ciudad para identificar si estás por encima o por debajo del mercado. |
   | Planeación de expansión | Evalúa el tamaño del mercado por categoría en distintas ciudades para decidir dónde abrir una nueva sede o franquicia. |
   | Diagnóstico de rendimiento | Obtén un percentil estimado y recomendaciones accionables según tu posición relativa dentro de tu segmento. |
   | Estrategia de precios y ticket promedio | Compara tu ticket promedio contra el de tu categoría para ajustar precios o diseñar promociones. |

5. En **Quick SQL Examples**, agrega los siguientes queries:

   **Ejemplo 1 - Explorar el benchmark completo de una ciudad:**
   ```sql
   SELECT 
       CATEGORIA_COMERCIO,
       NUM_COMERCIOS,
       TO_CHAR(FACTURACION_PROMEDIO_MENSUAL, '$999,999,999,999') AS FACTURACION_PROMEDIO,
       TO_CHAR(TICKET_PROMEDIO, '$999,999,999') AS TICKET_PROMEDIO,
       NUM_TRANSACCIONES_PROMEDIO,
       PERIODO
   FROM ANALYTICS.BENCHMARK_CATEGORIA
   WHERE CIUDAD = 'Bogotá'
   ORDER BY FACTURACION_PROMEDIO_MENSUAL DESC;
   ```

   **Ejemplo 2 - Comparar ciudades para una categoría específica:**
   ```sql
   SELECT 
       CIUDAD,
       NUM_COMERCIOS,
       TO_CHAR(FACTURACION_PROMEDIO_MENSUAL, '$999,999,999,999') AS FACTURACION_PROMEDIO,
       TO_CHAR(TICKET_PROMEDIO, '$999,999,999') AS TICKET_PROMEDIO
   FROM ANALYTICS.BENCHMARK_CATEGORIA
   WHERE CATEGORIA_COMERCIO = 'Restaurantes'
   ORDER BY FACTURACION_PROMEDIO_MENSUAL DESC;
   ```

   **Ejemplo 3 - Diagnosticar mi comercio con la función:**
   ```sql
   -- "Tengo un restaurante en Medellín que factura $25M al mes, ¿cómo me va?"
   SELECT * FROM TABLE(ANALYTICS.FN_COMPARAR_COMERCIO('Medellín', 'Restaurantes', 25000000));
   ```

   **Ejemplo 4 - Comparar múltiples escenarios:**
   ```sql
   -- "Estoy evaluando abrir una farmacia: ¿en qué ciudad me iría mejor si espero facturar $30M?"
   SELECT * FROM TABLE(ANALYTICS.FN_COMPARAR_COMERCIO('Bogotá', 'Farmacias', 30000000))
   UNION ALL
   SELECT * FROM TABLE(ANALYTICS.FN_COMPARAR_COMERCIO('Medellín', 'Farmacias', 30000000))
   UNION ALL
   SELECT * FROM TABLE(ANALYTICS.FN_COMPARAR_COMERCIO('Cali', 'Farmacias', 30000000))
   UNION ALL
   SELECT * FROM TABLE(ANALYTICS.FN_COMPARAR_COMERCIO('Barranquilla', 'Farmacias', 30000000))
   UNION ALL
   SELECT * FROM TABLE(ANALYTICS.FN_COMPARAR_COMERCIO('Cartagena', 'Farmacias', 30000000));
   ```

6. Completa la sección **Add Legal Terms**.

7. Completa la sección **Attributes**.

### Parte D: Agregar la cuenta del consumidor

1. Ve a la sección **Add Consumer Accounts**.

2. Necesitas el **Account Identifier** de la cuenta de tu pareja en el workshop. Para obtenerlo, pídele que haga lo siguiente en su cuenta de Snowflake:
   - Haga clic en su **perfil** (esquina inferior izquierda).
   - Seleccione **Connect Tool to Snowflake**.
   - Copie el **Account Identifier** que aparece y te lo comparta.

3. Ingresa el Account Identifier de tu pareja en el campo de Consumer Accounts.

### Parte E: Publicar el Listing

1. Revisa que toda la información del Listing esté completa.

2. Haz clic en **Publish**.

3. Confirma la publicación. Tu Listing ahora estará disponible para la cuenta consumidora que agregaste.

### Parte F: Consumir el Listing de tu compañero (desde la otra cuenta)

Ahora cambia a la **otra cuenta** (la de tu pareja en el workshop). Desde allí vas a consumir el Listing que tu compañero acaba de publicar.

1. Inicia sesión en la cuenta de tu pareja.

2. En el menú lateral izquierdo, haz clic en **Data Products** > **Private Sharing**.

3. Verás el Listing que tu compañero publicó. Haz clic sobre él.

4. Haz clic en el botón **Get**.

5. Deja el **nombre de la base de datos** tal como aparece (no lo cambies).

6. Asigna el rol **PUBLIC**.

7. Haz clic en el botón **Get** para confirmar.

8. Haz clic en **Query Data** para abrir un Worksheet con los datos compartidos.

9. Ejecuta los dos queries de ejemplo para verificar que puedes acceder a los datos:

   **Query 1 - Ver el benchmark por categoría en Bogotá:**
   ```sql
   SELECT 
       CATEGORIA_COMERCIO,
       NUM_COMERCIOS,
       TO_CHAR(FACTURACION_PROMEDIO_MENSUAL, '$999,999,999,999') AS FACTURACION_PROMEDIO,
       TO_CHAR(TICKET_PROMEDIO, '$999,999,999') AS TICKET_PROMEDIO,
       NUM_TRANSACCIONES_PROMEDIO,
       PERIODO
   FROM ANALYTICS.BENCHMARK_CATEGORIA
   WHERE CIUDAD = 'Bogotá'
   ORDER BY FACTURACION_PROMEDIO_MENSUAL DESC;
   ```

   **Query 2 - Diagnosticar un comercio con la función:**
   ```sql
   -- "Tengo un restaurante en Medellín que factura $25M al mes, ¿cómo me va?"
   SELECT * FROM TABLE(ANALYTICS.FN_COMPARAR_COMERCIO('Medellín', 'Restaurantes', 25000000));
   ```

Si ambos queries devuelven resultados, el Data Sharing fue exitoso. Ahora el comercio consumidor puede compararse contra los benchmarks de su categoría directamente desde su propia cuenta de Snowflake, sin que los datos hayan sido copiados.

---

## Ejercicio 3: Data Clean Room (Demo en vivo)

### Objetivo

Un Data Clean Room permite que dos organizaciones crucen y analicen datos de forma conjunta sin que ninguna de las partes vea los datos crudos de la otra. En este ejercicio, Credibanco (proveedor) y un retailer (comercio) cruzarán datos transaccionales con datos de lealtad para obtener insights de audiencia, todo dentro de un entorno seguro y controlado.

> **Nota:** Este ejercicio será ejecutado por voluntarios en el computador del instructor.

### Parte A: Configuración desde el Proveedor (Credibanco)

1. Primero, valida la data desde el lado del proveedor (Credibanco).

2. Ingresa a la aplicación de **Data Clean Rooms**.

3. Haz clic en **Nuevo Data Clean Room** y ponle el nombre **Credibanco-DCR**.

4. Selecciona la tabla **datos de transacciones** y haz clic en **Siguiente**.

5. Selecciona como join común el campo **token de tarjeta** y haz clic en **Siguiente**.

6. Selecciona la tabla **datos transacciones**.

7. Selecciona los siguientes campos:
   - Cadena
   - Categoría
   - Ciudad
   - Esfera
   - Tipo de tarjeta
   - Franquicia

8. Haz clic en **Siguiente**.

9. Selecciona como colaborador al **retailer** y haz clic en **Finish**.

### Parte B: Configuración desde el Comercio (Retailer)

1. Ingresa a la **otra cuenta** (la del comercio/retailer).

2. Navega a la pestaña de **Clean Rooms** y selecciona la pestaña **Invited**.

3. Verás el Data Clean Room **Credibanco-DCR** esperando aceptación. Haz clic en **Join**.

4. Selecciona la tabla **datos clientes lealtad** y haz clic en **Siguiente**.

5. Selecciona la columna **token de tarjeta** como columna de join y haz clic en **Siguiente**.

6. Selecciona la tabla y marca los siguientes campos:
   - Categoría preferida
   - Ciudad
   - Género
   - Rango de edad
   - Segmento

7. Haz clic en **Finish**.

### Parte C: Ejecutar el análisis en el Data Clean Room

1. Dentro del Data Clean Room, haz clic en **Run**.

2. Selecciona **Análisis y Queries**.

3. Ejecuta el primer análisis configurando lo siguiente:
   - Selecciona el **período de tiempo** que deseas analizar.
   - Selecciona el **join de las tablas**.
   - Selecciona la columna de join: **token de tarjeta**.
   - Selecciona las **columnas propias y del colaborador** con las que se ejecutará el análisis.

4. En este caso no seleccionaremos filtros, pero puedes hacerlo para generar tu propia segmentación de audiencias.

5. Haz clic en **Run**.

### Parte D: Resultados y activación

1. Una vez termine la ejecución, podrás ver el **overlap de audiencias** entre ambos conjuntos de datos.

2. Haz clic en **Activar** para ver las opciones de activación. Una de ellas es el **push down a la cuenta de Snowflake**.

### Parte E: Consultar resultados con Snowflake Intelligence (Cowork)

1. Entra a tu cuenta de Snowflake.

2. Abre **Cowork** (Snowflake Intelligence).

3. Dado que se creó una vista semántica sobre la tabla resultado del Data Clean Room, selecciona el agente **Inteligencia de Gasto DCR Credibanco**.

4. Ahora puedes hacer preguntas en lenguaje natural sobre los resultados del cruce de datos. Algunos ejemplos:

   - *¿Cuáles son las cadenas donde más gastan nuestros clientes fuera de Super Tiendas?*
   - *¿Qué porcentaje del gasto ocurre en municipios de la periferia?*
   - *¿Cuál es el share of wallet de Super Tiendas por segmento de lealtad?*
   - *¿Cuántos clientes Oro compran en cadenas de la competencia y cuánto gastan?*

---
