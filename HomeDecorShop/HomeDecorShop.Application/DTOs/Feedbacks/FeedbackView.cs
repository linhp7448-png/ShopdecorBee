namespace HomeDecorShop.Application;

public sealed record FeedbackView(
    int FeedbackId,
    string Name,
    string Email,
    string Message,
    DateTime CreatedAt,
    string? AdminReply = null,
    DateTime? RepliedAt = null);
