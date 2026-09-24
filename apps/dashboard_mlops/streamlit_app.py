import streamlit as st
from snowflake.snowpark.context import get_active_session
import pandas as pd

session = get_active_session()

st.title("🔍 CredibanCo — Observabilidad MLOps")
st.caption("Monitoreo de modelos · Model Registry · Snowflake ML")

# Model info
st.subheader("Modelo Registrado")
df_model = session.sql("""
    SELECT MODEL_NAME, MODEL_VERSIONS, MODEL_VERSION_ALIASES
    FROM CREDIBANCO_HOL.INFORMATION_SCHEMA.ML_MODELS
    WHERE MODEL_NAME = 'MODELO_FRAUDE_CREDIBANCO'
""").to_pandas()
if len(df_model) > 0:
    st.json(df_model.to_dict(orient='records')[0])
else:
    st.info("Ejecuta el notebook T4B para registrar el modelo.")

# Predictions history
st.subheader("Historial de Predicciones (90 días)")
df_pred = session.sql("""
    SELECT * FROM CREDIBANCO_HOL.ANALITICA.MLOPS_PREDICTIONS
    ORDER BY COMERCIO_ID LIMIT 200
""").to_pandas()
if len(df_pred) > 0:
    st.metric("Total Predicciones", f"{len(df_pred):,}")
    st.dataframe(df_pred.head(50), use_container_width=True)

# Feature importance
st.subheader("Features del Modelo de Fraude")
df_features = session.sql("""
    SELECT COLUMN_NAME 
    FROM CREDIBANCO_HOL.INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'TRAIN_RIESGO_COMERCIO' AND TABLE_SCHEMA = 'ANALITICA'
    AND COLUMN_NAME NOT IN ('COMERCIO_ID', 'ES_FRAUDE')
""").to_pandas()
if len(df_features) > 0:
    st.write("Features usadas para detección de fraude:")
    for f in df_features['COLUMN_NAME']:
        st.write(f"  • {f}")

# Anomalías detectadas
st.subheader("Anomalías Detectadas")
df_anom = session.sql("""
    SELECT * FROM CREDIBANCO_HOL.ANALITICA.RESULTADO_ANOMALIAS LIMIT 20
""").to_pandas()
if len(df_anom) > 0:
    st.metric("Comercios Anómalos", f"{len(df_anom)}")
    st.dataframe(df_anom, use_container_width=True)
