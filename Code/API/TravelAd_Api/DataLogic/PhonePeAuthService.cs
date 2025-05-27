using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;

public class PhonePeAuthService
{
    //private const string MerchantId = "M223ZQK1QQMIZUAT_2503211";   //UAT
    //private const string SaltKey = "YzU0NDI5NDgtOWZiMi00NDI4LWJlODktOTIzOTExMDYwMGZi";  //UAT


    //private const string MerchantId = "SU2503201553220596164615";   //Prduction
    //private const string SaltKey = "26b816ed-32e8-41a7-9aa1-04a3f2f4c314";   //Production

    //private const string ClientVersion = "1";
    //private const string GrantType = "client_credentials";

    //private const string TokenUrl = "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token"; //UAT

    //private const string TokenUrl = "https://api.phonepe.com/apis/identity-manager/v1/oauth/token"; //Production

    private static string _accessToken;
    private static DateTime _tokenExpiry;
    private static readonly HttpClient _client = new HttpClient();
    private static Timer _tokenRefreshTimer;
    private readonly IConfiguration _configuration;
    public PhonePeAuthService(IConfiguration configuration)
    {
        // Set the default headers
        _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        // Start the token refresh process when the service is initialized
        StartTokenRefreshProcess();
        _configuration = configuration;
    }

    public async Task<string> GetAccessTokenAsync()
    {
        // Check if we already have a valid token
        //if (!string.IsNullOrEmpty(_accessToken) && DateTime.UtcNow < _tokenExpiry)
        //{
        //    return _accessToken;
        //}

        try
        {
            // If the token is invalid, fetch a new one
            var token = await FetchNewAccessTokenAsync();
            return token;
        }
        catch (Exception ex)
        {
            throw new Exception($"Error fetching access token: {ex.Message}");
        }
    }

    private async Task<string> FetchNewAccessTokenAsync()
    {
        try
        {
            var formData = new List<KeyValuePair<string, string>>
            {
                new KeyValuePair<string, string>("client_id", $"{_configuration["PhonePeSettings:MerchantId"] }"),
                new KeyValuePair<string, string>("client_secret",  $"{_configuration["PhonePeSettings:SaltKey"] }"),
                new KeyValuePair<string, string>("client_version",  $"{_configuration["PhonePeSettings:ClientVersion"] }"),
                new KeyValuePair<string, string>("grant_type",  $"{_configuration["PhonePeSettings:GrantType"] }")
            };

            var content = new FormUrlEncodedContent(formData);

            // Set the proper content-type header
            content.Headers.ContentType = new MediaTypeHeaderValue("application/x-www-form-urlencoded");

            var response = await _client.PostAsync($"{_configuration["PhonePeSettings:Tokenurl"]}", content);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                var jsonResponse = JsonConvert.DeserializeObject<dynamic>(responseContent);
                if (jsonResponse?.access_token != null && jsonResponse?.expires_at != null)
                {
                    _accessToken = jsonResponse.access_token;
                    _tokenExpiry = DateTime.UtcNow.AddSeconds((int)jsonResponse.expires_at - 60); // Subtract 60 sec buffer
                    return _accessToken;
                }
                else
                {
                    throw new Exception("Failed to get access token: Missing expiration details.");
                }
            }
            else
            {
                throw new Exception($"Failed to get access token: {responseContent}");
            }
        }
        catch (Exception ex)
        {
            throw new Exception($"Error fetching access token: {ex.Message}");
        }
    }

    private void StartTokenRefreshProcess()
    {
        // Refresh the token every 5 minutes (before it expires)
        _tokenRefreshTimer = new Timer(async _ =>
        {
            if (_tokenExpiry < DateTime.UtcNow)
            {
                await FetchNewAccessTokenAsync();
                Console.WriteLine("✅ Token refreshed successfully.");
            }
        }, null, TimeSpan.Zero, TimeSpan.FromMinutes(5)); // Check every 5 minutes
    }
}
