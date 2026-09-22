# CredibanCo HOL V4 — RFP 10010806

Hands-On Lab de Snowflake para CredibanCo. 8 tracks, 15 min cada uno.

## Estructura
```
notebooks/          8 notebooks Snowflake (.ipynb)
sql/                Scripts de setup (master_setup, master_load)
```

## Setup en Snowflake
```sql
-- 1. Conectar este repo
CREATE GIT REPOSITORY CREDIBANCO_HOL.PLATAFORMA.HOL_REPO
  API_INTEGRATION = GITHUB_GIT_INTEGRATION
  ORIGIN = 'https://github.com/sfc-gh-jcastaneda/credibanco-hol.git';

-- 2. Fetch
ALTER GIT REPOSITORY CREDIBANCO_HOL.PLATAFORMA.HOL_REPO FETCH;

-- 3. Ver contenido
SHOW GIT BRANCHES IN CREDIBANCO_HOL.PLATAFORMA.HOL_REPO;
LIST @CREDIBANCO_HOL.PLATAFORMA.HOL_REPO/branches/main/notebooks/;
```

## Tracks
| Track | Notebook | Rol | Tiempo |
|-------|----------|-----|--------|
| T0 | T0_arquitectura.ipynb | CRB_ARQUITECTURA | 15 min |
| T1 | T1_gobierno.ipynb | CRB_SEGURIDAD_INFO | 15 min |
| T2 | T2_ingenieria.ipynb | CRB_DATA_ANALYTICS | 15 min |
| T4 | T4_analitica_ia.ipynb | CRB_ANALITICA | 15 min |
| T5 | T5_monetizacion.ipynb | CRB_NEGOCIO | 15 min |
| T6 | T6_autoservicio_bi.ipynb | CRB_NEGOCIO | 15 min |
| T7 | T7_dataops_finops.ipynb | CRB_INFRAESTRUCTURA | 15 min |
| T8 | T8_migracion_cloudera.ipynb | CRB_MIGRACION | 15 min |
