import re
import sys

# Ensure stdout can handle utf-8 if needed, but safer to write directly to file
# sys.stdout.reconfigure(encoding='utf-8') 

def parse_price(price_str):
    price_str = price_str.replace('.', '').replace('đ', '').replace('Đ', '')
    parts = re.split(r'[-–]', price_str)
    try:
        return int(parts[0].strip())
    except:
        return 0

def clean_text(text):
    return text.strip().replace('"', '\\"').replace('\n', ' ')

def parse_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    products = []
    current_product = {}
    section = None
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        match = re.match(r'===== SẢN PHẨM (\d+): (.*) =====', line)
        if match:
            if current_product:
                products.append(current_product)
            current_product = {
                'id': int(match.group(1)),
                'name': match.group(2).strip(),
                'description': '',
                'specs': '',
                'material': '',
                'style': '',
                'price': 0,
                'category': '',
                'image': ''
            }
            section = 'desc'
            continue
            
        if line.startswith('Mô tả:'):
            section = 'desc'
            continue
        elif line.startswith('Thông số:'):
            section = 'specs'
            continue
        elif line.startswith('Chất liệu:'):
            current_product['material'] = line.replace('Chất liệu:', '').strip()
            section = None
            continue
        elif line.startswith('Phong cách:'):
            current_product['style'] = line.replace('Phong cách:', '').strip()
            section = None
            continue
        elif line.startswith('Giá:'):
            current_product['price'] = parse_price(line.replace('Giá:', '').strip())
            section = None
            continue
        elif line.startswith('Thể loại:'):
            current_product['category'] = line.replace('Thể loại:', '').strip()
            section = None
            continue
        elif line.startswith('Tên ảnh:'):
            current_product['image'] = line.replace('Tên ảnh:', '').strip()
            section = None
            continue
        elif line.startswith('Caption:') or line.startswith('SEO:') or line.startswith('Hashtag:'):
            section = None
            continue
            
        if section == 'desc':
            current_product['description'] += line + ' '
        elif section == 'specs':
            current_product['specs'] += line + ' '

    if current_product:
        products.append(current_product)
        
    return products

products = parse_file('c:\\Users\\Dell\\OneDrive\\Desktop\\TMDT_Nhom6\\SanPham.txt')

categories = sorted(list(set(p['category'] for p in products)))
cat_map = {cat: i+1 for i, cat in enumerate(categories)}

with open('products_seed.txt', 'w', encoding='utf-8') as out:
    out.write("// Categories Seed\n")
    out.write("migrationBuilder.InsertData(\n")
    out.write("    table: \"Categories\",\n")
    out.write("    columns: new[] { \"Id\", \"IsActive\", \"Name\", \"Slug\" },\n")
    out.write("    values: new object[,] {\n")
    for cat, id in cat_map.items():
        slug = cat.lower().replace(' ', '-')
        out.write(f"        {{ {id}, true, \"{cat}\", \"{slug}\" }},\n")
    out.write("    });\n\n")

    out.write("// Products Seed\n")
    out.write("migrationBuilder.InsertData(\n")
    out.write("    table: \"Products\",\n")
    out.write("    columns: new[] { \"ProductId\", \"Brand\", \"Category\", \"CategoryId\", \"Color\", \"CreatedAt\", \"Description\", \"HoverImage\", \"Image\", \"InStock\", \"IsActive\", \"Material\", \"OldPrice\", \"Price\", \"ProductName\", \"Rating\", \"Reviews\", \"Sku\", \"Slug\", \"SoldPercentage\", \"StockLeft\", \"Style\", \"Tag\", \"VideoUrl\" },\n")
    out.write("    values: new object[,] {\n")
    for i, p in enumerate(products):
        desc = clean_text(p['description'] + " " + p['specs'])
        sku = f"BEE-{p['id']:03d}"
        slug = p['name'].lower().replace(' ', '-')
        img_path = f"assets/images/{p['image']}"
        rating = 4.5
        reviews = 10
        stock = 50
        out.write(f"        {{ {p['id']}, \"BeeShop\", \"{p['category']}\", {cat_map[p['category']]}, \"N/A\", DateTime.UtcNow, \"{desc}\", \"{img_path}\", \"{img_path}\", true, true, \"{p['material']}\", null, {p['price']}m, \"{p['name']}\", {rating}, {reviews}, \"{sku}\", \"{slug}\", 0, {stock}, \"{p['style']}\", \"NEW\", null }},\n")
    out.write("    });\n")

