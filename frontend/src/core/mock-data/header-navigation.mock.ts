export interface HeaderSubItem {
  label: string;
  link?: string;
  categoryName?: string; // Tên danh mục thực tế trong DB
}

export interface HeaderMenuColumn {
  title: string;
  items: HeaderSubItem[];
}

export interface HeaderNavCategory {
  label: string;
  slug?: string;
  type: 'mega' | 'dropdown' | 'link';
  link?: string;
  categoryNames?: string[]; // Tên danh mục thực tế trong DB
  columns?: HeaderMenuColumn[];
  featuredImage?: { src: string; caption: string };
  items?: HeaderSubItem[];
}

export const HEADER_NAVIGATION_STRUCTURE: HeaderNavCategory[] = [
  {
    label: 'Khuyến mại',
    slug: 'promotions',
    type: 'link',
    link: '/#flash-sale'
  },
  {
    label: 'Trang trí nội thất',
    slug: 'decor',
    type: 'mega',
    categoryName: 'Trang trí,Trang trí tường',
    columns: [
      {
        title: 'Đồ trang trí tường',
        items: [
          { label: 'Tranh Canvas & Poster', categoryName: 'Trang trí tường' },
          { label: 'Gương trang trí', categoryName: 'Trang trí tường' },
          { label: 'Đồng hồ treo tường', categoryName: 'Trang trí tường' },
          { label: 'Macrame & Đồ đan lát', categoryName: 'Trang trí' }
        ]
      },
      {
        title: 'Đồ trang trí mềm',
        items: [
          { label: 'Thảm trải sàn', categoryName: 'Phụ kiện vải' },
          { label: 'Vỏ gối tựa sofa', categoryName: 'Phụ kiện vải' },
          { label: 'Rèm cửa & Vải decor', categoryName: 'Phụ kiện vải' }
        ]
      },
      {
        title: 'Phụ kiện điểm nhấn',
        items: [
          { label: 'Lọ hoa & Chậu cây mini', categoryName: 'Trang trí' },
          { label: 'Tượng & Đồ thủ công', categoryName: 'Trang trí' },
          { label: 'Khay đựng đồ đan mây', categoryName: 'Mây tre đan' }
        ]
      }
    ],
    featuredImage: {
      src: 'https://picsum.photos/id/1078/400/300',
      caption: 'Góc phòng khách ấm áp'
    }
  },
  {
    label: 'Bếp & Bàn ăn',
    slug: 'kitchen-dining',
    type: 'mega',
    categoryName: 'Bàn ăn,Cốc ly',
    columns: [
      {
        title: 'Cốc & Ly',
        items: [
          { label: 'Cốc gốm nặn tay', categoryName: 'Cốc ly' },
          { label: 'Ly thủy tinh kiểu cách', categoryName: 'Cốc ly' },
          { label: 'Set ấm trà', categoryName: 'Cốc ly' }
        ]
      },
      {
        title: 'Đồ dùng bàn ăn',
        items: [
          { label: 'Đĩa/Bát gốm sứ', categoryName: 'Bàn ăn' },
          { label: 'Thìa, nĩa gỗ/vàng đồng', categoryName: 'Bàn ăn' },
          { label: 'Khay gỗ decor thức ăn', categoryName: 'Bàn ăn' }
        ]
      },
      {
        title: 'Phụ kiện vải',
        items: [
          { label: 'Khăn trải bàn vintage', categoryName: 'Phụ kiện vải' },
          { label: 'Tấm lót nồi & Lót ly', categoryName: 'Phụ kiện vải' },
          { label: 'Tạp dề linen', categoryName: 'Phụ kiện vải' }
        ]
      }
    ],
    featuredImage: {
      src: 'https://picsum.photos/id/425/400/300',
      caption: 'Bữa ăn ngon hơn'
    }
  },
  {
    label: 'Đèn & Ánh sáng',
    slug: 'lighting',
    type: 'mega',
    categoryName: 'Đèn,Hương thơm',
    columns: [
      {
        title: 'Loại đèn',
        items: [
          { label: 'Đèn ngủ & Đèn để bàn', categoryName: 'Đèn' },
          { label: 'Đèn cây đứng (Floor lamps)', categoryName: 'Đèn' },
          { label: 'Dây đèn LED trang trí', categoryName: 'Đèn' },
          { label: 'Đèn hoàng hôn', categoryName: 'Đèn' }
        ]
      },
      {
        title: 'Hương thơm',
        items: [
          { label: 'Nến thơm tạo hình', categoryName: 'Hương thơm' },
          { label: 'Sáp thơm & Tinh dầu', categoryName: 'Hương thơm' },
          { label: 'Đế lót nến nghệ thuật', categoryName: 'Hương thơm' }
        ]
      }
    ],
    featuredImage: {
      src: 'https://picsum.photos/id/366/400/300',
      caption: 'Ánh sáng cực chill'
    }
  },
  {
    label: 'Quà tặng',
    slug: 'gifts',
    type: 'dropdown',
    categoryName: 'Trang trí',
    items: [
      { label: 'Dưới 200k', categoryName: 'Trang trí' },
      { label: '200k - 500k', categoryName: 'Trang trí' },
      { label: 'Trên 500k', categoryName: 'Trang trí' },
      { label: 'Quà tặng tân gia', categoryName: 'Trang trí' },
      { label: 'Quà sinh nhật cho nàng / cho chàng', categoryName: 'Trang trí' },
      { label: 'Set quà gói sẵn (Gift sets)', categoryName: 'Trang trí' },
      { label: 'Thẻ quà tặng (E-Voucher)', categoryName: 'Trang trí' }
    ]
  },
  {
    label: 'Thương hiệu',
    slug: 'brands',
    type: 'dropdown',
    items: [
      { label: 'Gốm Bát Tràng' },
      { label: 'Thơm Studio' },
      { label: 'Lạc Macrame' },
      { label: 'Mây Tre Đan' }
    ]
  },
  {
    label: 'Nhà thiết kế',
    slug: 'designers',
    type: 'dropdown',
    items: [
      { label: 'BST "Thu Cúc" x Họa sĩ A' },
      { label: 'BST "Mùa Yêu" x Designer B' }
    ]
  },
  {
    label: 'Liên hệ',
    slug: 'contact',
    type: 'link',
    link: '/contact'
  },
  {
    label: 'Blog',
    slug: 'blog',
    type: 'dropdown',
    items: [
      { label: 'Mẹo trang trí nhà cửa' },
      { label: 'Xu hướng không gian sống' },
      { label: 'Chuyện nhà Bee' },
      { label: 'Video & Lookbook' }
    ]
  },
  {
    label: 'B2B',
    slug: 'b2b',
    type: 'dropdown',
    items: [
      { label: 'Chính sách mua sỉ (Đại lý)' },
      { label: 'Quà tặng sự kiện / Quà tặng nhân viên' },
      { label: 'Đăng ký báo giá doanh nghiệp' },
      { label: 'Dự án đã thực hiện (Portfolio)' }
    ]
  }
];
