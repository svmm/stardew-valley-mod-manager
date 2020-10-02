import { createModsService } from './mod-list.service';

describe('ModListService', () => {
	const { sortFilesIntoMods } = createModsService();

	describe('sortFilesIntoMods', () => {
		it('Should return 1 folder', () => {
			const mods = sortFilesIntoMods(<any>{
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
