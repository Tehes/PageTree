/* --------------------------------------------------------------------------------------------------
Imports
---------------------------------------------------------------------------------------------------*/
import { parseMd } from "https://cdn.jsdelivr.net/gh/Tehes/parseMD@main/parseMD.js";
import { renderTemplate } from "https://cdn.jsdelivr.net/gh/Tehes/vanillaTemplates@v0.18.1/core/renderTemplate.js";

/* --------------------------------------------------------------------------------------------------
Configuration
---------------------------------------------------------------------------------------------------*/
const config = {
	startingPageName: "home",
	standardFileType: "html",
	directory: "content",
	user: globalThis.location.hostname.split(".")[0],
	repo: globalThis.location.pathname.split("/")[1],
	isGitHubPages: globalThis.location.hostname.endsWith("github.io"),
};

/* --------------------------------------------------------------------------------------------------
Variables
---------------------------------------------------------------------------------------------------*/
let fileType;
let files = [];
const contentElement = document.querySelector("main");

/* --------------------------------------------------------------------------------------------------
Utility functions
---------------------------------------------------------------------------------------------------*/
async function fetchFile(url) {
	// Fetch the file from the network
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`HTTP error: ${response.status} (${response.statusText}) when trying to fetch ${url}`);
	}

	// Return the network response (Service Worker handles caching)
	return response;
}

async function loadTemplate(templateName) {
	const templatePath = `templates/${templateName}.html`;
	const templateTag = document.querySelector("template");

	try {
		const response = await fetch(templatePath);
		if (!response.ok) {
			throw new Error(`Failed to load template: ${templatePath}`);
		}

		const templateHTML = await response.text();
		templateTag.innerHTML = templateHTML; // Populate the existing <template> tag with the loaded HTML

		return templateTag; // Return the updated template element
	} catch (error) {
		console.error(error);
		return null;
	}
}

function extractFileType(file) {
	return file.split(".")[1];
}

function isValidFileType(fileType) {
	return fileType !== "htaccess";
}

function removePrefix(fileName) {
	return fileName.replace(/^\d+_/, "");
}

function getCleanFileName(file) {
	return removePrefix(file.replace(`/${config.directory}/`, "").split(".")[0]);
}

/* --------------------------------------------------------------------------------------------------
Main functions
---------------------------------------------------------------------------------------------------*/
async function buildMenu() {
	const nav = document.querySelector("nav");

	try {
		const apiURL = config.isGitHubPages
			? `https://api.github.com/repos/${config.user}/${config.repo}/contents/${config.directory}`
			: `${config.directory}/`;

		const response = await fetchFile(apiURL);
		if (config.isGitHubPages) {
			files = (await response.json()).map((file) => file.name).sort();
		} else {
			const data = await response.text();
			const parser = new DOMParser();
			const doc = parser.parseFromString(data, "text/html");
			files = Array.from(doc.querySelectorAll("a"))
				.map((link) => link.getAttribute("href").replace(`/${config.directory}/`, ""))
				.filter((file) => file !== "/" && file !== `/${config.directory}`)
				.sort();
		}

		files.forEach((file) => {
			const cleanFileName = file.split(".")[0];
			const fileType = extractFileType(file);

			if (!isValidFileType(fileType)) return;

			const linkText = removePrefix(cleanFileName);

			const link = document.createElement("a");
			link.href = `#${linkText}`;
			link.textContent = linkText;
			if (fileType !== config.standardFileType) {
				link.setAttribute("data-file-type", fileType);
			}
			nav.appendChild(link);
		});

		router();
	} catch (error) {
		console.error("Error fetching directory contents:", error);
	}
}

async function router() {
	const hash = location.hash.substring(1) || config.startingPageName;
	const matchingFile = files.find((file) => getCleanFileName(file) === hash);

	if (!matchingFile) {
		console.error(`No file matching the hash "${hash}" found in files:`, files);
		return;
	}

	fileType = extractFileType(matchingFile);

	try {
		const response = await fetchFile(`${config.directory}/${matchingFile}`);
		const data = fileType === "json" ? await response.json() : await response.text();

		contentElement.innerHTML = "";
		if (fileType === "json") {
			// Use the cleaned file name (without prefix and extension) to match the template ID
			const templateTag = await loadTemplate(hash); // Load the corresponding template and insert it
			if (templateTag) {
				renderTemplate(templateTag, data, contentElement);
			} else {
				console.error(`No template found for "${hash}".`);
			}
		} else if (fileType === "md") {
			contentElement.innerHTML = parseMd(data).content;
		} else {
			contentElement.innerHTML = data;
		}
	} catch (error) {
		contentElement.innerHTML = "";
		contentElement.appendChild(
			document.createTextNode(`Error: ${error.message}`),
		);
	}
}

/* --------------------------------------------------------------------------------------------------
Helper functions
---------------------------------------------------------------------------------------------------*/
function checkFileType(ev) {
	fileType = ev.target.dataset.fileType || config.standardFileType;
}

function init() {
	globalThis.addEventListener("hashchange", router, false);
	globalThis.addEventListener("DOMContentLoaded", buildMenu, false);
	document.addEventListener("click", checkFileType, false);
}

globalThis.app = {
	init,
};

globalThis.app.init();

/* --------------------------------------------------------------------------------------------------
Service Worker configuration. Toggle 'useServiceWorker' to enable or disable the Service Worker.
---------------------------------------------------------------------------------------------------*/
const useServiceWorker = false; // Set to "true" if you want to register the Service Worker, "false" to unregister

async function registerServiceWorker() {
	try {
		const currentPath = globalThis.location.pathname;
		const registration = await navigator.serviceWorker.register(`${currentPath}service-worker.js`);
		console.log("Service Worker registered with scope:", registration.scope);
	} catch (error) {
		console.log("Service Worker registration failed:", error);
	}
}

async function unregisterServiceWorkers() {
	const registrations = await navigator.serviceWorker.getRegistrations();
	for (const registration of registrations) {
		const success = await registration.unregister();
		if (success) {
			console.log("Service Worker successfully unregistered.");
		}
	}
}

if ("serviceWorker" in navigator) {
	globalThis.addEventListener("load", async () => {
		if (useServiceWorker) {
			await registerServiceWorker();
		} else {
			await unregisterServiceWorkers();
		}
	});
}
