import streamlit as st

st.set_page_config(layout="wide")

portal_html = open("/opt/app/index.html").read() if __name__ != "__main__" else ""

# Fallback: inline the HTML
if not portal_html:
    portal_html = """<h1>CredibanCo Intelligence Portal</h1><p>Loading...</p>"""

st.components.v1.html(portal_html, height=900, scrolling=True)
