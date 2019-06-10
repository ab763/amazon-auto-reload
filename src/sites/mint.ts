import { By, ThenableWebDriver, WebElement } from "selenium-webdriver";

import { ISiteConfig, Site } from "../lib/site";

export class Mint extends Site
{
	private static readonly startingPage: string = "transaction.event";

	public constructor(siteConfig: ISiteConfig)
	{
		super(siteConfig,
			     `https://accounts.intuit.com/index.html?offering_id=Intuit.ifs.mint&namespace_id=50000026&redirect_url=https%3A%2F%2Fmint.intuit.com%2F${Mint.startingPage}`,
			);
	}

	public async login(): Promise<void>
	{
		this.buildBrowser();

		// A driver alias so the code isn't *as* unwieldy
		const driver: ThenableWebDriver = this.driver;

		await this.loadLoginPage();

		if (await driver.getCurrentUrl() === `https://mint.intuit.com/${Mint.startingPage}`)
		{
			// We're already logged in - return
			return;
		}

		const usernameElement: WebElement =
			await driver.findElement(By.id("ius-userid"));

		await usernameElement.clear();
		await usernameElement.sendKeys(this.username);

		const rememberMeElement: WebElement =
			await driver.findElement(By.id("ius-signin-label-checkbox"));

		if (!(await rememberMeElement.isSelected()))
		{
			await rememberMeElement.click();
		}

		await driver.findElement(By.id("ius-password"))
			.sendKeys(this.password);

		driver.findElement(By.id("ius-sign-in-submit-btn"))
			.click();

		// await driver.wait(until.urlIs("https://mint.intuit.com/bills.event"));
		// await this.openTab("https://mint.intuit.com/trend.event");
		// await this.openTab("https://mint.intuit.com/transaction.event");
		// await this.openTab("https://mint.intuit.com/transaction.event?filterType=investment");
	}

	// private async openTab(url: string): Promise<void>
	// {
	// 	// A driver alias so the code isn't *as* unwieldy
	// 	const driver: ThenableWebDriver = this.driver;

	// 	await driver.findElement(By.css("body"))
	// 		.sendKeys(Key.chord(Key.CONTROL, "t"));

	// 	await driver.get(url);
	// }
}
