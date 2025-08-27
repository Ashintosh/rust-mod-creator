import * as path from 'path';
import * as vscode from 'vscode';
import * as utils from './utils.js';

const config = vscode.workspace.getConfiguration('rustModCreator');

/**
 * Creates a new Rust module or submodule.
 * 
 * Behavior:
 * - If `name` ends with `/`, create a directory module (with `mod.rs` inside).
 * - If `name` ends with `.` or `.rs`, create a file module (e.g., `foo.rs`).
 * - If `name` has no suffix, treat it as a directory module.
 * 
 * @param selectedDirectory - The parent directory where the module will be created.
 * @param name - The raw module name entered by the user.
 * @returns The normalized module name if created successfully, otherwise `null`.
 */
export async function createNew(selectedDirectory: string, name: string) {
    const createDirectory = name.endsWith('/');
    const createFile = name.endsWith('.') || name.endsWith('.rs');
    
    // Normalize module name (remove trailing '/' or extension if present)
    const newModuleName = 
        createDirectory ? name.replace(/\/$/, '')
        : createFile ? name.split('.')[0] 
        : name;

    // Attempt creation
    if (createFile) {
        if (!await createNewFile(selectedDirectory, newModuleName)) {
            return null;  // File already exists or failed
        }
    } else {
        if (!await createNewDirectory(selectedDirectory, newModuleName)) {
            return null;  // Directory already exists or failed
        }
    }

    return newModuleName;
}

/**
 * Creates a new directory-based module with an inner `mod.rs` file.
 * 
 * @param selectedDirectory - The parent directory path.
 * @param directoryName - Name of the new module directory.
 * @returns true if created successfully, false if it already exists.
 */
async function createNewDirectory(selectedDirectory: string, directoryName: string) {
    if (await utils.pathJoinExists(selectedDirectory, directoryName)) {
        return false;
    }

    // Create new directory
    const newDirectoryUri = vscode.Uri.file(path.join(selectedDirectory, directoryName));
    await vscode.workspace.fs.createDirectory(newDirectoryUri);

    // Add inner `mod.rs` file
    const innerModuleFileUri = vscode.Uri.file(path.join(newDirectoryUri.path, 'mod.rs'));
    await vscode.workspace.fs.writeFile(innerModuleFileUri, new TextEncoder().encode(''));

    // Focus the new `mod.rs` file if configured
    const autoFocus = config.get<boolean>('autoFocus');

    if (autoFocus) {
        await vscode.window.showTextDocument(newDirectoryUri, { preview: false });
    }

    return true;
}

/**
 * Creates a new file-based Rust module (e.g., `foo.rs`).
 * 
 * @param selectedDirectory - The parent directory path.
 * @param fileName - Name of the new module file (without extension).
 * @returns true if created successfully, false if it already exists.
 */
async function createNewFile(selectedDirectory: string, fileName: string) {
    if (await utils.pathJoinExists(selectedDirectory, fileName)) {
        return false;
    }

    // Create new `.rs` file
    const newFileUri = vscode.Uri.file(path.join(selectedDirectory, `${fileName}.rs`));
    await vscode.workspace.fs.writeFile(newFileUri, new TextEncoder().encode(''));

    // Focus the new file if configured
    const autoFocus = config.get<boolean>('autoFocus');

    if (autoFocus) {
        await vscode.window.showTextDocument(newFileUri, { preview: false });
    }

    return true;
}

/**
 * Updates an existing Rust module file (`mod.rs`, `lib.rs`, or `main.rs`)
 * by appending a new `mod` line if it doesn't already exist.
 * 
 * @param selectedDirectory - Directory containing the parent module file.
 * @param moduleLine - The `mod` declaration to add (e.g., `mod foo;`).
 * @returns true if update succeeded, false otherwise.
 */
export async function updateExistingFile(selectedDirectory: string, moduleLine: string) {
    // Determine which file to update: lib.rs > main.rs > mod.rs
    const existingModFileUri =
        (await utils.pathJoinExists(selectedDirectory, 'lib.rs')) ? vscode.Uri.file(path.join(selectedDirectory, 'lib.rs')) :
        (await utils.pathJoinExists(selectedDirectory, 'main.rs')) ? vscode.Uri.file(path.join(selectedDirectory, 'main.rs')) :
        vscode.Uri.file(path.join(selectedDirectory, 'mod.rs'));

    try {
        // Read file contents
        const modContext = await vscode.workspace.fs.readFile(existingModFileUri);
        const modText = Buffer.from(modContext).toString('utf8');

        // Append the new mod line to the top of the file
        if (!modText.includes(moduleLine)) {
            const updated = `${moduleLine}\n${modText.trimStart()}`;
            await vscode.workspace.fs.writeFile(existingModFileUri, new TextEncoder().encode(updated));
        }

        return true;
    } catch {
        return false;
    }
}
