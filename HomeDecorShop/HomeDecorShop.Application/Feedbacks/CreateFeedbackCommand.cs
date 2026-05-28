using HomeDecorShop.Domain;

namespace HomeDecorShop.Application.Feedbacks;

public record CreateFeedbackCommand(string Name, string Email, string Message);

public sealed class CreateFeedbackHandler(IFeedbackRepository repository)
{
    public FeedbackView Handle(CreateFeedbackCommand command)
    {
        var feedback = new Feedback(
            0,
            command.Name.Trim(),
            command.Email.Trim().ToLower(),
            command.Message.Trim(),
            DateTime.UtcNow);

        var created = repository.Create(feedback);
        return MapFeedback(created);
    }

    private static FeedbackView MapFeedback(Feedback feedback) =>
        new(
            feedback.FeedbackId,
            feedback.Name,
            feedback.Email,
            feedback.Message,
            feedback.CreatedAt);
}
