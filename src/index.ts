import accounting from "accounting";
import chalk from "chalk";
import { readFileSync } from "fs";
// import { writeFileSync } from "fs";
import { Answers, prompt } from "inquirer";
import { parse } from "json5";
// import { stringify } from "json5";
// import { DateTime } from "luxon";
import { table } from "table";

// import { BankAccount } from "./lib/bankAccount";
import { Card } from "./lib/card";
import { Cards } from "./lib/cards";
// import { logger } from "./lib/logger";
import { Amazon } from "./sites/amazon";
// import { BankOfAmerica } from "./sites/bankOfAmerica";
// import { BarclaycardUS } from "./sites/barclaycardUS";
// import { CapitalOne } from "./sites/capitalOne";
// import { Discover } from "./sites/discover";
// import { Mango } from "./sites/mango";
// import { Merrill } from "./sites/merrill";
// import { Mint } from "./sites/mint";
// import { Optimum } from "./sites/optimum";
// import { PenFed } from "./sites/penFed";
// import { PremierMembersCreditUnion } from "./sites/premierMembersCreditUnion";
// import { USBank } from "./sites/usBank";
// import { Wealthfront } from "./sites/wealthfront";

// let bankOfAmerica: BankOfAmerica;
// let barclaycardUS: BarclaycardUS;
// let discoverPersonal: Discover;
// let discoverBusiness: Discover;
// let usBank: USBank;
// let penFed: PenFed;
// let capitalOne: CapitalOne;
// let configModified: boolean = false;

async function start(): Promise<void>
{
	const configFilepath: string = "./config/default.json5";
	const config = parse(readFileSync(configFilepath)
		.toString());

	const completeTransactions: boolean =
		(config.completeTransactions == undefined) ? true : config.completeTransactions;
	const confirmBeforePurchases: boolean =
		(config.confirmBeforePurchases == undefined) ? false : config.confirmBeforePurchases;
	const skipCardsWithTransactions: boolean =
		(config.skipCardsWithTransactions == undefined) ? false : config.skipCardsWithTransactions;

	const cards: Cards = new Cards(config.cards, skipCardsWithTransactions);

	// outputCardTable(cards.enabledCards(), "Before checking for card updates, cards that could be run");

	// const wealthfront: Wealthfront = new Wealthfront(config.wealthfront);

	// const merrill: Merrill = new Merrill(config.merrill);
	// if (!merrill.transferOutSubmittedInLastWeek())
	// {
	// 	await merrill.transferOutAvailableBalance();
	// 	config.merrill.lastCompletedRun = now();
	// 	config.configModified = true;
	// 	updateConfigFile(configFilepath, config);
	// }

	// const premierMembersCreditUnion: PremierMembersCreditUnion =
	// 	new PremierMembersCreditUnion(config.premierMembersCreditUnion);
	// if (!premierMembersCreditUnion.transferOutSubmittedInLastWeek())
	// {
	// 	await premierMembersCreditUnion.transferFundsToSavings();
	// 	const premierMembersCreditUnionBalanceToTransferOut =
	// 		await premierMembersCreditUnion.howMuchToTransferOutOfBank();

	// 	if (premierMembersCreditUnionBalanceToTransferOut > 0)
	// 	{
	// 		await wealthfront.transferFunds(
	// 			new BankAccount({accountName: "", accountNumber: ""}),
	// 			premierMembersCreditUnionBalanceToTransferOut);

	// 		config.premierMembersCreditUnion.lastCompletedRun = now();
	// 		configModified = true;
	// 	}
	// }

	// const mango2: Mango = new Mango(config.mango2);
	// if (!mango2.transferOutSubmittedInLastWeek())
	// {
	// 	const mango1: Mango = new Mango(config.mango1);
	// 	await mango1.transferFundsToSecondAccount();
	// 	const mangoBalanceToTransferOut =
	// 		await mango2.howMuchToTransferFromSecondAccount();

	// 	if (mangoBalanceToTransferOut > 0)
	// 	{
	// 		await wealthfront.transferFunds(
	// 			new BankAccount({accountName: "Metropolitan Commercial Bank Checking", accountNumber: "2042100022716719"}),
	// 			mangoBalanceToTransferOut);

	// 		config.mango2.lastCompletedRun = now();
	// 		configModified = true;
	// 	}
	// }

	// for (let currentCard: number = 0; currentCard < cards.cardArray.length; currentCard++)
	// {
	// 	if (!cards.cardArray[currentCard].skip)
	// 	{
	// 		// We also pass config as it has the login details for each financial institution
	// 		await checkForCreditCardTransactions(cards.cardArray[currentCard], config);
	// 		if (cards.cardArray[currentCard].closingDate
	// 			&& typeof cards.cardArray[currentCard].transactionsFound !== "undefined")
	// 		{
	// 			config.cards[currentCard].closingDate = cards.cardArray[currentCard].closingDateAsString;
	// 			config.cards[currentCard].transactionsFound = cards.cardArray[currentCard].transactionsFound;
	// 			configModified = true;
	// 		}
	// 	}
	// }

	// updateConfigFile(configFilepath, config);

	// outputCardTable(cards.skippedCards(), "After checking for card updates, cards that will not be run");

	outputCardTable(cards.cardsToRun(), "Cards that will be run");
	// const loadSitePromises: Array<Promise<void>> = [];
	// const mint: Mint = new Mint(config.mint);
	// loadSitePromises.push(mint.login());

	if (confirmBeforePurchases && cards.cardsToRun().length > 0)
	{
		const answers: Answers = await prompt({
			type: "confirm",
			name: "makePurchases",
			message: "Make purchases using the still-enabled cards?",
		});

		if (!answers.makePurchases)
		{
			// closeBrowsers();

			return;
		}
	}

	// const optimum: Optimum = new Optimum(config.optimum, completeTransactions);
	// await optimum.makePurchases(cards.cardsToRun());
	// outputCardTable(cards.cardsToRun(), "After running Optimum, cards that remain to be run");

	const amazon: Amazon = new Amazon(config.amazon, completeTransactions);
	await amazon.reloadCards(cards.cardsToRun());

	// closeBrowsers();
	}

