using DBAccess;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Threading.Tasks;
using TravelAd_Api.DataLogic;

[ApiController]
[Route("api/webhook/phonepe")]
public class PhonePeWebhookController : ControllerBase
{
    private readonly IDbHandler _dbHandler;
    private readonly ILogger<PhonePeWebhookController> _logger;

    public PhonePeWebhookController(IDbHandler dbHandler, ILogger<PhonePeWebhookController> logger)
    {
        _dbHandler = dbHandler;
        _logger = logger;
    }

    internal static void ProcessPaymentSuccess(string responseData)
    {
        throw new NotImplementedException();
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> HandleWebhook()
    {
        _logger.LogInformation("Webhook hit: {time}", DateTime.UtcNow);

        // Read body ONCE and reuse
        string requestBody = await new StreamReader(Request.Body).ReadToEndAsync();

        _logger.LogInformation("Headers: {headers}", JsonConvert.SerializeObject(Request.Headers));
        _logger.LogInformation("Body: {body}", requestBody);

        string fallbackLogPath = @"C:\webHookLogs\log.txt";
        Directory.CreateDirectory(Path.GetDirectoryName(fallbackLogPath));
        await System.IO.File.AppendAllTextAsync(fallbackLogPath, JsonConvert.SerializeObject(Request.Headers));
        await System.IO.File.AppendAllTextAsync(fallbackLogPath, requestBody);

        try
        {
            if (string.IsNullOrWhiteSpace(requestBody))
            {
                _logger.LogError("Received an empty webhook payload.");
                return BadRequest(new { message = "Invalid webhook payload" });
            }

            JObject json;
            try
            {
                json = JObject.Parse(requestBody);
            }
            catch (JsonReaderException jsonEx)
            {
                _logger.LogError(jsonEx, "Invalid JSON received in PhonePe webhook: {0}", requestBody);
                return BadRequest(new { message = "Invalid JSON format" });
            }

            string eventType = json["event"]?.ToString();
            var payload = json["payload"];

            if (payload == null)
            {
                _logger.LogWarning("Missing 'payload' in webhook.");
                return BadRequest(new { message = "Missing 'payload' in webhook." });
            }

            if (string.IsNullOrWhiteSpace(payload["orderId"]?.ToString()))
            {
                _logger.LogWarning("Missing Order ID in payload.");
                return BadRequest(new { message = "Missing Order ID in payload." });
            }

            try
            {
                switch (eventType)
                {
                    case "checkout.order.completed":
                        await ProcessPaymentSuccess(payload);
                        break;
                    case "checkout.order.failed":
                        _logger.LogWarning($"Payment failed for Order ID: {payload["orderId"]}");
                        break;
                    case "pg.refund.failed":
                        _logger.LogWarning($"Refund failed for Order ID: {payload["orderId"]}");
                        break;
                    case "pg.refund.completed":
                        _logger.LogInformation($"Refund completed for Order ID: {payload["orderId"]}");
                        break;
                    case "pg.refund.accepted":
                        _logger.LogInformation($"Refund accepted for Order ID: {payload["orderId"]}");
                        break;
                    default:
                        _logger.LogWarning($"Unhandled event type: {eventType}");
                        break;
                }
            }
            catch (Exception innerEx)
            {
                _logger.LogError(innerEx, $"Error while processing event type: {eventType}");
                return StatusCode(500, new { message = $"Error while processing event: {eventType}", details = innerEx.Message });
            }

            return Ok(new { message = "Webhook processed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in webhook handler");
            return StatusCode(500, new { message = "Internal server error", details = ex.Message });
        }
    }


    private async Task ProcessPaymentSuccess(JToken payload)
    {
        try
        {
            string procedureName = "InsertPhonepetDetails";

            var parameters = new Dictionary<string, object>
        {
            {"@PaymentId", payload["orderId"]?.ToString() ?? string.Empty },
            //{"@Amount", payload["amount"]?.ToString() ?? "0" },
            { "@Amount", (Convert.ToDecimal(payload["amount"]) / 100).ToString() },
            {"@Status", payload["state"]?.ToString() == "COMPLETED" ? "Succeeded" : "Failed" },
            {"@Currency", payload["metaInfo"]?["udf1"]?.ToString() ?? "INR" },
            {"@plan_name", payload["metaInfo"]?["udf2"]?.ToString() ?? "Default Plan" },
            {"@accountid", payload["metaInfo"]?["udf3"]?.ToString() ?? "Unknown" },
            {"@orderid", payload["paymentDetails"]?[0]?["transactionId"]?.ToString() ?? "" },
            {"@paymenttype", "Phonepe" },
            {"@ReceiptUrl", "" },
            {"@Email", "" },
            {"@productname", "" },
            {"@package_type", payload["metaInfo"]?["udf4"]?.ToString() ?? "Unknown" }
        };

            try
            {
                await Task.Run(() =>
                    _dbHandler.ExecuteNonQuery(procedureName, parameters, CommandType.StoredProcedure)
                );
                _logger.LogInformation("Payment details saved to DB successfully.");

                // Optional: write to fallback file (use C:\Logs safely)
                string fallbackLogPath = @"C:\Logs\webhook-log.txt";
                Directory.CreateDirectory(Path.GetDirectoryName(fallbackLogPath));
                await System.IO.File.AppendAllTextAsync(fallbackLogPath, $"{DateTime.Now} - Inserted to DB: {parameters["@PaymentId"]}\n");
            }
            catch (Exception dbEx)
            {
                _logger.LogError(dbEx, "Database error while inserting PhonePe payment data.");

                // Fallback log to file
                string errorLogPath = @"C:\Logs\webhook-errors.txt";
                Directory.CreateDirectory(Path.GetDirectoryName(errorLogPath));
                await System.IO.File.AppendAllTextAsync(errorLogPath, $"{DateTime.Now} - DB Error: {dbEx.Message}\n");

                throw; // Rethrow to trigger main handler
            }

            try
            {
                var generator = new PhonepeInvoiceGenerator();
                byte[] pdfBytes = generator.GenerateInvoice(payload);

                if (pdfBytes != null)
                {
                    var insertInvoiceParams = new Dictionary<string, object>
                {
                    { "@PaymentId", payload["orderId"]?.ToString() ?? "" },
                    { "@PdfData", pdfBytes },
                    { "@CreatedAt", DateTime.UtcNow }
                };

                    try
                    {
                        await Task.Run(() =>
                            _dbHandler.ExecuteNonQuery("InsertPhonePeInvoicePdf", insertInvoiceParams, CommandType.StoredProcedure)
                        );
                        _logger.LogInformation("PDF invoice saved to database for Payment ID: {0}", payload["orderId"]);
                    }
                    catch (Exception dbEx)
                    {
                        _logger.LogError(dbEx, "Error saving PDF to DB.");
                        throw new ApplicationException("Failed to save PDF invoice to DB", dbEx);
                    }
                }
                else
                {
                    _logger.LogWarning("PDF generation returned null for Payment ID: {0}", payload["orderId"]);
                }
            }
            catch (Exception pdfEx)
            {
                _logger.LogError(pdfEx, "Error generating PDF for Payment ID: {0}", payload["orderId"]);
                throw new ApplicationException("Failed to generate PDF", pdfEx);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fatal error in ProcessPaymentSuccess.");
            throw; // Rethrow to propagate to caller
        }
    }



}