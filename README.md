# rust-mod-creator

This extension makes it easy to create and update Rust modules and submodules.

1. In the file explorer, right-click in the directory you want to create your new module or submodule.
2. Click "Create New (Sub)module".
3. Enter the name of your new (sub)module.
   - Adding a trailing `.` or `.rs` will create a new submodule file.
   - Adding a trailing `/` or no trailing symbol will create a new module directory with a new inner `mod.rs` file.
4. Select the access modifier for your new (sub)module.
5. New (sub)module is now created and added to the top of existing `mod.rs`.
    - If there is no existing `mod.rs` file, it will try to add mod line to `lib.rs` then will try `main.rs`.

## Features

### Simple context-menu shortcut to create a new module or submodule
![context-module-image](images/module.gif)

![context-submodule-image](images/submodule.gif)


> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

- None

## Extension Settings

This extension contributes the following settings:

* `rustModCreator.autoFocus`: Automatically focus the newly created module file in the editor.

## Known Issues

- Cannot create new module from command because of issue with selected path

## Release Notes

### 0.0.2

Added example images to README.md

### 0.0.1

Initial release of Rust Mod Creator
