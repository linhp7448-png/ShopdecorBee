using HomeDecorShop.Application;
using HomeDecorShop.Domain;

namespace HomeDecorShop.Infrastructure;

public sealed class SqlFeedbackRepository : IFeedbackRepository
{
    private readonly AppDbContext _context;

    public SqlFeedbackRepository(AppDbContext context)
    {
        _context = context;
    }

    public IReadOnlyCollection<Feedback> GetAll()
    {
        return _context.Feedbacks
            .OrderByDescending(feedback => feedback.CreatedAt)
            .ToList();
    }

    public Feedback? GetById(int feedbackId)
    {
        return _context.Feedbacks
            .FirstOrDefault(feedback => feedback.FeedbackId == feedbackId);
    }

    public Feedback Create(Feedback feedback)
    {
        _context.Feedbacks.Add(feedback);
        _context.SaveChanges();
        return feedback;
    }

    public Feedback? Update(Feedback feedback)
    {
        var existing = GetById(feedback.FeedbackId);
        if (existing is null)
        {
            return null;
        }

        _context.Entry(existing).CurrentValues.SetValues(feedback);
        _context.SaveChanges();
        return existing;
    }

    public bool Delete(int feedbackId)
    {
        var feedback = GetById(feedbackId);
        if (feedback is null)
        {
            return false;
        }

        _context.Feedbacks.Remove(feedback);
        _context.SaveChanges();
        return true;
    }
}
