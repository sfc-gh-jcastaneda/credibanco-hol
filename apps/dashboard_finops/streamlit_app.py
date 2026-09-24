import streamlit as st
from snowflake.snowpark.context import get_active_session
import pandas as pd

session = get_active_session()

st.title("🛡️ CredibanCo — Monitor de Riesgo y Fraude")
st.caption("Detección de fraude · Scoring de comercios · Alertas SARLAFT")

# KPIs de riesgo
st.subheader("Indicadores de Riesgo")
try:
    kpis = session.sql("""
        SELECT 
            COUNT(*) AS TOTAL_COMERCIOS,
            SUM(CASE WHEN ES_FRAUDE = 1 THEN 1 ELSE 0 END) AS COMERCIOS_FRAUDE,
            ROUND(AVG(TASA_RECHAZO) * 100, 2) AS TASA_RECHAZO_PROMEDIO,
            SUM(CASE WHEN EN_ANILLO_SOSPECHOSO = 1 THEN 1 ELSE 0 END) AS EN_ANILLO_SOSPECHOSO
        FROM CREDIBANCO_HOL.ANALITICA.TRAIN_RIESGO_COMERCIO
    """).to_pandas()
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Total Comercios", f"{kpis['TOTAL_COMERCIOS'][0]:,.0f}")
    c2.metric("Fraude Detectado", f"{kpis['COMERCIOS_FRAUDE'][0]:,.0f}", delta=None)
    c3.metric("Tasa Rechazo Prom.", f"{kpis['TASA_RECHAZO_PROMEDIO'][0]:.1f}%")
    c4.metric("Anillo Sospechoso", f"{kpis['EN_ANILLO_SOSPECHOSO'][0]:,.0f}")
except Exception as e:
    st.error(f"Error cargando KPIs: {e}")

st.divider()

# Top comercios riesgosos
col1, col2 = st.columns(2)

with col1:
    st.subheader("Top 10 Comercios por Tasa de Rechazo")
    try:
        df_rechazo = session.sql("""
            SELECT r.COMERCIO_ID, c.RAZON_SOCIAL, c.CIUDAD,
                ROUND(r.TASA_RECHAZO * 100, 2) AS TASA_RECHAZO_PCT,
                r.NUM_AUTORIZACIONES, r.ES_FRAUDE
            FROM CREDIBANCO_HOL.ANALITICA.TRAIN_RIESGO_COMERCIO r
            JOIN CREDIBANCO_HOL.COMERCIOS.COMERCIOS c ON r.COMERCIO_ID = c.COMERCIO_ID
            ORDER BY r.TASA_RECHAZO DESC
            LIMIT 10
        """).to_pandas()
        st.dataframe(df_rechazo, use_container_width=True)
    except:
        st.info("Datos no disponibles.")

with col2:
    st.subheader("Distribución de Fraude por Ciudad")
    try:
        df_ciudad = session.sql("""
            SELECT c.CIUDAD, COUNT(*) AS COMERCIOS,
                SUM(CASE WHEN r.ES_FRAUDE = 1 THEN 1 ELSE 0 END) AS CON_FRAUDE
            FROM CREDIBANCO_HOL.ANALITICA.TRAIN_RIESGO_COMERCIO r
            JOIN CREDIBANCO_HOL.COMERCIOS.COMERCIOS c ON r.COMERCIO_ID = c.COMERCIO_ID
            GROUP BY c.CIUDAD
            HAVING CON_FRAUDE > 0
            ORDER BY CON_FRAUDE DESC
            LIMIT 10
        """).to_pandas()
        st.bar_chart(df_ciudad.set_index('CIUDAD')['CON_FRAUDE'])
    except:
        st.info("Datos no disponibles.")

st.divider()

# Anomalías
st.subheader("Comercios con Comportamiento Anómalo")
try:
    df_anom = session.sql("""
        SELECT * FROM CREDIBANCO_HOL.ANALITICA.RESULTADO_ANOMALIAS
        ORDER BY 1
        LIMIT 20
    """).to_pandas()
    if len(df_anom) > 0:
        st.metric("Total Anomalías Detectadas", len(df_anom))
        st.dataframe(df_anom, use_container_width=True)
except:
    st.info("Tabla de anomalías no disponible.")

st.divider()

# Alertas SARLAFT
st.subheader("Alertas de Riesgo Activas")
try:
    df_alertas = session.sql("""
        SELECT * FROM CREDIBANCO_HOL.RIESGO.ALERTAS
        ORDER BY 1
        LIMIT 20
    """).to_pandas()
    if len(df_alertas) > 0:
        st.metric("Alertas Activas", len(df_alertas))
        st.dataframe(df_alertas, use_container_width=True)
except:
    st.info("Tabla de alertas no disponible.")

# Contracargos
st.subheader("Últimos Contracargos")
try:
    df_contra = session.sql("""
        SELECT * FROM CREDIBANCO_HOL.RIESGO.CONTRACARGOS
        ORDER BY 1 DESC
        LIMIT 20
    """).to_pandas()
    if len(df_contra) > 0:
        st.metric("Total Contracargos", f"{len(df_contra):,}")
        st.dataframe(df_contra, use_container_width=True)
except:
    st.info("Tabla de contracargos no disponible.")
