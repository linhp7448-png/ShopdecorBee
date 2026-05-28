
import re
import pyodbc

conn_str = (
    r'DRIVER={SQL Server};'
    r'SERVER=.\SQLEXPRESS01;'
    r'DATABASE=HomeDecorDb;'
    r'Trusted_Connection=yes;'
)

def update_descriptions():
    with open('SanPham.txt', 'r', encoding='utf-8') as f:
        content = f.read()
    
    products = re.split(r'===== SẢN PHẨM \d+: ', content)[1:]
    
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    for p in products:
        try:
            name_match = re.match(r'(.*?) =====', p)
            if not name_match: continue
            name = name_match.group(1).strip()
            
            mota = re.search(r'Mô tả:\s*(.*?)\s*Thông số:', p, re.S)
            thongso = re.search(r'Thông số:\s*(.*?)\s*Chất liệu:', p, re.S)
            chatlieu = re.search(r'Chất liệu:\s*(.*?)\s*Phong cách:', p, re.S)
            phongcach = re.search(r'Phong cách:\s*(.*?)\s*Giá:', p, re.S)
            
            if mota and thongso and chatlieu and phongcach:
                m = mota.group(1).strip()
                t = thongso.group(1).strip()
                c = chatlieu.group(1).strip()
                pg = phongcach.group(1).strip()
                
                full_desc = f"{m}\n\n[THÔNG SỐ]\n{t}\n\n[CHẤT LIỆU]: {c}\n[PHONG CÁCH]: {pg}"
                
                # Update by name (case-insensitive and handle accents if possible, but exact match is first try)
                cursor.execute("UPDATE Products SET Description = ?, Material = ?, Style = ? WHERE ProductName LIKE ?", 
                               (full_desc, c, pg, f"%{name}%"))
                print(f"Updated: {name}")
            else:
                print(f"Failed to parse parts for: {name}")
                
        except Exception as ex:
            print(f"Error processing product: {ex}")
            
    conn.commit()
    conn.close()

if __name__ == '__main__':
    update_descriptions()
