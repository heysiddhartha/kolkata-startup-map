from pathlib import Path

# Deprecated discovery script. eChai is intentionally not used as a source of truth.
# Public company links must be independently verified before entering production data.
OUT = Path("data/startups.json")

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text('{"source":"independent-verification","companies":[]}', encoding="utf-8")
print("eChai discovery disabled; use independently verified company sources.")
