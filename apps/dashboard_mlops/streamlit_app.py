import streamlit as st
from snowflake.snowpark.context import get_active_session
import pandas as pd

session = get_active_session()

st.title("🔍 CredibanCo — Observabilidad MLOps")
st.caption("Monitoreo de modelos · Experimentos · Predicciones · Snowflake ML")

# Experiments
st.subheader("Historial de Experimentos ML")
try:
    df_exp = session.sql("""
        SELECT EXPERIMENT_ID, ALGORITMO, ACCURACY, PRECISION_SCORE, RECALL_SCORE, AUC_ROC, STATUS, FECHA_EXPERIMENTO
        FROM CREDIBANCO_HOL.ANALITICA.ML_EXPERIMENTS
        ORDER BY FECHA_EXPERIMENTO DESC
    """).to_pandas()
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Total Experimentos", len(df_exp))
    champions = df_exp[df_exp['STATUS'] == 'champion']
    c2.metric("Champions", len(champions))
    c3.metric("Mejor AUC", f"{df_exp['AUC_ROC'].max():.4f}")
    c4.metric("Algoritmos Probados", df_exp['ALGORITMO'].nunique())

    col1, col2 = st.columns(2)
    with col1:
        st.write("**Accuracy por Experimento**")
        st.bar_chart(df_exp.set_index('EXPERIMENT_ID')['ACCURACY'])
    with col2:
        st.write("**AUC-ROC por Algoritmo**")
        df_algo = df_exp.groupby('ALGORITMO')['AUC_ROC'].mean().reset_index()
        st.bar_chart(df_algo.set_index('ALGORITMO')['AUC_ROC'])

    st.write("**Detalle de Experimentos**")
    st.dataframe(df_exp, use_container_width=True)
except Exception as e:
    st.error(f"Error: {e}")

st.divider()

# Model info from SHOW MODELS
st.subheader("Modelos en Registry")
try:
    session.sql("SHOW MODELS IN SCHEMA CREDIBANCO_HOL.ANALITICA").collect()
    df_model = session.sql("""SELECT "name", "model_versions", "model_version_aliases" FROM TABLE(RESULT_SCAN(LAST_QUERY_ID()))""").to_pandas()
    if len(df_model) > 0:
        for _, row in df_model.iterrows():
            st.success(f"**{row['name']}** — Versiones: {row['model_versions']} — Aliases: {row['model_version_aliases']}")
except:
    pass

st.divider()

# Churn predictions
st.subheader("Predicciones de Churn — Historial 90 días")
try:
    df_churn = session.sql("""
        SELECT FECHA_PREDICCION, VERSION_MODELO,
            COUNT(*) AS TOTAL_PREDICCIONES,
            SUM(CHURN_PREDICHO) AS PREDICHOS_CHURN,
            SUM(CHURN_REAL) AS CHURN_REAL,
            ROUND(AVG(PROBABILIDAD_CHURN), 4) AS PROB_PROMEDIO
        FROM CREDIBANCO_HOL.ANALITICA.CHURN_PREDICTIONS_HISTORICO
        GROUP BY FECHA_PREDICCION, VERSION_MODELO
        ORDER BY FECHA_PREDICCION DESC
        LIMIT 30
    """).to_pandas()
    c5, c6, c7 = st.columns(3)
    c5.metric("Días de Historial", df_churn['FECHA_PREDICCION'].nunique())
    c6.metric("Versiones del Modelo", df_churn['VERSION_MODELO'].nunique())
    c7.metric("Prob. Churn Promedio", f"{df_churn['PROB_PROMEDIO'].mean():.2%}")

    st.write("**Predicciones por Día**")
    st.bar_chart(df_churn.set_index('FECHA_PREDICCION')['TOTAL_PREDICCIONES'])
    st.dataframe(df_churn, use_container_width=True)
except Exception as e:
    st.error(f"Error: {e}")

st.divider()

# Dataset de churn
st.subheader("Dataset de Churn de Comercios")
try:
    df_churn_data = session.sql("""
        SELECT 
            COUNT(*) AS TOTAL_COMERCIOS,
            SUM(ES_CHURN) AS COMERCIOS_CHURN,
            ROUND(AVG(TX_ULTIMO_MES), 0) AS TX_PROMEDIO_MES,
            ROUND(AVG(DIAS_SIN_TRANSACCION), 0) AS DIAS_SIN_TX_PROMEDIO,
            ROUND(AVG(CONTRACARGOS_ULTIMOS_90D), 1) AS CONTRACARGOS_PROMEDIO
        FROM CREDIBANCO_HOL.ANALITICA.COMERCIOS_CHURN
    """).to_pandas()
    c8, c9, c10, c11 = st.columns(4)
    c8.metric("Comercios Analizados", f"{df_churn_data['TOTAL_COMERCIOS'][0]:,.0f}")
    c9.metric("En Riesgo de Churn", f"{df_churn_data['COMERCIOS_CHURN'][0]:,.0f}", delta=f"{df_churn_data['COMERCIOS_CHURN'][0]*100//df_churn_data['TOTAL_COMERCIOS'][0]}%", delta_color="inverse")
    c10.metric("TX Promedio/Mes", f"{df_churn_data['TX_PROMEDIO_MES'][0]:,.0f}")
    c11.metric("Días sin TX (prom)", f"{df_churn_data['DIAS_SIN_TX_PROMEDIO'][0]:.0f}")
except Exception as e:
    st.error(f"Error: {e}")

st.divider()

# Features del modelo de fraude
st.subheader("Features del Modelo de Fraude")
try:
    df_features = session.sql("""
        SELECT COLUMN_NAME
        FROM CREDIBANCO_HOL.INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'TRAIN_RIESGO_COMERCIO' AND TABLE_SCHEMA = 'ANALITICA'
        AND COLUMN_NAME NOT IN ('COMERCIO_ID', 'ES_FRAUDE')
    """).to_pandas()
    cols = st.columns(3)
    for i, f in enumerate(df_features['COLUMN_NAME']):
        cols[i % 3].write(f"• **{f}**")
except:
    pass

# Anomalías
st.subheader("Anomalías Detectadas")
try:
    df_anom = session.sql("SELECT * FROM CREDIBANCO_HOL.ANALITICA.RESULTADO_ANOMALIAS LIMIT 20").to_pandas()
    st.metric("Comercios Anómalos", f"{len(df_anom)}")
    st.dataframe(df_anom, use_container_width=True)
except:
    pass
