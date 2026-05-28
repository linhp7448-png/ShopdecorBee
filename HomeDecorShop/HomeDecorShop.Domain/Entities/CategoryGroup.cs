namespace HomeDecorShop.Domain;

public class CategoryGroup
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int DisplayOrder { get; set; }

    public ICollection<Category> Categories { get; set; } = new List<Category>();
}
