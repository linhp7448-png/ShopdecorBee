import { Injectable, signal } from '@angular/core';
import { BlogPost, ShopLook } from '@/core/models';
import {
  MOCK_BLOG_POSTS,
  MOCK_INSTAGRAM_FEED,
  MOCK_LOOKBOOK_ITEMS,
  MOCK_SHOP_LOOKS
} from '@/core/mock-data/ecommerce.mock';

@Injectable({ providedIn: 'root' })
export class ContentStore {
  readonly blogPosts = signal<BlogPost[]>(MOCK_BLOG_POSTS);
  readonly lookbookItems = signal<ShopLook[]>(MOCK_LOOKBOOK_ITEMS);
  readonly shopLooks = signal<ShopLook[]>(MOCK_SHOP_LOOKS);
  readonly instagramFeed = signal<string[]>(MOCK_INSTAGRAM_FEED);
}
