-- =============================================================================
-- TRACK 8 · Paso 1: Assessment de Cloudera desde Snowflake (via Cortex Code / Coco)
-- =============================================================================
-- Objetivo: conectar Snowflake a un HiveServer2 de Cloudera (CDP / on-prem)
-- vía External Access Integration, para poder hacer "assessment con Coco":
-- listar bases, tablas, esquemas y hacer preguntas en lenguaje natural sobre
-- el ambiente Cloudera directamente desde el chat de Cortex Code.
--
-- LISTO PARA COPIAR Y PEGAR: apunta al Cloudera sandbox de Martinexsa
-- (ambiente controlado / sin data real) con credenciales ya incluidas.
-- Cada persona lo corre en SU PROPIA cuenta Snowflake -- no hay nada que
-- reemplazar, solo ejecutar de punta a punta.
--
-- Requisitos de tu Hive Server2 / Cloudera:
--   - Debe exponer Thrift sobre HTTP (no el puerto binario 10000 clásico)
--   - Puerto típico: 443 (HTTPS) o el que tu admin de Cloudera indique
--   - http_path típico: "cliservice"
--   - Auth: PLAIN (usuario/password) -- si tu Cloudera usa Kerberos/LDAP con
--     otro mecanismo, cambia auth_mechanism en el paso 5.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- PASO 0: Namespace de trabajo (cámbialo por el tuyo si ya tienes uno)
-- ---------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS CREDIBANCO_HOL;
CREATE SCHEMA IF NOT EXISTS CREDIBANCO_HOL.CLOUDERA_ASSESSMENT;
USE SCHEMA CREDIBANCO_HOL.CLOUDERA_ASSESSMENT;

-- ---------------------------------------------------------------------------
-- PASO 0b: Warehouse Snowpark-optimized con x86 -- REQUERIDO
-- Los procs de este paso instalan impyla, que trae internamente el paquete
-- thrift==0.16.0 (código nativo/C) como dependencia -- SIEMPRE, sin importar
-- si lo listas explícito o no en PACKAGES. En algunas cuentas/regiones un
-- warehouse Standard plano compila este código nativo sin problema; en
-- otras (confirmado en la cuenta HOL real del cliente) la compilación falla
-- de forma consistente en Standard y solo funciona forzando arquitectura
-- x86 explícita -- por eso usamos SIEMPRE esta config, para que el script
-- funcione igual sin importar en qué cuenta/región se ejecute.
-- Usamos CREATE OR REPLACE (no IF NOT EXISTS) para garantizar esta config
-- exacta aunque ya exista un warehouse con este nombre en otra configuración
-- (por ejemplo, de un intento anterior).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE WAREHOUSE CLOUDERA_ASSESSMENT_WH
  WAREHOUSE_SIZE = MEDIUM
  WAREHOUSE_TYPE = 'SNOWPARK-OPTIMIZED'
  RESOURCE_CONSTRAINT = 'MEMORY_1X_X86'
  AUTO_SUSPEND = 60
  AUTO_RESUME = TRUE
  INITIALLY_SUSPENDED = TRUE
  COMMENT = 'Warehouse Snowpark-optimized (x86) dedicado para los procs de assessment de Cloudera (Track 8)';
USE WAREHOUSE CLOUDERA_ASSESSMENT_WH;

-- ---------------------------------------------------------------------------
-- PASO 1: Network Rule -- permite la salida (egress) SOLO hacia tu Cloudera
-- ---------------------------------------------------------------------------
CREATE OR REPLACE NETWORK RULE CLOUDERA_HIVE_NETWORK_RULE
  MODE = EGRESS
  TYPE = HOST_PORT
  VALUE_LIST = ('hs2-mtrx-snow-cdp-warehouse-2.dw-mtrx-snow-cdp-env.v4nv-63pq.cloudera.site:443');

-- ---------------------------------------------------------------------------
-- PASO 2: Secret -- credenciales del usuario Hive/Cloudera (nunca en texto
-- plano dentro del código; siempre se recupera vía _snowflake.get_username_password)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE SECRET CLOUDERA_HIVE_CREDENTIALS
  TYPE = PASSWORD
  USERNAME = 'srv_snowflake_cloudera'
  PASSWORD = 'Snowflake_cloudera_password_test_2026_%$';

-- ---------------------------------------------------------------------------
-- PASO 3: External Access Integration -- une la network rule + el secret
-- ---------------------------------------------------------------------------
CREATE OR REPLACE EXTERNAL ACCESS INTEGRATION CLOUDERA_HIVE_ACCESS_INTEGRATION
  ALLOWED_NETWORK_RULES = (CLOUDERA_HIVE_NETWORK_RULE)
  ALLOWED_AUTHENTICATION_SECRETS = (CLOUDERA_HIVE_CREDENTIALS)
  ENABLED = TRUE
  COMMENT = 'Acceso al Hive Server2 de Cloudera CDP para assessment (Track 8)';

