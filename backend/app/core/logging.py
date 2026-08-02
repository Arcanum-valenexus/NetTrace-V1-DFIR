import sys
import logging
from typing import Any, Dict
import structlog


def setup_logging(log_level: str = "INFO") -> None:
    """Configures structured JSON logging for NetTrace Enterprise Backend."""
    
    logging_level = getattr(logging, log_level.upper(), logging.INFO)

    # Standard python logging config
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=logging_level,
    )

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer()
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )


logger = structlog.get_logger("nettrace")


def log_audit_event(event_type: str, actor_id: str, action: str, details: Dict[str, Any], status: str = "SUCCESS") -> None:
    """Helper to structure security and audit events."""
    audit_logger = structlog.get_logger("nettrace.audit")
    audit_logger.info(
        "AUDIT_EVENT",
        event_type=event_type,
        actor_id=actor_id,
        action=action,
        status=status,
        details=details,
    )
