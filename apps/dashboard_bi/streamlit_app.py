import streamlit as st
from snowflake.snowpark.context import get_active_session
import pandas as pd

session = get_active_session()

st.title("📊 CredibanCo — Dashboard de Autorizaciones")
st.caption("Red de pagos Colombia · Datos en tiempo real desde Snowflake")

# KPIs
kpis = session.sql("""
    SELECT COUNT(*) as total_tx,
           SUM(CASE WHEN CODIGO_RESPUESTA='00' THEN 1 ELSE 0 END) as aprobadas,
           SUM(CASE WHEN CODIGO_RESPUESTA!='00' THEN 1 ELSE 0 END) as rechazadas,
           ROUND(AVG(MONTO),0) as ticket_promedio,
           ROUND(SUM(MONTO),0) as monto_total,
           COUNT(DISTINCT COMERCIO_ID) as comercios_activos,
           COUNT(DISTINCT CIUDAD) as ciudades
    FROM CREDIBANCO_HOL.PAGOS.AUTORIZACIONES
""").to_pandas()

c1, c2, c3, c4 = st.columns(4)
c1.metric("Total Transacciones", f"{kpis['TOTAL_TX'][0]:,.0f}")
c2.metric("Aprobadas", f"{kpis['APROBADAS'][0]:,.0f}", delta=f"{kpis['APROBADAS'][0]*100//kpis['TOTAL_TX'][0]}%")
c3.metric("Ticket Promedio", f"${kpis['TICKET_PROMEDIO'][0]:,.0f} COP")
c4.metric("Comercios Activos", f"{kpis['COMERCIOS_ACTIVOS'][0]:,.0f}")

c5, c6, c7, c8 = st.columns(4)
c5.metric("Monto Total", f"${kpis['MONTO_TOTAL'][0]:,.0f} COP")
c6.metric("Rechazadas", f"{kpis['RECHAZADAS'][0]:,.0f}", delta=f"-{kpis['RECHAZADAS'][0]*100//kpis['TOTAL_TX'][0]}%", delta_color="inverse")
c7.metric("Ciudades", f"{kpis['CIUDADES'][0]:,.0f}")
c8.metric("Tasa Aprobación", f"{kpis['APROBADAS'][0]*100//kpis['TOTAL_TX'][0]}%")

st.divider()

# Filtros
col_f1, col_f2, col_f3 = st.columns(3)
ciudades = session.sql("SELECT DISTINCT CIUDAD FROM CREDIBANCO_HOL.PAGOS.AUTORIZACIONES ORDER BY 1").to_pandas()
with col_f1:
    ciudad_sel = st.selectbox("🏙️ Ciudad", ["Todas"] + ciudades['CIUDAD'].tolist())
with col_f2:
    canal_sel = st.selectbox("📡 Canal", ["Todos", "POS", "ECOMMERCE", "ATM"])
with col_f3:
    mcc_list = session.sql("SELECT DISTINCT MCC FROM CREDIBANCO_HOL.PAGOS.AUTORIZACIONES ORDER BY 1").to_pandas()
    mcc_sel = st.selectbox("🏷️ Categoría (MCC)", ["Todos"] + mcc_list['MCC'].tolist())

where = "WHERE 1=1"
if ciudad_sel != "Todas":
    where += f" AND CIUDAD = '{ciudad_sel}'"
if canal_sel != "Todos":
    where += f" AND CANAL = '{canal_sel}'"
if mcc_sel != "Todos":
    where += f" AND MCC = '{mcc_sel}'"

# Fila 1: Ciudad + Canal
col1, col2 = st.columns(2)

with col1:
    st.subheader("Transacciones por Ciudad (Top 10)")
    df_ciudad = session.sql(f"""
        SELECT CIUDAD, COUNT(*) as TX, ROUND(SUM(MONTO),0) as MONTO_TOTAL
        FROM CREDIBANCO_HOL.PAGOS.AUTORIZACIONES {where}
        GROUP BY CIUDAD ORDER BY TX DESC LIMIT 10
    """).to_pandas()
    st.bar_chart(df_ciudad.set_index('CIUDAD')['TX'])

with col2:
    st.subheader("Distribución por Canal")
    df_canal = session.sql(f"""
        SELECT CANAL, COUNT(*) as TX, ROUND(SUM(MONTO),0) as MONTO
        FROM CREDIBANCO_HOL.PAGOS.AUTORIZACIONES {where}
        GROUP BY CANAL ORDER BY TX DESC
    """).to_pandas()
    st.bar_chart(df_canal.set_index('CANAL')['TX'])

