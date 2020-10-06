import { ModService } from './mod.service';

describe('ModListService', () => {
	describe('sortFilesIntoMods', () => {
		it('Should return 1 folder', () => {
			const mods = ModService.sortFilesIntoMods(<any>{
				name: 'parent',
				directories: {
					holdToBreakGems: {
						name: 'holdToBreakGems',
						files: {
							'manifest.json': {
								name: 'manifest.json',
							},
						},
					},
				},
			});

			expect(mods.mods.holdToBreakGems).toBeDefined();
			expect(mods.mods.holdToBreakGems.files).toBeDefined();
			expect(mods.mods.holdToBreakGems.files['manifest.json']).toBeDefined();
		});
	});
});
