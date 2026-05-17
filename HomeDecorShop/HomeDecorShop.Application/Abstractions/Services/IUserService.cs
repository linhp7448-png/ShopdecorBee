using HomeDecorShop.Domain;

namespace HomeDecorShop.Application;

public interface IUserService
{
    IReadOnlyCollection<UserView> GetAll();
    UserView? GetById(int userId);
    AuthResult Register(RegisterUserInput input);
    AuthResult? Login(LoginInput input);
    UserView? GetByToken(string token);
    UserView? UpdateProfile(string token, UpdateProfileInput input);
    IReadOnlyCollection<AddressView>? GetAddresses(string token);
    AddressView? GetAddressById(string token, int addressId);
    AddressView? AddAddress(string token, UpsertAddressInput input);
    AddressView? UpdateAddress(string token, int addressId, UpsertAddressInput input);
    bool DeleteAddress(string token, int addressId);
    bool ConfirmEmail(string token);
    bool UpdateRole(int userId, UserRole role);
    bool ToggleStatus(int userId);
    bool Delete(int userId);
}
