#!/usr/bin/env python3
import sys
import traceback

try:
    import api_server
    print("SUCCESS: api_server imported successfully")
except Exception as e:
    print(f"ERROR: Failed to import api_server: {e}")
    traceback.print_exc()
    sys.exit(1)
