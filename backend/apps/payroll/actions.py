from __future__ import annotations

from io import BytesIO
from django.core.mail import EmailMessage
from django.http import FileResponse
from reportlab.lib.pagesizes import LETTER
from reportlab.pdfgen import canvas


def payslip_pdf(payslip):
    stream = BytesIO()
    pdf = canvas.Canvas(stream, pagesize=LETTER)
    pdf.setTitle(f"Payslip {payslip.month}")
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(54, 744, "HireChamps Payslip")
    pdf.setFont("Helvetica", 10)
    pdf.drawString(54, 724, f"Period: {payslip.period or payslip.month}")
    y = 684
    for label, value in (("Gross", payslip.gross), ("Deductions", payslip.deductions), ("Tax", payslip.tax), ("Net pay", payslip.net)):
        pdf.drawString(54, y, label)
        pdf.drawRightString(330, y, f"{value:,.2f}")
        y -= 22
    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(54, y - 10, "Breakdown")
    y -= 32
    pdf.setFont("Helvetica", 10)
    for line in payslip.lines.all():
        pdf.drawString(54, y, line.label)
        pdf.drawRightString(330, y, f"{line.amount:,.2f}")
        y -= 18
    pdf.save()
    stream.seek(0)
    return stream


def email_payslip(payslip, recipient: str):
    stream = payslip_pdf(payslip)
    email = EmailMessage(
        subject=f"Your HireChamps payslip — {payslip.month}",
        body=f"Attached is your payslip for {payslip.period or payslip.month}.",
        to=[recipient],
    )
    email.attach(f"payslip-{payslip.month}.pdf", stream.read(), "application/pdf")
    email.send(fail_silently=False)
