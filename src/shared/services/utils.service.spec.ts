import { chunkArray } from './utils.service';

describe('UtilsService', () => {
	describe('chunkArray', () => {
		it('Should create 1 chunk with array of 1 element', () => {
			const arrToChunk = [1];

			const output = chunkArray(arrToChunk, 1);

			expect(output).toStrictEqual([[1]]);
		});

		it('Should create 2 chunks with array of 2 elements', () => {
			const arrToChunk = [1, 2];

			const output = chunkArray(arrToChunk, 1);

			expect(output).toStrictEqual([[1], [2]]);
		});
	});
});
