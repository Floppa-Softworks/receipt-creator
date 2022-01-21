import { writeFile } from 'fs/promises';

import puppeteer, { Page } from 'puppeteer';

import { IItem } from '../types';

import Constants from './constants';
import Utils from './utils';

const WEBSITE_URL = 'https://www.needreceipt.com/pdf-restaurant-receipt.html';
const CONSTANTS_KEYS = Object.keys(Constants);

async function typeInInputElement(
	page: Page,
	inputSelector: string,
	text: string
) {
	await page.evaluate(
		(inputSelector, text) => {
			const inputElement =
				typeof inputSelector === 'string'
					? document.querySelector(inputSelector)
					: inputSelector;
			const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
				window.HTMLInputElement.prototype,
				'value'
			).set;
			nativeInputValueSetter.call(inputElement, text);

			const ev2 = new Event('input', { bubbles: true });
			inputElement.dispatchEvent(ev2);
			const ev3 = new Event('change', { bubbles: true });
			inputElement.dispatchEvent(ev3);
		},
		inputSelector,
		text
	);
}

export default async function createReceipt(
	options: {
		[key: string]: string | boolean;
	},
	items: IItem[]
) {
	const newOptions = {};

	Object.keys(options).forEach((option) => {
		const foundSelector = CONSTANTS_KEYS.find((e) =>
			e.toLowerCase().includes(option.toLowerCase())
		);
		if (foundSelector) {
			newOptions[Constants[foundSelector]] = options[option];
			return Constants[foundSelector];
		}
		return null;
	});

	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	const utils = new Utils(page);

	await page.goto(WEBSITE_URL, {
		waitUntil: 'networkidle2',
	});
	await page.setViewport({
		width: 1000,
		height: 2500,
	});

	for (const [selector, value] of Object.entries(newOptions)) {
		typeInInputElement(page, selector, value as string);
	}

	for (let i = 1; i < items.length; ++i) {
		await page.click(Constants.ADD_ITEM_SELECTOR);
	}

	await utils.sleep(1000);

	(await page.$$('[placeholder="Qty"]')).forEach(async (el, idx) => {
		const item = items[idx].quantity.toString();
		el.evaluate((el, item) => {
			(el as HTMLInputElement).value = item;
			el.dispatchEvent(new Event('input'));
		}, item);
	});
	(await page.$$('[placeholder="Item"]')).forEach((el, idx) => {
		const item = items[idx].itemName;
		el.evaluate((el, item) => {
			(el as HTMLInputElement).value = item;
			el.dispatchEvent(new Event('input'));
		}, item);
	});
	(await page.$$('[placeholder="Cost"]')).forEach((el, idx) => {
		const item = items[idx].cost.toString();
		el.evaluate((el, item) => {
			(el as HTMLInputElement).value = item;
			el.dispatchEvent(new Event('input'));
		}, item);
	});

	await utils.sleep(1000);

	await page.screenshot({ path: 'example.png' });
	const base64Src = (
		await page.$eval(Constants.FINAL_IMG_SELECTOR, (el) => {
			return (el as HTMLImageElement).src;
		})
	).split(';base64,')[1];
	writeFile('Receipt.png', base64Src, { encoding: 'base64' });

	await browser.close();
	console.log('Closed Browser');
}
