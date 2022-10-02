import IsVersionAbove from 'front/misc/IsVersionAbove';
import PiniaInstance from './PiniaInstance';
import { defineStore } from 'pinia';
import { APP_RELEASES_URL, APP_VERSION } from 'core/Constants';
import type { PiniaUpdatesState } from 'types/store';

export default defineStore('StoreUpdates', {
    state: (): PiniaUpdatesState => {
        return {
            isFilled: false,
            isAvailable: false,
            releases: []
        };
    },
    actions: {
        async fill() {
            try {
                if (APP_VERSION) {
                    const response = await fetch(APP_RELEASES_URL);
                    const releases = await response.json();
                    const tagVersion = releases[0].tag_name.slice(1);

                    if (IsVersionAbove(tagVersion, APP_VERSION)) {
                        this.isAvailable = true;
                        this.releases = releases;
                    }
                }

                this.isAvailable = false;
            } catch {
                this.isAvailable = false;
            } finally {
                this.isFilled = true;
            }
        }
    },
    getters: {
        getUpdatableReleases(state) {
            if (APP_VERSION) {
                return state.releases.filter(release => IsVersionAbove(release.tag_name.slice(1), APP_VERSION) && !release.draft);
            }

            return [];
        },
        isHasImportant(state) {
            for (const release of state.releases) {
                if (/---important---/i.test(release.body)) {
                    return true;
                }
            }

            return false;
        }
    }
})(PiniaInstance);
