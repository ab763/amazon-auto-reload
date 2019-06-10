import { By, Locator, ThenableWebDriver, until, WebElement } from "selenium-webdriver";

import { Card } from "../lib/card";
import { logger } from "../lib/logger";
import { ISiteConfig, Site } from "../lib/site";

export interface IOptimumConfig extends ISiteConfig
{
	readonly addressLine1: string;
	readonly city: string;
	readonly state: string;
	readonly zipcode: string;
}

export class Optimum extends Site implements IOptimumConfig
{
	public readonly addressLine1: string;

	public readonly city: string;

	public readonly state: string;

	public readonly zipcode: string;

	private readonly completeTransactions: boolean;

	public constructor(optimumConfig: IOptimumConfig, completeTransactions: boolean)
	{
		super(optimumConfig, "https://www.optimum.net/login/?referer=%2fpay-bill%2fpayment-options%2f");

		this.addressLine1 = optimumConfig.addressLine1;
		this.city = optimumConfig.city;
		this.state = optimumConfig.state;
		this.zipcode = optimumConfig.zipcode;
		this.completeTransactions = completeTransactions;
	}

	public async makePurchases(cards: Card[]): Promise<void>
	{
		let eligibleCardFound: boolean = false;

		for (const card of cards)
		{
			if (card.reloadAmount >= 1)
			{
				eligibleCardFound = true;
			}

		}

		if (!eligibleCardFound)
		{
			return;
		}

		await this.login();

		for (const card of cards)
		{
			while (card.reloadTimes > 0)
			{
				await this.makePurchase(card);
			}
		}
	}

	private async login(): Promise<void>
	{
		this.buildBrowser();

		// A driver alias so the code isn't *as* unwieldy
		const driver: ThenableWebDriver = this.driver;

		await this.loadLoginPage();

		const usernameField: WebElement = await driver.findElement(By.id("loginPageUsername"));
		await usernameField.clear();
		await usernameField.sendKeys(this.username);
		const passwordField: WebElement = await driver.findElement(By.id("loginPagePassword"));
		await passwordField.sendKeys(this.password);

		const rememberMe: WebElement = await driver.findElement(By.css(".checkbox:nth-child(3) > .checkbox-inner"));

		if (!(await rememberMe.isSelected()))
		{
			try
			{
				await rememberMe.click();
			}
			catch
			{
				// If clicking Remember Me fails, just keep going anyway...
			}
		}

		// Sign in
		await driver.findElement(By.id("target"))
			.click();
	}

	private async makePurchase(card: Card): Promise<void>
	{
		// A driver alias so the code isn't *as* unwieldy
		const driver: ThenableWebDriver = this.driver;

		if (card.reloadAmount < 1)
		{
			logger.info(`Reload amount ${card.reloadAmount} for ${card.description} is below site minimum; skipping card.`);

			return;
		}

		const paymentMethodLocator: Locator = By.css(".payoptions-dropdown .dropdown__knob");
		const paymentMethodElement: WebElement = await driver.wait(until.elementLocated(paymentMethodLocator));
		await driver.wait(until.elementIsVisible(paymentMethodElement))
			.click();

		try
		{
			const cardDropdown: WebElement =
				await driver.findElement(By.xpath(`//li[contains(.,\'${card.shortDescription}\')]`));
			await cardDropdown.click();
		}
		catch
		{
			// If we can't find the card, enter a new card
			await driver.findElement(By.xpath("//li[contains(.,\'Add credit/debit card\')]"))
				.click();

			const cardNumberElement: WebElement = await driver.findElement(By.id("cardInputField"));
			await cardNumberElement.sendKeys(`${card.cardNumber}`);

			// Enter expiration month
			if (card.expirationMonth !== undefined && card.expirationYear !== undefined)
			{
				// Open the month dropdown
				await driver.findElement(
					By.xpath("//div[@options='model.monthOptions']//div[contains(concat(' ', @class, ' '), ' dropdown__knob')]"))
					.click();
				// Then select the month
				await driver.findElement(By.xpath(
					`//span[.='${String(card.expirationMonth).padStart(2, "0")}']/..`,
					))
					.click();

				// Open the year dropdown
				await driver.findElement(
					By.css(".margin-top-expiration-date-radio > .dropdown--highlight:nth-child(2) .icon-caret-down"))
					.click();
				// Enter expiration year
				await driver.findElement(By.css(
					`.margin-top-expiration-date-radio > .dropdown--highlight:nth-child(2) .dropdown__option:nth-child(${card.expirationYear - new Date().getFullYear() + 2})`,
					))
					.click();
			} else
			{
				throw new Error(`${card.friendlyReference}: ${card.expirationMonth}/${card.expirationYear}`);
			}

			// Manually specify address
			await driver.findElement(By.css(".checkMargin"))
				.click();
			await driver.findElement(By.id("addPaymentAddressLine1"))
				.sendKeys(this.addressLine1);
			await driver.findElement(By.id("addPaymentCity"))
				.sendKeys(this.city);
			await driver.findElement(By.id("zipcode"))
				.sendKeys(this.zipcode);
			await driver.findElement(By.css(".span2 .dropdown__selected"))
				.click();
			await driver.findElement(By.css(".dropdown__option:nth-child(24) > .ng-binding"))
				.click();
		}

		const paymentAmount: WebElement = await driver.findElement(By.id("otherAmountInput"));
		await paymentAmount.click();
		await paymentAmount.sendKeys(card.reloadAmount);
		logger.debug("Completed filling Optimum form.");

		if (this.completeTransactions)
		{
			logger.debug("About to submit Optumum payment");
			await driver.findElement(By.id("otpSubmit"))
				.click();
			await driver.findElement(By.xpath("//input[@ng-click='oweAccepted()']"))
				.click();
			logger.debug("Submitted payment");
			card.reloadTimes -= 1;
		}
	}
}
