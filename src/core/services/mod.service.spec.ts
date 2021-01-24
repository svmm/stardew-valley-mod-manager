import { ModService } from './mod.service';

describe('ModListService', () => {
	describe('sortFilesIntoMods', () => {
		it('Should return 1 folder', async () => {
			const mods = await ModService.sortFilesIntoMods(<any>{
				name: 'parent',
				directories: {
					holdToBreakGems: {
						name: 'holdToBreakGems',
						files: {
							'manifest.json': {
								name: 'manifest.json',
								async getFile() {
									return {
										async text(){
											return `
												{
													"Name": "Hold to break gems",
													"Author": "test",
													"Version": "1",
													"Description" : "test"
												}
											`
										}
									}
								},
							},
						},
					},
				},
			});

			expect(mods.mods['Hold to break gems']).toBeDefined();
			expect(mods.mods['Hold to break gems'].files).toBeDefined();
			expect(mods.mods['Hold to break gems'].files['manifest.json']).toBeDefined();
		});
	});

	describe('sanitiseJson', () => {
		it('Should return proper JSON with correct JSON', () => {
			const json = `
				{
					"test": "test"
				}
			`;

			const output = ModService.sanitiseJson(json);

			expect(output).toBe(`{"test":"test"}`);
		});

		it('Should return proper JSON with 1 comma dangle', () => {
			const json = `
				{
					"test": "test",
				}
			`;

			const output = ModService.sanitiseJson(json);

			expect(output).toBe(`{"test":"test"}`);
		});

		it('Should return proper JSON with 2 comma dangles', () => {
			const json = `
				{
					"test": "test",
					"test": "test",
				}
			`;

			const output = ModService.sanitiseJson(json);

			expect(output).toBe(`{"test":"test","test":"test"}`);
		});

		it('Should return proper JSON with nested dangle', () => {
			const json = `
				{
					"test1": {
						"test2": "test2",
					}
				}
			`;

			const output = ModService.sanitiseJson(json);

			expect(output).toBe(`{"test1":{"test2":"test2"}}`);
		});
	});
});
