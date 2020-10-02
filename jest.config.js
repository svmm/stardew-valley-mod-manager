module.exports = {
	"preset": "ts-jest",
	"roots": [
		"<rootDir>/src"
	],
	"testMatch": [
		"**/?(*.)+(spec|test).+(ts|tsx|js)"
	],
	"transform": {
		"^.+\\.(ts|tsx)$": "ts-jest",
	},
	"moduleNameMapper": {
		"native-file-system-adapter": "<rootDir>/test/native-file-system-adapter.ts",
	},
	"globals": {
		"ts-jest": {
			"tsconfig": "./tsconfig.test.json"
		}
	},
	"verbose": true,
  }
