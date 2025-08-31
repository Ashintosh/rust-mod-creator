import * as path from 'path';
import * as vscode from 'vscode';

/**
 * Validates whether the given name is a valid Rust module or file name.
 * Rules:
 * - Must start with a letter or underscore (cannot start with a number or period).
 * - Can contain only letters, digits, or underscores in the main name.
 * - Cannot end with an underscore.
 * - Periods are only allowed in the extension (not in the base name).
 * - Allowed suffixes:
 *      - No suffix (e.g., "my_module") -> directory with mod.rs
 *      - "/" (e.g., "my_module/") -> explicitly create directory
 *      - "." (e.g., "my_module.") -> explicitly create a submodule file
 *      - ".rs" (e.g., "my_module.rs") -> explicitly create a submodule file
 * 
 * @param name - The module name entered by the user.
 * @returns true if the name is valid, false otherwise.
 */
export function isValidRustName(name: string) {
    const rustNamePattern = /^(?![0-9\.])[A-Za-z0-9_](?:[A-Za-z0-9_]*[A-Za-z0-9])?(?:\.rs|\/|\.)?$/;
    return rustNamePattern.test(name);
}

/**
 * Checks if a specific path exists by joining two paths.
 * 
 * @param aPath - Base path.
 * @param bPath - Additional path to join with base.
 * @returns true if the joined path exists, false otherwise.
 */
export async function pathJoinExists(aPath: string, bPath: string) {
    try {
        const uri = vscode.Uri.file(path.join(aPath, bPath));
        await vscode.workspace.fs.stat(uri);
        return true;
    } catch {
        return false;
    }
}
