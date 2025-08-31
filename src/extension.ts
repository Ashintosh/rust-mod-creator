import * as vscode from 'vscode';
import * as path from 'path';

import * as module from './modules.js';
import * as utils from './utils.js';

const config = vscode.workspace.getConfiguration('rustModCreator');

/**
 * Activates the Rust Mod Creator extension.
 * Registers the command for creating new Rust modules/submodules.
 */
export function activate(context: vscode.ExtensionContext) {
    // Used to prevent context menu from showing in non-Rust workspaces
    vscode.commands.executeCommand('setContext', 'rust-mod-creator.thisContext', true);

    /**
     * Command: rust-mod-creator.createModuleOrSubmodule
     * Allows the user to create a new Rust module or submodule in the selected directory.
     */
    const createModuleOrSubmodule = vscode.commands.registerCommand(
        'rust-mod-creator.createModuleOrSubmodule',
        async (uri?: vscode.Uri) => {
            // Set Uri to active file when running as command
            if (!uri) {
                const activeEditor = vscode.window.activeTextEditor;
                if (activeEditor) {
                    uri = activeEditor.document.uri;
                } else if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
                    uri = vscode.workspace.workspaceFolders[0].uri;
                } else {
                    vscode.window.showErrorMessage('No active file or workspace folder found');
                    return;
                }
            }

            // ------------------------------------------
            // 1. Determine the selected directory
            // ------------------------------------------
            const selectedDirectory = (await vscode.workspace.fs.stat(uri)).type === vscode.FileType.Directory
                ? uri.fsPath
                : path.dirname(uri.fsPath);

            // ------------------------------------------
            // 2. Prompt user for new module name
            // ------------------------------------------
            const rawModuleName = await vscode.window.showInputBox({
                prompt: 'Enter module name',
                placeHolder: 'my_module(.rs)',
                validateInput(value) {
                    if (!utils.isValidRustName(value)) {
                        return 'Module name must be a valid Rust identifier (snake_case)';
                    }
                    return null;
                },
            });

            if (!rawModuleName) {
                return;  // User cancelled
            }

            // ------------------------------------------
            // 3. Prompt user for visibility level
            // ------------------------------------------
            const visibilityOptions = config.get<{ label: string; description: string }[]>("visibilityOptions", []);
            const visibility = await vscode.window.showQuickPick(
                visibilityOptions,
                {
                    placeHolder: "Select visibility for this module",
                }
            );

            if (!visibility) {
                return;  // User cancelled
            }

            // ------------------------------------------
            // 4. Create the new module file or directory
            // ------------------------------------------
            const newModuleName = await module.createNew(selectedDirectory, rawModuleName);

            if (!newModuleName) {
                vscode.window.showErrorMessage(`${newModuleName} module already exists`);
                return;
            }

            // ------------------------------------------
            // 5. Add mod line to parent file (mod.rs, lib.rs, or main.rs)
            // ------------------------------------------
            const visibilityKeyword = visibility.label === 'private' ? '' : visibility.label;
            const newModuleLine = `${visibilityKeyword ? visibilityKeyword + " " : ""}mod ${newModuleName};`;

            const updated = await module.updateExistingFile(selectedDirectory, newModuleLine);

            if (!updated) {
                vscode.window.showErrorMessage('Failed updating parent module file');
                return;
            }

            //

            const showSuccessMessage = config.get<boolean>('showSuccessMessage');
            
            if (showSuccessMessage) {
                vscode.window.showInformationMessage(`Created ${newModuleName} module`);
            }
        }
    );

    // Register the command in the extension's context
    context.subscriptions.push(createModuleOrSubmodule);
}

/**
 * Deactivates the extension.
 */
export function deactivate() {}