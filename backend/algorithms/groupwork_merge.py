"""Fold the per-worker groupwork shard files back into coursesProcessed.json.

groupwork_all.py writes a small {course_code: bool} file per worker when run with
GROUPWORK_SHARDS > 1, so that parallel workers never rewrite the shared 5MB
coursesProcessed.json concurrently. Run this once the workers have finished.

Usage (from backend/algorithms/):  python groupwork_merge.py
"""

import glob
import json
import os

OUTPUT_PATH = "../data/final_data/coursesProcessed.json"
SHARD_GLOB = "../data/final_data/groupwork_shard_*.json"


def main():
    with open(OUTPUT_PATH, "r", encoding="utf-8") as file:
        course_data = json.load(file)

    shard_files = sorted(glob.glob(SHARD_GLOB))
    if not shard_files:
        print("No shard files found - nothing to merge.")
        return

    applied = 0
    conflicts = []
    unknown = []
    for path in shard_files:
        with open(path, "r", encoding="utf-8") as file:
            shard = json.load(file)
        for code, value in shard.items():
            if code not in course_data:
                unknown.append(code)
                continue
            existing = course_data[code].get("groupwork")
            if existing is not None and existing != value:
                conflicts.append((code, existing, value))
            course_data[code]["groupwork"] = value
            applied += 1
        print(f"{os.path.basename(path)}: {len(shard)} value(s)")

    # Same atomic swap the scraper uses: never truncate the real file in place.
    tmp = f"{OUTPUT_PATH}.tmp"
    with open(tmp, "w", encoding="utf-8") as out_file:
        json.dump(course_data, out_file, indent=4)
    os.replace(tmp, OUTPUT_PATH)

    have = sum(1 for v in course_data.values() if "groupwork" in v)
    true_n = sum(1 for v in course_data.values() if v.get("groupwork") is True)
    print(f"\nApplied {applied} value(s) from {len(shard_files)} shard(s)")
    if conflicts:
        print(f"WARNING: {len(conflicts)} conflict(s) with existing values, e.g. {conflicts[:5]}")
    if unknown:
        print(f"WARNING: {len(unknown)} code(s) not in coursesProcessed.json, e.g. {unknown[:5]}")
    print(f"coursesProcessed.json now: {have}/{len(course_data)} with a value ({true_n} true)")


if __name__ == "__main__":
    main()
