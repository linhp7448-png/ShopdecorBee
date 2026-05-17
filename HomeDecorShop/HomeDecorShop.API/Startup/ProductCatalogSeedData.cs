using System.Globalization;
using System.Text;

namespace HomeDecorShop.API;

internal static class ProductCatalogSeedData
{
    internal sealed record SeedProductDefinition(
        string Name,
        string Category,
        decimal Price,
        decimal? OldPrice,
        string Image,
        string HoverImage,
        string Material,
        string Style,
        string Color,
        string Description,
        string Brand,
        string? Tag,
        int StockLeft,
        double Rating,
        int Reviews);

    public static IReadOnlyList<SeedProductDefinition> BuildCatalog()
    {
        var catalog = new List<SeedProductDefinition>(128);

        catalog.AddRange(BuildGroup(
            category: "Ly gốm / cốc decor",
            names: CupNames,
            imagePool: CupImages,
            basePrice: 69000m,
            priceStep: 12000m,
            material: "Gốm sứ",
            style: "Tối giản / Decor",
            color: "Be / Kem / Trung tính",
            usage: "Phù hợp decor bàn trà, bàn ăn và chụp ảnh sản phẩm."));

        catalog.AddRange(BuildGroup(
            category: "Khăn bàn nhiều chất liệu",
            names: TableclothNames,
            imagePool: TableclothImages,
            basePrice: 129000m,
            priceStep: 18000m,
            material: "Linen / Cotton / Canvas",
            style: "Decor bàn ăn",
            color: "Kem / Be / Họa tiết nhẹ",
            usage: "Phù hợp decor bàn ăn, bàn trà, picnic và nền chụp sản phẩm."));

        catalog.AddRange(BuildGroup(
            category: "Tấm lót bàn / lót ly",
            names: CoasterNames,
            imagePool: CoasterImages,
            basePrice: 49000m,
            priceStep: 15000m,
            material: "Gỗ / Gốm / Mây tre / Cork",
            style: "Bàn ăn / Bắc Âu",
            color: "Gỗ / Be / Tự nhiên",
            usage: "Dùng lót ly, lót nồi, lót bàn ăn và làm điểm nhấn decor."));

        catalog.AddRange(BuildGroup(
            category: "Bình hoa / lọ hoa decor",
            names: VaseNames,
            imagePool: VaseImages,
            basePrice: 89000m,
            priceStep: 20000m,
            material: "Gốm / Thủy tinh",
            style: "Minimal / Bắc Âu",
            color: "Kem / Be / Trắng sữa",
            usage: "Phù hợp cắm hoa, decor kệ sách, bàn trà và góc làm việc."));

        catalog.AddRange(BuildGroup(
            category: "Nến thơm / phụ kiện nến",
            names: CandleNames,
            imagePool: CandleImages,
            basePrice: 79000m,
            priceStep: 22000m,
            material: "Sáp thơm / Gốm / Thủy tinh",
            style: "Thư giãn / Decor",
            color: "Kem / Trắng / Ấm",
            usage: "Phù hợp decor phòng ngủ, bàn trà và các set quà tặng."));

        catalog.AddRange(BuildGroup(
            category: "Khay decor / khay đựng đồ",
            names: TrayNames,
            imagePool: TrayImages,
            basePrice: 99000m,
            priceStep: 25000m,
            material: "Gỗ / Mây tre / Gốm / Kim loại",
            style: "Decor bàn trà",
            color: "Nâu gỗ / Be / Vàng nhạt",
            usage: "Dùng bày nến, nước hoa, trang sức, chìa khóa và vật dụng nhỏ."));

        catalog.AddRange(BuildGroup(
            category: "Gối tựa / vỏ gối decor",
            names: PillowNames,
            imagePool: PillowImages,
            basePrice: 139000m,
            priceStep: 22000m,
            material: "Cotton / Linen / Nhung",
            style: "Cozy / Boho",
            color: "Be / Nâu / Trung tính",
            usage: "Phù hợp sofa, homestay, phòng ngủ và góc chụp lifestyle."));

        catalog.AddRange(BuildGroup(
            category: "Rèm / vải decor",
            names: CurtainNames,
            imagePool: CurtainImages,
            basePrice: 169000m,
            priceStep: 28000m,
            material: "Linen / Voan / Cotton",
            style: "Nhẹ nhàng / Vintage",
            color: "Kem / Trắng / Pastel",
            usage: "Phù hợp decor cửa sổ, nền chụp ảnh và không gian sống tối giản."));

        catalog.AddRange(BuildGroup(
            category: "Giỏ / đồ mây tre decor",
            names: BasketNames,
            imagePool: BasketImages,
            basePrice: 89000m,
            priceStep: 18000m,
            material: "Mây tre / Cói",
            style: "Tự nhiên / Rustic",
            color: "Nâu mây / Tự nhiên",
            usage: "Phù hợp đựng đồ, decor bàn ăn, kệ sách và không gian mộc."));

        catalog.AddRange(BuildGroup(
            category: "Đèn decor",
            names: LampNames,
            imagePool: LampImages,
            basePrice: 119000m,
            priceStep: 35000m,
            material: "LED / Gỗ / Gốm / Mây tre",
            style: "Ánh sáng vàng ấm",
            color: "Vàng ấm / Gỗ / Trung tính",
            usage: "Phù hợp decor phòng ngủ, phòng khách, kệ sách và góc chụp sản phẩm."));

        catalog.AddRange(BuildGroup(
            category: "Gương / tranh / đồ treo tường",
            names: WallDecorNames,
            imagePool: WallDecorImages,
            basePrice: 129000m,
            priceStep: 30000m,
            material: "Canvas / Kính / Gỗ",
            style: "Tường decor",
            color: "Trung tính / Gỗ / Vintage",
            usage: "Phù hợp decor tường, bàn làm việc, phòng ngủ và phòng khách."));

        catalog.AddRange(BuildGroup(
            category: "Phụ kiện bàn ăn / bếp decor",
            names: DiningNames,
            imagePool: DiningImages,
            basePrice: 45000m,
            priceStep: 18000m,
            material: "Gốm / Gỗ / Thủy tinh / Vải",
            style: "Bàn ăn tối giản",
            color: "Trắng / Gỗ / Trung tính",
            usage: "Phù hợp bàn ăn, bếp decor và chụp ảnh món ăn."));

        return catalog;
    }

