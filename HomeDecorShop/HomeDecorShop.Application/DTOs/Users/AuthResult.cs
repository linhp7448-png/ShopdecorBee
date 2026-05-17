namespace HomeDecorShop.Application;

public sealed record AuthResult(string Token, UserView User);
