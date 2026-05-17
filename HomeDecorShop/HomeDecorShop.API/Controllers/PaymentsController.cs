using System.Globalization;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using HomeDecorShop.API.Payments;
using HomeDecorShop.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Swashbuckle.AspNetCore.Annotations;

namespace HomeDecorShop.API.Controllers;

[ApiController]
[Authorize]
[Route("api/payments")]
[SwaggerTag("Payment processing endpoints for the currently authenticated user.")]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
public sealed class PaymentsController(
    IPaymentService paymentService,
    IOptions<VnPayOptions> vnPayOptions) : ApiControllerBase
{
    [HttpGet]
    [SwaggerOperation(
        Summary = "List current user payments",
        Description = "Returns all payment attempts of the authenticated user ordered by newest first.")]
    [ProducesResponseType(typeof(PaymentView[]), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public ActionResult<IReadOnlyCollection<PaymentView>> GetMine()
    {
        return Ok(paymentService.GetMine(ReadRequiredToken()));
    }

    [HttpGet("{id:int}")]
    [SwaggerOperation(
        Summary = "Get a payment by id",
        Description = "Returns a single payment owned by the authenticated user.")]
    [ProducesResponseType(typeof(PaymentView), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public ActionResult<PaymentView> GetById(int id)
    {
        return Ok(RequireResource(paymentService.GetById(ReadRequiredToken(), id), $"Payment with id {id} was not found."));
    }

    [HttpGet("order/{orderId:int}")]
    [SwaggerOperation(
        Summary = "List payments by order",
        Description = "Returns all payment attempts for a specific order owned by the authenticated user.")]
    [ProducesResponseType(typeof(PaymentView[]), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public ActionResult<IReadOnlyCollection<PaymentView>> GetByOrderId(int orderId)
    {
        return Ok(paymentService.GetByOrderId(ReadRequiredToken(), orderId));
    }

    [HttpPost]
    [SwaggerOperation(
        Summary = "Process a payment",
        Description = "Simulates a payment for an order in pending payment state and marks the order as paid.")]
    [ProducesResponseType(typeof(PaymentView), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public ActionResult<PaymentView> Process([FromBody] PaymentProcessInput input)
    {
        var created = paymentService.Process(ReadRequiredToken(), input);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPost("vnpay/url")]
    [SwaggerOperation(
        Summary = "Create VNPay checkout URL",
        Description = "Creates a pending VNPay payment transaction and returns a signed checkout URL.")]
    [ProducesResponseType(typeof(VnPayCreateUrlApiResult), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public ActionResult<VnPayCreateUrlApiResult> CreateVnPayUrl([FromBody] VnPayCreateUrlInput input)
    {
        var options = RequireVnPayOptions();
        var created = paymentService.CreateVnPayPayment(ReadRequiredToken(), input);
        var paymentUrl = BuildVnPayPaymentUrl(options, created);
        var response = new VnPayCreateUrlApiResult(
            created.PaymentId,
            created.OrderId,
            created.OrderNumber,
            created.Amount,
            created.TransactionCode,
            created.CreatedAt,
            paymentUrl);

        return CreatedAtAction(nameof(GetById), new { id = response.PaymentId }, response);
    }

    [AllowAnonymous]
    [HttpGet("vnpay/return")]
    [SwaggerOperation(
        Summary = "Handle VNPay return callback",
        Description = "Validates VNPay callback signature and updates payment/order status based on response data.")]
    [ProducesResponseType(typeof(VnPayHandleCallbackResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public IActionResult HandleVnPayReturn()
    {
        var options = RequireVnPayOptions();
        var callbackInput = BuildCallbackInputFromQuery(options);
        var result = paymentService.HandleVnPayCallback(callbackInput);

        if (TryBuildFrontEndReturnUrl(options.FrontendReturnUrl, result, out var redirectUrl))
        {
            return Redirect(redirectUrl);
        }

        return Ok(result);
    }

    [AllowAnonymous]
    [HttpGet("vnpay/ipn")]
    [SwaggerOperation(
        Summary = "Handle VNPay IPN callback",
        Description = "Acknowledges server-to-server VNPay IPN notifications with VNPay-compatible response codes.")]
    [ProducesResponseType(typeof(VnPayIpnResponse), StatusCodes.Status200OK)]
    public ActionResult<VnPayIpnResponse> HandleVnPayIpn()
    {
        try
        {
            var options = RequireVnPayOptions();
            var callbackInput = BuildCallbackInputFromQuery(options);
            _ = paymentService.HandleVnPayCallback(callbackInput);
            return Ok(new VnPayIpnResponse("00", "Confirm Success"));
        }
        catch (RequestValidationException ex) when (ex.Code == AppErrorCodes.PaymentGatewaySignatureInvalid)
        {
            return Ok(new VnPayIpnResponse("97", "Invalid signature"));
        }
        catch (RequestValidationException)
        {
            return Ok(new VnPayIpnResponse("99", "Invalid callback data"));
        }
        catch (NotFoundException)
        {
            return Ok(new VnPayIpnResponse("01", "Transaction not found"));
        }
        catch (ConflictException ex) when (ex.Code == AppErrorCodes.PaymentGatewayAmountInvalid)
        {
            return Ok(new VnPayIpnResponse("04", "Invalid amount"));
        }
        catch (ConflictException)
        {
            return Ok(new VnPayIpnResponse("02", "Order state is not valid"));
        }
        catch
        {
            return Ok(new VnPayIpnResponse("99", "Unknown error"));
        }
    }

    private VnPayOptions RequireVnPayOptions()
    {
        var options = vnPayOptions.Value;
        var errors = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase);

        if (string.IsNullOrWhiteSpace(options.TmnCode))
        {
            errors["tmnCode"] = ["VNPay terminal code is required."];
        }
        else if (IsPlaceholder(options.TmnCode))
        {
            errors["tmnCode"] = ["VNPay terminal code must be replaced with a real merchant terminal code."];
        }

        if (string.IsNullOrWhiteSpace(options.HashSecret))
        {
            errors["hashSecret"] = ["VNPay hash secret is required."];
        }
        else if (IsPlaceholder(options.HashSecret))
        {
            errors["hashSecret"] = ["VNPay hash secret must be replaced with a real merchant secret."];
        }

        if (!Uri.TryCreate(options.PaymentUrl, UriKind.Absolute, out var paymentUrl) ||
            !string.Equals(paymentUrl.Scheme, Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase))
        {
            errors["paymentUrl"] = ["VNPay payment URL must be a valid HTTPS absolute URL."];
        }

        if (!Uri.TryCreate(options.ReturnUrl, UriKind.Absolute, out var returnUrl) ||
            !string.Equals(returnUrl.Scheme, Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase))
        {
            errors["returnUrl"] = ["VNPay return URL must be a valid HTTPS absolute URL."];
        }
        else if (returnUrl.IsLoopback || IsPlaceholder(options.ReturnUrl))
        {
            errors["returnUrl"] = ["VNPay return URL must be a public HTTPS URL and cannot use placeholders or localhost."];
        }

        if (errors.Count > 0)
        {
            throw new RequestValidationException(
                "VNPay configuration is invalid.",
                errors,
                AppErrorCodes.PaymentGatewayConfigInvalid);
        }

        return options;
    }

    private string BuildVnPayPaymentUrl(VnPayOptions options, VnPayCreateUrlResult created)
    {
        var createdAt = DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromHours(7));
        var expiresAt = createdAt.AddMinutes(15);
        var amount = decimal.ToInt64(decimal.Round(created.Amount * 100m, 0, MidpointRounding.AwayFromZero));

        var parameters = new SortedDictionary<string, string>(StringComparer.Ordinal)
        {
            ["vnp_Version"] = "2.1.0",
            ["vnp_Command"] = "pay",
            ["vnp_TmnCode"] = options.TmnCode,
            ["vnp_Amount"] = amount.ToString(CultureInfo.InvariantCulture),
            ["vnp_CurrCode"] = "VND",
            ["vnp_TxnRef"] = created.TransactionCode,
            ["vnp_OrderInfo"] = $"Thanh toan don hang {created.OrderId}",
            ["vnp_OrderType"] = options.OrderType,
            ["vnp_Locale"] = options.Locale,
            ["vnp_ReturnUrl"] = options.ReturnUrl,
            ["vnp_IpAddr"] = GetRequestIp(),
            ["vnp_CreateDate"] = createdAt.ToString("yyyyMMddHHmmss", CultureInfo.InvariantCulture),
            ["vnp_ExpireDate"] = expiresAt.ToString("yyyyMMddHHmmss", CultureInfo.InvariantCulture)
        };

        var query = BuildSignedQuery(parameters);
        var secureHash = ComputeHmacSha512(options.HashSecret, query);
        return $"{options.PaymentUrl}?{query}&vnp_SecureHash={secureHash}";
    }

    private VnPayHandleCallbackInput BuildCallbackInputFromQuery(VnPayOptions options)
    {
        var query = HttpContext.Request.Query;
        ValidateVnPaySignature(options, HttpContext.Request.QueryString, query);

        var transactionCode = query["vnp_TxnRef"].ToString();
        var responseCode = query["vnp_ResponseCode"].ToString();
        var amountText = query["vnp_Amount"].ToString();

        var errors = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase);
        if (string.IsNullOrWhiteSpace(transactionCode))
        {
            errors["vnp_TxnRef"] = ["Missing transaction code from VNPay callback."];
        }

        if (string.IsNullOrWhiteSpace(responseCode))
        {
            errors["vnp_ResponseCode"] = ["Missing response code from VNPay callback."];
        }

        if (!long.TryParse(amountText, NumberStyles.None, CultureInfo.InvariantCulture, out var amount) || amount <= 0)
        {
            errors["vnp_Amount"] = ["Missing or invalid amount from VNPay callback."];
        }

        if (errors.Count > 0)
        {
            throw new RequestValidationException(
                "VNPay callback payload is invalid.",
                errors,
                AppErrorCodes.PaymentGatewayCallbackInvalid);
        }

        return new VnPayHandleCallbackInput
        {
            TransactionCode = transactionCode,
            ResponseCode = responseCode,
            Amount = amount,
            TransactionStatus = query["vnp_TransactionStatus"].ToString(),
            GatewayTransactionCode = query["vnp_TransactionNo"].ToString()
        };
    }

    private static void ValidateVnPaySignature(VnPayOptions options, QueryString rawQueryString, IQueryCollection query)
    {
        var providedHash = query["vnp_SecureHash"].ToString();
        if (string.IsNullOrWhiteSpace(providedHash))
        {
            throw new RequestValidationException(
                "VNPay secure hash is missing.",
                new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase)
                {
                    ["vnp_SecureHash"] = ["Missing signature in callback query."]
                },
                AppErrorCodes.PaymentGatewaySignatureInvalid);
        }

        var hashData = BuildRawCallbackHashData(rawQueryString);
        var computedHash = ComputeHmacSha512(options.HashSecret, hashData);
        if (!string.Equals(providedHash, computedHash, StringComparison.OrdinalIgnoreCase))
        {
            throw new RequestValidationException(
                "VNPay secure hash is invalid.",
                new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase)
                {
                    ["vnp_SecureHash"] = ["Invalid VNPay callback signature."]
                },
                AppErrorCodes.PaymentGatewaySignatureInvalid);
        }
    }

    private static string BuildRawCallbackHashData(QueryString rawQueryString)
    {
        var rawValue = rawQueryString.Value?.TrimStart('?');
        if (string.IsNullOrWhiteSpace(rawValue))
        {
            return string.Empty;
        }

        return string.Join(
            "&",
            rawValue
                .Split('&', StringSplitOptions.RemoveEmptyEntries)
                .Select(segment =>
                {
                    var separatorIndex = segment.IndexOf('=');
                    if (separatorIndex < 0)
                    {
                        return new KeyValuePair<string, string>(segment, string.Empty);
                    }

                    var key = segment[..separatorIndex];
                    var value = separatorIndex == segment.Length - 1
                        ? string.Empty
                        : segment[(separatorIndex + 1)..];

                    return new KeyValuePair<string, string>(key, value);
                })
                .Where(pair => pair.Key.StartsWith("vnp_", StringComparison.Ordinal))
                .Where(pair => !string.Equals(pair.Key, "vnp_SecureHash", StringComparison.OrdinalIgnoreCase))
                .Where(pair => !string.Equals(pair.Key, "vnp_SecureHashType", StringComparison.OrdinalIgnoreCase))
                .Where(pair => !string.IsNullOrWhiteSpace(pair.Value))
                .OrderBy(pair => pair.Key, StringComparer.Ordinal)
                .Select(pair => $"{pair.Key}={pair.Value}"));
    }

    private string GetRequestIp()
    {
        var forwardedIp = HttpContext.Request.Headers["X-Forwarded-For"].ToString()
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(forwardedIp))
        {
            return forwardedIp;
        }

        var realIp = HttpContext.Request.Headers["X-Real-IP"].ToString();
        if (!string.IsNullOrWhiteSpace(realIp))
        {
            return realIp;
        }

        var ip = HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString();
        return string.IsNullOrWhiteSpace(ip) ? "127.0.0.1" : ip;
    }

    private static bool TryBuildFrontEndReturnUrl(
        string? frontEndReturnUrl,
        VnPayHandleCallbackResult result,
        out string redirectUrl)
    {
        redirectUrl = string.Empty;

        if (string.IsNullOrWhiteSpace(frontEndReturnUrl) ||
            !Uri.TryCreate(frontEndReturnUrl, UriKind.Absolute, out var frontEndUri) ||
            (!string.Equals(frontEndUri.Scheme, Uri.UriSchemeHttp, StringComparison.OrdinalIgnoreCase) &&
             !string.Equals(frontEndUri.Scheme, Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase)))
        {
            return false;
        }

        var query = QueryString.Create(new[]
        {
            new KeyValuePair<string, string?>("payment", result.IsSuccess ? "success" : "failed"),
            new KeyValuePair<string, string?>("orderId", result.OrderId.ToString(CultureInfo.InvariantCulture)),
            new KeyValuePair<string, string?>("orderNumber", result.OrderNumber),
            new KeyValuePair<string, string?>("responseCode", result.ResponseCode)
        });

        var builder = new UriBuilder(frontEndUri)
        {
            Query = query.Value?.TrimStart('?')
        };

        redirectUrl = builder.Uri.ToString();
        return true;
    }

    private static string BuildSignedQuery(IEnumerable<KeyValuePair<string, string>> parameters)
    {
        return string.Join(
            "&",
            parameters
                .OrderBy(pair => pair.Key, StringComparer.Ordinal)
                .Select(pair => $"{pair.Key}={WebUtility.UrlEncode(pair.Value)}"));
    }

    private static string ComputeHmacSha512(string secret, string data)
    {
        var keyBytes = Encoding.UTF8.GetBytes(secret);
        var inputBytes = Encoding.UTF8.GetBytes(data);

        using var hmac = new HMACSHA512(keyBytes);
        var hashBytes = hmac.ComputeHash(inputBytes);
        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }

    private static bool IsPlaceholder(string value) =>
        value.Contains("YOUR_", StringComparison.OrdinalIgnoreCase) ||
        value.Contains("<", StringComparison.OrdinalIgnoreCase) ||
        value.Contains("CHANGEME", StringComparison.OrdinalIgnoreCase);
}

public sealed record VnPayCreateUrlApiResult(
    int PaymentId,
    int OrderId,
    string OrderNumber,
    decimal Amount,
    string TransactionCode,
    DateTime CreatedAt,
    string PaymentUrl);

public sealed record VnPayIpnResponse(string RspCode, string Message);
