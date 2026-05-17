namespace HomeDecorShop.Application;

public sealed record WalletDepositInput(decimal Amount);
public sealed record WalletWithdrawInput(decimal Amount);
public sealed record WalletPayOrderInput(int OrderId);
