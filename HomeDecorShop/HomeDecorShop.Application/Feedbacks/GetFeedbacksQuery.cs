using HomeDecorShop.Domain;

namespace HomeDecorShop.Application.Feedbacks;

public record GetFeedbacksQuery();

public sealed class GetFeedbacksHandler(IFeedbackRepository repository)
{
    public IReadOnlyCollection<FeedbackView> Handle(GetFeedbacksQuery query)
    {
        return repository
            .GetAll()
            .Select(feedback => new FeedbackView(
                feedback.FeedbackId,
                feedback.Name,
                feedback.Email,
                feedback.Message,
                feedback.CreatedAt))
            .ToArray();
    }
}
