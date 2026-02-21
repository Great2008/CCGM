"""
CCOGM - Python Backend API (Vercel Serverless Functions)
Each file in /api is a separate serverless function endpoint.
This main handler routes requests.
"""
from http.server import BaseHTTPRequestHandler
import json
from datetime import datetime


def get_cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    }


class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        for k, v in get_cors_headers().items():
            self.send_header(k, v)
        self.end_headers()

    def do_GET(self):
        path = self.path.rstrip("/")
        headers = get_cors_headers()

        if path == "/api" or path == "/api/health":
            body = {"status": "ok", "message": "CCOGM API is running", "timestamp": datetime.now().isoformat()}
            self._respond(200, body, headers)
        elif path == "/api/sermons":
            self._respond(200, {"sermons": SERMONS_DATA}, headers)
        elif path.startswith("/api/sermons/"):
            sermon_id = int(path.split("/")[-1])
            sermon = next((s for s in SERMONS_DATA if s["id"] == sermon_id), None)
            if sermon:
                self._respond(200, sermon, headers)
            else:
                self._respond(404, {"error": "Sermon not found"}, headers)
        elif path == "/api/events":
            self._respond(200, {"events": EVENTS_DATA}, headers)
        elif path == "/api/blog":
            self._respond(200, {"posts": BLOG_DATA}, headers)
        else:
            self._respond(404, {"error": "Not found"}, headers)

    def do_POST(self):
        path = self.path.rstrip("/")
        headers = get_cors_headers()
        content_length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(content_length)) if content_length else {}

        if path == "/api/contact":
            # Validate required fields
            required = ["name", "email", "message", "subject"]
            missing = [f for f in required if not body.get(f)]
            if missing:
                self._respond(400, {"error": f"Missing fields: {', '.join(missing)}"}, headers)
                return
            # TODO: Integrate with email provider (SendGrid, Mailgun, etc.)
            # send_email(body["email"], body["name"], body["subject"], body["message"])
            self._respond(200, {
                "success": True,
                "message": f"Thank you {body['name']}, your message has been received. We'll be in touch soon!"
            }, headers)

        elif path == "/api/newsletter":
            email = body.get("email", "").strip()
            if not email or "@" not in email:
                self._respond(400, {"error": "Valid email is required"}, headers)
                return
            # TODO: Add to email list provider (Mailchimp, ConvertKit, etc.)
            self._respond(200, {"success": True, "message": "You've been subscribed to our devotionals!"}, headers)

        elif path == "/api/prayer":
            required = ["name", "request"]
            missing = [f for f in required if not body.get(f)]
            if missing:
                self._respond(400, {"error": f"Missing fields: {', '.join(missing)}"}, headers)
                return
            # TODO: Store in database and notify prayer team
            self._respond(200, {"success": True, "message": "Your prayer request has been received. Our prayer team is with you."}, headers)

        else:
            self._respond(404, {"error": "Endpoint not found"}, headers)

    def _respond(self, status: int, data: dict, headers: dict):
        self.send_response(status)
        for k, v in headers.items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def log_message(self, format, *args):
        pass  # Suppress default logging


# ── In-memory seed data (replace with a real DB like Supabase, PlanetScale, etc.) ──

SERMONS_DATA = [
    {
        "id": 1,
        "title": "Walking in Faith Through Every Storm",
        "pastor": "Pastor John Mensah",
        "date": "2025-02-16",
        "scripture": "Matthew 14:22-33",
        "series": "Faith Series",
        "description": "A powerful message about trusting God even when waves of life seem insurmountable.",
        "videoUrl": "",
        "audioUrl": "",
        "thumbnail": "",
        "duration": "48 min",
        "views": 1204,
    },
    {
        "id": 2,
        "title": "The Power of Prayer and Fasting",
        "pastor": "Pastor Sarah Boateng",
        "date": "2025-02-09",
        "scripture": "Isaiah 58:6-9",
        "series": "Prayer Life",
        "description": "Exploring the spiritual discipline of fasting as a pathway to breakthrough.",
        "videoUrl": "",
        "audioUrl": "",
        "thumbnail": "",
        "duration": "52 min",
        "views": 982,
    },
]

EVENTS_DATA = [
    {
        "id": 1,
        "title": "Sunday Worship Service",
        "date": "2025-02-23",
        "time": "9:00 AM & 11:00 AM",
        "location": "Main Sanctuary",
        "category": "Worship",
        "description": "Weekly Sunday worship service. All are welcome.",
        "recurring": True,
    },
    {
        "id": 2,
        "title": "Annual Church Convention 2025",
        "date": "2025-03-14",
        "time": "9:00 AM",
        "location": "Church Main Hall",
        "category": "Special Event",
        "description": "A three-day revival with guest ministers, worship nights, and breakout sessions.",
        "recurring": False,
    },
]

BLOG_DATA = [
    {
        "id": 1,
        "title": "Finding Peace in the Midst of Life's Uncertainties",
        "author": "Pastor John Mensah",
        "date": "2025-02-18",
        "category": "Devotional",
        "excerpt": "Life can be overwhelming, but God's Word promises a peace that transcends human understanding.",
        "content": "",
        "readTime": "4 min read",
    },
]
