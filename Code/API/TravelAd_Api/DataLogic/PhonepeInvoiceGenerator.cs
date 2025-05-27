using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Kernel.Font;
using iText.IO.Font.Constants;
using System;
using System.IO;
using Newtonsoft.Json.Linq;

namespace TravelAd_Api.DataLogic
{
    public class PhonepeInvoiceGenerator
    {
        public byte[] GenerateInvoicePublic(JToken payload)
        {
            return GenerateInvoice(payload);
        }

        public byte[] GenerateInvoice(JToken payload)
        {
            try
            {
                using (var ms = new MemoryStream())
                {
                    PdfWriter writer = new PdfWriter(ms);
                    PdfDocument pdf = new PdfDocument(writer);
                    Document document = new Document(pdf);

                    PdfFont boldFont = PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD);
                    PdfFont regularFont = PdfFontFactory.CreateFont(StandardFonts.HELVETICA);

                    string orderId = payload["orderId"]?.ToString() ?? Guid.NewGuid().ToString();
                    string amount = (Convert.ToDecimal(payload["amount"]) / 100).ToString("F2");
                    string merchantId = payload["merchantId"]?.ToString() ?? "Unknown";
                    string planName = payload["metaInfo"]?["udf2"]?.ToString() ?? "N/A";

                    // Header
                    document.Add(new Paragraph("Invoice").SetFont(boldFont).SetFontSize(20));
                    document.Add(new Paragraph($"Invoice Number: {orderId}").SetFont(boldFont));
                    document.Add(new Paragraph($"Date of Issue: {DateTime.Now:MMMM dd, yyyy}").SetFont(regularFont));
                    document.Add(new Paragraph("\n"));

                    // Company Info
                    document.Add(new Paragraph("AGNO INTEL PRIVATE LIMITED").SetFont(boldFont));
                    document.Add(new Paragraph("Manasarovar, #1, 9C/10A, Second Floor, Second Street,").SetFont(regularFont));
                    document.Add(new Paragraph("Ayodhya Colony, Velachery, Chennai, Tamil Nadu 600042").SetFont(regularFont));
                    document.Add(new Paragraph("\n"));

                    // Bill To
                    document.Add(new Paragraph("Bill To:").SetFont(boldFont));
                    document.Add(new Paragraph(merchantId).SetFont(regularFont));
                    document.Add(new Paragraph("\n"));

                    // Table
                    Table table = new Table(3);
                    table.AddHeaderCell(new Cell().Add(new Paragraph("Plan Name").SetFont(boldFont)));
                    table.AddHeaderCell(new Cell().Add(new Paragraph("Qty").SetFont(boldFont)));
                    table.AddHeaderCell(new Cell().Add(new Paragraph("Amount").SetFont(boldFont)));

                    table.AddCell(new Cell().Add(new Paragraph(planName).SetFont(regularFont)));
                    table.AddCell(new Cell().Add(new Paragraph("1").SetFont(regularFont)));
                    table.AddCell(new Cell().Add(new Paragraph($"₹{amount}").SetFont(regularFont)));

                    document.Add(table);

                    // Total
                    document.Add(new Paragraph($"\nTotal Amount Due: ₹{amount}")
                        .SetFont(boldFont).SetFontSize(14));

                    document.Close();

                    return ms.ToArray(); // return byte[]
                }
            }
            catch (Exception ex)
            {
                File.AppendAllText(@"C:\Logs\invoice-errors.txt", $"{DateTime.Now}: Error generating invoice as bytes: {ex.Message}\n");
                return null;
            }
        }

    }
}