// async function closeBrowsers(): Promise<void>
// {
// 	if (bankOfAmerica)
// 	{
// 		bankOfAmerica.driver.close();
// 	}
// 	if (barclaycardUS)
// 	{
// 		barclaycardUS.driver.close();
// 	}
// 	if (discoverPersonal)
// 	{
// 		discoverPersonal.driver.close();
// 	}
// 	if (discoverBusiness)
// 	{
// 		discoverBusiness.driver.close();
// 	}
// 	if (usBank)
// 	{
// 		usBank.driver.close();
// 	}
// 	if (penFed)
// 	{
// 		penFed.driver.close();
// 	}
// 	if (capitalOne)
// 	{
// 		capitalOne.driver.close();
// 	}
// }

function outputCardTable(cards: Card[], tableIntroduction?: string): void
{
	if (tableIntroduction)
	{
		console.log(chalk.inverse(tableIntroduction));
	}

	const data: string[][] = [
		[
			chalk.bold("Card"),
			chalk.bold("Last four"),
			chalk.bold("Status"),
			chalk.bold("Closing date"),
			chalk.bold("Don't use until"),
			chalk.bold("Transactions found"),
			chalk.bold("Reload"),
		],
	];

	for (const card of cards)
	{
		const color = card.skip ? chalk.gray : chalk;

		data.push([
			color(card.description),
			color(card.lastFour),
			color(card.status()),
			color(card.closingDateAsString),
			color(card.dontUseUntilAsString),
			color(card.transactionsFoundAsString),
			color(`${accounting.formatMoney(card.reloadAmount)}, ${card.reloadTimes.toString()} times`),
		]);
	}

	console.log(table(data));
}

// async function checkForCreditCardTransactions(card: Card, config: any): Promise<void>
// {
// 	if (card.issuer === "Bank of America")
// 	{
// 		if (!bankOfAmerica)
// 		{
// 			bankOfAmerica = new BankOfAmerica(config.bankOfAmerica);
// 		}
// 		await bankOfAmerica.checkForCreditCardTransactions(card);
// 	}
// 	else if (card.issuer === "BarclaycardUS")
// 	{
// 		if (!barclaycardUS)
// 		{
// 			barclaycardUS = new BarclaycardUS(config.barclaycardUS);
// 		}
// 		await barclaycardUS.checkForCreditCardTransactions(card);
// 	}
// 	else if (card.issuer === "Discover Personal")
// 	{
// 		if (!discoverPersonal)
// 		{
// 			discoverPersonal = new Discover(config.discoverPersonal);
// 		}
// 		await discoverPersonal.checkForCreditCardTransactions(card);
// 	}
// 	else if (card.issuer === "Discover Business")
// 	{
// 		if (!discoverBusiness)
// 		{
// 			discoverBusiness = new Discover(config.discoverBusiness);
// 		}
// 		await discoverBusiness.checkForCreditCardTransactions(card);
// 	}
// 	else if (card.issuer === "US Bank")
// 	{
// 		if (!usBank)
// 		{
// 			usBank = new USBank(config.discoverBusiness);
// 		}
// 		await usBank.checkForCreditCardTransactions(card);
// 	}
// 	else if (card.issuer === "PenFed")
// 	{
// 		if (!penFed)
// 		{
// 			penFed = new PenFed(config.penFed);
// 		}
// 		await penFed.checkForCreditCardTransactions(card);
// 	}
// 	else if (card.issuer === "Capital One")
// 	{
// 		if (!capitalOne)
// 		{
// 			capitalOne = new CapitalOne(config.capitalOne);
// 		}
// 		await capitalOne.checkForCreditCardTransactions(card);
// 	}
// 	else if (card.issuer)
// 	{
// 		logger.warning(`Issuer ${card.issuer} not recognized for ${card.friendlyReference}`);
// 	}
// }

// function updateConfigFile(configFilepath: string, config: any)
// {
// 	if (configModified)
// 	{
// 		const spacesInOutput: number = 4;
// 		const json5string: string = stringify(config, undefined, spacesInOutput);
// 		writeFileSync(configFilepath, json5string);
// 		configModified = false;
// 	}
// }

// function now(): string
// {
// 	return DateTime.local().toISO();
// }

start();
