from supabase import create_client, Client
from app.config import settings
import logging

logger = logging.getLogger(__name__)

if settings.SUPABASE_URL and settings.SUPABASE_KEY:
    try:
        supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        logger.info("✅ Supabase connected")
    except Exception as e:
        supabase = None
        logger.error(f"❌ Supabase connection failed: {e}")
else:
    supabase = None
    logger.warning("⚠️ Supabase not configured")