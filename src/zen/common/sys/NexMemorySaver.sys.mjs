// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const lazy = {};

ChromeUtils.defineESModuleGetters(lazy, {
  TabUnloader: "moz-src:///browser/components/tabbrowser/TabUnloader.sys.mjs",
  clearInterval: "resource://gre/modules/Timer.sys.mjs",
  setInterval: "resource://gre/modules/Timer.sys.mjs",
});

const kEnabledPref = "nexbrowser.memory-saver.enabled";
const kTimeoutPref = "nexbrowser.memory-saver.timeout-minutes";
const kCheckIntervalMs = 60 * 1000;

/**
 * NexBrowser memory saver. Firefox only unloads tabs once the system is
 * already low on memory; this unloads background tabs as soon as they have
 * been inactive for a while, like Chrome's Memory Saver.
 *
 * Candidate selection is delegated to TabUnloader, so tabs that are selected,
 * playing audio, in Picture-in-Picture, sharing camera/microphone/screen or
 * private are never unloaded. Pinned tabs and Essentials are kept loaded as
 * well, since they usually hold apps that should keep running in the
 * background (mail, chat).
 */
export const NexMemorySaver = {
  _timer: null,
  _running: false,

  init() {
    Services.prefs.addObserver(kEnabledPref, () => this._update());
    this._update();
  },

  _update() {
    let enabled = Services.prefs.getBoolPref(kEnabledPref, true);
    if (enabled && !this._timer) {
      this._timer = lazy.setInterval(() => {
        this.unloadInactiveTabs().catch(console.error);
      }, kCheckIntervalMs);
    } else if (!enabled && this._timer) {
      lazy.clearInterval(this._timer);
      this._timer = null;
    }
  },

  /**
   * @returns {Promise<number>} the number of tabs unloaded.
   */
  async unloadInactiveTabs() {
    if (this._running) {
      return 0;
    }
    this._running = true;
    try {
      let minutes = Math.max(1, Services.prefs.getIntPref(kTimeoutPref, 20));
      let tabs = await lazy.TabUnloader.getSortedTabs(minutes * 60 * 1000);
      let unloaded = 0;
      for (let tabInfo of tabs) {
        if (!lazy.TabUnloader.isDiscardable(tabInfo)) {
          // The list is sorted by weight, everything after this is kept too.
          break;
        }
        let { tab, gBrowser } = tabInfo;
        if (tab.pinned || tab.hasAttribute("zen-essential") || tab.closing) {
          continue;
        }
        await gBrowser.prepareDiscardBrowser(tab);
        if (gBrowser.discardBrowser(tab)) {
          tab.updateLastUnloadedByTabUnloader();
          unloaded++;
        }
      }
      return unloaded;
    } finally {
      this._running = false;
    }
  },
};
