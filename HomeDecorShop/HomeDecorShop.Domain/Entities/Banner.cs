namespace HomeDecorShop.Domain;

public class Banner
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string Link { get; set; } = string.Empty;
    public int Position { get; set; }
    public bool IsActive { get; set; } = true;
}
