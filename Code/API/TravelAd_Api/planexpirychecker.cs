using DBAccess;

namespace TravelAd_Api
{
    public class planexpirychecker
    {

        private readonly IDbHandler _dbHandler;

        public planexpirychecker(IDbHandler dbHandler)
        {
            _dbHandler = dbHandler;
        }

        public async Task ProcesswalletAsync()
        {
            Console.WriteLine("Checking plan expiry.");


            var dt = _dbHandler.ExecuteDataTable("EXEC ProcessUserWallets");
            var dt1 = _dbHandler.ExecuteDataTable("EXEC Checkexpirywallets");
            if (dt.Rows.Count > 0)
            {
                Console.WriteLine("Wallet expiry amount processed");
            }
            if (dt1.Rows.Count > 0)
            {
                Console.WriteLine("Notification sended successfully");
            }
        }
    }
}
