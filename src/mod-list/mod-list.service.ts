// Services
import { ModService } from '../core/services/mod.service';

// Intefaces
import { Mod } from '../shared/interfaces/mod.interface';
import { ModDirectory } from '../shared/interfaces/mod-directory.interface';

class ModListServiceClass {
	public get mods(): ModDirectory {
		return ModService.mods;
	}

	public get modDirectoryHandle(): any {
		return ModService.modDirectory.value;
	}

	public async getMods(): Promise<void> {
		await ModService.getMods();
	}

	public async deleteMod(mod: Mod): Promise<void> {
		await ModService.deleteMod(mod);
	}
}

export const ModListService = new ModListServiceClass();
