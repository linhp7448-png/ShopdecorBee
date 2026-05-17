using System.Globalization;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using HomeDecorShop.Application;
using HomeDecorShop.API.Payments;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Swashbuckle.AspNetCore.Annotations;

namespace HomeDecorShop.API.Controllers;

[ApiController]
[Authorize]
[Route("api/wallet")]
[SwaggerTag("Wallet endpoints for balance management.")]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
public sealed class WalletController(
    IWalletService walletService,
    IOptions<VnPayOptions> vnPayOptions) : ApiControllerBase
{
    [HttpGet]
    [SwaggerOperation(Summary = "Get wallet", Description = "Returns the authenticated user's wallet (creates one if not exists).")]
    [ProducesResponseType(typeof(WalletView), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public ActionResult<WalletView> Get()
    {
        return Ok(walletService.GetOrCreate(ReadRequiredToken()));
    }

    [HttpGet("transactions")]
    [SwaggerOperation(Summary = "List wallet transactions", Description = "Returns all wallet transactions of the authenticated user.")]
    [ProducesResponseType(typeof(WalletTransactionView[]), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public ActionResult<IReadOnlyCollection<WalletTransactionView>> GetTransactions()
    {
        return Ok(walletService.GetTransactions(ReadRequiredToken()));
    }

    [HttpPost("deposit/vnpay/url")]
    [SwaggerOperation(Summary = "Create VNPay deposit URL", Description = "Creates a VNPay payment URL to deposit funds into the wallet.")]
    [ProducesResponseType(typeof(WalletDepositUrlResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public ActionResult<WalletDepositUrlResult> CreateDepositUrl([FromBody] WalletDepositInput input)
    {
        if (input.Amount <= 0)
            return BadRequest(new { message = "Số tiền nạp phải lớn hơn 0." });
        if (input.Amount < 1000)
            return BadRequest(new { message = "Số tiền nạp tối thiểu là 1.000 VND." });

        var options = vnPayOptions.Value;
        var token = ReadRequiredToken();

        var now = DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromHours(7));
        var txnRef = $"WDEP{now:yyyyMMddHHmmss}{new Random().Next(1000, 9999)}";

        var reference = walletService.CreatePendingDeposit(token, input.Amount, txnRef);

        var returnUrl = string.IsNullOrWhiteSpace(options.WalletDepositReturnUrl)
            ? options.ReturnUrl
            : options.WalletDepositReturnUrl;

        var paymentUrl = BuildVnPayUrl(options, txnRef, input.Amount, $"Nap tien vao vi: {txnRef}", returnUrl, GetClientIp());

        return Ok(new WalletDepositUrlResult(reference, paymentUrl));
    }

    [AllowAnonymous]
    [HttpGet("deposit/vnpay/return")]
    [SwaggerOperation(Summary = "Handle VNPay wallet deposit callback")]
    public IActionResult HandleDepositReturn()
    {
        var options = vnPayOptions.Value;
        var query = HttpContext.Request.Query;
        var txnRef = query["vnp_TxnRef"].ToString();
        var responseCode = query["vnp_ResponseCode"].ToString();
        var transactionStatus = query["vnp_TransactionStatus"].ToString();
        var amountStr = query["vnp_Amount"].ToString();

        // In VNPay sandbox, responseCode "00" means success
        var isSuccess = string.Equals(responseCode, "00", StringComparison.Ordinal);

        Console.WriteLine($"[WalletDeposit] txnRef={txnRef} responseCode={responseCode} txnStatus={transactionStatus} amount={amountStr} isSuccess={isSuccess}");

        if (isSuccess && long.TryParse(amountStr, out var amountInt))
        {
            var amount = amountInt / 100m;
            try
            {
                walletService.ConfirmDeposit(txnRef, amount);
                Console.WriteLine($"[WalletDeposit] SUCCESS - Confirmed deposit txnRef={txnRef} amount={amount:N0} VND");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[WalletDeposit] ERROR confirming deposit: {ex.Message}");
            }
        }

        var frontendUrl = "http://127.0.0.1:3000";
        var redirectUrl = $"{frontendUrl}?walletDeposit={(isSuccess ? "success" : "failed")}&txn={txnRef}";
        return Redirect(redirectUrl);
    }

    [HttpPost("deposit")]
    [SwaggerOperation(Summary = "Direct deposit (test only)", Description = "Directly adds balance to wallet.")]
    [ProducesResponseType(typeof(WalletView), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public ActionResult<WalletView> Deposit([FromBody] WalletDepositInput input)
    {
        return Ok(walletService.Deposit(ReadRequiredToken(), input.Amount));
    }

    [HttpPost("withdraw")]
    [SwaggerOperation(Summary = "Withdraw from wallet", Description = "Deducts balance from the authenticated user's wallet.")]
    [ProducesResponseType(typeof(WalletView), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public ActionResult<WalletView> Withdraw([FromBody] WalletWithdrawInput input)
    {
        return Ok(walletService.Withdraw(ReadRequiredToken(), input.Amount));
    }

    [HttpPost("pay")]
    [SwaggerOperation(Summary = "Pay order with wallet", Description = "Uses wallet balance to pay for a pending order.")]
    [ProducesResponseType(typeof(WalletView), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public ActionResult<WalletView> PayOrder([FromBody] WalletPayOrderInput input)
    {
        return Ok(walletService.PayOrder(ReadRequiredToken(), input.OrderId));
    }

    // ── VNPay helpers ─────────────────────────────────────────────────────────

    private string BuildVnPayUrl(VnPayOptions opts, string txnRef, decimal amount, string orderInfo, string returnUrl, string ip)
    {
        var now = DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromHours(7));
        var amountInt = decimal.ToInt64(decimal.Round(amount * 100m, 0, MidpointRounding.AwayFromZero));

        var p = new SortedDictionary<string, string>(StringComparer.Ordinal)
        {
            ["vnp_Version"]    = "2.1.0",
            ["vnp_Command"]    = "pay",
            ["vnp_TmnCode"]    = opts.TmnCode,
            ["vnp_Amount"]     = amountInt.ToString(CultureInfo.InvariantCulture),
            ["vnp_CurrCode"]   = "VND",
            ["vnp_TxnRef"]     = txnRef,
            ["vnp_OrderInfo"]  = orderInfo,
            ["vnp_OrderType"]  = opts.OrderType,
            ["vnp_Locale"]     = opts.Locale,
            ["vnp_ReturnUrl"]  = returnUrl,
            ["vnp_IpAddr"]     = ip,
            ["vnp_CreateDate"] = now.ToString("yyyyMMddHHmmss", CultureInfo.InvariantCulture),
            ["vnp_ExpireDate"] = now.AddMinutes(15).ToString("yyyyMMddHHmmss", CultureInfo.InvariantCulture)
        };

        var query = string.Join("&", p.Select(kv => $"{kv.Key}={WebUtility.UrlEncode(kv.Value)}"));
        var hash  = ComputeHmacSha512(opts.HashSecret, query);
        return $"{opts.PaymentUrl}?{query}&vnp_SecureHash={hash}";
    }

    private static string BuildRawHashData(QueryString rawQuery)
    {
        var raw = rawQuery.Value?.TrimStart('?') ?? "";
        return string.Join("&", raw
            .Split('&', StringSplitOptions.RemoveEmptyEntries)
            .Select(seg =>
            {
                var idx = seg.IndexOf('=');
                if (idx < 0) return (key: seg, val: "");
                return (key: seg[..idx], val: WebUtility.UrlDecode(seg[(idx + 1)..]) ?? "");
            })
            .Where(x => x.key.StartsWith("vnp_", StringComparison.Ordinal))
            .Where(x => !string.Equals(x.key, "vnp_SecureHash", StringComparison.OrdinalIgnoreCase))
            .Where(x => !string.Equals(x.key, "vnp_SecureHashType", StringComparison.OrdinalIgnoreCase))
            .Where(x => !string.IsNullOrWhiteSpace(x.val))
            .OrderBy(x => x.key, StringComparer.Ordinal)
            .Select(x => $"{x.key}={x.val}"));
    }

    private static string ComputeHmacSha512(string secret, string data)
    {
        var key   = Encoding.UTF8.GetBytes(secret);
        var input = Encoding.UTF8.GetBytes(data);
        using var hmac = new HMACSHA512(key);
        return Convert.ToHexString(hmac.ComputeHash(input)).ToLowerInvariant();
    }

    private string GetClientIp()
    {
        var fwd = HttpContext.Request.Headers["X-Forwarded-For"].ToString().Split(',').FirstOrDefault()?.Trim();
        if (!string.IsNullOrWhiteSpace(fwd)) return fwd;
        var real = HttpContext.Request.Headers["X-Real-IP"].ToString();
        if (!string.IsNullOrWhiteSpace(real)) return real;
        return HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString() ?? "127.0.0.1";
    }
}

public sealed record WalletDepositUrlResult(string Reference, string PaymentUrl);
