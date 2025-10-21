# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 

### Changed
- 

### Fixed
- 

## [1.6.0] - 2025-10-21

### Added
- JSDoc documentation was added to the project ([#40](https://github.com/blazejkustra/dynamode/pull/40))
- Enhanced entity conversion to handle attribute selection in EntityManager `get()` and `batchGet()` methods

### Changed
- Bump AWS SDK packages to version 3.883.0 & improve type safety ([#42](https://github.com/blazejkustra/dynamode/pull/40))

### Fixed
- Fix import example in documentation ([#37](https://github.com/blazejkustra/dynamode/pull/37)) - Thanks @gmreburn!

## [1.5.0] - 2024-08-15

### Added
- `@attribute.customName()` decorator to set custom names for entity attributes ([#33](https://github.com/blazejkustra/dynamode/pull/33))
- Tests for `customName` decorator

### Fixed
- Fixed entity renaming logic
- Improved code safety and error handling

## [1.4.0] - 2024-07-21

### Added
- Support for multiple GSI decorators on the same attribute ([#28](https://github.com/blazejkustra/dynamode/pull/28), [#29](https://github.com/blazejkustra/dynamode/pull/29))
- Allow GSI decorators to decorate both partition and sort keys interchangeably ([#31](https://github.com/blazejkustra/dynamode/pull/31))

### Changed
- Moved test fixtures to a dedicated catalog
- Improved test organization and coverage

### Fixed
- Fixed issue where multiple attribute decorators could not be added to primary keys
- Fixed typecheck issues

## [1.3.0] - 2024-06-23

### Added
- Support for decorating an attribute with multiple indexes ([#28](https://github.com/blazejkustra/dynamode/pull/28))

## [1.2.0] - 2024-04-17

### Added
- Binary data type support ([#26](https://github.com/blazejkustra/dynamode/pull/26))

## [1.1.0] - 2024-04-13

### Fixed
- Fixed `startAt` fails when querying secondary indices

## [1.0.0] - 2024-03-24

### Added
- 🎉 Dynamode is now out of beta!
- DynamoDB stream support ([#21](https://github.com/blazejkustra/dynamode/pull/21))

## Earlier Versions

For changes in earlier versions (< 1.0.0), please refer to the [Git commit history](https://github.com/blazejkustra/dynamode/commits/main).

