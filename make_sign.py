"""
Generate a 18x24 inch (3:4) yard sign PDF for Liberty Hill fonio lead gen.
"""
import io, qrcode
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, white, black
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

URL = "https://fonio-local-sites.vercel.app/liberty-hill-v2.html"
OUT = "/Users/agentluna/fonio-local-sites/liberty-hill-yard-sign.pdf"

W, H = 18 * inch, 24 * inch

BLUE   = HexColor("#585dfe")
TEAL   = HexColor("#bfeff2")
BLACK  = HexColor("#0f0f16")
LIGHT  = HexColor("#f7f8fc")

def make_qr(url, size_px=600):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=2,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#0f0f16", back_color="#f7f8fc")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return ImageReader(buf)

c = canvas.Canvas(OUT, pagesize=(W, H))

# Background
c.setFillColor(LIGHT)
c.rect(0, 0, W, H, fill=1, stroke=0)

# Top color band
c.setFillColor(BLUE)
c.rect(0, H - 4.5*inch, W, 4.5*inch, fill=1, stroke=0)

# fonio wordmark on blue band
c.setFillColor(white)
c.setFont("Helvetica-Bold", 72)
c.drawCentredString(W/2, H - 2.0*inch, "fonio")

# Tagline on blue band
c.setFont("Helvetica", 28)
c.drawCentredString(W/2, H - 2.9*inch, "AI Phone Agent")

# Divider line
c.setStrokeColor(BLUE)
c.setLineWidth(3)
c.line(1*inch, H - 5.2*inch, W - 1*inch, H - 5.2*inch)

# Main headline
c.setFillColor(BLACK)
c.setFont("Helvetica-Bold", 58)
c.drawCentredString(W/2, H - 6.6*inch, "NEVER MISS")
c.drawCentredString(W/2, H - 7.5*inch, "ANOTHER CALL.")

# Sub-copy
c.setFont("Helvetica", 26)
c.setFillColor(HexColor("#444444"))
c.drawCentredString(W/2, H - 8.7*inch, "AI answers your phone 24/7.")
c.drawCentredString(W/2, H - 9.3*inch, "Free demo built for your business.")

# QR code
qr_img = make_qr(URL)
qr_size = 5.5 * inch
qr_x = (W - qr_size) / 2
qr_y = H - 16.5*inch
c.drawImage(qr_img, qr_x, qr_y, width=qr_size, height=qr_size)

# "Scan for your free demo" label
c.setFont("Helvetica-Bold", 22)
c.setFillColor(BLUE)
c.drawCentredString(W/2, qr_y - 0.5*inch, "SCAN FOR YOUR FREE DEMO")

# Liberty Hill local callout
c.setFillColor(TEAL)
c.roundRect(1*inch, 1.2*inch, W - 2*inch, 0.85*inch, 8, fill=1, stroke=0)
c.setFillColor(BLACK)
c.setFont("Helvetica-Bold", 26)
c.drawCentredString(W/2, 1.55*inch, "LIBERTY HILL SMALL BUSINESSES")

# Bottom URL
c.setFont("Helvetica", 16)
c.setFillColor(HexColor("#666666"))
c.drawCentredString(W/2, 0.7*inch, URL)

c.save()
print(f"Saved: {OUT}")
