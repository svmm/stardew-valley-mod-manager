import { ref, reactive } from 'vue';

/**
 * How to create the profiles feature
 *
 * Option 1)
 *
 * Store all mods underneath hidden folder and copy the active ones into the main folder.
 *
 * Pros:
 * 		- Fairly easy to set up
 * 		- All profiles share same mods if they're active
 *
 * Cons:
 * 		- Bit flaky
 * 		- Maybe a bit slow
 * 		- Means that the user has to do an install/uninstall step to set up the app for use the first/last time.
 * 		  Can't just never touch SVMM and your mods will all still work without uninstalling
 *
 * Option 2)
 *
 * Every profile has a folder underneath a hidden folder. And just copy the whole active one out
 *
 * Pros:
 * 		- Super easy to set up
 * 		- Simple to install/uninstall
 * 		- Every profile has their own mods, which means you can test out different versions in a "sandbox"
 *
 * Cons:
 * 		- Will be slow af
 * 		- Will definitely require an install step. But maybe that could happen when the user creates a profile
 *
 * Option 3)
 *
 * Every mod file just gets renamed to ".modName" if it's not active
 *
 * Pros:
 * 		- Fairly easy to set up
 * 		- We can easily store the list of active mods somewhere, localStorage, indexDB or just locally in the parent directory
 *
 * Cons:
 * 		- Install/Uninstall obvs
 * 		-
 *
 */

// Services
import { ModService } from '../../../core/services/mod.service';
import { FileSystemService } from '../../../core/services/file-system.service';

// Interfaces
import { Mod } from '../../interfaces/mod.interface';

export class ProfileService {
	public static async getProfileFolder() {
		if (!ModService.modDirectory) {
			return null;
		}

		return ModService.modDirectory
	}

	public static async toggleModActive(mod: Mod): Promise<void> {
		await FileSystemService.copyFolder(mod.directoryHandle, mod.parentDirectoryHandle, `.${ mod.directoryHandle.name }`);
		await FileSystemService.deleteFolder(mod.parentDirectoryHandle, mod.directoryHandle.name);
	}
}
