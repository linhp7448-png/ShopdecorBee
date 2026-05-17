using HomeDecorShop.Domain;

namespace HomeDecorShop.Application;

public sealed class UserService : IUserService
{
    private readonly IUserRepository _repository;
    private readonly IEmailService _emailService;

    public UserService(IUserRepository repository, IEmailService emailService)
    {
        _repository = repository;
        _emailService = emailService;
    }

    public IReadOnlyCollection<UserView> GetAll() =>
        _repository.GetAll().Select(MapUser).ToArray();

    public UserView? GetById(int userId)
    {
        var user = _repository.GetById(userId);
        return user is null ? null : MapUser(user);
    }

    public AuthResult Register(RegisterUserInput input)
    {
        var normalizedEmail = Normalize(input.Email);
        if (_repository.GetByEmail(normalizedEmail) is not null)
        {
            throw new ConflictException("Email already exists in the system.", AppErrorCodes.EmailAlreadyExists);
        }

        var token = Guid.NewGuid().ToString("N");
        var verifyToken = Guid.NewGuid().ToString("N");

        var user = new User
        {
            Email = normalizedEmail,
            FullName = input.FullName.Trim(),
            Phone = input.Phone?.Trim() ?? string.Empty,
            Role = UserRole.Customer,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(input.Password),
            CreatedAt = DateTime.UtcNow,
            CurrentToken = token,
            Addresses = new List<Address>(),
            IsEmailConfirmed = true,
            EmailConfirmationToken = verifyToken
        };

        var createdUser = _repository.Create(user);

        return new AuthResult(token, MapUser(createdUser));
    }

    public AuthResult? Login(LoginInput input)
    {
        var user = _repository.GetByEmail(Normalize(input.Email));
        if (user is null || !BCrypt.Net.BCrypt.Verify(input.Password, user.PasswordHash))
        {
            return null;
        }

        if (!user.IsEmailConfirmed)
        {
            throw new RequestValidationException(
                "Please confirm your email before logging in.",
                new Dictionary<string, string[]>
                {
                    ["email"] = ["This account has not confirmed its email address yet."]
                },
                AppErrorCodes.EmailNotConfirmed);
        }

        if (!user.IsActive)
        {
            throw new RequestValidationException(
                "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
                new Dictionary<string, string[]>
                {
                    ["email"] = ["Tài khoản đang bị tạm khóa."]
                });
        }

        user.CurrentToken = Guid.NewGuid().ToString("N");
        _repository.Update(user);

        return new AuthResult(user.CurrentToken, MapUser(user));
    }

    public UserView? GetByToken(string token)
    {
        var user = FindUserByToken(token);
        return user is null ? null : MapUser(user);
    }

    public UserView? UpdateProfile(string token, UpdateProfileInput input)
    {
        var user = FindUserByToken(token);
        if (user is null)
        {
            return null;
        }

        user.FullName = input.FullName.Trim();
        user.Phone = input.Phone.Trim();

        var saved = _repository.Update(user);
        return saved is null ? null : MapUser(saved);
    }

    public IReadOnlyCollection<AddressView>? GetAddresses(string token)
    {
        var user = FindUserByToken(token);
        return user is null
            ? null
            : user.Addresses
                .OrderByDescending(address => address.IsDefault)
                .ThenBy(address => address.Id)
                .Select(MapAddress)
                .ToArray();
    }

    public AddressView? GetAddressById(string token, int addressId)
    {
        var user = FindUserByToken(token);
        var address = user?.Addresses.FirstOrDefault(item => item.Id == addressId);
        return address is null ? null : MapAddress(address);
    }

    public AddressView? AddAddress(string token, UpsertAddressInput input)
    {
        var user = FindUserByToken(token);
        if (user is null)
        {
            return null;
        }

        var newAddress = new Address
        {
            FullName = input.FullName.Trim(),
            Phone = input.Phone.Trim(),
            Line1 = input.Line1.Trim(),
            Ward = input.Ward.Trim(),
            District = input.District.Trim(),
            City = input.City.Trim(),
            IsDefault = input.IsDefault
        };

        if (newAddress.IsDefault)
        {
            foreach (var address in user.Addresses)
            {
                address.IsDefault = false;
            }
        }

        user.Addresses.Add(newAddress);
        var saved = _repository.Update(user);
        return saved is null
            ? null
            : saved.Addresses
                .OrderByDescending(address => address.Id)
                .Select(MapAddress)
                .FirstOrDefault();
    }

    public AddressView? UpdateAddress(string token, int addressId, UpsertAddressInput input)
    {
        var user = FindUserByToken(token);
        if (user is null)
        {
            return null;
        }

        var address = user.Addresses.FirstOrDefault(item => item.Id == addressId);
        if (address is null)
        {
            return null;
        }

        address.FullName = input.FullName.Trim();
        address.Phone = input.Phone.Trim();
        address.Line1 = input.Line1.Trim();
        address.Ward = input.Ward.Trim();
        address.District = input.District.Trim();
        address.City = input.City.Trim();
        address.IsDefault = input.IsDefault;

        if (address.IsDefault)
        {
            foreach (var item in user.Addresses.Where(item => item.Id != addressId))
            {
                item.IsDefault = false;
            }
        }

        var saved = _repository.Update(user);
        var updated = saved?.Addresses.FirstOrDefault(item => item.Id == addressId);
        return updated is null ? null : MapAddress(updated);
    }

    public bool DeleteAddress(string token, int addressId)
    {
        var user = FindUserByToken(token);
        if (user is null)
        {
            return false;
        }

        var address = user.Addresses.FirstOrDefault(item => item.Id == addressId);
        if (address is null)
        {
            return false;
        }

        user.Addresses.Remove(address);
        _repository.Update(user);
        return true;
    }

    public bool ConfirmEmail(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return false;
        }

        var user = _repository.GetAll().FirstOrDefault(item => item.EmailConfirmationToken == token);
        if (user is null)
        {
            return false;
        }

        user.IsEmailConfirmed = true;
        user.EmailConfirmationToken = null;
        _repository.Update(user);
        return true;
    }

    public bool UpdateRole(int userId, UserRole role)
    {
        var user = _repository.GetById(userId);
        if (user is null)
        {
            return false;
        }

        user.Role = role;
        _repository.Update(user);
        return true;
    }

    public bool ToggleStatus(int userId)
    {
        var user = _repository.GetById(userId);
        if (user is null)
        {
            return false;
        }

        user.IsActive = !user.IsActive;
        _repository.Update(user);
        return true;
    }

    public bool Delete(int userId) => _repository.Delete(userId);

    private static UserView MapUser(User user) =>
        new(
            user.UserId,
            user.Email,
            user.FullName,
            user.Phone,
            user.Role.ToString().ToLowerInvariant(),
            user.CreatedAt,
            user.IsActive,
            user.Addresses
                .OrderByDescending(address => address.IsDefault)
                .ThenBy(address => address.Id)
                .Select(MapAddress)
                .ToArray());

    private User? FindUserByToken(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return null;
        }

        return _repository.GetByToken(token.Trim());
    }

    private static AddressView MapAddress(Address address) =>
        new(
            address.Id,
            address.FullName,
            address.Phone,
            address.Line1,
            address.Ward,
            address.District,
            address.City,
            address.IsDefault);

    private static string Normalize(string? value) =>
        (value ?? string.Empty).Trim().ToLowerInvariant();
}
