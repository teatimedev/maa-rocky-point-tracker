from __future__ import annotations

import os

from supabase import Client, create_client


def get_supabase_client() -> Client | None:
    """Create a Supabase client using service-role creds when available.

    Uses env vars:
    - SUPABASE_URL
    - SUPABASE_SERVICE_ROLE_KEY
    """

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        return None
    return create_client(url, key)
