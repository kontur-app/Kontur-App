import sys
import os
import django
from django.conf import settings

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "kontur_backend.settings")
os.environ.setdefault("DATABASE_URL", "")

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()

from django.http import HttpRequest
from django.core.handlers.wsgi import WSGIHandler
from io import BytesIO

app = application


def handler(environ, start_response):
    """Vercel Python Runtime handler."""
    environ["REQUEST_METHOD"] = environ.get("REQUEST_METHOD", "GET")
    environ["SCRIPT_NAME"] = ""
    environ["SERVER_NAME"] = environ.get("SERVER_NAME", "localhost")
    environ["SERVER_PORT"] = environ.get("SERVER_PORT", "443")
    environ["SERVER_PROTOCOL"] = "HTTP/1.1"
    environ["wsgi.url_scheme"] = environ.get("HTTP_X_FORWARDED_PROTO", "https")

    return application(environ, start_response)