    public static string CreateSku(int sequence) => $"BEE-{sequence:000}";

    public static string CreateSlug(string name, int sequence) => $"{Slugify(name)}-{sequence:000}";

    private static IEnumerable<SeedProductDefinition> BuildGroup(
        string category,
        string[] names,
        string[] imagePool,
        decimal basePrice,
        decimal priceStep,
        string material,
        string style,
        string color,
        string usage)
    {
        for (var index = 0; index < names.Length; index++)
        {
            var image = imagePool[index % imagePool.Length];
            var hoverImage = imagePool[(index + 1) % imagePool.Length];
            var price = basePrice + (index % 4) * priceStep;
            var oldPrice = price + Math.Max(priceStep, 15000m);

            yield return new SeedProductDefinition(
                Name: names[index],
                Category: category,
                Price: price,
                OldPrice: oldPrice,
                Image: image,
                HoverImage: hoverImage,
                Material: material,
                Style: style,
                Color: color,
                Description: $"{names[index]}. {usage}",
                Brand: "BeeShop",
                Tag: index % 5 == 0 ? "TRENDING" : "NEW",
                StockLeft: 24 + (index % 6) * 7,
                Rating: 4.6 + (index % 4) * 0.1,
                Reviews: 8 + index * 2);
        }
    }

    private static string Slugify(string value)
    {
        var normalized = value
            .Replace('Đ', 'D')
            .Replace('đ', 'd')
            .Normalize(NormalizationForm.FormD);

        var builder = new StringBuilder();
        var previousDash = false;

        foreach (var character in normalized)
        {
            var category = CharUnicodeInfo.GetUnicodeCategory(character);
            if (category == UnicodeCategory.NonSpacingMark)
            {
                continue;
            }

            if (char.IsLetterOrDigit(character))
            {
                builder.Append(char.ToLowerInvariant(character));
                previousDash = false;
                continue;
            }

            if (previousDash)
            {
                continue;
            }

            builder.Append('-');
            previousDash = true;
        }

        return builder.ToString().Trim('-');
    }

    private static string[] SplitLines(string raw) =>
        raw.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    private static string Asset(string fileName) => $"assets/images/{fileName}";

    private static readonly string[] CupImages =
    [
        Asset("coc-gom-vintage-battrang.jpg"),
        Asset("ly-minimal.jpg"),
        Asset("ly-tay-cam.jpg"),
        Asset("ly-gom-be.jpg"),
        Asset("ly-hoa-tiet.jpg"),
        Asset("ly-trang.jpg")
    ];

    private static readonly string[] TableclothImages =
    [
        Asset("khan-linen.jpg"),
        Asset("khan-caro.jpg"),
        Asset("khan-hoa.jpg"),
        Asset("khan-trang.jpg"),
        Asset("khan-xam.jpg"),
        Asset("table-runner.jpg")
    ];

    private static readonly string[] CoasterImages =
    [
        Asset("khay-go.jpg"),
        Asset("khay-nho.jpg"),
        Asset("khan-linen.jpg"),
        Asset("table-runner.jpg")
    ];

