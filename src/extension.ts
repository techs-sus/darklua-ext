// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as childProcess from "child_process";
import { installDarklua } from "./manageDarklua";
import { promisify } from "util";
import { parse, relative, sep as pathSeparator } from "path";
import { access, constants, readFile } from "fs/promises";
const execute = promisify(childProcess.exec);

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const configuration = vscode.workspace.getConfiguration("darklua");
	console.log("Darklua activated");
	context.subscriptions.push(
		vscode.commands.registerCommand(
			"darklua-cooking.installDarklua",
			async () => {
				await installDarklua();
			}
		)
	);
	context.subscriptions.push(
		vscode.commands.registerCommand("darklua-cooking.bundle", async () => {
			const uri = vscode.window.activeTextEditor?.document.uri;
			if (uri?.scheme === "file") {
				// TODO: add extension setting for input dir and output dir
				const processingSettings: {
					input: string;
					output: string;
				} = configuration.get("processing")!;
				console.log(processingSettings);
				await execute(
					`darklua process ${processingSettings.input} ${processingSettings.output}`
				).catch((e) => {
					vscode.window.showErrorMessage(
						`Failed processing ${processingSettings.input}: ${e}`
					);
				});
				const path = parse(uri.fsPath);
				const splitDirectory = path.dir.split(pathSeparator);
				const index = splitDirectory.findIndex(
					(v) => v === processingSettings.input
				);
				if (index !== -1) {
					splitDirectory[index] = processingSettings.output;
					const directory = splitDirectory.join(pathSeparator);
					const rewrittenPath = directory + pathSeparator + path.base;
					readFile(rewrittenPath).then((buffer: Buffer) => {
						vscode.env.clipboard.writeText(buffer.toString());
					});
				} else {
					vscode.window.showErrorMessage("Could not rewrite path");
				}
			}
		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
