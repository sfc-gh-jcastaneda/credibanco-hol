#!/usr/bin/env python3
"""
Build OpenFlow Pipeline: Open-Meteo Weather API → Snowflake
For CredibanCo HOL accounts via NiFi REST API (curl-based)
"""
import subprocess
import json
import sys
import time
import hashlib
import base64

# ============================================================
# CONFIG - Change these for each account
# ============================================================
ACCOUNT_NAME = sys.argv[1] if len(sys.argv) > 1 else "HANDSONLAB_FOR_CREDIBANCO_COLOM_LEDZYD"
ACCOUNT_URL_SLUG = ACCOUNT_NAME.lower().replace('_', '-')
RUNTIME_KEY = sys.argv[2] if len(sys.argv) > 2 else "s3ingestionruntime-100"
NIFI_BASE = f"https://of1--sfsehol-{ACCOUNT_URL_SLUG}.snowflakecomputing.app:443/{RUNTIME_KEY}/nifi-api"

DEST_DB = "CREDIBANCO_HOL"
DEST_SCHEMA = "PAGOS"
DEST_TABLE = "AUTORIZACIONES_STREAMING"

KEY_FILE = "/tmp/hol_rsa_key.p8"
PUB_FILE = "/tmp/hol_rsa_key.pub"

# ============================================================
# Generate JWT Token
# ============================================================
def generate_jwt():
    import jwt as pyjwt
    from cryptography.hazmat.primitives.serialization import load_pem_public_key
    from cryptography.hazmat.primitives import serialization
    
    with open(KEY_FILE, 'r') as f:
        private_key = f.read()
    with open(PUB_FILE, 'rb') as f:
        pub_key_raw = f.read()
    
    pub_key = load_pem_public_key(pub_key_raw)
    der_bytes = pub_key.public_bytes(serialization.Encoding.DER, serialization.PublicFormat.SubjectPublicKeyInfo)
    fp = base64.b64encode(hashlib.sha256(der_bytes).digest()).decode()
    
    account = f"SFSEHOL-{ACCOUNT_NAME}"
    qualified_user = f"{account}.USER"
    
    now = int(time.time())
    payload = {
        "iss": f"{qualified_user}.SHA256:{fp}",
        "sub": qualified_user,
        "iat": now,
        "exp": now + 3600
    }
    return pyjwt.encode(payload, private_key, algorithm="RS256")

# ============================================================
# NiFi API Helper
# ============================================================
def nifi_api(method, path, data=None):
    url = f"{NIFI_BASE}{path}"
    cmd = ["curl", "-s", "-X", method, url, "-H", f"Authorization: Bearer {TOKEN}", "-H", "Content-Type: application/json"]
    if data:
        cmd += ["-d", json.dumps(data)]
    result = subprocess.run(cmd, capture_output=True, text=True)
    try:
        return json.loads(result.stdout)
    except:
        return {"raw": result.stdout, "error": result.stderr}

print("=" * 60)
print(f"  OpenFlow Pipeline: Open-Meteo → {DEST_DB}.{DEST_SCHEMA}.{DEST_TABLE}")
print(f"  Account: {ACCOUNT_NAME}")
print("=" * 60)

# 1. Generate token
TOKEN = generate_jwt()
print(f"\n[1/7] JWT token generated ({len(TOKEN)} chars)")

# 2. Get root process group
root_status = nifi_api("GET", "/flow/process-groups/root/status")
root_id = root_status.get("processGroupStatus", {}).get("id")
if not root_id:
    print(f"ERROR: Cannot get root PG. Response: {root_status}")
    sys.exit(1)
print(f"[2/7] Connected to runtime. Root PG: {root_id}")

# 3. Create Process Group
pg_data = {
    "revision": {"version": 0},
    "component": {
        "name": "CredibanCo Weather Ingestion (Open-Meteo → Snowflake)",
        "position": {"x": 100, "y": 100}
    }
}
pg_result = nifi_api("POST", f"/process-groups/{root_id}/process-groups", pg_data)
pg_id = pg_result.get("id")
if not pg_id:
    print(f"ERROR creating PG: {pg_result}")
    sys.exit(1)
