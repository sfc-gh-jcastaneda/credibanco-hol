import streamlit as st
from snowflake.snowpark.context import get_active_session

session = get_active_session()

st.title("💰 CredibanCo — Dashboard FinOps")
st.caption("Gobierno de costos · Snowflake")

# Consumo por servicio
st.subheader("Consumo por Servicio (Últimos 30 días)")
df_svc = session.sql("""
    SELECT SERVICE_TYPE, ROUND(SUM(CREDITS_USED),2) as CREDITOS
    FROM SNOWFLAKE.ACCOUNT_USAGE.METERING_DAILY_HISTORY
    WHERE USAGE_DATE > DATEADD('day', -30, CURRENT_DATE())
    GROUP BY SERVICE_TYPE ORDER BY CREDITOS DESC
""").to_pandas()
if len(df_svc) > 0:
    c1, c2 = st.columns([2,1])
    with c1:
        st.bar_chart(df_svc.set_index('SERVICE_TYPE')['CREDITOS'])
    with c2:
        total = df_svc['CREDITOS'].sum()
        st.metric("Total Créditos", f"{total:,.2f}")
        st.dataframe(df_svc, use_container_width=True)
else:
    st.info("Datos de consumo se actualizan con latencia de hasta 72 horas.")

# Tendencia diaria
st.subheader("Tendencia Diaria de Consumo")
df_trend = session.sql("""
    SELECT USAGE_DATE, ROUND(SUM(CREDITS_USED),2) as CREDITOS
    FROM SNOWFLAKE.ACCOUNT_USAGE.METERING_DAILY_HISTORY
    WHERE USAGE_DATE > DATEADD('day', -30, CURRENT_DATE())
    GROUP BY USAGE_DATE ORDER BY USAGE_DATE
""").to_pandas()
if len(df_trend) > 0:
    st.line_chart(df_trend.set_index('USAGE_DATE')['CREDITOS'])

# Top warehouses
st.subheader("Top Warehouses por Consumo")
df_wh = session.sql("""
    SELECT WAREHOUSE_NAME, ROUND(SUM(CREDITS_USED),2) as CREDITOS
    FROM SNOWFLAKE.ACCOUNT_USAGE.WAREHOUSE_METERING_HISTORY
    WHERE START_TIME > DATEADD('day', -30, CURRENT_TIMESTAMP())
    GROUP BY WAREHOUSE_NAME ORDER BY CREDITOS DESC LIMIT 10
""").to_pandas()
if len(df_wh) > 0:
    st.dataframe(df_wh, use_container_width=True)

# Top queries costosas
st.subheader("Top 10 Queries Más Costosas (7 días)")
df_q = session.sql("""
    SELECT QUERY_ID, USER_NAME, WAREHOUSE_NAME, 
           ROUND(TOTAL_ELAPSED_TIME/1000,1) as DURACION_SEG,
           ROUND(CREDITS_USED_CLOUD_SERVICES,4) as CREDITOS_CS
    FROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY
    WHERE START_TIME > DATEADD('day', -7, CURRENT_TIMESTAMP())
    AND CREDITS_USED_CLOUD_SERVICES > 0
    ORDER BY CREDITS_USED_CLOUD_SERVICES DESC LIMIT 10
""").to_pandas()
if len(df_q) > 0:
    st.dataframe(df_q, use_container_width=True)
