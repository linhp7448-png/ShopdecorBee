using HomeDecorShop.Domain;

namespace HomeDecorShop.Application;

public interface IUserRepository
{
    IReadOnlyCollection<User> GetAll();
    User? GetById(int userId);
    User? GetByEmail(string email);
    User? GetByToken(string token);
    User Create(User user);
    User? Update(User user);
    bool Delete(int userId);
    IReadOnlyCollection<User> GetAdmins();
}
