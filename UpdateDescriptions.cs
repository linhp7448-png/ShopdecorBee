
using System;
using System.IO;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using Microsoft.Data.SqlClient;

class Program {
    static void Main() {
        string text = File.ReadAllText(@"c:\Users\Dell\OneDrive\Desktop\TMDT_Nhom6\SanPham.txt");
        var products = text.Split(new[] { "===== SẢN PHẨM" }, StringSplitOptions.RemoveEmptyEntries);
        
        string connStr = "Server=.\\SQLEXPRESS01;Database=HomeDecorDb;Trusted_Connection=True;TrustServerCertificate=True;";
        using (var conn = new SqlConnection(connStr)) {
            conn.Open();
            foreach (var p in products) {
                try {
                    // Match name and parts
                    var match = Regex.Match(p, @"^ \d+: (.*?) =====\s+Mô tả:\s+(.*?)\s+Thông số:\s+(.*?)\s+Chất liệu:\s+(.*?)\s+Phong cách:\s+(.*?)\s+Giá:", RegexOptions.Singleline);
                    if (match.Success) {
                        string name = match.Groups[1].Value.Trim();
                        string description = match.Groups[2].Value.Trim();
                        string specs = match.Groups[3].Value.Trim();
                        string material = match.Groups[4].Value.Trim();
                        string style = match.Groups[5].Value.Trim();
                        
                        string fullDesc = $"{description}\n\n[THÔNG SỐ]\n{specs}\n\n[CHẤT LIỆU]: {material}\n[PHONG CÁCH]: {style}";
                        
                        using (var cmd = new SqlCommand("UPDATE Products SET Description = @desc, Material = @mat, Style = @style WHERE ProductName LIKE @name", conn)) {
                            cmd.Parameters.AddWithValue("@desc", fullDesc);
                            cmd.Parameters.AddWithValue("@mat", material);
                            cmd.Parameters.AddWithValue("@style", style);
                            cmd.Parameters.AddWithValue("@name", "%" + name + "%");
                            int rows = cmd.ExecuteNonQuery();
                            if (rows > 0) Console.WriteLine("Updated: " + name);
                        }
                    }
                } catch (Exception ex) {
                    Console.WriteLine("Error processing product: " + ex.Message);
                }
            }
        }
        Console.WriteLine("Finished updating 100 products.");
    }
}
