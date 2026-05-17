namespace HomeDecorShop.Domain;

public class BlogPost
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public int Views { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
