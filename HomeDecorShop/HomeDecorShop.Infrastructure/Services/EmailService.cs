using HomeDecorShop.Application;
using System.IO;

namespace HomeDecorShop.Infrastructure;

public sealed class EmailService : IEmailService
{
    public void SendEmail(string to, string subject, string body)
    {
        var desktopPath = @"C:\Users\Mr VU\Desktop\TMDT_Nhom6\verification_link.txt";
        
        var message = $@"----------------------------------------
To: {to}
Subject: {subject}
Date: {DateTime.Now}
----------------------------------------
{body}
----------------------------------------
";
        try
        {
            File.AppendAllText(desktopPath, message);
            Console.WriteLine($"[EMAIL SENT TO {to}] - Verification details saved to {desktopPath}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EMAIL ERROR] Failed to save verification file: {ex.Message}");
        }
    }
}
