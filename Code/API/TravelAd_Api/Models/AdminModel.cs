using System.Text.Json.Serialization;

namespace TravelAd_Api.Models
{
    public class AdminModel
    {
        public class UpdateCampaign
        {
            public int campaignId { get; set; }
            public string status { get; set; }
            //public int serverId { get; set; }
            public string campaignname { get; set; }
         //   public int connectionId { get; set; }
        }

        public class UpdateShortCodeMapper
        {
            public int workspaceId { get; set; }
            public string data { get; set; }
        }
        public class AdvertiserChannelRequest
        {
            public int WorkspaceId { get; set; }
            public List<string> Channels { get; set; }
        }


        public class MarkNotificationsReadRequest
        {
            public int WorkspaceId { get; set; }
        }

      

        public class CampaignResult
        {
            public int CampaignId { get; set; }
            public string CampaignName { get; set; }
        }
        public class CampaignRequest
        {
            public int CampaignId { get; set; }
            public DateTime StartDate { get; set; }
            public DateTime EndDate { get; set; }
        }



    }
}
