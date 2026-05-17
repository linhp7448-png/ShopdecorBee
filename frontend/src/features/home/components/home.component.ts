import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeroComponent } from './hero.component';
import { TrustBarComponent } from './trust-bar.component';
import { CategoriesComponent } from './categories.component';
import { ShopLookComponent } from './shop-look.component';
import { FlashSaleComponent } from './flash-sale.component';
import { TrendingComponent } from './trending.component';
import { BrandStoryComponent } from './brand-story.component';
import { NewArrivalsComponent } from './new-arrivals.component';
import { SocialProofComponent } from './social-proof.component';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        HeroComponent,
        TrustBarComponent,
        CategoriesComponent,
        ShopLookComponent,
        FlashSaleComponent,
        TrendingComponent,
        BrandStoryComponent,
        NewArrivalsComponent,
        SocialProofComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <!-- 1. Hero Banner -->
    <app-hero></app-hero>
    
    <!-- 2. Thanh Cam Kết -->
    <app-trust-bar></app-trust-bar>
    
    <!-- 3. Danh mục -->
    <app-categories></app-categories>
    
    <!-- 4. Shop The Look -->
    <app-shop-look></app-shop-look>
    
    <!-- 5. Deal Mật Ngọt -->
    <app-flash-sale id="flash-sale"></app-flash-sale>
    
    <!-- 6. Góc Tổ Ong -->
    <app-trending></app-trending>
    
    <!-- 7. Chuyện Nhà Bee -->
    <app-brand-story></app-brand-story>
    
    <!-- 8. Mới Về Tổ -->
    <app-new-arrivals></app-new-arrivals>
    
    <!-- 9. Feedback -->
    <app-social-proof></app-social-proof>
  `
})
export class HomeComponent { }
