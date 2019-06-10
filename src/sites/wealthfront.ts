import { By, ThenableWebDriver, until } from "selenium-webdriver";

import { BankAccount } from "../lib/bankAccount";
import { ISiteConfig, Site } from "../lib/site";

export class Wealthfront extends Site
{
	// private readonly managedFree: number = 15000;

	public constructor(siteConfig: ISiteConfig)
	{
		super(siteConfig, "https://www.wealthfront.com/dashboard");
	}

	public async transferFunds(fromAccount: BankAccount, transferAmount: number): Promise<void>
	{
		await this.login();
		// A driver alias so the code isn't *as* unwieldy
		const driver: ThenableWebDriver = this.driver;

		// const balance: number = unformat(await driver.findElement(
		// 		By.css("#Investments-account-group .dashboard-wealthfront-account-card-component-account-value"))
		// 		.getText());

		await driver.wait(until.elementLocated(By.xpath("//button[contains(.,\'Transfer Funds\')]")))
			.click();
		await driver.findElement(By.linkText("Deposit Cash"))
			.click();

		await driver.wait(until.elementLocated(By.css(
			"#funding-bank-deposit-step-component-destination-account-funding-info > .select-menu-component-toggle-arrow")))
			.click();

		await driver.wait(until.elementLocated(By.xpath(`//span[contains(.,\'${this.accountToString(fromAccount)}\')]`)))
			.click();
		await driver.findElement(By.id("common-funding-bank-deposit-amount-component-amount"))
			.sendKeys(transferAmount);
		await driver.findElement(By.xpath(`//button[contains(.,\'Deposit $${transferAmount}\')]`))
			.click();
		await driver.findElement(By.xpath("//button[contains(.,\'Schedule my deposit\')]"))
		.click();
	}

	// The particular way that this financial institution formats accounts
	private accountToString(bankAccount: BankAccount): string
	{
		return `${bankAccount.accountName} - ${BankAccount.lastFour(bankAccount)}`;
	}

	private async login(): Promise<void>
	{
		this.buildBrowser();

		// A driver alias so the code isn't *as* unwieldy
		const driver: ThenableWebDriver = this.driver;

		if (await driver.getTitle() === "My Overview - Wealthfront")
		{
			// We're already logged in
			return;
		}

		await this.loadLoginPage();

		await driver.findElement(By.id("static-access-login-component-username"))
			.sendKeys(this.username);
		await driver.findElement(By.id("static-access-login-component-password"))
			.sendKeys(this.password);
		await driver.findElement(By.css(".capy-login-submit-btn"))
			.click();
	}
}
