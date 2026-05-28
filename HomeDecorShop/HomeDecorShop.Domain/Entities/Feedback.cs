namespace HomeDecorShop.Domain;

public sealed record Feedback(
    int FeedbackId,
    string Name,
    string Email,
    string Message,
    DateTime CreatedAt,
    string? AdminReply = null,
    DateTime? RepliedAt = null);
