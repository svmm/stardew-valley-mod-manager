import { ref, reactive } from 'vue';

// Services
import { ModService } from '../../../core/services/mod.service';

export class ProfileService {
	public static async getProfileFolder() {
		if (!ModService.modDirectory) {
			return null;
		}

		return ModService.modDirectory
	}
}
