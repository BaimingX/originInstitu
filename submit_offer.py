# submit_offer.py
# -*- coding: utf-8 -*-

import json, argparse
import requests

DEFAULT_BASE = "https://cricosapi.dotedu.com.au"
USERNAME = "origininst_live"
PASSWORD = "$rigininst_l1ve2o22"

def pretty(title, payload):
    print(f"\n=== {title} ===")
    if isinstance(payload,(dict,list)):
        print(json.dumps(payload, ensure_ascii=False, indent=2))
    else:
        print(str(payload))

def get_token(base: str) -> str:
    url = f"{base.rstrip('/')}/token"
    data = {"grant_type":"password","username":USERNAME,"password":PASSWORD}
    r = requests.post(url, data=data, headers={"Content-Type":"application/x-www-form-urlencoded"}, timeout=30)
    if r.status_code != 200:
        raise SystemExit(f"[ERROR] Token {r.status_code}: {r.text}")
    try:
        return r.json()["access_token"]
    except Exception:
        raise SystemExit(f"[ERROR] Token parse error: {r.text}")

def post_json(base: str, token: str, path: str, body):
    url = f"{base.rstrip('/')}{path}"
    h = {"Authorization":f"Bearer {token}","Content-Type":"application/json","Accept":"application/json, text/json"}
    r = requests.post(url, headers=h, json=body, timeout=120)
    try: return r.status_code, r.json()
    except Exception: return r.status_code, r.text

def load_offer(path: str):
    with open(path,"r",encoding="utf-8") as f:
        return json.loads(f.read())

def build_parser():
    p = argparse.ArgumentParser(description="Submit StudentOffer from output.json")
    p.add_argument("--base", default=DEFAULT_BASE)
    p.add_argument("--file", default="output.json")
    p.add_argument("--validate", action="store_true", help="Call /Validate before submit")
    p.add_argument("--no-submit", action="store_true", help="Skip submit (validate only)")
    return p

def main():
    args = build_parser().parse_args()

    offer = load_offer(args.file)
    pretty("LOADED OFFER", offer)

    token = get_token(args.base)
    pretty("ACCESS TOKEN", token[:8] + "...")

    if args.validate or args.no_submit:
        code_v, res_v = post_json(args.base, token, "/api/V1/StudentOffers/Validate", offer)
        pretty(f"VALIDATE RESULT ({code_v})", res_v)
        if args.no_submit or code_v >= 400:
            return

    code_s, res_s = post_json(args.base, token, "/api/V1/StudentOffers", offer)
    pretty(f"SUBMIT RESULT ({code_s})", res_s)

if __name__ == "__main__":
    main()
