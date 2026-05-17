using HomeDecorShop.Domain;

namespace HomeDecorShop.Application;

public sealed class FeedbackService(IFeedbackRepository repository) : IFeedbackService
{
    public IReadOnlyCollection<FeedbackView> GetAll() =>
        repository.GetAll().Select(MapFeedback).ToArray();

    public FeedbackView? GetById(int feedbackId)
    {
        var feedback = repository.GetById(feedbackId);
        return feedback is null ? null : MapFeedback(feedback);
    }

    public FeedbackView Create(FeedbackUpsertInput input)
    {
        var created = repository.Create(new Feedback(
            0,
            input.Name.Trim(),
            input.Email.Trim().ToLowerInvariant(),
            input.Message.Trim(),
            DateTime.UtcNow));

        return MapFeedback(created);
    }

    public FeedbackView? Update(int feedbackId, FeedbackUpsertInput input)
    {
        var existing = repository.GetById(feedbackId);
        if (existing is null)
        {
            return null;
        }

        var updated = repository.Update(new Feedback(
            feedbackId,
            input.Name.Trim(),
            input.Email.Trim().ToLowerInvariant(),
            input.Message.Trim(),
            existing.CreatedAt));

        return updated is null ? null : MapFeedback(updated);
    }

    public FeedbackView? Reply(int feedbackId, string replyContent)
    {
        var existing = repository.GetById(feedbackId);
        if (existing is null)
        {
            return null;
        }

        var replied = repository.Update(existing with
        {
            AdminReply = replyContent.Trim(),
            RepliedAt = DateTime.UtcNow
        });

        return replied is null ? null : MapFeedback(replied);
    }

    public bool Delete(int feedbackId) => repository.Delete(feedbackId);

    private static FeedbackView MapFeedback(Feedback feedback) =>
        new(
            feedback.FeedbackId,
            feedback.Name,
            feedback.Email,
            feedback.Message,
            feedback.CreatedAt,
            feedback.AdminReply,
            feedback.RepliedAt);
}
