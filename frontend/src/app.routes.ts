import { Routes } from '@angular/router';
import { HomeComponent } from '@/features/home/components/home.component';
import { CategoryComponent } from '@/features/catalog/components/category.component';
import { NewCollectionComponent } from '@/features/catalog/components/new-collection.component';
import { SearchResultsComponent } from '@/features/search/components/search-results.component';
import { CheckoutComponent } from '@/features/checkout/components/checkout.component';
import { LoginComponent } from '@/features/auth/components/login.component';
import { ContactComponent } from '@/features/contact/components/contact.component';
import { PoliciesComponent } from '@/features/policies/components/policies.component';
import { ProductDetailComponent } from '@/features/product/components/product-detail.component';
import { RegisterComponent } from '@/features/auth/components/register.component';
import { ConfirmEmailComponent } from '@/features/auth/components/confirm-email.component';
import { AdminDashboardComponent } from '@/features/admin/components/admin-dashboard.component';
import { OrdersComponent } from '@/features/orders/components/orders.component';

import { adminGuard } from '@/core/guards/admin.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'collections/:slug', component: CategoryComponent },
    { path: 'new-collection', component: NewCollectionComponent },
    { path: 'product/:id', component: ProductDetailComponent },
    { path: 'search', component: SearchResultsComponent },
    { path: 'checkout', component: CheckoutComponent },
    { path: 'orders', component: OrdersComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'confirm-email', component: ConfirmEmailComponent },
    { path: 'contact', component: ContactComponent },
    { path: 'policies', component: PoliciesComponent },
    { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
    { path: '**', redirectTo: '' }
];
