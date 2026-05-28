using HomeDecorShop.Domain;

namespace HomeDecorShop.Application;

public interface IFeedbackRepository
{
    IReadOnlyCollection<Feedback> GetAll();
    Feedback? GetById(int feedbackId);
    Feedback Create(Feedback feedback);
    Feedback? Update(Feedback feedback);
    bool Delete(int feedbackId);
}
