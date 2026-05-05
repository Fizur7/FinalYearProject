import urllib.request, json

BASE = "http://localhost:8000"

# Login as admin
data = json.dumps({"email": "admin@ecotrack.com", "password": "admin123"}).encode()
req = urllib.request.Request(f"{BASE}/api/auth/login", data=data, headers={"Content-Type": "application/json"}, method="POST")
res = urllib.request.urlopen(req)
token = json.loads(res.read())["access_token"]
print("Admin login OK")

headers = {"Authorization": f"Bearer {token}"}

# Get drivers
req2 = urllib.request.Request(f"{BASE}/api/admin/drivers", headers=headers)
drivers = json.loads(urllib.request.urlopen(req2).read())
print(f"Drivers ({len(drivers)}):")
for d in drivers:
    print(f"  name={d['name']} email={d['email']} vehicle={d.get('vehicle_id')} id={d['id']}")

# Get reports
req3 = urllib.request.Request(f"{BASE}/api/admin/reports", headers=headers)
reports = json.loads(urllib.request.urlopen(req3).read())
print(f"Reports ({len(reports)}):")
for r in reports:
    print(f"  {r['report_id']} status={r['status']} citizen={r.get('citizen_name')}")

# If there's a pending report and a driver, test assign
pending = [r for r in reports if r["status"] == "Pending"]
if pending and drivers:
    rpt = pending[0]
    drv = drivers[0]
    print(f"\nAssigning {rpt['report_id']} to {drv['name']}...")
    url = f"{BASE}/api/admin/reports/{rpt['report_id']}/approve?driver_id={drv['id']}"
    req4 = urllib.request.Request(url, data=b"", headers=headers, method="POST")
    result = json.loads(urllib.request.urlopen(req4).read())
    print(f"Result: {result}")
else:
    print("\nNo pending reports or no drivers to test assign.")
    print("Submit a report as citizen first, then run this again.")
