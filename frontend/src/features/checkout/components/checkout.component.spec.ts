import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { CheckoutComponent } from './checkout.component';
import { flushCatalogBootstrapRequests } from '@/testing/catalog-test.utils';

describe('CheckoutComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('creates the checkout feature shell', () => {
    const fixture = TestBed.createComponent(CheckoutComponent);
    flushCatalogBootstrapRequests(httpMock);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
