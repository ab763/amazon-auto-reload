export class BankAccount {

	public static lastFour(bankAccount: BankAccount): string
	{
		return bankAccount.accountNumber.slice(-4);
	}

	public readonly accountName: string;
	public readonly accountNumber: string;

	public constructor(bankAccount: BankAccount)
	{
		this.accountName = bankAccount.accountName;
		this.accountNumber = bankAccount.accountNumber;
	}
}
