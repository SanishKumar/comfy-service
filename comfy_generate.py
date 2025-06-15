import uuid
import json
import random
import requests
import websocket
from urllib.parse import urlencode

SERVER = "127.0.0.1:8188"

def queue_prompt(prompt: str, negative: str = "", seed: int = None, lora: str = None):
    cid = str(uuid.uuid4())
    payload = {
        "prompt": prompt,
        "negative_prompt": negative,
        "client_id": cid
    }
    # optional fields
    if seed is not None:
        payload["seed"] = seed
    if lora is not None:
        payload["lora_name"] = lora

    resp = requests.post(f"http://{SERVER}/prompt", json=payload)
    resp.raise_for_status()
    data = resp.json()
    return data["prompt_id"], cid

def wait_for_done(ws, pid):
    while True:
        msg = ws.recv()
        if not isinstance(msg, str):
            continue
        m = json.loads(msg)
        # when type is 'executing' with node==None, prompt done
        if m.get("type") == "executing" \
           and m["data"].get("node") is None \
           and m["data"].get("prompt_id") == pid:
            return

def fetch_images(pid: int):
    hist = requests.get(f"http://{SERVER}/history/{pid}").json()[str(pid)]
    out = {}
    for nid, node in hist["outputs"].items():
        if "images" not in node:
            continue
        imgs = []
        for im in node["images"]:
            q = urlencode({
                "filename": im["filename"],
                "subfolder": im["subfolder"],
                "type": im["type"]
            })
            raw = requests.get(f"http://{SERVER}/view?{q}").content
            imgs.append(raw)
        out[nid] = imgs
    return out

def generate_image(
    prompt: str,
    negative_prompt: str = "",
    seed: int = None,
    lora_name: str = None
) -> dict:
    """
    Returns a dict mapping node_id -> list of PNG bytes.
    """
    pid, cid = queue_prompt(
        prompt=prompt,
        negative=negative_prompt,
        seed=seed,
        lora=lora_name
    )

    ws = websocket.WebSocket()
    ws.connect(f"ws://{SERVER}/ws?clientId={cid}")
    wait_for_done(ws, pid)
    ws.close()

    return fetch_images(pid)
