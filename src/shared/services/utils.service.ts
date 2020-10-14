export const chunkArray = <T>(arrayToChunk: T[], chunkSize: number): T[][] => {
	let perArrayCount = 0;
	let chunk = 0;
	const output = [[]];

	for (const item of arrayToChunk) {
		if (!output[chunk]) {
			output[chunk] = [];
		}

		output[chunk].push(item);

		perArrayCount++;

		if (perArrayCount === chunkSize) {
			chunk++;
			perArrayCount = 0;
		}
	}

	return output;
}
