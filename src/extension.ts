import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  	console.log('Rust Mod Creator is active!');

	const createModuleOrSubmodule = vscode.commands.registerCommand(
		'rust-mod-creator.createModuleOrSubmodule',
		async (uri: vscode.Uri) => {
			const targetDir = (await vscode.workspace.fs.stat(uri)).type === vscode.FileType.Directory
				? uri.fsPath
				: path.dirname(uri.fsPath);

			let isSubmodule = false;
			try {
				const modUri = vscode.Uri.file(path.join(targetDir, 'mod.rs'));
				await vscode.workspace.fs.stat(modUri);
				isSubmodule = true;
			} catch {
				isSubmodule = false;
			}

			// Ask for new (sub)module name
			const name = await vscode.window.showInputBox({
				prompt: isSubmodule ? 'Enter submodule name' : 'Enter module name',
				placeHolder: isSubmodule ? 'my_module(.rs)' : 'my_module',
				validateInput: (value) => {
					if (!value.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
						return 'Module name must be a valid Rust identifier (snake_case)';
					}
					return null;
				}
			});

			if (!name) {
				return; // User cancelled
			}

			// TODO: Check if submodule name contains .rs and create a file or folder
			if (isSubmodule) {
				const visibility = await vscode.window.showQuickPick(
					[
						{ label: "pub", description: "Visible to entire crate" },
						{ label: "pub(super)", description: "Visible to the parent module" },
						{ label: "pub(crate)", description: "Visible only within the crate" },
						{ label: "private", description: "Visible only within this module" }
					],
					{
						placeHolder: "Select visibility for this submodule",
					}
				);

				if (!visibility) {
					return; // User cancelled
				}

				// Map "private" to no keyword
				const visibilityKeyword = visibility.label === 'private' ? '' : visibility.label;

				const newFileUri = vscode.Uri.file(path.join(targetDir, `${name}.rs`));

				try {
					await vscode.workspace.fs.stat(newFileUri);
					vscode.window.showErrorMessage(`File ${name}.rs already exists!`);
					return;
				} catch {
					await vscode.workspace.fs.writeFile(newFileUri, new TextEncoder().encode("// TODO: Implement module\n"));
				}

				const modFileUri = vscode.Uri.file(path.join(targetDir, 'mod.rs'));

				try {
					const modContent = await vscode.workspace.fs.readFile(modFileUri);
					const modText = Buffer.from(modContent).toString('utf8');

					const newLine = `${visibilityKeyword ? visibilityKeyword + " " : ""}mod ${name};`;

					if (!modText.includes(newLine)) {
						const updated = modText.trimEnd() + `\n${newLine}\n`;
						await vscode.workspace.fs.writeFile(modFileUri, new TextEncoder().encode(updated));
					}

					vscode.window.showInformationMessage(`Submodule '${name}' created and added to mod.rs`);
				} catch (err) {
					vscode.window.showErrorMessage(`Could not update mod.rs: ${err}`);
				}
			} else {
				const moduleDir = vscode.Uri.file(path.join(targetDir, name));

				try {
					await vscode.workspace.fs.createDirectory(moduleDir);

					const modRsUri = vscode.Uri.file(path.join(moduleDir.fsPath, 'mod.rs'));
					await vscode.workspace.fs.writeFile(modRsUri, new TextEncoder().encode('// TODO: Implement module\n'));

					vscode.window.showInformationMessage(`Module '${name}' created at ${moduleDir.fsPath}`);


				} catch (err) {
					vscode.window.showErrorMessage(`Could not create module: ${err}`);
				}

				// TODO: Add new module to parent
			}
		}
	);

	context.subscriptions.push(createModuleOrSubmodule);

}

export function deactivate() {}
