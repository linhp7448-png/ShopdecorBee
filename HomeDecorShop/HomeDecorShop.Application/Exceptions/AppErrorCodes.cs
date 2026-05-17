namespace HomeDecorShop.Application;

public static class AppErrorCodes
{
    public const string ValidationFailed = "validation_failed";
    public const string ResourceNotFound = "resource_not_found";
    public const string Unauthorized = "unauthorized";
    public const string Forbidden = "forbidden";
    public const string Conflict = "conflict";
    public const string InternalServerError = "internal_server_error";

    public const string AuthTokenRequired = "auth_token_required";
    public const string AuthTokenInvalid = "auth_token_invalid";
    public const string InvalidCredentials = "invalid_credentials";
    public const string EmailAlreadyExists = "email_already_exists";
    public const string EmailNotConfirmed = "email_not_confirmed";
    public const string EmailConfirmationTokenInvalid = "email_confirmation_token_invalid";

    public const string ProductNotFound = "product_not_found";
    public const string ProductInactive = "product_inactive";
    public const string ProductOutOfStock = "product_out_of_stock";
    public const string ProductStockExceeded = "product_stock_exceeded";
    public const string ProductOriginalPriceInvalid = "product_original_price_invalid";
    public const string ProductSkuAlreadyExists = "product_sku_already_exists";
    public const string ProductSlugAlreadyExists = "product_slug_already_exists";

    public const string CategoryInvalid = "category_invalid";
    public const string CategoryNotFound = "category_not_found";
    public const string CategoryInactive = "category_inactive";
    public const string CategoryNameAlreadyExists = "category_name_already_exists";
    public const string CategorySlugAlreadyExists = "category_slug_already_exists";
    public const string CategoryHasProducts = "category_has_products";
    public const string CategoryHasActiveProducts = "category_has_active_products";
    public const string CategoryGroupInvalid = "category_group_invalid";
    public const string CategoryGroupInactive = "category_group_inactive";

    public const string CartEmpty = "cart_empty";
    public const string CartItemNotFound = "cart_item_not_found";

    public const string PaymentNotFound = "payment_not_found";
    public const string PaymentGatewayConfigInvalid = "payment_gateway_config_invalid";
    public const string PaymentGatewaySignatureInvalid = "payment_gateway_signature_invalid";
    public const string PaymentGatewayCallbackInvalid = "payment_gateway_callback_invalid";
    public const string PaymentGatewayAmountInvalid = "payment_gateway_amount_invalid";

    public const string ShippingAddressInvalid = "shipping_address_invalid";
    public const string ShippingInfoRequired = "shipping_info_required";
    public const string OrderNotFound = "order_not_found";
    public const string OrderCannotBeCancelled = "order_cannot_be_cancelled";
    public const string OrderCancelled = "order_cancelled";
    public const string OrderAlreadyPaid = "order_already_paid";
    public const string OrderPaymentNotPending = "order_payment_not_pending";

    public const string RequestValidationFailed = "request_validation_failed";

    public const string WalletInsufficientBalance = "wallet_insufficient_balance";
    public const string WalletTransactionNotFound = "wallet_transaction_not_found";
}
