import { DateTime, Duration } from "luxon";
import { ThenableWebDriver } from "selenium-webdriver";
import { URL } from "url";

import { Browser, BrowserType } from "./browser";

export interface ISiteConfig
{
	readonly lastCompletedRun?: string;
	readonly password: string;
	readonly startingURL?: string;
	readonly username: string;
}

export abstract class Site implements ISiteConfig {

	public get driver(): ThenableWebDriver
	{
		if (this.browser === undefined)
		{
			throw(Error);
		}

		return this.browser.driver;
	}

	public browser: Browser | undefined;
	public readonly lastCompletedRun?: string;
	public readonly password: string;
	public readonly startingURL: string;
	public readonly username: string;

	public constructor(siteConfig: ISiteConfig, startingURL: string)
	{
		if (siteConfig.startingURL)
		{
			this.startingURL = siteConfig.startingURL;
		}
		else
		{
			this.startingURL = startingURL;
		}
		this.username = siteConfig.username;
		this.password = siteConfig.password;
		this.lastCompletedRun = siteConfig.lastCompletedRun;
	}

	public transferOutSubmittedInLastWeek(): boolean
	{
		// logger.debug(`lastCompletedRun ${lastCompletedRun}`);

		if (!this.lastCompletedRun)
		{
			return false;
		}

		const lastCompletedRun: DateTime = DateTime.fromISO(this.lastCompletedRun);

		// logger.debug(`lastCompletedRunDate: ${lastCompletedRun}`);

		const today: DateTime = DateTime.local();

		const timeSinceLastRun: Duration = today.diff(lastCompletedRun);

		return (timeSinceLastRun.as("days") < 7);
	}

	protected buildBrowser(browserType?: BrowserType): void
	{
		if (!this.browser)
		{
			this.browser = new Browser(new URL(this.startingURL), this.username, browserType);
		}
	}

	protected async loadLoginPage(): Promise<void>
	{
		// A driver alias so the code isn't *as* unwieldy
		const driver: ThenableWebDriver = this.driver;

		const currentURL: string = await driver.getCurrentUrl();

		if (
			currentURL === "https://www.google.com/_/chrome/newtab?ie=UTF-8"
			|| currentURL === "about:blank"
			)
		{
			// Chrome was supposed to start with a starting URL.
			// It works on my Windows machine, but fails in my Docker Linux image.
			// As such, handle that case as well.
			await driver.get(this.startingURL);
		}
	}
}
