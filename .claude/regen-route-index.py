#!/usr/bin/env python3
"""
Regenerates the backend route index memory file from the live backend source.
Run whenever backend routes change (git pull/push in the backend repo).
Extracts METHOD, full path, and a description from the handler body.
"""
import re
import os
import sys
from datetime import datetime

ROUTES_DIR = "/Users/Rajveer/Desktop/Coding/100xDevs-Journey/Projects/Geolocation-MVP/backend/src/routes"
APP_FILE = "/Users/Rajveer/Desktop/Coding/100xDevs-Journey/Projects/Geolocation-MVP/backend/src/app.ts"
MEMORY_DIR = "/Users/Rajveer/.claude/projects/-Users-Rajveer-Desktop-Coding-100xDevs-Journey-Projects-Geolocation-MVP-app/memory"
MEMORY_FILE = os.path.join(MEMORY_DIR, "backend-route-index.md")


def load_prefixes(app_file):
    with open(app_file) as f:
        content = f.read()
    prefix_map = {}
    for m in re.finditer(r"app\.use\('([^']+)',\s*(\w+)\)", content):
        prefix_map[m.group(2).lower()] = m.group(1)
    file_to_var = {}
    for m in re.finditer(r"import (\w+) from ['\"].*?/routes/([^'\"]+)['\"]", content):
        var, path = m.group(1), m.group(2)
        file_to_var[path.replace(".js", "").replace(".ts", "")] = var.lower()
    return prefix_map, file_to_var


def infer_description(lines, route_line_idx):
    """
    Try to infer a human-readable description for a route from:
    1. An '--- Endpoint: ...' comment on/before the route line
    2. A section comment (// ── ... ──) before the route
    3. The first service function call in the handler body
    4. The response shape (res.json / res.status)
    Falls back to empty string.
    """
    # Look back up to 8 lines for a comment
    for j in range(max(0, route_line_idx - 8), route_line_idx):
        line = lines[j].strip()
        # Skip "--- Endpoint: METHOD /path ---" — redundant with path itself
        if re.search(r'Endpoint:\s*\w+\s+/\S+', line):
            continue
        # Section comment "// ── Title ──" or "// == Title ==" or "// --- Title ---"
        m = re.match(r'//\s*[──=\-]{2,}\s*(.+?)\s*[──=\-]{2,}', line)
        if m:
            candidate = m.group(1).strip()
            # Filter out noise like "DEAL TYPE SPECIFIC VALIDATION" (all-caps)
            if len(candidate) > 3 and not candidate.upper() == candidate:
                return candidate

    # Look forward into the handler body (next ~20 lines) for service calls
    body_lines = lines[route_line_idx + 1 : route_line_idx + 30]
    for line in body_lines:
        # await serviceFunctionName( — use function name as description
        m = re.search(r'await\s+([a-z][a-zA-Z]+)\s*\(', line)
        if m:
            fn = m.group(1)
            # Skip generic names
            if fn not in ('prisma', 'bcrypt', 'jwt', 'res', 'req', 'next', 'protect', 'parse', 'parseInt', 'Math', 'JSON', 'Promise', 'setTimeout'):
                # Convert camelCase to readable words
                desc = re.sub(r'([A-Z])', r' \1', fn).strip().lower()
                return desc.capitalize()
        # res.status(201).json — creation endpoint
        if 'status(201)' in line:
            return "Create resource"
        # res.json({ success: true, message: 'Success message' }) — skip error messages
        m = re.search(r"message:\s*['\"]([^'\"]{5,50})['\"]", line)
        if m:
            msg = m.group(1).rstrip('.,')
            error_words = ('failed', 'invalid', 'error', 'not found', 'required', 'unauthorized', 'forbidden', 'missing', 'already')
            if not any(w in msg.lower() for w in error_words):
                return msg

    return ""


def extract_routes(routes_dir, prefix_map, file_to_var):
    result = {}  # fname -> list of (METHOD, full_path, description)
    for fname in sorted(os.listdir(routes_dir)):
        if not fname.endswith(".ts"):
            continue
        fkey = fname.replace(".ts", "")
        var_name = file_to_var.get(fkey, "")
        prefix = prefix_map.get(var_name, "/api")

        with open(os.path.join(routes_dir, fname)) as f:
            lines = f.readlines()

        routes = []
        for i, line in enumerate(lines):
            m = re.match(r"\s*router\.(get|post|put|patch|delete)\(['\"]([^'\"]+)['\"]", line)
            if m:
                method = m.group(1).upper()
                path = m.group(2)
                full = prefix.rstrip("/") + path if path != "/" else prefix
                desc = infer_description(lines, i)
                routes.append((method, full, desc))
        if routes:
            result[fname] = routes
    return result


def count_routes(result):
    return sum(len(v) for v in result.values())


def build_content(routes_by_file, today):
    total = count_routes(routes_by_file)
    lines = [
        "---",
        "name: backend-route-index",
        f'description: "Complete index of every backend API route (method + path + description). Auto-regenerated from backend/src/routes/*.ts on {today}. {total} routes across {len(routes_by_file)} route files."',
        "metadata:",
        "  type: reference",
        "---",
        "",
        "All routes served from `http://localhost:3000`. Base prefix for all API: `/api` (health routes have no prefix).",
        "**Source of truth:** `backend/src/routes/<name>.routes.ts` — read the handler body there for exact request body fields, query params, and response shape.",
        "**DO NOT trust `backend.docx`** — it is outdated. See [[backend-contract-mismatch]].",
        f"**Last regenerated:** {today} ({total} routes, {len(routes_by_file)} files)",
        "",
        "---",
        "",
    ]

    for fname, routes in routes_by_file.items():
        lines.append(f"### {fname.replace('.routes.ts', '')}")
        for method, path, desc in routes:
            desc_part = f"  — {desc}" if desc else ""
            lines.append(f"  {method:<7} {path}{desc_part}")
        lines.append("")

    return "\n".join(lines)


if __name__ == "__main__":
    if not os.path.exists(ROUTES_DIR):
        print(f"ERROR: backend routes dir not found: {ROUTES_DIR}", file=sys.stderr)
        sys.exit(1)
    if not os.path.exists(APP_FILE):
        print(f"ERROR: backend app.ts not found: {APP_FILE}", file=sys.stderr)
        sys.exit(1)

    prefix_map, file_to_var = load_prefixes(APP_FILE)
    routes_by_file = extract_routes(ROUTES_DIR, prefix_map, file_to_var)
    total = count_routes(routes_by_file)
    today = datetime.now().strftime("%Y-%m-%d")

    new_content = build_content(routes_by_file, today)

    # Read existing to check if changed (ignore date line)
    existing = ""
    if os.path.exists(MEMORY_FILE):
        with open(MEMORY_FILE) as f:
            existing = f.read()

    def strip_volatile(s):
        return re.sub(r"\*\*Last regenerated:\*\*.*", "", s)

    if strip_volatile(new_content) == strip_volatile(existing):
        print("Routes unchanged — index up to date.")
        sys.exit(0)

    os.makedirs(MEMORY_DIR, exist_ok=True)
    with open(MEMORY_FILE, "w") as f:
        f.write(new_content)

    print(f"Route index updated: {total} routes across {len(routes_by_file)} files → {MEMORY_FILE}")
