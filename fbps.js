#!/usr/bin/env node
const puppeteer = require('puppeteer');
const minimist = require('minimist');

const LoginPage = {
	password: 'input#uiPass',
	login: 'button#submitLoginBtn'
};

const DevicePage = {
	profileSelect: 'select[name=kisi_profile]',
	apply: 'button[name=apply]'
};


async function main() {
	const argv = minimist(process.argv.slice(2));
	const show = argv.s || false;
	const browser = await puppeteer.launch({ headless: !show });
	const page = await open(browser, argv.url);
	await login(page, fromBase64(argv.password));
	const targets = argv._;
	let target = targets.pop();
	while (target) {
		await applyProfile(page, target);
		target = targets.pop();
	}
	await browser.close();
}

/**
 * Applies a desired access profile to a network device.
 * @param page Page instance, on the Network Connections page.
 * @param {string} devNameProfile "DEVICE=PROFILE"
 * @returns {Promise<void>} Resolved when back on the Network Connections page.
 */
async function applyProfile(page, devNameProfile) {
	const keyVal = devNameProfile.split('=');
	const deviceName = keyVal[0];
	const profileName = keyVal[1];
	console.log(`Applying ${profileName} to ${deviceName}`);
	const editButton = `div[title=${deviceName}]~div.buttonView button[name=edit]`
	await page.waitForSelector(editButton);
	console.log(`Editing device: ${deviceName}`);
	await page.click(editButton);
	await page.waitForSelector(DevicePage.profileSelect);
	await selectProfile(page, profileName);
	await page.waitForTimeout(1000);  // Is this even necessary? Just in case events are triggered I guess.
	await page.click(DevicePage.apply);
	await page.waitForSelector(editButton);
}

/**
 * Selects an Access Profile from the device details page by option TEXT not value.
 * @param page The puppeteer page object - should be on the device details page.
 * @param profile The name of the profile to select - e.g. "Standard"
 * @returns {Promise<void>}
 */
async function selectProfile(page, profile) {
	console.log(`Selecting profile by text: ${profile}`);
	const profileOpt = (await page.$x(`//*[@name = "kisi_profile"]/option[text() = "${profile}"]`))[0];
	if (profileOpt) {
		const profileVal = await (await profileOpt.getProperty('value')).jsonValue();
		console.log(`Selecting profile by value: ${profileVal}`);
		await page.select(DevicePage.profileSelect, profileVal);  // Standard, KidsDevices
	} else {
		console.error(`Could not find option with text "${profile}"`)
	}
}

/**
 * Loads FritzBox Network Connections on a new puppeteer page.
 * @param browser The puppeteer browser instance to use.
 * @param baseUrl The base URL of the Fritz device (no querystring).
 * @returns {Promise<Page>} Resolves with the puppeteer page instance.
 */
async function open(browser, baseUrl) {
	let url = baseUrl || 'http://fritz.box';
	url = `${url}?lp=net`
	console.log(`Opening ${url}`);
	const page = await browser.newPage();
	await page.goto(url);
	page.setDefaultTimeout(60000)
	return page;
}

/**
 * Handles the login page.
 * @param page The login page.
 * @param password The password.
 * @returns {Promise<void>} resolved when it has logged in.
 */
async function login(page, password) {
	console.log('Logging in');
	await page.waitForSelector(LoginPage.password);
	await page.type(LoginPage.password, password);
	await page.click(LoginPage.login);
	console.log('Logged in');
}

/**
 * Decodes a base64 encoded string
 * @param s The base64 encoded string
 * @returns {string} The cleartext string
 */
function fromBase64(s) {
	let buff = Buffer.from(s, 'base64');
	let text = buff.toString('ascii');
	return text;
}

main().then(() => console.log('Done'));
