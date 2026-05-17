namespace HomeDecorShop.Domain;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int GroupId { get; set; }

    public CategoryGroup GroupNavigation { get; set; } = null!;
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
