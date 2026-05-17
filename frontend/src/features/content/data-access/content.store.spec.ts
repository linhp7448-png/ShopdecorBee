import { TestBed } from '@angular/core/testing';
import { ContentStore } from './content.store';

describe('ContentStore', () => {
  let store: ContentStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(ContentStore);
  });

  it('loads content mock collections', () => {
    expect(store.blogPosts().length).toBeGreaterThan(0);
    expect(store.lookbookItems().length).toBeGreaterThan(0);
    expect(store.instagramFeed().length).toBeGreaterThan(0);
  });
});
