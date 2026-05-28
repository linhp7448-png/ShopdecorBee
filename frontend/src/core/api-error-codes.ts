export const apiErrorCodes = {
  validationFailed: 'validation_failed',
  resourceNotFound: 'resource_not_found',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  conflict: 'conflict',
  internalServerError: 'internal_server_error',
  authTokenRequired: 'auth_token_required',
  authTokenInvalid: 'auth_token_invalid',
  invalidCredentials: 'invalid_credentials',
  emailAlreadyExists: 'email_already_exists',
  emailNotConfirmed: 'email_not_confirmed',
  emailConfirmationTokenInvalid: 'email_confirmation_token_invalid',
  productNotFound: 'product_not_found',
  productInactive: 'product_inactive',
  productOutOfStock: 'product_out_of_stock',
  productStockExceeded: 'product_stock_exceeded',
  productOriginalPriceInvalid: 'product_original_price_invalid',
  productSkuAlreadyExists: 'product_sku_already_exists',
  productSlugAlreadyExists: 'product_slug_already_exists',
  categoryInvalid: 'category_invalid',
  categoryNotFound: 'category_not_found',
  categoryInactive: 'category_inactive',
  categoryNameAlreadyExists: 'category_name_already_exists',
  categorySlugAlreadyExists: 'category_slug_already_exists',
  categoryHasProducts: 'category_has_products',
  categoryHasActiveProducts: 'category_has_active_products',
  cartEmpty: 'cart_empty',
  cartItemNotFound: 'cart_item_not_found',
  paymentGatewayConfigInvalid: 'payment_gateway_config_invalid',
  paymentGatewaySignatureInvalid: 'payment_gateway_signature_invalid',
  paymentGatewayCallbackInvalid: 'payment_gateway_callback_invalid',
  paymentGatewayAmountInvalid: 'payment_gateway_amount_invalid',
  shippingAddressInvalid: 'shipping_address_invalid',
  shippingInfoRequired: 'shipping_info_required',
  orderNotFound: 'order_not_found',
  orderCannotBeCancelled: 'order_cannot_be_cancelled',
  orderCancelled: 'order_cancelled',
  orderAlreadyPaid: 'order_already_paid',
  orderPaymentNotPending: 'order_payment_not_pending'
} as const;

export type ApiErrorCode = typeof apiErrorCodes[keyof typeof apiErrorCodes];

const apiErrorCodeSet = new Set<string>(Object.values(apiErrorCodes));

export function isApiErrorCode(value: string): value is ApiErrorCode {
  return apiErrorCodeSet.has(value);
}