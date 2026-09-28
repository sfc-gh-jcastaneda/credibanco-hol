-- =============================================================================
-- TRACK 8 · Paso 1b: Procedimientos de assessment reutilizables sobre Cloudera
-- =============================================================================
-- Estos 3 procedimientos son el "kit de assessment" que Coco puede invocar en
-- lenguaje natural para explorar el ambiente Cloudera sin que el usuario
-- tenga que escribir Python. Corre este script DESPUÉS de
-- 01_setup_cloudera_access.sql (usa la misma integration + secret).
--
-- Ejemplos de preguntas que puedes hacerle a Coco una vez creados estos procs:
--   "¿Qué bases de datos hay en el Cloudera?"
--   "Lista las tablas de la base staging en Cloudera"
--   "¿Cuántas columnas tiene la tabla cafcnbtp en Cloudera y de qué tipo son?"
--   "Dame 10 filas de muestra de staging.sic_bonos_virtuales"
-- =============================================================================

USE SCHEMA CREDIBANCO_HOL.CLOUDERA_ASSESSMENT;
USE WAREHOUSE CLOUDERA_ASSESSMENT_WH;  -- creado en 01_setup_cloudera_access.sql (Snowpark-optimized x86, requerido por impyla/thrift)
-- IMPORTANTE: estos procs NO deben llevar RESOURCE_CONSTRAINT=(architecture='x86')
-- -- esa anotación en el proc rompe el CALL cuando se combina con
-- EXTERNAL_ACCESS_INTEGRATIONS (ver nota completa en 01_setup_cloudera_access.sql,
-- PASO 4). El warehouse ya es x86 por debajo; eso basta para compilar thrift.

-- ---------------------------------------------------------------------------
-- Helper Python compartido -- una sola conexión Hive por llamada
-- ---------------------------------------------------------------------------

CREATE OR REPLACE PROCEDURE CLOUDERA_LIST_TABLES(DATABASE_NAME VARCHAR)
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

def run(database_name):
    cred = _snowflake.get_username_password('cred')
    conn = connect(host=HIVE_HOST, port=HIVE_PORT, use_http_transport=True,
                    http_path="cliservice", auth_mechanism="PLAIN",
                    user=cred.username, password=cred.password, use_ssl=True, timeout=30)
    cur = conn.cursor()
    cur.execute(f"SHOW TABLES IN {database_name}")
    tables = [row[0] for row in cur.fetchall()]
    cur.close(); conn.close()
    return {"status": "ok", "database": database_name, "tables": tables}
$$;

CREATE OR REPLACE PROCEDURE CLOUDERA_DESCRIBE_TABLE(DATABASE_NAME VARCHAR, TABLE_NAME VARCHAR)
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

def run(database_name, table_name):
    cred = _snowflake.get_username_password('cred')
    conn = connect(host=HIVE_HOST, port=HIVE_PORT, use_http_transport=True,
                    http_path="cliservice", auth_mechanism="PLAIN",
                    user=cred.username, password=cred.password, use_ssl=True, timeout=30)
    cur = conn.cursor()
    cur.execute(f"DESCRIBE {database_name}.{table_name}")
    columns = [{"name": row[0], "type": row[1], "comment": row[2]} for row in cur.fetchall()]
    cur.close(); conn.close()
    return {"status": "ok", "database": database_name, "table": table_name, "columns": columns}
$$;

CREATE OR REPLACE PROCEDURE CLOUDERA_SAMPLE_ROWS(DATABASE_NAME VARCHAR, TABLE_NAME VARCHAR, N_ROWS INTEGER)
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

def run(database_name, table_name, n_rows):
    cred = _snowflake.get_username_password('cred')
    conn = connect(host=HIVE_HOST, port=HIVE_PORT, use_http_transport=True,
                    http_path="cliservice", auth_mechanism="PLAIN",
                    user=cred.username, password=cred.password, use_ssl=True, timeout=30)
    cur = conn.cursor()
    cur.execute(f"SELECT * FROM {database_name}.{table_name} LIMIT {int(n_rows)}")
    cols = [d[0] for d in cur.description]
    rows = [dict(zip(cols, row)) for row in cur.fetchall()]
    cur.close(); conn.close()
    return {"status": "ok", "database": database_name, "table": table_name, "columns": cols, "rows": rows}
$$;

-- ---------------------------------------------------------------------------
-- Pruebas rápidas
-- ---------------------------------------------------------------------------
CALL CLOUDERA_LIST_TABLES('default');
-- CALL CLOUDERA_DESCRIBE_TABLE('staging', 'cafcnbtp');
-- CALL CLOUDERA_SAMPLE_ROWS('staging', 'cafcnbtp', 10);