    private static readonly string[] VaseImages =
    [
        Asset("lo-gom-nham.jpg"),
        Asset("lo-hoa-thuy-tinh.jpg"),
        Asset("lo-hoa-tron.jpg"),
        Asset("lo-mau.jpg"),
        Asset("lo-men-trang.jpg")
    ];

    private static readonly string[] CandleImages =
    [
        Asset("nen-chanh-sa.jpg"),
        Asset("nen-dau.jpg"),
        Asset("nen-lo.jpg"),
        Asset("nen-matcha.jpg"),
        Asset("nen-nhai.jpg"),
        Asset("nen-thom-lavender-relax.jpg"),
        Asset("nen-vanilla.jpg")
    ];

    private static readonly string[] TrayImages =
    [
        Asset("khay-go.jpg"),
        Asset("khay-nho.jpg"),
        Asset("hop-go.jpg"),
        Asset("hop-dung.jpg")
    ];

    private static readonly string[] PillowImages =
    [
        Asset("tham-long.jpg"),
        Asset("tham-mini.jpg"),
        Asset("tham-tron.jpg"),
        Asset("khan-xam.jpg"),
        Asset("khan-linen.jpg")
    ];

    private static readonly string[] CurtainImages =
    [
        Asset("khan-trang.jpg"),
        Asset("khan-linen.jpg"),
        Asset("khan-hoa.jpg"),
        Asset("khan-caro.jpg"),
        Asset("table-runner.jpg")
    ];

    private static readonly string[] BasketImages =
    [
        Asset("gio-cay.jpg"),
        Asset("gio-dung-do.jpg"),
        Asset("gio-lon.jpg"),
        Asset("gio-may.jpg"),
        Asset("gio-mini.jpg"),
        Asset("gio-vuong.jpg")
    ];

    private static readonly string[] LampImages =
    [
        Asset("den-ban.jpg"),
        Asset("den-ban-mini.jpg"),
        Asset("den-cau.jpg"),
        Asset("den-day.jpg"),
        Asset("den-go.jpg"),
        Asset("den-kep.jpg"),
        Asset("den-led-trang-tri.jpg"),
        Asset("den-may.jpg"),
        Asset("den-mini.jpg"),
        Asset("den-neon-chu.jpg"),
        Asset("den-ngu-led.jpg"),
        Asset("den-tron.jpg")
    ];

    private static readonly string[] WallDecorImages =
    [
        Asset("guong-bo-vien.jpg"),
        Asset("guong-tron.jpg"),
        Asset("tranh-abstract.jpg"),
        Asset("tranh-canvas-minimal.jpg"),
        Asset("tranh-cua.jpg"),
        Asset("tranh-hoa-la.jpg"),
        Asset("tranh-lineart.jpg"),
        Asset("tranh-phong-canh.jpg"),
        Asset("tranh-phong-ngu.jpg"),
        Asset("tranh-typo.jpg"),
        Asset("khung-anh-day.jpg"),
        Asset("khung-anh-go.jpg"),
        Asset("khung-mini.jpg"),
        Asset("ke-go-treo.jpg")
    ];

    private static readonly string[] DiningImages =
    [
        Asset("dia-gom.jpg"),
        Asset("bat-men.jpg"),
        Asset("bat-nho.jpg"),
        Asset("bat-lon.jpg"),
        Asset("chen-bat-trang.jpg"),
        Asset("ly-trang.jpg"),
        Asset("ly-minimal.jpg"),
        Asset("khan-trang.jpg"),
        Asset("hop-go.jpg")
    ];

    private static readonly string[] CupNames = SplitLines("""
        Ly gốm men bóng tối giản
        Ly gốm men nhám phong cách Hàn
        Ly gốm quai vuông decor bàn trà
        Ly gốm dáng trụ màu trung tính
        Ly gốm retro họa tiết hoa nhí
        Ly gốm handmade viền nâu
        Cốc gốm dung tích lớn dùng cà phê/sữa
        Ly gốm kèm đĩa lót
        Bộ ly gốm 2 chiếc tông be kem
        Ly gốm vẽ tay phong cách vintage
        Cốc gốm có nắp
        Ly gốm decor chụp ảnh sản phẩm
        """);

    private static readonly string[] TableclothNames = SplitLines("""
        Khăn bàn linen trơn phong cách tối giản
        Khăn bàn cotton dệt gân
        Khăn bàn canvas dày chống nhăn nhẹ
        Khăn bàn ren vintage
        Khăn bàn bố mộc decor quán cà phê
        Khăn bàn caro phong cách Hàn Quốc
        Khăn bàn họa tiết hoa nhí
        Khăn trải bàn chống thấm nhẹ
        Khăn bàn tua rua decor picnic/chụp ảnh
        Khăn bàn nhung mềm sang trọng
        Khăn bàn polyester dễ giặt
        Khăn bàn phối viền bèo nữ tính
        """);

