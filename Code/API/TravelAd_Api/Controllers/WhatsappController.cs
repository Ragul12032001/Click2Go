using DBAccess;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Data;
using TravelAd_Api.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using static TravelAd_Api.Models.WhatsappModel;
using Microsoft.Extensions.Logging;
using log4net;
using System.Net.Http.Headers;
using static TravelAd_Api.Models.AdvertiserAccountModel;

namespace TravelAd_Api.Controllers
{
    [Route("[controller]/api/[action]")]
    [ApiController]
    [EnableCors("AllowSpecificOrigin")]
    public class WhatsappController : Controller
    {

        private readonly IConfiguration _configuration;
        private readonly IDbHandler _dbHandler;
        private readonly ILogger<WhatsappController> _logger;
        //private static readonly ILog Log = LogManager.GetLogger(typeof(AdvertiserAccountController));



        public WhatsappController(IConfiguration configuration, IDbHandler dbHandler, ILogger<WhatsappController> logger)
        {
            _configuration = configuration;
            _dbHandler = dbHandler;
            _logger = logger;
        }

            private string DtToJSON(DataTable table)
        {
            string jsonString = JsonConvert.SerializeObject(table);
            return jsonString;
        }

        private WhatsappAccountDetails GetWhatsappAccountDetails(string emailId)
        {
            string procedure = "GetWhatsappAccountDetails";

            var parameters = new Dictionary<string, object>
    {
        { "@EmailId", emailId }
    };
            DataTable campaignDetailsById = _dbHandler.ExecuteDataTable(procedure, parameters, CommandType.StoredProcedure);

            if (campaignDetailsById.Rows.Count == 0)
            {
                return null;
            }

            return new WhatsappAccountDetails
            {
                WabaId = campaignDetailsById.Rows[0]["wabaId"].ToString(),
                PhoneId = campaignDetailsById.Rows[0]["phoneId"].ToString(),
                AccessToken = campaignDetailsById.Rows[0]["accessToken"].ToString()
            };
        }


        //Webhook connection will be verified here
        [HttpGet]
        public IActionResult Webhook([FromQuery(Name = "hub.mode")] string hub_mode, [FromQuery(Name = "hub.challenge")] int hub_challenge, [FromQuery(Name = "hub.verify_token")] string hub_verify_token)
        {
            string VERIFY_TOKEN = _configuration["WebHookVerifyToken"]; // Replace with your token
            if (hub_mode == "subscribe" && hub_verify_token == VERIFY_TOKEN)
            {
                return Ok(hub_challenge); // Echo back the challenge token
            }
            return Forbid();
        }



        //Webhook events will be received here below
        [HttpPost]
        public IActionResult Webhook([FromBody] JsonElement payload)
        {
            _logger.LogInformation("payload data: " + payload);
            if (payload.TryGetProperty("object", out var objectProperty) &&
                objectProperty.GetString() == "whatsapp_business_account")
            {
                var entry = payload.GetProperty("entry")[0];
                var changes = entry.GetProperty("changes");
                _logger.LogInformation("Processing changes...");
                foreach (var change in changes.EnumerateArray())
                {
                    var field = change.GetProperty("field").GetString();

                    switch (field)
                    {
                        case "messages":
                            HandleMessages(change.GetProperty("value"));
                            break;

                        case "statuses":
                            HandleStatuses(change.GetProperty("value"));
                            break;

                        default:
                            Console.WriteLine($"Unhandled field: {field}");
                            break;
                    }
                }
            }

            return Ok();
        }

