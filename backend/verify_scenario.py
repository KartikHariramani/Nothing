import requests
import json

def test_full_system():
    base_url = "http://127.0.0.1:8000/api/v1"
    
    print("1. Testing Health & Campaigns...")
    r = requests.get(f"{base_url}/campaigns")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    campaigns = r.json()
    print(f"   -> Found {len(campaigns)} live campaigns: {[c['name'] for c in campaigns]}")
    camp_id = campaigns[0]["id"]

    print("2. Testing Analytics for Campaign...")
    r = requests.get(f"{base_url}/analytics/campaign/{camp_id}")
    assert r.status_code == 200
    analytics = r.json()
    print(f"   -> Target: {analytics['target_count']} | Confirmed: {analytics['confirmed_count']} | Predicted: {analytics['predicted_attendance']} | Attended: {analytics['actual_attendance']}")

    print("3. Testing Hackathon 14-Step Full Scenario...")
    r = requests.post(f"{base_url}/demo/run-full-scenario")
    assert r.status_code == 200
    res = r.json()
    print(f"   -> Successfully ran {len(res['steps'])} autonomous steps:")
    for s in res["steps"]:
        print(f"      [Step {s['step']}] {s['title']}: {s['description']}")

    print("4. Testing Live Activity Feed...")
    r = requests.get(f"{base_url}/audit/activity-feed?limit=5")
    assert r.status_code == 200
    feed = r.json()
    print(f"   -> Telemetry stream items: {[item['title'] for item in feed]}")

    print("5. Testing Admin Role Switch & Audit Inspector...")
    auth_res = requests.post(f"{base_url}/auth/switch-demo-role/admin")
    assert auth_res.status_code == 200
    admin_token = auth_res.json()["access_token"]

    r = requests.get(f"{base_url}/audit?limit=5", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    logs = r.json()
    print(f"   -> Verified {len(logs)} audit entries via Admin JWT token.")

    print("\n========================================================")
    print(" ALL END-TO-END SYSTEM VERIFICATIONS PASSED 100%!")
    print("========================================================")

if __name__ == "__main__":
    test_full_system()