-- ---------------------------------------------------------------------------
-- PASO 4: Stored Procedure de conexión -- IMPORTANTE: las versiones de
-- PACKAGES están fijadas (pinned) a propósito. Snowflake resuelve
-- dependencias vía Anaconda channel y, sin fijar versiones exactas, puede
-- elegir una combinación distinta (impyla 0.16 + thriftpy2) que tiene un bug
-- conocido de autenticación Basic Auth (newline en el header). Esta
-- combinación exacta fue validada y funciona.
--
-- CAUSA RAIZ REAL (encontrada con acceso directo a la cuenta HOL real):
-- NO pongas `RESOURCE_CONSTRAINT=(architecture='x86')` en el proc. El
-- warehouse Snowpark-optimized MEMORY_1X_X86 (PASO 0b) ya le da hardware x86
-- a la compilación de `thrift` -- eso es lo único que se necesitaba.
-- Agregar la anotación x86 TAMBIÉN en el proc rompe la EJECUCIÓN (no la
-- creación) cuando el proc usa EXTERNAL_ACCESS_INTEGRATIONS: fue aislado
-- experimentalmente que esa combinación exacta (arquitectura x86 en el
-- proc + external access integration) causa
-- "SQL execution internal error: Processing aborted due to error
-- 370001:...; incident ..." en CADA `CALL`, incluso sin llegar a usar el
-- secret ni hacer ninguna conexión de red -- ocurre con solo declarar
-- EXTERNAL_ACCESS_INTEGRATIONS junto con la anotación x86 en el proc. Sin
-- la anotación x86 en el proc (dejando solo el warehouse como x86), todo
-- funciona sin problema: creación y ejecución exitosas, repetible.
--
-- SI FALLA LA CREACION (compilación de thrift nativo):
--   "Failed to create function. The source distribution for package
--   thrift-0.16.0 requires native code to be compiled. Please recreate
--   this UDF with resource constraint."
-- Vuelve a correr este mismo CREATE OR REPLACE PROCEDURE (sin cambiar nada);
-- es una falla transitoria de la primera compilación nativa, no de config.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE TEST_CLOUDERA_CONNECTION()
RETURNS VARIANT
LANGUAGE PYTHON
RUNTIME_VERSION = 3.11
HANDLER = 'run'
EXTERNAL_ACCESS_INTEGRATIONS = (CLOUDERA_HIVE_ACCESS_INTEGRATION)
SECRETS = ('cred' = CLOUDERA_HIVE_CREDENTIALS)
PACKAGES = ('snowflake-snowpark-python', 'impyla==0.23.0', 'thrift==0.16.0', 'thrift_sasl==0.4.3', 'pure-sasl==0.6.2', 'six==1.17.0', 'bitarray==3.10.1')
AS
$$
import _snowflake
from impala.dbapi import connect

HIVE_HOST = "hs2-mtrx-snow-cdp-warehouse-2.dw-mtrx-snow-cdp-env.v4nv-63pq.cloudera.site"
HIVE_PORT = 443
HTTP_PATH = "cliservice"           # cambia si tu Cloudera usa otro path

def run():
    cred = _snowflake.get_username_password('cred')

    conn = connect(
        host=HIVE_HOST,
        port=HIVE_PORT,
        use_http_transport=True,
        http_path=HTTP_PATH,
        auth_mechanism="PLAIN",     # cambia si tu Cloudera usa otro mecanismo:
                                    # "LDAP" (usuario/password via LDAP, mismo formato que PLAIN),
                                    # "GSSAPI" (Kerberos -- requiere keytab, no soportado por este
                                    #   patron de Secret simple; contacta a tu admin de Cloudera),
                                    # "NOSASL" (sin autenticacion, poco comun en CDP)
        user=cred.username,
        password=cred.password,
        use_ssl=True,
        timeout=30,
    )
    cur = conn.cursor()
    cur.execute("SHOW DATABASES")
    databases = [row[0] for row in cur.fetchall()]

    result = {"status": "ok", "databases": databases}

    cur.close()
    conn.close()
    return result
$$;

-- ---------------------------------------------------------------------------
-- PASO 5: Probar la conexión
-- ---------------------------------------------------------------------------
CALL TEST_CLOUDERA_CONNECTION();
-- Resultado esperado: {"status": "ok", "databases": ["default", "information_schema", ...]}
