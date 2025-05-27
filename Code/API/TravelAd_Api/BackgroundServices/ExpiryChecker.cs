using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace TravelAd_Api.BackgroundServices
{
    public class ExpiryChecker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public ExpiryChecker(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var now = DateTime.Now;
                var todayAt1159 = DateTime.Today.AddHours(23).AddMinutes(59);

                // If it's already past 11:59 PM, run tomorrow
                if (now > todayAt1159)
                {
                    todayAt1159 = todayAt1159.AddDays(1);
                }

                var waitTime = todayAt1159 - now;
                Console.WriteLine($"⏳ Waiting {waitTime.TotalMinutes:N0} minutes until 11:59 PM...");

                try
                {
                    await Task.Delay(waitTime, stoppingToken);

                    using (var scope = _scopeFactory.CreateScope())
                    {
                        var planExpiryChecker = scope.ServiceProvider.GetRequiredService<planexpirychecker>();
                        Console.WriteLine("🔄 Running plan expiry checker...");
                        await planExpiryChecker.ProcesswalletAsync();
                        Console.WriteLine("✅ Wallet check completed.");
                    }
                }
                catch (TaskCanceledException)
                {
                    // Graceful shutdown
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Error: {ex.Message}");
                }

                // Repeat every 24 hours after the initial execution
                await Task.Delay(TimeSpan.FromDays(1), stoppingToken);
            }
        }

    }
}
