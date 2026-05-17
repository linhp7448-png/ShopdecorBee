Build started...
Build succeeded.
IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260320080048_InitialAuth'
)
BEGIN
    CREATE TABLE [Users] (
        [Id] int NOT NULL IDENTITY,
        [Email] nvarchar(450) NOT NULL,
        [FullName] nvarchar(max) NOT NULL,
        [Phone] nvarchar(max) NOT NULL,
        [Role] int NOT NULL,
        [PasswordHash] nvarchar(max) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CurrentToken] nvarchar(max) NULL,
        CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260320080048_InitialAuth'
)
BEGIN
    CREATE TABLE [Addresses] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [FullName] nvarchar(max) NOT NULL,
        [Phone] nvarchar(max) NOT NULL,
        [Line1] nvarchar(max) NOT NULL,
        [Ward] nvarchar(max) NOT NULL,
        [District] nvarchar(max) NOT NULL,
        [City] nvarchar(max) NOT NULL,
        [IsDefault] bit NOT NULL,
        CONSTRAINT [PK_Addresses] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Addresses_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260320080048_InitialAuth'
)
BEGIN
    CREATE INDEX [IX_Addresses_UserId] ON [Addresses] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260320080048_InitialAuth'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Users_Email] ON [Users] ([Email]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260320080048_InitialAuth'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260320080048_InitialAuth', N'9.0.0');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260324125007_AddProductAndCategorySeed'
)
BEGIN
    CREATE TABLE [Categories] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(max) NOT NULL,
        [Slug] nvarchar(max) NOT NULL,
        [IsActive] bit NOT NULL,
        CONSTRAINT [PK_Categories] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260324125007_AddProductAndCategorySeed'
)
BEGIN
    CREATE TABLE [Products] (
        [Id] int NOT NULL IDENTITY,
        [Sku] nvarchar(max) NOT NULL,
        [Name] nvarchar(max) NOT NULL,
        [Slug] nvarchar(max) NOT NULL,
        [Price] decimal(18,2) NOT NULL,
        [OriginalPrice] decimal(18,2) NULL,
        [CategoryId] int NOT NULL,
        [Category] nvarchar(max) NOT NULL,
        [Image] nvarchar(max) NOT NULL,
        [HoverImage] nvarchar(max) NOT NULL,
        [VideoUrl] nvarchar(max) NULL,
        [Tag] nvarchar(max) NULL,
        [SoldPercentage] int NULL,
        [StockLeft] int NOT NULL,
        [Rating] float NOT NULL,
        [Reviews] int NOT NULL,
        [Brand] nvarchar(max) NOT NULL,
        [Color] nvarchar(max) NOT NULL,
        [Material] nvarchar(max) NOT NULL,
        [Style] nvarchar(max) NOT NULL,
        [InStock] bit NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Products] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Products_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Categories] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260324125007_AddProductAndCategorySeed'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'IsActive', N'Name', N'Slug') AND [object_id] = OBJECT_ID(N'[Categories]'))
        SET IDENTITY_INSERT [Categories] ON;
    EXEC(N'INSERT INTO [Categories] ([Id], [IsActive], [Name], [Slug])
    VALUES (1, CAST(1 AS bit), N''Phß╗Ñ kiß╗çn b├án'', N''phu-kien-ban''),
    (2, CAST(1 AS bit), N''Lighting'', N''lighting''),
    (3, CAST(1 AS bit), N''Decor'', N''decor''),
    (4, CAST(1 AS bit), N''Furniture'', N''furniture''),
    (5, CAST(1 AS bit), N''Textile'', N''textile''),
    (6, CAST(1 AS bit), N''Kitchen'', N''kitchen'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'IsActive', N'Name', N'Slug') AND [object_id] = OBJECT_ID(N'[Categories]'))
        SET IDENTITY_INSERT [Categories] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260324125007_AddProductAndCategorySeed'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Brand', N'Category', N'CategoryId', N'Color', N'CreatedAt', N'HoverImage', N'Image', N'InStock', N'IsActive', N'Material', N'Name', N'OriginalPrice', N'Price', N'Rating', N'Reviews', N'Sku', N'Slug', N'SoldPercentage', N'StockLeft', N'Style', N'Tag', N'VideoUrl') AND [object_id] = OBJECT_ID(N'[Products]'))
        SET IDENTITY_INSERT [Products] ON;
    EXEC(N'INSERT INTO [Products] ([Id], [Brand], [Category], [CategoryId], [Color], [CreatedAt], [HoverImage], [Image], [InStock], [IsActive], [Material], [Name], [OriginalPrice], [Price], [Rating], [Reviews], [Sku], [Slug], [SoldPercentage], [StockLeft], [Style], [Tag], [VideoUrl])
    VALUES (101, N''BeeShop'', N''Phß╗Ñ kiß╗çn b├án'', 1, N''#8B4513'', ''2026-03-13T00:00:00.0000000Z'', N''https://picsum.photos/id/102/400/500'', N''https://picsum.photos/id/101/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Gß╗ù'', N''Khay Cß║»m B├║t Gß╗ù Sß╗ôi'', 180000.0, 150000.0, 4.7999999999999998E0, 45, N''BEE-101'', N''khay-cam-but-go-soi'', NULL, 0, N''Minimalist'', N''NEW'', NULL),
    (102, N''BeeShop'', N''Lighting'', 2, N''#333333'', ''2026-03-13T00:00:00.0000000Z'', N''https://picsum.photos/id/104/400/500'', N''https://picsum.photos/id/103/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Kim loß║íi'', N''─É├¿n B├án Pixar'', NULL, 350000.0, 4.9000000000000004E0, 120, N''BEE-102'', N''den-ban-pixar'', NULL, 0, N''Hiß╗çn ─æß║íi'', N''-20%'', NULL),
    (103, N''BeeShop'', N''Phß╗Ñ kiß╗çn b├án'', 1, N''#D2B48C'', ''2026-03-13T00:00:00.0000000Z'', N''https://picsum.photos/id/107/400/500'', N''https://picsum.photos/id/106/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Vß║úi'', N''Bß║úng Ghim Ghi Ch├║'', NULL, 120000.0, 4.5E0, 30, N''BEE-103'', N''bang-ghim-ghi-chu'', NULL, 0, N''Vintage'', NULL, NULL),
    (104, N''BeeShop'', N''Decor'', 3, N''#4CAF50'', ''2026-03-13T00:00:00.0000000Z'', N''https://picsum.photos/id/113/400/500'', N''https://picsum.photos/id/112/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Gß╗æm sß╗⌐'', N''Chß║¡u C├óy Mini ─Éß╗â B├án'', NULL, 85000.0, 5.0E0, 210, N''BEE-104'', N''chau-cay-mini-de-ban'', NULL, 0, N''Dß╗à th╞░╞íng'', N''Best Seller'', NULL),
    (105, N''BeeShop'', N''Phß╗Ñ kiß╗çn b├án'', 1, N''#8B4513'', ''2026-03-13T00:00:00.0000000Z'', N''https://picsum.photos/id/134/400/500'', N''https://picsum.photos/id/133/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Gß╗ù'', N''Lß╗ïch Gß╗ù ─Éß╗â B├án'', NULL, 190000.0, 4.7000000000000002E0, 15, N''BEE-105'', N''lich-go-de-ban'', NULL, 0, N''Minimalist'', NULL, NULL),
    (106, N''BeeShop'', N''Decor'', 3, N''#FFFFFF'', ''2026-03-13T00:00:00.0000000Z'', N''https://picsum.photos/id/146/400/500'', N''https://picsum.photos/id/145/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Gß╗æm sß╗⌐'', N''Cß╗æc Gß╗æm Handmade'', 160000.0, 145000.0, 4.5999999999999996E0, 55, N''BEE-106'', N''coc-gom-handmade'', NULL, 0, N''Vintage'', NULL, NULL),
    (107, N''BeeShop'', N''Decor'', 3, N''#333333'', ''2026-03-13T00:00:00.0000000Z'', N''https://picsum.photos/id/176/400/500'', N''https://picsum.photos/id/175/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Nhß╗▒a'', N''─Éß╗ông Hß╗ô Lß║¡t Sß╗æ'', NULL, 450000.0, 4.9000000000000004E0, 80, N''BEE-107'', N''dong-ho-lat-so'', NULL, 0, N''Hiß╗çn ─æß║íi'', N''Sold Out'', NULL),
    (108, N''Nordic Nest'', N''Phß╗Ñ kiß╗çn b├án'', 1, N''#8B4513'', ''2026-03-13T00:00:00.0000000Z'', N''https://picsum.photos/id/161/400/500'', N''https://picsum.photos/id/160/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Da'', N''Thß║úm Chuß╗Öt Da'', NULL, 220000.0, 4.7999999999999998E0, 90, N''BEE-108'', N''tham-chuot-da'', NULL, 0, N''Minimalist'', NULL, NULL),
    (109, N''Moc Decor'', N''Kitchen'', 6, N''#B08968'', ''2026-03-13T00:00:00.0000000Z'', N''https://picsum.photos/id/141/400/500'', N''https://picsum.photos/id/140/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Gß╗ù'', N''Bß╗Ö Khay Gß╗ù Trang Tr├¡ B├án ─én'', 690000.0, 520000.0, 4.5999999999999996E0, 66, N''BEE-109'', N''bo-khay-go-trang-tri-ban-an'', NULL, 0, N''Vintage'', NULL, NULL),
    (110, N''LumiHome'', N''Lighting'', 2, N''#222222'', ''2026-03-13T00:00:00.0000000Z'', N''https://picsum.photos/id/322/400/500'', N''https://picsum.photos/id/321/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Kim loß║íi'', N''─É├¿n Thß║ú Trß║ºn Cafe Loft'', NULL, 890000.0, 4.9000000000000004E0, 143, N''BEE-110'', N''den-tha-tran-cafe-loft'', NULL, 0, N''Hiß╗çn ─æß║íi'', N''Best Seller'', NULL),
    (111, N''SoftNest'', N''Textile'', 5, N''#E0A96D'', ''2026-03-13T00:00:00.0000000Z'', N''https://picsum.photos/id/326/400/500'', N''https://picsum.photos/id/325/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Vß║úi'', N''Gß╗æi Tß╗▒a Sofa Boho'', 240000.0, 180000.0, 4.4000000000000004E0, 38, N''BEE-111'', N''goi-tua-sofa-boho'', NULL, 0, N''Dß╗à th╞░╞íng'', NULL, NULL),
    (112, N''BeeLiving'', N''Decor'', 3, N''#7F5539'', ''2026-03-13T00:00:00.0000000Z'', N''https://picsum.photos/id/331/400/500'', N''https://picsum.photos/id/330/400/500'', CAST(0 AS bit), CAST(1 AS bit), N''Gß╗ù'', N''Kß╗ç Gß╗ù Treo T╞░ß╗¥ng Hex'', NULL, 430000.0, 4.7000000000000002E0, 57, N''BEE-112'', N''ke-go-treo-tuong-hex'', NULL, 0, N''Minimalist'', NULL, NULL),
    (113, N''SoftNest'', N''Textile'', 5, N''#C9ADA7'', ''2026-03-13T00:00:00.0000000Z'', N''https://picsum.photos/id/339/400/500'', N''https://picsum.photos/id/338/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Vß║úi'', N''Thß║úm Lß╗Ña Trang Tr├¡ Ph├▓ng Ngß╗º'', 960000.0, 760000.0, 4.9000000000000004E0, 102, N''BEE-113'', N''tham-lua-trang-tri-phong-ngu'', NULL, 0, N''Hiß╗çn ─æß║íi'', NULL, NULL),
    (114, N''Moc Decor'', N''Kitchen'', 6, N''#A47148'', ''2026-03-13T00:00:00.0000000Z'', N''https://picsum.photos/id/345/400/500'', N''https://picsum.photos/id/344/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Gß╗ù'', N''Set Th├¼a N─⌐a Gß╗ù 6 M├│n'', NULL, 250000.0, 4.2999999999999998E0, 22, N''BEE-114'', N''set-thia-nia-go-6-mon'', NULL, 0, N''Vintage'', NULL, NULL),
    (115, N''LumiHome'', N''Lighting'', 2, N''#2D2D2D'', ''2026-03-13T00:00:00.0000000Z'', N''https://picsum.photos/id/351/400/500'', N''https://picsum.photos/id/350/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Gß╗ù'', N''─É├¿n Ngß╗º Gß╗ù C├│ Dimmer'', NULL, 680000.0, 4.7999999999999998E0, 41, N''BEE-115'', N''den-ngu-go-co-dimmer'', NULL, 0, N''Minimalist'', N''NEW'', NULL),
    (116, N''Nordic Nest'', N''Furniture'', 4, N''#8D6E63'', ''2026-03-13T00:00:00.0000000Z'', N''https://picsum.photos/id/356/400/500'', N''https://picsum.photos/id/355/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Gß╗ù'', N''Tß╗º ─Éß║ºu Gi╞░ß╗¥ng 2 Ng─ân K├⌐o'', NULL, 1490000.0, 4.5999999999999996E0, 29, N''BEE-116'', N''tu-dau-giuong-2-ngan-keo'', NULL, 0, N''Hiß╗çn ─æß║íi'', NULL, NULL),
    (117, N''BeeLiving'', N''Kitchen'', 6, N''#EDE0D4'', ''2026-03-13T00:00:00.0000000Z'', N''https://picsum.photos/id/362/400/500'', N''https://picsum.photos/id/361/400/500'', CAST(0 AS bit), CAST(1 AS bit), N''Vß║úi'', N''Kh─ân Trß║úi B├án Linen Kem'', 390000.0, 310000.0, 4.5E0, 36, N''BEE-117'', N''khan-trai-ban-linen-kem'', NULL, 0, N''Minimalist'', NULL, NULL),
    (118, N''Artify'', N''Decor'', 3, N''#B0A8B9'', ''2026-03-13T00:00:00.0000000Z'', N''https://picsum.photos/id/369/400/500'', N''https://picsum.photos/id/368/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Canvas'', N''Bß╗Ö 3 Khung Tranh Trß╗½u T╞░ß╗úng'', NULL, 580000.0, 4.7000000000000002E0, 73, N''BEE-118'', N''bo-3-khung-tranh-truu-tuong'', NULL, 0, N''Hiß╗çn ─æß║íi'', NULL, NULL),
    (119, N''AromaBee'', N''Decor'', 3, N''#FFF4D6'', ''2026-03-13T00:00:00.0000000Z'', N''https://picsum.photos/id/376/400/500'', N''https://picsum.photos/id/375/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''S├íp ─æß║¡u n├ánh'', N''Nß║┐n Th╞ím Vani H┼⌐ Thß╗ºy Tinh'', 210000.0, 165000.0, 4.2000000000000002E0, 64, N''BEE-119'', N''nen-thom-vani-hu-thuy-tinh'', NULL, 0, N''Dß╗à th╞░╞íng'', NULL, NULL),
    (120, N''Artify'', N''Decor'', 3, N''#2A9D8F'', ''2026-03-13T00:00:00.0000000Z'', N''https://picsum.photos/id/382/400/500'', N''https://picsum.photos/id/381/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Thß╗ºy tinh'', N''B├¼nh Hoa Thß╗ºy Tinh Xanh R├¬u'', NULL, 410000.0, 4.7999999999999998E0, 88, N''BEE-120'', N''binh-hoa-thuy-tinh-xanh-rieu'', NULL, 0, N''Vintage'', NULL, NULL),
    (121, N''Nordic Nest'', N''Furniture'', 4, N''#6D597A'', ''2026-03-13T00:00:00.0000000Z'', N''https://picsum.photos/id/389/400/500'', N''https://picsum.photos/id/388/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Vß║úi'', N''Ghß║┐ ─É├┤n Bß╗ìc Vß║úi Nhung'', NULL, 980000.0, 4.5E0, 27, N''BEE-121'', N''ghe-don-boc-vai-nhung'', NULL, 0, N''Vintage'', NULL, NULL),
    (122, N''Moc Decor'', N''Kitchen'', 6, N''#F4EBD0'', ''2026-03-13T00:00:00.0000000Z'', N''https://picsum.photos/id/395/400/500'', N''https://picsum.photos/id/394/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Thß╗ºy tinh'', N''Bß╗Ö Ly Thß╗ºy Tinh Viß╗ün V├áng'', 520000.0, 460000.0, 4.9000000000000004E0, 112, N''BEE-122'', N''bo-ly-thuy-tinh-co-vien-vang'', NULL, 0, N''Hiß╗çn ─æß║íi'', NULL, NULL),
    (123, N''BeeLiving'', N''Decor'', 3, N''#D6CCC2'', ''2026-03-13T00:00:00.0000000Z'', N''https://picsum.photos/id/402/400/500'', N''https://picsum.photos/id/401/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Gß╗ù'', N''G╞░╞íng Tr├▓n Viß╗ün Gß╗ù Sß╗ôi'', NULL, 1250000.0, 4.7000000000000002E0, 46, N''BEE-123'', N''guong-tron-vien-go-soi'', NULL, 0, N''Minimalist'', NULL, NULL),
    (124, N''AromaBee'', N''Kitchen'', 6, N''#E3D5CA'', ''2026-03-13T00:00:00.0000000Z'', N''https://picsum.photos/id/410/400/500'', N''https://picsum.photos/id/409/400/500'', CAST(0 AS bit), CAST(1 AS bit), N''Gß╗æm sß╗⌐'', N''Set Khay Gß╗æm Breakfast'', NULL, 340000.0, 4.2999999999999998E0, 18, N''BEE-124'', N''set-khay-gom-breakfast'', NULL, 0, N''Dß╗à th╞░╞íng'', NULL, NULL)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Brand', N'Category', N'CategoryId', N'Color', N'CreatedAt', N'HoverImage', N'Image', N'InStock', N'IsActive', N'Material', N'Name', N'OriginalPrice', N'Price', N'Rating', N'Reviews', N'Sku', N'Slug', N'SoldPercentage', N'StockLeft', N'Style', N'Tag', N'VideoUrl') AND [object_id] = OBJECT_ID(N'[Products]'))
        SET IDENTITY_INSERT [Products] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260324125007_AddProductAndCategorySeed'
)
BEGIN
    CREATE INDEX [IX_Products_CategoryId] ON [Products] ([CategoryId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260324125007_AddProductAndCategorySeed'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260324125007_AddProductAndCategorySeed', N'9.0.0');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260324143612_UpdateUserSchema'
)
BEGIN
    ALTER TABLE [Addresses] DROP CONSTRAINT [FK_Addresses_Users_UserId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260324143612_UpdateUserSchema'
)
BEGIN
    ALTER TABLE [Addresses] DROP CONSTRAINT [PK_Addresses];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260324143612_UpdateUserSchema'
)
BEGIN
    EXEC sp_rename N'[Addresses]', N'Address', 'OBJECT';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260324143612_UpdateUserSchema'
)
BEGIN
    EXEC sp_rename N'[Users].[Id]', N'UserId', 'COLUMN';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260324143612_UpdateUserSchema'
)
BEGIN
    EXEC sp_rename N'[Address].[IX_Addresses_UserId]', N'IX_Address_UserId', 'INDEX';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260324143612_UpdateUserSchema'
)
BEGIN
    ALTER TABLE [Users] ADD [Address] nvarchar(max) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260324143612_UpdateUserSchema'
)
BEGIN
    ALTER TABLE [Address] ADD CONSTRAINT [PK_Address] PRIMARY KEY ([Id]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260324143612_UpdateUserSchema'
)
BEGIN
    CREATE TABLE [Feedback] (
        [FeedbackId] int NOT NULL IDENTITY,
        [Name] nvarchar(max) NOT NULL,
        [Email] nvarchar(max) NOT NULL,
        [Message] nvarchar(max) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Feedback] PRIMARY KEY ([FeedbackId])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260324143612_UpdateUserSchema'
)
BEGIN
    CREATE TABLE [Products] (
        [ProductId] int NOT NULL IDENTITY,
        [Sku] nvarchar(max) NOT NULL,
        [ProductName] nvarchar(max) NOT NULL,
        [Slug] nvarchar(max) NOT NULL,
        [Price] decimal(18,2) NOT NULL,
        [OldPrice] decimal(18,2) NULL,
        [CategoryId] int NOT NULL,
        [Category] nvarchar(max) NOT NULL,
        [Image] nvarchar(max) NOT NULL,
        [HoverImage] nvarchar(max) NOT NULL,
        [VideoUrl] nvarchar(max) NULL,
        [Tag] nvarchar(max) NULL,
        [SoldPercentage] int NULL,
        [StockLeft] int NOT NULL,
        [Rating] float NOT NULL,
        [Reviews] int NOT NULL,
        [Brand] nvarchar(max) NOT NULL,
        [Color] nvarchar(max) NOT NULL,
        [Material] nvarchar(max) NOT NULL,
        [Style] nvarchar(max) NOT NULL,
        [InStock] bit NOT NULL,
        [IsActive] bit NOT NULL,
        [IsPromotion] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [Description] nvarchar(max) NULL,
        CONSTRAINT [PK_Products] PRIMARY KEY ([ProductId])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260324143612_UpdateUserSchema'
)
BEGIN
    ALTER TABLE [Address] ADD CONSTRAINT [FK_Address_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE CASCADE;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260324143612_UpdateUserSchema'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260324143612_UpdateUserSchema', N'9.0.0');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260324154445_AddEmailVerification'
)
BEGIN
    ALTER TABLE [Users] ADD [EmailConfirmationToken] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260324154445_AddEmailVerification'
)
BEGIN
    ALTER TABLE [Users] ADD [IsEmailConfirmed] bit NOT NULL DEFAULT CAST(0 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260324154445_AddEmailVerification'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260324154445_AddEmailVerification', N'9.0.0');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260324161106_SeedAdminFixed'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'UserId', N'Address', N'CreatedAt', N'CurrentToken', N'Email', N'EmailConfirmationToken', N'FullName', N'IsEmailConfirmed', N'PasswordHash', N'Phone', N'Role') AND [object_id] = OBJECT_ID(N'[Users]'))
        SET IDENTITY_INSERT [Users] ON;
    EXEC(N'INSERT INTO [Users] ([UserId], [Address], [CreatedAt], [CurrentToken], [Email], [EmailConfirmationToken], [FullName], [IsEmailConfirmed], [PasswordHash], [Phone], [Role])
    VALUES (99, N''System'', ''2026-03-24T15:53:10.0000000Z'', NULL, N''admin'', NULL, N''Administrator'', CAST(1 AS bit), N''$2a$11$XZKAs1.hhd1cRoCH2eTlquOBAAEoA/Cfkt028hduwkCKNQ4eHd5bC'', N''0000000000'', 0)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'UserId', N'Address', N'CreatedAt', N'CurrentToken', N'Email', N'EmailConfirmationToken', N'FullName', N'IsEmailConfirmed', N'PasswordHash', N'Phone', N'Role') AND [object_id] = OBJECT_ID(N'[Users]'))
        SET IDENTITY_INSERT [Users] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260324161106_SeedAdminFixed'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260324161106_SeedAdminFixed', N'9.0.0');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    ALTER TABLE [Address] DROP CONSTRAINT [FK_Address_Users_UserId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    ALTER TABLE [Products] DROP CONSTRAINT [PK_Products];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    ALTER TABLE [Address] DROP CONSTRAINT [PK_Address];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    EXEC(N'DELETE FROM [Products]
    WHERE [Id] = 101;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    EXEC(N'DELETE FROM [Products]
    WHERE [Id] = 102;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    EXEC(N'DELETE FROM [Products]
    WHERE [Id] = 103;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    EXEC(N'DELETE FROM [Products]
    WHERE [Id] = 104;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    EXEC(N'DELETE FROM [Products]
    WHERE [Id] = 105;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    EXEC(N'DELETE FROM [Products]
    WHERE [Id] = 106;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    EXEC(N'DELETE FROM [Products]
    WHERE [Id] = 107;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    EXEC(N'DELETE FROM [Products]
    WHERE [Id] = 108;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    EXEC(N'DELETE FROM [Products]
    WHERE [Id] = 109;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    EXEC(N'DELETE FROM [Products]
    WHERE [Id] = 110;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    EXEC(N'DELETE FROM [Products]
    WHERE [Id] = 111;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    EXEC(N'DELETE FROM [Products]
    WHERE [Id] = 112;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    EXEC(N'DELETE FROM [Products]
    WHERE [Id] = 113;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    EXEC(N'DELETE FROM [Products]
    WHERE [Id] = 114;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    EXEC(N'DELETE FROM [Products]
    WHERE [Id] = 115;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    EXEC(N'DELETE FROM [Products]
    WHERE [Id] = 116;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    EXEC(N'DELETE FROM [Products]
    WHERE [Id] = 117;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    EXEC(N'DELETE FROM [Products]
    WHERE [Id] = 118;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    EXEC(N'DELETE FROM [Products]
    WHERE [Id] = 119;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    EXEC(N'DELETE FROM [Products]
    WHERE [Id] = 120;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    EXEC(N'DELETE FROM [Products]
    WHERE [Id] = 121;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    EXEC(N'DELETE FROM [Products]
    WHERE [Id] = 122;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    EXEC(N'DELETE FROM [Products]
    WHERE [Id] = 123;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    EXEC(N'DELETE FROM [Products]
    WHERE [Id] = 124;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    DECLARE @var0 sysname;
    SELECT @var0 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Products]') AND [c].[name] = N'Id');
    IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [Products] DROP CONSTRAINT [' + @var0 + '];');
    ALTER TABLE [Products] DROP COLUMN [Id];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    DECLARE @var1 sysname;
    SELECT @var1 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Products]') AND [c].[name] = N'IsPromotion');
    IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [Products] DROP CONSTRAINT [' + @var1 + '];');
    ALTER TABLE [Products] DROP COLUMN [IsPromotion];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    DECLARE @var2 sysname;
    SELECT @var2 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Products]') AND [c].[name] = N'Name');
    IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [Products] DROP CONSTRAINT [' + @var2 + '];');
    ALTER TABLE [Products] DROP COLUMN [Name];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    DECLARE @var3 sysname;
    SELECT @var3 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Products]') AND [c].[name] = N'OriginalPrice');
    IF @var3 IS NOT NULL EXEC(N'ALTER TABLE [Products] DROP CONSTRAINT [' + @var3 + '];');
    ALTER TABLE [Products] DROP COLUMN [OriginalPrice];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    EXEC sp_rename N'[Address]', N'Addresses', 'OBJECT';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    EXEC sp_rename N'[Addresses].[IX_Address_UserId]', N'IX_Addresses_UserId', 'INDEX';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    ALTER TABLE [Products] ADD CONSTRAINT [PK_Products] PRIMARY KEY ([ProductId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    ALTER TABLE [Addresses] ADD CONSTRAINT [PK_Addresses] PRIMARY KEY ([Id]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'ProductId', N'Brand', N'Category', N'CategoryId', N'Color', N'CreatedAt', N'Description', N'HoverImage', N'Image', N'InStock', N'IsActive', N'Material', N'OldPrice', N'Price', N'ProductName', N'Rating', N'Reviews', N'Sku', N'Slug', N'SoldPercentage', N'StockLeft', N'Style', N'Tag', N'VideoUrl') AND [object_id] = OBJECT_ID(N'[Products]'))
        SET IDENTITY_INSERT [Products] ON;
    EXEC(N'INSERT INTO [Products] ([ProductId], [Brand], [Category], [CategoryId], [Color], [CreatedAt], [Description], [HoverImage], [Image], [InStock], [IsActive], [Material], [OldPrice], [Price], [ProductName], [Rating], [Reviews], [Sku], [Slug], [SoldPercentage], [StockLeft], [Style], [Tag], [VideoUrl])
    VALUES (101, N''BeeShop'', N''Phß╗Ñ kiß╗çn b├án'', 1, N''#8B4513'', ''2026-03-13T00:00:00.0000000Z'', NULL, N''https://picsum.photos/id/102/400/500'', N''https://picsum.photos/id/101/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Gß╗ù'', 180000.0, 150000.0, N''Khay Cß║»m B├║t Gß╗ù Sß╗ôi'', 4.7999999999999998E0, 45, N''BEE-101'', N''khay-cam-but-go-soi'', NULL, 0, N''Minimalist'', N''NEW'', NULL),
    (102, N''BeeShop'', N''Lighting'', 2, N''#333333'', ''2026-03-13T00:00:00.0000000Z'', NULL, N''https://picsum.photos/id/104/400/500'', N''https://picsum.photos/id/103/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Kim loß║íi'', NULL, 350000.0, N''─É├¿n B├án Pixar'', 4.9000000000000004E0, 120, N''BEE-102'', N''den-ban-pixar'', NULL, 0, N''Hiß╗çn ─æß║íi'', N''-20%'', NULL),
    (103, N''BeeShop'', N''Phß╗Ñ kiß╗çn b├án'', 1, N''#D2B48C'', ''2026-03-13T00:00:00.0000000Z'', NULL, N''https://picsum.photos/id/107/400/500'', N''https://picsum.photos/id/106/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Vß║úi'', NULL, 120000.0, N''Bß║úng Ghim Ghi Ch├║'', 4.5E0, 30, N''BEE-103'', N''bang-ghim-ghi-chu'', NULL, 0, N''Vintage'', NULL, NULL),
    (104, N''BeeShop'', N''Decor'', 3, N''#4CAF50'', ''2026-03-13T00:00:00.0000000Z'', NULL, N''https://picsum.photos/id/113/400/500'', N''https://picsum.photos/id/112/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Gß╗æm sß╗⌐'', NULL, 85000.0, N''Chß║¡u C├óy Mini ─Éß╗â B├án'', 5.0E0, 210, N''BEE-104'', N''chau-cay-mini-de-ban'', NULL, 0, N''Dß╗à th╞░╞íng'', N''Best Seller'', NULL),
    (105, N''BeeShop'', N''Phß╗Ñ kiß╗çn b├án'', 1, N''#8B4513'', ''2026-03-13T00:00:00.0000000Z'', NULL, N''https://picsum.photos/id/134/400/500'', N''https://picsum.photos/id/133/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Gß╗ù'', NULL, 190000.0, N''Lß╗ïch Gß╗ù ─Éß╗â B├án'', 4.7000000000000002E0, 15, N''BEE-105'', N''lich-go-de-ban'', NULL, 0, N''Minimalist'', NULL, NULL),
    (106, N''BeeShop'', N''Decor'', 3, N''#FFFFFF'', ''2026-03-13T00:00:00.0000000Z'', NULL, N''https://picsum.photos/id/146/400/500'', N''https://picsum.photos/id/145/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Gß╗æm sß╗⌐'', 160000.0, 145000.0, N''Cß╗æc Gß╗æm Handmade'', 4.5999999999999996E0, 55, N''BEE-106'', N''coc-gom-handmade'', NULL, 0, N''Vintage'', NULL, NULL),
    (107, N''BeeShop'', N''Decor'', 3, N''#333333'', ''2026-03-13T00:00:00.0000000Z'', NULL, N''https://picsum.photos/id/176/400/500'', N''https://picsum.photos/id/175/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Nhß╗▒a'', NULL, 450000.0, N''─Éß╗ông Hß╗ô Lß║¡t Sß╗æ'', 4.9000000000000004E0, 80, N''BEE-107'', N''dong-ho-lat-so'', NULL, 0, N''Hiß╗çn ─æß║íi'', N''Sold Out'', NULL),
    (108, N''Nordic Nest'', N''Phß╗Ñ kiß╗çn b├án'', 1, N''#8B4513'', ''2026-03-13T00:00:00.0000000Z'', NULL, N''https://picsum.photos/id/161/400/500'', N''https://picsum.photos/id/160/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Da'', NULL, 220000.0, N''Thß║úm Chuß╗Öt Da'', 4.7999999999999998E0, 90, N''BEE-108'', N''tham-chuot-da'', NULL, 0, N''Minimalist'', NULL, NULL),
    (109, N''Moc Decor'', N''Kitchen'', 6, N''#B08968'', ''2026-03-13T00:00:00.0000000Z'', NULL, N''https://picsum.photos/id/141/400/500'', N''https://picsum.photos/id/140/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Gß╗ù'', 690000.0, 520000.0, N''Bß╗Ö Khay Gß╗ù Trang Tr├¡ B├án ─én'', 4.5999999999999996E0, 66, N''BEE-109'', N''bo-khay-go-trang-tri-ban-an'', NULL, 0, N''Vintage'', NULL, NULL),
    (110, N''LumiHome'', N''Lighting'', 2, N''#222222'', ''2026-03-13T00:00:00.0000000Z'', NULL, N''https://picsum.photos/id/322/400/500'', N''https://picsum.photos/id/321/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Kim loß║íi'', NULL, 890000.0, N''─É├¿n Thß║ú Trß║ºn Cafe Loft'', 4.9000000000000004E0, 143, N''BEE-110'', N''den-tha-tran-cafe-loft'', NULL, 0, N''Hiß╗çn ─æß║íi'', N''Best Seller'', NULL),
    (111, N''SoftNest'', N''Textile'', 5, N''#E0A96D'', ''2026-03-13T00:00:00.0000000Z'', NULL, N''https://picsum.photos/id/326/400/500'', N''https://picsum.photos/id/325/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Vß║úi'', 240000.0, 180000.0, N''Gß╗æi Tß╗▒a Sofa Boho'', 4.4000000000000004E0, 38, N''BEE-111'', N''goi-tua-sofa-boho'', NULL, 0, N''Dß╗à th╞░╞íng'', NULL, NULL),
    (112, N''BeeLiving'', N''Decor'', 3, N''#7F5539'', ''2026-03-13T00:00:00.0000000Z'', NULL, N''https://picsum.photos/id/331/400/500'', N''https://picsum.photos/id/330/400/500'', CAST(0 AS bit), CAST(1 AS bit), N''Gß╗ù'', NULL, 430000.0, N''Kß╗ç Gß╗ù Treo T╞░ß╗¥ng Hex'', 4.7000000000000002E0, 57, N''BEE-112'', N''ke-go-treo-tuong-hex'', NULL, 0, N''Minimalist'', NULL, NULL),
    (113, N''SoftNest'', N''Textile'', 5, N''#C9ADA7'', ''2026-03-13T00:00:00.0000000Z'', NULL, N''https://picsum.photos/id/339/400/500'', N''https://picsum.photos/id/338/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Vß║úi'', 960000.0, 760000.0, N''Thß║úm Lß╗Ña Trang Tr├¡ Ph├▓ng Ngß╗º'', 4.9000000000000004E0, 102, N''BEE-113'', N''tham-lua-trang-tri-phong-ngu'', NULL, 0, N''Hiß╗çn ─æß║íi'', NULL, NULL),
    (114, N''Moc Decor'', N''Kitchen'', 6, N''#A47148'', ''2026-03-13T00:00:00.0000000Z'', NULL, N''https://picsum.photos/id/345/400/500'', N''https://picsum.photos/id/344/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Gß╗ù'', NULL, 250000.0, N''Set Th├¼a N─⌐a Gß╗ù 6 M├│n'', 4.2999999999999998E0, 22, N''BEE-114'', N''set-thia-nia-go-6-mon'', NULL, 0, N''Vintage'', NULL, NULL),
    (115, N''LumiHome'', N''Lighting'', 2, N''#2D2D2D'', ''2026-03-13T00:00:00.0000000Z'', NULL, N''https://picsum.photos/id/351/400/500'', N''https://picsum.photos/id/350/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Gß╗ù'', NULL, 680000.0, N''─É├¿n Ngß╗º Gß╗ù C├│ Dimmer'', 4.7999999999999998E0, 41, N''BEE-115'', N''den-ngu-go-co-dimmer'', NULL, 0, N''Minimalist'', N''NEW'', NULL),
    (116, N''Nordic Nest'', N''Furniture'', 4, N''#8D6E63'', ''2026-03-13T00:00:00.0000000Z'', NULL, N''https://picsum.photos/id/356/400/500'', N''https://picsum.photos/id/355/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Gß╗ù'', NULL, 1490000.0, N''Tß╗º ─Éß║ºu Gi╞░ß╗¥ng 2 Ng─ân K├⌐o'', 4.5999999999999996E0, 29, N''BEE-116'', N''tu-dau-giuong-2-ngan-keo'', NULL, 0, N''Hiß╗çn ─æß║íi'', NULL, NULL),
    (117, N''BeeLiving'', N''Kitchen'', 6, N''#EDE0D4'', ''2026-03-13T00:00:00.0000000Z'', NULL, N''https://picsum.photos/id/362/400/500'', N''https://picsum.photos/id/361/400/500'', CAST(0 AS bit), CAST(1 AS bit), N''Vß║úi'', 390000.0, 310000.0, N''Kh─ân Trß║úi B├án Linen Kem'', 4.5E0, 36, N''BEE-117'', N''khan-trai-ban-linen-kem'', NULL, 0, N''Minimalist'', NULL, NULL),
    (118, N''Artify'', N''Decor'', 3, N''#B0A8B9'', ''2026-03-13T00:00:00.0000000Z'', NULL, N''https://picsum.photos/id/369/400/500'', N''https://picsum.photos/id/368/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Canvas'', NULL, 580000.0, N''Bß╗Ö 3 Khung Tranh Trß╗½u T╞░ß╗úng'', 4.7000000000000002E0, 73, N''BEE-118'', N''bo-3-khung-tranh-truu-tuong'', NULL, 0, N''Hiß╗çn ─æß║íi'', NULL, NULL),
    (119, N''AromaBee'', N''Decor'', 3, N''#FFF4D6'', ''2026-03-13T00:00:00.0000000Z'', NULL, N''https://picsum.photos/id/376/400/500'', N''https://picsum.photos/id/375/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''S├íp ─æß║¡u n├ánh'', 210000.0, 165000.0, N''Nß║┐n Th╞ím Vani H┼⌐ Thß╗ºy Tinh'', 4.2000000000000002E0, 64, N''BEE-119'', N''nen-thom-vani-hu-thuy-tinh'', NULL, 0, N''Dß╗à th╞░╞íng'', NULL, NULL),
    (120, N''Artify'', N''Decor'', 3, N''#2A9D8F'', ''2026-03-13T00:00:00.0000000Z'', NULL, N''https://picsum.photos/id/382/400/500'', N''https://picsum.photos/id/381/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Thß╗ºy tinh'', NULL, 410000.0, N''B├¼nh Hoa Thß╗ºy Tinh Xanh R├¬u'', 4.7999999999999998E0, 88, N''BEE-120'', N''binh-hoa-thuy-tinh-xanh-rieu'', NULL, 0, N''Vintage'', NULL, NULL),
    (121, N''Nordic Nest'', N''Furniture'', 4, N''#6D597A'', ''2026-03-13T00:00:00.0000000Z'', NULL, N''https://picsum.photos/id/389/400/500'', N''https://picsum.photos/id/388/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Vß║úi'', NULL, 980000.0, N''Ghß║┐ ─É├┤n Bß╗ìc Vß║úi Nhung'', 4.5E0, 27, N''BEE-121'', N''ghe-don-boc-vai-nhung'', NULL, 0, N''Vintage'', NULL, NULL),
    (122, N''Moc Decor'', N''Kitchen'', 6, N''#F4EBD0'', ''2026-03-13T00:00:00.0000000Z'', NULL, N''https://picsum.photos/id/395/400/500'', N''https://picsum.photos/id/394/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Thß╗ºy tinh'', 520000.0, 460000.0, N''Bß╗Ö Ly Thß╗ºy Tinh Viß╗ün V├áng'', 4.9000000000000004E0, 112, N''BEE-122'', N''bo-ly-thuy-tinh-co-vien-vang'', NULL, 0, N''Hiß╗çn ─æß║íi'', NULL, NULL),
    (123, N''BeeLiving'', N''Decor'', 3, N''#D6CCC2'', ''2026-03-13T00:00:00.0000000Z'', NULL, N''https://picsum.photos/id/402/400/500'', N''https://picsum.photos/id/401/400/500'', CAST(1 AS bit), CAST(1 AS bit), N''Gß╗ù'', NULL, 1250000.0, N''G╞░╞íng Tr├▓n Viß╗ün Gß╗ù Sß╗ôi'', 4.7000000000000002E0, 46, N''BEE-123'', N''guong-tron-vien-go-soi'', NULL, 0, N''Minimalist'', NULL, NULL),
    (124, N''AromaBee'', N''Kitchen'', 6, N''#E3D5CA'', ''2026-03-13T00:00:00.0000000Z'', NULL, N''https://picsum.photos/id/410/400/500'', N''https://picsum.photos/id/409/400/500'', CAST(0 AS bit), CAST(1 AS bit), N''Gß╗æm sß╗⌐'', NULL, 340000.0, N''Set Khay Gß╗æm Breakfast'', 4.2999999999999998E0, 18, N''BEE-124'', N''set-khay-gom-breakfast'', NULL, 0, N''Dß╗à th╞░╞íng'', NULL, NULL)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'ProductId', N'Brand', N'Category', N'CategoryId', N'Color', N'CreatedAt', N'Description', N'HoverImage', N'Image', N'InStock', N'IsActive', N'Material', N'OldPrice', N'Price', N'ProductName', N'Rating', N'Reviews', N'Sku', N'Slug', N'SoldPercentage', N'StockLeft', N'Style', N'Tag', N'VideoUrl') AND [object_id] = OBJECT_ID(N'[Products]'))
        SET IDENTITY_INSERT [Products] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    EXEC(N'UPDATE [Users] SET [Email] = N''admin@gmail.com''
    WHERE [UserId] = 99;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    ALTER TABLE [Addresses] ADD CONSTRAINT [FK_Addresses_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE CASCADE;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260326032237_FinalFixModels'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260326032237_FinalFixModels', N'9.0.0');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260406170341_AddUserIsActive'
)
BEGIN
    ALTER TABLE [Users] ADD [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260406170341_AddUserIsActive'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260406170341_AddUserIsActive', N'9.0.0');
END;

COMMIT;
GO


