using Microsoft.Data.SqlClient;
using System;

try {
    string connString = "Server=.\\SQLEXPRESS01;Database=HomeDecorDb;Trusted_Connection=True;TrustServerCertificate=True;Connect Timeout=60;";
    using (SqlConnection conn = new SqlConnection(connString)) {
        conn.Open();
        Console.WriteLine("Connection successful!");
        using (SqlCommand cmd = new SqlCommand("SELECT name FROM sys.databases WHERE name = 'HomeDecorDb'", conn)) {
            var name = cmd.ExecuteScalar();
            Console.WriteLine($"Database check: {name}");
        }
    }
} catch (Exception ex) {
    Console.WriteLine($"Error: {ex.Message}");
}
