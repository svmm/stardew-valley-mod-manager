import { getFolder } from '../services/file-system.service';

onmessage = async payload => {
	if (payload.data.type === 'getFolder') {
		const directory = await getFolder();

		payload.source.postMessage(directory);
	}
}
