#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""合成强节奏 BGM：120 BPM（beat=0.5s 精确已知），kick每拍+snare反拍+hihat8分+bass四根音。"""
import numpy as np, wave, subprocess, os, json

SR, BPM = 44100, 120
BEAT = 60 / BPM          # 0.5s
BARS = 18                # 4/4，共 36s
DUR = BARS * 4 * BEAT
rng = np.random.default_rng(7)
mix = np.zeros(int(DUR * SR))

def add(sig, at):
    i0 = int(at * SR)
    if i0 >= len(mix): return
    i1 = min(i0 + len(sig), len(mix))
    mix[i0:i1] += sig[:i1 - i0]

def kick():
    n = int(0.13 * SR); tt = np.arange(n) / SR
    f = 160 * np.exp(-tt / 0.028) + 48
    return 0.95 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.05)

def snare():
    n = int(0.18 * SR); tt = np.arange(n) / SR
    noise = rng.uniform(-1, 1, n)
    noise = noise - np.concatenate([[0], noise[:-1]])          # 提亮
    body = 0.45 * np.sin(2 * np.pi * 185 * tt)
    return (0.8 * noise + body) * np.exp(-tt / 0.05)

def hat(open_=False):
    n = int((0.10 if open_ else 0.035) * SR); tt = np.arange(n) / SR
    noise = rng.uniform(-1, 1, n)
    hp = noise - np.concatenate([[0], noise[:-1]])
    hp = hp - np.concatenate([[0], hp[:-1]])                   # 更亮
    return 0.22 * hp * np.exp(-tt / (0.055 if open_ else 0.012))

def bass(freq, d):
    n = int(d * SR); tt = np.arange(n) / SR
    sig = np.sin(2 * np.pi * freq * tt) + 0.35 * np.sin(4 * np.pi * freq * tt) + 0.15 * np.sin(6 * np.pi * freq * tt)
    env = np.minimum(1, tt / 0.005) * np.exp(-tt / 0.20)
    return 0.55 * sig * env

prog = [55.00, 43.65, 65.41, 49.00]        # A1 F1 C2 G1（Am F C G）
for bar in range(BARS):
    bt0 = bar * 4 * BEAT
    root = prog[bar % 4]
    for b in range(4):
        at = bt0 + b * BEAT
        add(kick(), at)
        if b in (1, 3): add(snare(), at)     # 反拍军鼓
        for e in range(2):                   # 8 分 hat，反拍开镲
            add(hat(open_=(e == 1)), at + e * BEAT / 2)
        for e in range(2):                   # 8 分贝斯泵
            add(bass(root, BEAT / 2), at + e * BEAT / 2)

mix = mix / np.max(np.abs(mix)) * 0.92
OUTDIR = "/Users/lv/WorkBuddy/ISkills/dig-media/music-generated-strong-beat-120bpm"
os.makedirs(OUTDIR, exist_ok=True)
wavp = f"{OUTDIR}/strong-beat-120bpm.wav"
w = wave.open(wavp, "w"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mix * 32767).astype("<i2").tobytes()); w.close()
mp3 = f"{OUTDIR}/strong-beat-120bpm.mp3"
r = subprocess.run(["/opt/homebrew/bin/ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
                    "-i", wavp, "-c:a", "libmp3lame", "-b:a", "192k", mp3], capture_output=True, text=True)
final = mp3 if r.returncode == 0 else wavp
json.dump({
    "source": "self-synthesized (numpy)",
    "title": "Strong Beat 120BPM (Am-F-C-G)",
    "bpm": BPM, "beat_interval_s": BEAT, "duration_s": round(DUR, 2),
    "layers": "kick every beat / snare backbeat / hats 8th (open off-beat) / bass 8th pump",
    "license": "自生成，无署名义务", "generated_at": "2026-10-03",
    "usage": "节拍卡点验证（iskill-video-clipper 验证样片）"
}, open(f"{OUTDIR}/manifest.json", "w"), ensure_ascii=False, indent=2)
print("BGM:", final, os.path.getsize(final))
