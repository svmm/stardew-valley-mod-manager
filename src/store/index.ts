import Vue from 'vue';
import Vuex from 'vuex';
import * as chokidar from 'chokidar';

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		currentFolderLocation: '',
		modsCurrentlyInstalled: [] as string[],
		folderWatcher: null as unknown as chokidar.FSWatcher,
	},
	mutations: {
		setCurrentFolderLocation(state, folderLocation: string) {
			state.currentFolderLocation = folderLocation;
		},
		setWatcher(state, watcher: chokidar.FSWatcher) {
			state.folderWatcher = watcher;
		},
		setModsCurrentlyInstalled(state, mods: string[]) {
			state.modsCurrentlyInstalled = [
				...mods,
			];
		}
	},
	actions: {
		setCurrentFolderLocation({ commit, dispatch }, folderLocation: string) {
			commit('setCurrentFolderLocation', folderLocation);
			dispatch('setWatcher', folderLocation);
		},
		setWatcher({ commit, dispatch, state, getters }, folderLocation: string) {
			commit('setModsCurrentlyInstalled', []);

			const watcher = chokidar
				.watch(folderLocation, {
					cwd: folderLocation,
					ignored: /(^|[/\\])\../,
					persistent: true,
					depth: 0,
				})
				.on('addDir', (path: string) => {
					dispatch('addMod', path);
				})
				.on('unlinkDir', (path: string) => {
					dispatch('removeMod', path);
				});

			commit('setWatcher', watcher);
		},
		addMod({ commit, state }, modPath: string) {
			if (!state.modsCurrentlyInstalled.find(path => path === modPath)){
				const newMods = [
					...state.modsCurrentlyInstalled,
					modPath,
				];

				commit('setModsCurrentlyInstalled', newMods);
			}
		},
		removeMod({ commit, state }, modPath: string) {
			const newMods = [
				...state.modsCurrentlyInstalled,
			].filter(path => path !== modPath);

			commit('setModsCurrentlyInstalled', newMods);
		},
	},
	getters: {
		installedMods(state) {
			return state.modsCurrentlyInstalled;
		},
	},
	modules: {},
});
