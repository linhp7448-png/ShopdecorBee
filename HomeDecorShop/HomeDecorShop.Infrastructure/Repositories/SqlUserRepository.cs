using HomeDecorShop.Application;
using HomeDecorShop.Domain;
using Microsoft.EntityFrameworkCore;

namespace HomeDecorShop.Infrastructure;

public sealed class SqlUserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public SqlUserRepository(AppDbContext context)
    {
        _context = context;
    }

    public IReadOnlyCollection<User> GetAll()
    {
        return QueryUsers().ToList();
    }

    public User? GetById(int id)
    {
        return QueryUsers().FirstOrDefault(user => user.UserId == id);
    }

    public User? GetByEmail(string email)
    {
        return QueryUsers().FirstOrDefault(user => user.Email == email.ToLower());
    }

    public User? GetByToken(string token)
    {
        return QueryUsers().FirstOrDefault(user => user.CurrentToken == token);
    }

    public User Create(User user)
    {
        user.Email = user.Email.ToLower();
        _context.Users.Add(user);
        _context.SaveChanges();
        return user;
    }

    public User? Update(User user)
    {
        _context.Users.Update(user);
        _context.SaveChanges();
        return user;
    }

    public bool Delete(int userId)
    {
        var user = GetById(userId);
        if (user is null)
        {
            return false;
        }

        _context.Users.Remove(user);
        _context.SaveChanges();
        return true;
    }

    private IQueryable<User> QueryUsers()
    {
        return _context.Users.Include(user => user.Addresses);
    }

    public IReadOnlyCollection<User> GetAdmins()
    {
        return QueryUsers().Where(u => u.Role == UserRole.Admin).ToList();
    }
}