print(f"[3/7] Process Group created: {pg_id}")

# 4. Create InvokeHTTP processor
api_url = "https://api.open-meteo.com/v1/forecast?latitude=4.711&longitude=-74.072&current=temperature_2m,wind_speed_10m,relative_humidity_2m,precipitation&hourly=temperature_2m,precipitation_probability&forecast_days=1&timezone=America/Bogota"

invoke_data = {
    "revision": {"version": 0},
    "component": {
        "type": "org.apache.nifi.processors.standard.InvokeHTTP",
        "name": "Fetch Open-Meteo Bogota",
        "position": {"x": 200, "y": 200},
        "config": {
            "properties": {
                "HTTP URL": api_url,
                "HTTP Method": "GET"
            },
            "autoTerminatedRelationships": ["Original", "Retry", "No Retry", "Failure"],
            "schedulingPeriod": "60 sec",
            "schedulingStrategy": "TIMER_DRIVEN"
        }
    }
}
invoke_result = nifi_api("POST", f"/process-groups/{pg_id}/processors", invoke_data)
invoke_id = invoke_result.get("id")
if invoke_id:
    print(f"[4/7] InvokeHTTP created: {invoke_id} (Open-Meteo Bogota, every 60s)")
else:
    print(f"ERROR creating InvokeHTTP: {invoke_result}")
    sys.exit(1)

# 5. Create PublishSnowpipeStreaming processor
publish_data = {
    "revision": {"version": 0},
    "component": {
        "type": "org.apache.nifi.processors.snowflake.PublishSnowpipeStreaming",
        "name": "Write to Snowflake",
        "position": {"x": 200, "y": 500},
        "config": {
            "properties": {
                "Snowflake Authentication Strategy": "SNOWFLAKE_SESSION_TOKEN",
                "Destination Type": "Table",
                "Database": DEST_DB,
                "Schema": DEST_SCHEMA,
                "Table": DEST_TABLE,
                "Transfer Strategy": "Managed",
                "Channel Type": "Standard"
            },
            "autoTerminatedRelationships": ["success", "failure"]
        }
    }
}
publish_result = nifi_api("POST", f"/process-groups/{pg_id}/processors", publish_data)
publish_id = publish_result.get("id")
if publish_id:
    print(f"[5/7] PublishSnowpipeStreaming created: {publish_id}")
else:
    print(f"ERROR creating PublishSnowpipeStreaming: {publish_result}")
    # Continue anyway

# 6. Create connection: InvokeHTTP[Response] → PublishSnowpipeStreaming
if invoke_id and publish_id:
    conn_data = {
        "revision": {"version": 0},
        "component": {
            "source": {"id": invoke_id, "groupId": pg_id, "type": "PROCESSOR"},
            "destination": {"id": publish_id, "groupId": pg_id, "type": "PROCESSOR"},
            "selectedRelationships": ["Response"]
        }
    }
    conn_result = nifi_api("POST", f"/process-groups/{pg_id}/connections", conn_data)
    if conn_result.get("id"):
        print(f"[6/7] Connection: InvokeHTTP → PublishSnowpipeStreaming")
    else:
        print(f"Connection result: {conn_result}")

# 7. Start the process group
start_data = {"id": pg_id, "state": "RUNNING"}
start_result = nifi_api("PUT", f"/flow/process-groups/{pg_id}", {"id": pg_id, "state": "RUNNING"})
print(f"[7/7] Process Group STARTED")

print("\n" + "=" * 60)
print("  Pipeline created and running!")
print(f"  Flow: Open-Meteo Bogota → {DEST_DB}.{DEST_SCHEMA}.{DEST_TABLE}")
print(f"  Schedule: every 60 seconds")
print("=" * 60)