        // Handle received messages
        private void HandleMessages(JsonElement value)
        {
            try
            {
                if (value.TryGetProperty("messages", out var messages))
                {
                    foreach (var message in messages.EnumerateArray())
                    {
                        string procedure = "InsertWebhookConversations";

                        var message_id = message.GetProperty("id").GetString();
                        var from = message.GetProperty("from").GetString();
                        var text = message.GetProperty("text").GetProperty("body").GetString();

                        var parameters = new Dictionary<string, object>
                            {
                                { "@messageId", message_id },
                                { "@senderId", from},
                                {"@message", text }
                            };

                        _logger.LogInformation($"Received message from {from}: {text}");

                        int result = _dbHandler.ExecuteNonQuery(procedure, parameters, CommandType.StoredProcedure);

                        if (result > 0)
                        {
                            _logger.LogInformation($"Message received from user and inserted successfully into the database via webhook.");
                        }
                        else
                        {
                            _logger.LogInformation($"Message received from user but insertion into the database failed via webhook.");
                        }

                    }
                }
                if (value.TryGetProperty("statuses", out var statuses))
                {
                    foreach (var status in statuses.EnumerateArray())
                    {
                        string procedure = "InsertAndUpdateWebhookData";
                        var messageId = status.GetProperty("id").GetString();
                        var recipientId = status.GetProperty("recipient_id").GetString();
                        var sts = status.GetProperty("status").GetString();
                        var parameters = new Dictionary<string, object>
                            {
                                { "@mode", "webhook_insert" },
                                { "@message_id", messageId },
                                { "@recipient_id", recipientId},
                            };

                        if (sts == "sent")
                        {
                            var conversationId = status.GetProperty("conversation").GetProperty("id").GetString();
                            parameters.Add("@conversation_id", conversationId);
                            parameters.Add("@status", sts);

                            int result = _dbHandler.ExecuteNonQuery(procedure, parameters, CommandType.StoredProcedure);

                            if (result > 0)
                            {
                                _logger.LogInformation($"message was sent and inserted into the database successfully via webhook.");
                            }
                            else
                            {
                                _logger.LogInformation($"message was sent but insertion into the database failed via webhook.");
                            }
                        }
                        else if (sts == "delivered")
                        {
                            var conversationId = status.GetProperty("conversation").GetProperty("id").GetString();
                            parameters.Add("@conversation_id", conversationId);
                            parameters.Add("@status", sts);

                            int result = _dbHandler.ExecuteNonQuery(procedure, parameters, CommandType.StoredProcedure);

                            if (result > 0)
                            {
                                _logger.LogInformation($"message was successfully delivered to recipient and inserted into the database via webhook.");
                            }
                            else
                            {
                                _logger.LogInformation($"message was successfully delivered but the record was not able insert in the database via webhook.");
                            }
                        }
                        else if (sts == "read")
                        {
                            parameters.Add("@status", sts);

                            int result = _dbHandler.ExecuteNonQuery(procedure, parameters, CommandType.StoredProcedure);

                            if (result > 0)
                            {
                                _logger.LogInformation($"message was successfully read by user and inserted into the datbase via webhook");
                            }
                            else
                            {
                                _logger.LogInformation($"message was successfully read by recipient but insertion into database failed via webhook.");
                            }
                        }
                        else
                        {
                            _logger.LogInformation($"Unknown webhook status found: {status.GetProperty("status").GetString()}");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogInformation($"Error in webhook: {ex}");
            }

        }

        // Handle status updates
        private void HandleStatuses(JsonElement value)
        {
            if (value.TryGetProperty("statuses", out var statuses))
            {
                foreach (var status in statuses.EnumerateArray())
                {
                    var message_id = status.GetProperty("id").GetString();
                    var statusValue = status.GetProperty("status").GetString();
                    var recipient_id = status.GetProperty("recipient_id").GetString();
                    var conversation_id = status.GetProperty("conversation").GetProperty("id").GetString();
                    var campaign_id = "Unknown"; // Modify as per your logic for campaign_id

                    // Log the status update
                    _logger.LogInformation($"Status update for message {message_id}: {statusValue} for recipient {recipient_id} in conversation {conversation_id}");

                    // You can store these values as per your requirements
                    _logger.LogInformation($"Status details - Message ID: {message_id}, Status: {statusValue}, Recipient ID: {recipient_id}, Conversation ID: {conversation_id}, Campaign ID: {campaign_id}");
                }
            }
        }



    }
}