st.divider()

# Fila 2: Tasa aprobación por ciudad + Monto por canal
col3, col4 = st.columns(2)

with col3:
    st.subheader("Tasa de Aprobación por Ciudad")
    df_aprob = session.sql(f"""
        SELECT CIUDAD,
            ROUND(SUM(CASE WHEN CODIGO_RESPUESTA='00' THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100, 1) AS TASA_APROBACION
        FROM CREDIBANCO_HOL.PAGOS.AUTORIZACIONES {where}
        GROUP BY CIUDAD ORDER BY TASA_APROBACION ASC LIMIT 10
    """).to_pandas()
    st.bar_chart(df_aprob.set_index('CIUDAD')['TASA_APROBACION'])

with col4:
    st.subheader("Monto Promedio por Canal")
    df_monto_canal = session.sql(f"""
        SELECT CANAL, ROUND(AVG(MONTO),0) AS TICKET_PROMEDIO, ROUND(SUM(MONTO),0) AS MONTO_TOTAL
        FROM CREDIBANCO_HOL.PAGOS.AUTORIZACIONES {where}
        GROUP BY CANAL ORDER BY MONTO_TOTAL DESC
    """).to_pandas()
    st.bar_chart(df_monto_canal.set_index('CANAL')['TICKET_PROMEDIO'])

st.divider()

# Fila 3: Top comercios + tendencia
col5, col6 = st.columns(2)

with col5:
    st.subheader("Top 10 Comercios por Volumen")
    df_top = session.sql(f"""
        SELECT c.RAZON_SOCIAL, COUNT(*) AS TX, ROUND(SUM(a.MONTO),0) AS MONTO_TOTAL
        FROM CREDIBANCO_HOL.PAGOS.AUTORIZACIONES a
        JOIN CREDIBANCO_HOL.COMERCIOS.COMERCIOS c ON a.COMERCIO_ID = c.COMERCIO_ID
        {where}
        GROUP BY c.RAZON_SOCIAL ORDER BY TX DESC LIMIT 10
    """).to_pandas()
    st.dataframe(df_top, use_container_width=True)

with col6:
    st.subheader("Tendencia Diaria de Transacciones")
    df_trend = session.sql(f"""
        SELECT DATE(FECHA_HORA) AS FECHA, COUNT(*) AS TX
        FROM CREDIBANCO_HOL.PAGOS.AUTORIZACIONES {where}
        GROUP BY FECHA ORDER BY FECHA
    """).to_pandas()
    if len(df_trend) > 0:
        st.line_chart(df_trend.set_index('FECHA')['TX'])

st.divider()

# Fila 4: Liquidaciones
st.subheader("Resumen de Liquidaciones")
col7, col8 = st.columns(2)

with col7:
    try:
        df_liq = session.sql("""
            SELECT ESTADO, COUNT(*) AS TOTAL, ROUND(SUM(MONTO_LIQUIDADO),0) AS MONTO
            FROM CREDIBANCO_HOL.PAGOS.LIQUIDACIONES
            GROUP BY ESTADO ORDER BY TOTAL DESC
        """).to_pandas()
        st.dataframe(df_liq, use_container_width=True)
    except:
        st.info("Datos de liquidaciones no disponibles.")

with col8:
    try:
        df_liq_trend = session.sql("""
            SELECT DATE(FECHA_LIQUIDACION) AS FECHA, COUNT(*) AS LIQUIDACIONES, ROUND(SUM(MONTO_LIQUIDADO),0) AS MONTO
            FROM CREDIBANCO_HOL.PAGOS.LIQUIDACIONES
            GROUP BY FECHA ORDER BY FECHA
        """).to_pandas()
        if len(df_liq_trend) > 0:
            st.line_chart(df_liq_trend.set_index('FECHA')['MONTO'])
    except:
        pass

st.divider()

# Tabla detalle
st.subheader("Últimas 50 Transacciones")
df_detail = session.sql(f"""
    SELECT a.AUTORIZACION_ID, c.RAZON_SOCIAL, a.CIUDAD, a.MCC, a.MONTO, a.CODIGO_RESPUESTA, a.CANAL, a.FECHA_HORA
    FROM CREDIBANCO_HOL.PAGOS.AUTORIZACIONES a
    JOIN CREDIBANCO_HOL.COMERCIOS.COMERCIOS c ON a.COMERCIO_ID = c.COMERCIO_ID
    {where}
    ORDER BY a.FECHA_HORA DESC LIMIT 50
""").to_pandas()
st.dataframe(df_detail, use_container_width=True)
