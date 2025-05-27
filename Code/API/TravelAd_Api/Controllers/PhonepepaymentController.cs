using Azure.Core;
using DBAccess;
using Inetlab.SMPP;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Data;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using TravelAd_Api.DataLogic;

[ApiController]
[Route("api/payment")]
public class PaymentController : ControllerBase
{
   // private const string PhonePeBaseUrl = "https://api-preprod.phonepe.com/apis/pg-sandbox"; //UAT

    //private const string PhonePeBaseUrl = "https://api.phonepe.com/apis/pg"; //Production
    //private const string PhonePePayEndpoint = "/checkout/v2/pay";
    //private const string PhonePeStatusEndpoint = "/checkout/v2/order";

    //private const string MerchantId = "M223ZQK1QQMIZUAT_2503211";   //UAT
    //private const string SaltKey = "YzU0NDI5NDgtOWZiMi00NDI4LWJlODktOTIzOTExMDYwMGZi";  //UAT


    //private const string MerchantId = "SU2503201553220596164615";   //Prduction
    //private const string SaltKey = "26b816ed-32e8-41a7-9aa1-04a3f2f4c314";   //Production

    private const string SaltIndex = "1";
    private readonly PhonePeSettings _settings;
    private readonly PhonePeAuthService _phonePeAuthService;
    private static readonly HttpClient _httpClient = new HttpClient();
    private readonly IDbHandler _dbHandler;
    private readonly IConfiguration _configuration;
    public PaymentController(IDbHandler dbHandler, IConfiguration configuration)
    {
        _dbHandler = dbHandler;
        _configuration = configuration;
        _phonePeAuthService = new PhonePeAuthService(configuration); // Initialize the service
    }

    /// <summary>
    /// 🔹 Initiates a Payment Request to PhonePe
    /// </summary>
    [HttpPost("initiate")]
    public async Task<IActionResult> InitiatePayment([FromBody] PaymentRequest request)
    {
        try
        {
            if (request.Currency != "INR")
            {
                request.Amount = await ConvertToINR(request.Amount, request.Currency);
            }

            string accessToken = await _phonePeAuthService.GetAccessTokenAsync();
            Console.WriteLine("📌 Access Token: " + accessToken);

            var transactionId = $"MT{DateTime.UtcNow.Ticks}";

            var payload = new
            {
                merchantOrderId = transactionId,
                amount = request.Amount * 100,
                expireAfter = 1200,
                metaInfo = new
                {
                    udf1 = request.Currency,
                    udf2 = request.plan,
                    udf3 = request.Userid,
                    udf4 = request.packagetype
                },
                paymentFlow = new
                {
                    type = "PG_CHECKOUT",
                    message = "Payment message used for collect requests",
                    merchantUrls = new
                    {
                        redirectUrl = request.RedirectUrl
                    }
                }
            };

            var content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json");
            using var client = new HttpClient();
            client.DefaultRequestHeaders.Add("Authorization", $"O-Bearer {accessToken}");

            string apiUrl = $"{_configuration["PhonePeSettings:BaseUrl"]}{_configuration["PhonePeSettings:Endpoint"]}";
            Console.WriteLine("📡 Hitting API: " + apiUrl);

            var response = await client.PostAsync(apiUrl, content);
            var responseData = await response.Content.ReadAsStringAsync();

            Console.WriteLine("📥 Response: " + responseData);

            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, new { success = false, message = "PhonePe call failed", details = responseData });
            }

            var jsonObject = JObject.Parse(responseData);

            var accesToken = await _phonePeAuthService.GetAccessTokenAsync();

            return Ok(new
            {
                OrderId = jsonObject["orderId"]?.ToString(),
                RedirectUrl = jsonObject["redirectUrl"]?.ToString(),
                AccessToken = accesToken,
                TransactionId = transactionId
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine("❌ Exception: " + ex.ToString());
            return StatusCode(500, new { success = false, message = "Internal error", error = ex.Message });
        }
    }

    /// <summary>
    /// 🔹 Converts Foreign Currencies to INR
    /// </summary>
    private async Task<int> ConvertToINR(int amount, string currency)
    {
        using var client = new HttpClient();
        var response = await client.GetStringAsync($"https://api.exchangerate-api.com/v4/latest/{currency}");
        var exchangeRates = JsonConvert.DeserializeObject<dynamic>(response);

        if (exchangeRates == null || exchangeRates.rates == null || exchangeRates.rates.INR == null)
        {
            throw new Exception("Exchange rate fetch failed");
        }

        decimal rate = exchangeRates.rates.INR;
        return (int)(amount * rate);
    }




    [HttpPost("status/{merchantOrderId}")]
    public async Task<IActionResult> GetPaymentStatus(string merchantOrderId)
    {
        if (string.IsNullOrEmpty(merchantOrderId))
        {
            return BadRequest(new { message = "MerchantTransactionId is required" });
        }

        string apiEndpoint = $"{_configuration["PhonePeSettings:StatusEndpoint"]}/{merchantOrderId}/status";
        using var client = new HttpClient();
        client.DefaultRequestHeaders.Add("Authorization", $"O-Bearer {await _phonePeAuthService.GetAccessTokenAsync()}");

        var response = await client.GetAsync($"{_configuration["PhonePeSettings:BaseUrl"]}{apiEndpoint}");

        if (response.StatusCode == HttpStatusCode.NoContent)
        {
            return Ok(new { success = false, status = "No content returned from PhonePe" });
        }

        var responseData = await response.Content.ReadAsStringAsync();
        if (string.IsNullOrWhiteSpace(responseData))
        {
            return Ok(new { success = false, status = "Empty response from PhonePe" });
        }

        var jsonResponse = JsonConvert.DeserializeObject<dynamic>(responseData);
        if (jsonResponse != null && jsonResponse.success == true)
        {
            return Ok(new { success = true, status = jsonResponse.data.state });
        }

        JObject payload = JObject.Parse(responseData);

        if(payload["state"]?.ToString() == "COMPLETED")
        ProcessPaymentSuccess(payload);


        return Ok(responseData);
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


            await Task.Run(() =>
                _dbHandler.ExecuteNonQuery(procedureName, parameters, CommandType.StoredProcedure)
            );


        }
        catch (Exception ex)
        {
            throw; // Rethrow to propagate to caller
        }
    }

    // 📌 DTO Classes
    public class PaymentRequest
    {
        public int Amount { get; set; }
        public string plan { get; set; }
        public string Currency { get; set; }
        public string RedirectUrl { get; set; }
        public int Userid { get; set; }

        public string packagetype { get; set; }
    }
    public class PaymentStatusRequest
    {
        public string MerchantOrderId { get; set; }
    }


}