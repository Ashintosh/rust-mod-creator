import * as vscode from 'vscode';
import * as path from 'path';

import * as module from './modules.js';
import * as utils from './utils.js';

/**
 * Activates the Rust Mod Creator extension.
 * Registers the command for creating new Rust modules/submodules.
 */
export function activate(context: vscode.ExtensionContext) {
    /**
     * Command: rust-mod-creator.createModuleOrSubmodule
     * Allows the user to create a new Rust module or submodule in the selected directory.
     */
    const createModuleOrSubmodule = vscode.commands.registerCommand(
        'rust-mod-creator.createModuleOrSubmodule',
        async (uri: vscode.Uri) => {
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
                prompt: 'Enter (sub)module name',
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
            const visibility = await vscode.window.showQuickPick(
                [
                    { label: 'pub', description: 'Visible to the entire crate' },
                    { label: 'pub(super)', description: 'Visible to the parent module' },
                    { label: 'pub(crate)', description: 'Visible only within the crate' },
                    { label: 'private', description: 'Visible only within this module' },
                ],
                {
                    placeHolder: 'Select visibility for this (sub)module',
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
                vscode.window.showErrorMessage(`${newModuleName} (sub)module already exists`);
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

            // ------------------------------------------
            // 6. Notify the user
            // ------------------------------------------
            vscode.window.showInformationMessage(`Created ${newModuleName} (sub)module`);
        }
    );

    // Register the command in the extension's context
    context.subscriptions.push(createModuleOrSubmodule);
}

/**
 * Deactivates the extension.
 */
export function deactivate() {}