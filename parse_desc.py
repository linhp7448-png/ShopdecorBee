import re

with open('SanPham.txt', 'r', encoding='utf-8') as f:
    content = f.read()

products = re.split(r'===== SẢN PHẨM \d+: .* =====', content)
descriptions = []

for p in products[1:]: # skip the first empty split
    p = p.strip()
    match = re.search(r'Mô tả:\n(.*?)\n\nThông số:', p, re.DOTALL)
    if match:
        desc = match.group(1).strip().replace('\n', ' ')
        specs_match = re.search(r'Thông số:\n(.*?)\n\nChất liệu:', p, re.DOTALL)
        if specs_match:
            desc += " | Thông số: " + specs_match.group(1).strip().replace('\n', ', ')
        descriptions.append(desc)
    else:
        # Fallback if parsing fails for some reason
        descriptions.append("Mô tả đang cập nhật...")

# Output first 100
for i, d in enumerate(descriptions[:100]):
    print(f"[{i+1}] {d[:100]}...")

# Generate SQL
with open('update_desc.sql', 'w', encoding='utf-8') as f:
    for i, d in enumerate(descriptions[:100]):
        # ProductId in DB starts from 1
        safe_desc = d.replace("'", "''")
        f.write(f"UPDATE Products SET Description = N'{safe_desc}' WHERE ProductId = {i+1};\n")
