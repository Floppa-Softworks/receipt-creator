import { fromPath } from 'pdf2pic';
import { Page } from 'puppeteer';

export default class Utils {
	public page: Page;
	public constructor(page: Page) {
		this.page = page;
	}
	public async clickButton(selector: string) {
		await this.page.$eval(
			selector,
			(el) => {
				if (
					el instanceof HTMLButtonElement ||
					el instanceof HTMLInputElement
				) {
					el.click();
				}
			},
			selector
		);
	}

	public async setValueOfInput(selector: string, value: string) {
		await this.page.$eval(
			selector,
			(el, value: string) => {
				if (
					el instanceof HTMLTextAreaElement ||
					el instanceof HTMLInputElement
				) {
					el.value = value;
				}
			},
			value
		);
	}
	public async sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	public convertPdfToPng(path: string) {
		const storeAsImage = fromPath(path, {
			density: 100,
			saveFilename: 'Receipt',
			savePath: process.cwd(),
			format: 'png',
			width: 350,
			height: 500,
		});
		const pageToConvertAsImage = 1;

		storeAsImage(pageToConvertAsImage).then((resolve) => {
			console.log('Converted Receipt PDF To Image');

			return resolve;
		});
	}
}
