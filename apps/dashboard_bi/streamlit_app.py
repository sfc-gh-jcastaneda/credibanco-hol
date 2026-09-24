import streamlit as st
from snowflake.snowpark.context import get_active_session
import pandas as pd

session = get_active_session()
st.set_page_config(page_title="CredibanCo BI", layout="wide") if hasattr(st, 'set_page_config') else None

st.title("📊 CredibanCo — Dashboard de Autorizaciones")
st.caption("Red de pagos Colombia · Datos en tiempo real desde Snowflake")

# KPIs
kpis = session.sql("""
    SELECT COUNT(*) as total_tx,
           SUM(CASE WHEN CODIGO_RESPUESTA='00' THEN 1 ELSE 0 END) as aprobadas,
           ROUND(AVG(MONTO),0) as ticket_promedio,
           COUNT(DISTINCT COMERCIO_ID) as comercios_activos
    FROM CREDIBANCO_HOL.PAGOS.AUTORIZACIONES
""").to_pandas()

c1, c2, c3, c4 = st.columns(4)
c1.metric("Total Transacciones", f"{kpis['TOTAL_TX'][0]:,.0f}")
c2.metric("Aprobadas", f"{kpis['APROBADAS'][0]:,.0f}")
c3.metric("Ticket Promedio", f"${kpis['TICKET_PROMEDIO'][0]:,.0f} COP")
c4.metric("Comercios Activos", f"{kpis['COMERCIOS_ACTIVOS'][0]:,.0f}")

st.divider()

# Filtros
col_f1, col_f2 = st.columns(2)
ciudades = session.sql("SELECT DISTINCT CIUDAD FROM CREDIBANCO_HOL.PAGOS.AUTORIZACIONES ORDER BY 1").to_pandas()
with col_f1:
    ciudad_sel = st.selectbox("Ciudad", ["Todas"] + ciudades['CIUDAD'].tolist())
with col_f2:
    canal_sel = st.selectbox("Canal", ["Todos", "POS", "ECOMMERCE", "ATM"])

where = "WHERE 1=1"
if ciudad_sel != "Todas":
    where += f" AND CIUDAD = '{ciudad_sel}'"
if canal_sel != "Todos":
    where += f" AND CANAL = '{canal_sel}'"

# Charts
col1, col2 = st.columns(2)

with col1:
    st.subheader("Transacciones por Ciudad (Top 10)")
    df_ciudad = session.sql(f"""
        SELECT CIUDAD, COUNT(*) as TX, SUM(MONTO) as MONTO_TOTAL
        FROM CREDIBANCO_HOL.PAGOS.AUTORIZACIONES {where}
        GROUP BY CIUDAD ORDER BY TX DESC LIMIT 10
    """).to_pandas()
    st.bar_chart(df_ciudad.set_index('CIUDAD')['TX'])

with col2:
    st.subheader("Distribución por Canal")
    df_canal = session.sql(f"""
        SELECT CANAL, COUNT(*) as TX
        FROM CREDIBANCO_HOL.PAGOS.AUTORIZACIONES {where}
        GROUP BY CANAL ORDER BY TX DESC
    """).to_pandas()
    st.bar_chart(df_canal.set_index('CANAL')['TX'])

# Tabla detalle
st.subheader("Últimas 50 Transacciones")
df_detail = session.sql(f"""
    SELECT AUTORIZACION_ID, COMERCIO_ID, CIUDAD, MCC, MONTO, CODIGO_RESPUESTA, CANAL, FECHA_HORA
    FROM CREDIBANCO_HOL.PAGOS.AUTORIZACIONES {where}
    ORDER BY FECHA_HORA DESC LIMIT 50
""").to_pandas()
st.dataframe(df_detail, use_container_width=True)
