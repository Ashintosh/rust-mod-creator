# Change Log

All notable changes to the "rust-mod-creator" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.4]

### Fixed
- Typo in `package.json` that targets wrong vscode.engine version.

## [0.0.3]

### Fixed
- Uri path when creating a module from command, prevent it from actually creating the module.
- Typo of `rustModCreator.AutoFocus` in `package.json` preventing it from being used correctly.

### Added
- Config option to disable message on successful module creation.
- Config option to choose what visibility options show when creating a module.

### Changed
- Automatically create `mod.rs` file if `main.rs`, `lib.rs` or existing `mod.rs` file is not found.

## [0.0.2]

- Added example images to repo.

## [0.0.1]

- Initial release.