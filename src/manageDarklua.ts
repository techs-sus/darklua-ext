import { promisify } from "util";
import which from "which";
import * as vscode from "vscode";

export async function isDarkluaInstalled(): Promise<boolean> {
	const darkluaPath = await which("darklua").catch(() => null);
	// can we use !!darkluaPath?
	return darkluaPath ? true : false;
}

async function isCargoInstalled(): Promise<boolean> {
	const cargoPath = await which("cargo").catch(() => null);
	// can we use !!cargoPath?
	return cargoPath ? true : false;
}

export async function installDarklua() {
	const darkluaInstalled = await isDarkluaInstalled();
	if (darkluaInstalled) {
		vscode.window.showInformationMessage("Darklua is already installed.");
		return;
	}

	const cargoInstalled = await isCargoInstalled();
	const terminal = vscode.window.createTerminal({
		name: "Darklua installation",
	});

	if (cargoInstalled) {
		terminal.sendText("cargo install darklua", true);
		terminal.show();
		while (terminal.exitStatus === undefined) {
			await promisify(setTimeout)(100);
		}
		terminal.dispose();
		return;
	}

	throw new Error("Failed installing darklua, cargo is not available");
}
