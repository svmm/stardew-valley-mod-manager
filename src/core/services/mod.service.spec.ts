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
});
