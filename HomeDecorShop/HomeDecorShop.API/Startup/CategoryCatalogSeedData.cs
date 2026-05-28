namespace HomeDecorShop.API;

internal static class CategoryCatalogSeedData
{
    internal sealed record SeedCategoryGroupDefinition(
        string Name,
        string Slug,
        int DisplayOrder,
        bool IsActive = true);

    internal sealed record SeedCategoryDefinition(
        string Name,
        string Slug,
        string GroupSlug,
        bool IsActive = true);

    public static IReadOnlyList<SeedCategoryGroupDefinition> BuildGroups() =>
    [
        new("Bàn ăn & Bếp", "ban-an-bep", 1),
        new("Trang trí & Sắp đặt", "trang-tri-sap-dat", 2),
        new("Vải & Phụ kiện mềm", "vai-phu-kien-mem", 3),
        new("Ánh sáng & Hương thơm", "anh-sang-huong-thom", 4)
    ];

    public static IReadOnlyList<SeedCategoryDefinition> BuildCatalog() =>
    [
        new("Ly gốm / cốc decor", "ly-gom-coc-decor", "ban-an-bep"),
        new("Khăn bàn nhiều chất liệu", "khan-ban-nhieu-chat-lieu", "ban-an-bep"),
        new("Tấm lót bàn / lót ly", "tam-lot-ban-lot-ly", "ban-an-bep"),
        new("Bình hoa / lọ hoa decor", "binh-hoa-lo-hoa-decor", "trang-tri-sap-dat"),
        new("Nến thơm / phụ kiện nến", "nen-thom-phu-kien-nen", "anh-sang-huong-thom"),
        new("Khay decor / khay đựng đồ", "khay-decor-khay-dung-do", "trang-tri-sap-dat"),
        new("Gối tựa / vỏ gối decor", "goi-tua-vo-goi-decor", "vai-phu-kien-mem"),
        new("Rèm / vải decor", "rem-vai-decor", "vai-phu-kien-mem"),
        new("Giỏ / đồ mây tre decor", "gio-do-may-tre-decor", "trang-tri-sap-dat"),
        new("Đèn decor", "den-decor", "anh-sang-huong-thom"),
        new("Gương / tranh / đồ treo tường", "guong-tranh-do-treo-tuong", "trang-tri-sap-dat"),
        new("Phụ kiện bàn ăn / bếp decor", "phu-kien-ban-an-bep-decor", "ban-an-bep")
    ];
}