    private static readonly string[] CoasterNames = SplitLines("""
        Lót ly gỗ decor
        Lót ly gốm chống nóng
        Lót ly mây tre đan
        Lót ly vải linen
        Lót ly cork tối giản
        Set lót ly 4 món phong cách Bắc Âu
        Tấm lót bàn ăn chống bám bẩn
        Tấm lót bàn giả da decor hiện đại
        Lót nồi bằng mây tre thủ công
        Miếng lót cốc hình hoa/hình mây
        """);

    private static readonly string[] VaseNames = SplitLines("""
        Bình hoa gốm nhám dáng tối giản
        Lọ hoa gốm cổ cao
        Bình hoa thủy tinh trong suốt
        Lọ hoa thủy tinh gân sọc
        Bình hoa mini để bàn
        Bình hoa dáng tròn phong cách Bắc Âu
        Lọ hoa gốm men rạn vintage
        Bình hoa bất đối xứng decor nghệ thuật
        Set 2 lọ hoa decor kệ sách
        Bình hoa màu kem/be/trắng sữa
        """);

    private static readonly string[] CandleNames = SplitLines("""
        Nến thơm hũ gốm
        Nến thơm hũ thủy tinh nắp gỗ
        Nến thơm decor phòng ngủ
        Nến tealight set nhiều viên
        Chân nến gốm tối giản
        Chân nến kim loại vintage
        Khay đựng nến decor
        Dụng cụ dập nến cao cấp
        Bộ quà tặng nến thơm decor
        Sáp thơm trang trí tủ quần áo
        """);

    private static readonly string[] TrayNames = SplitLines("""
        Khay gỗ decor bàn trà
        Khay mây tre đan
        Khay gốm đựng trang sức
        Khay kim loại viền vàng
        Khay đá resin decor
        Khay oval tối giản
        Khay chữ nhật decor chụp ảnh sản phẩm
        Khay đựng nến và nước hoa
        Khay mini để chìa khóa
        Khay decor bathroom
        """);

    private static readonly string[] PillowNames = SplitLines("""
        Vỏ gối linen màu trơn
        Vỏ gối cotton họa tiết tối giản
        Gối tựa lưng decor sofa
        Vỏ gối nhung sang trọng
        Gối decor họa tiết thêu
        Gối tua rua phong cách boho
        Gối caro vintage
        Gối tròn decor ghế sofa
        Set vỏ gối 2 chiếc tông be nâu
        Gối mềm chụp ảnh decor homestay
        """);

    private static readonly string[] CurtainNames = SplitLines("""
        Rèm linen lọc sáng
        Rèm voan trắng decor cửa sổ
        Rèm cotton màu kem
        Rèm ngắn decor bếp
        Vải phủ kệ phong cách vintage
        Vải decor nền chụp ảnh sản phẩm
        Rèm tua rua phong cách boho
        Rèm cửa pastel nhẹ nhàng
        """);

    private static readonly string[] BasketNames = SplitLines("""
        Giỏ mây đựng đồ decor
        Giỏ cói đựng khăn/tạp chí
        Rổ mây decor bàn ăn
        Khay mây tròn chụp ảnh sản phẩm
        Giỏ treo tường decor
        Hộp mây đựng vật dụng nhỏ
        Tấm lót nồi mây tre
        Chụp đèn mây decor
        """);

    private static readonly string[] LampNames = SplitLines("""
        Đèn ngủ để bàn ánh sáng vàng
        Đèn gốm chụp vải
        Đèn mây tre decor phòng khách
        Đèn LED dây trang trí
        Đèn bàn phong cách vintage
        Đèn ngủ mini decor kệ
        Đèn nến điện tử
        Đèn decor chụp ảnh sản phẩm
        """);

    private static readonly string[] WallDecorNames = SplitLines("""
        Gương decor viền gỗ
        Gương mây treo tường
        Tranh canvas tối giản
        Tranh quote decor phòng
        Tranh hoa lá tông vintage
        Bộ tranh treo tường 3 tấm
        Khung ảnh gỗ để bàn
        Khung ảnh decor phong cách Hàn
        Kệ treo tường mini decor
        Móc treo tường gỗ tối giản
        """);

    private static readonly string[] DiningNames = SplitLines("""
        Đĩa gốm decor chụp ảnh món ăn
        Bát gốm men nhám
        Muỗng gỗ decor
        Bộ dao nĩa phong cách tối giản
        Hũ đựng gia vị bằng gốm
        Hũ thủy tinh nắp gỗ
        Bình nước thủy tinh decor
        Khăn ăn vải linen
        Vòng gài khăn ăn decor
        Tạp dề cotton phong cách Hàn
        """);
}
