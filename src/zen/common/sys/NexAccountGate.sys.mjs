// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const lazy = {};

ChromeUtils.defineESModuleGetters(lazy, {
  SelectableProfileService:
    "resource:///modules/profiles/SelectableProfileService.sys.mjs",
});

/**
 * NexBrowser account gate. Each account is a selectable profile; the profile
 * selector is kept on at startup so the user always picks an account, and an
 * account protected by a Primary Password must be unlocked before any browser
 * window opens. Cancelling the unlock prompt quits the browser.
 */
export const NexAccountGate = {
  init() {
    if (!this.unlockOrQuit()) {
      return;
    }
    this.keepSelectorOn().catch(console.error);
  },

  /**
   * Synchronously asks for the Primary Password of the current account if it
   * has one. NSS keeps re-prompting on a wrong password, so the login promise
   * only rejects when the user cancels.
   *
   * @returns {boolean} false if the browser is quitting.
   */
  unlockOrQuit() {
    let token = Cc["@mozilla.org/security/internalkeytoken;1"].createInstance(
      Ci.nsIPKCS11Token
    );
    if (!token.hasPassword || token.isLoggedIn) {
      return true;
    }

    let done = false;
    let unlocked = false;
    token.login().then(
      () => {
        unlocked = true;
        done = true;
      },
      () => {
        done = true;
      }
    );
    Services.tm.spinEventLoopUntil("NexAccountGate:unlock", () => done);

    if (unlocked && token.isLoggedIn) {
      return true;
    }
    Services.startup.quit(Ci.nsIAppStartup.eForceQuit);
    return false;
  },

  async keepSelectorOn() {
    let service = lazy.SelectableProfileService;
    if (!service.isEnabled || !service.groupToolkitProfile) {
      return;
    }
    await service.maybeSetupDataStore();
    if (!service.groupToolkitProfile.showProfileSelector) {
      await service.setShowProfileSelectorWindow(true);
    }
  },
};
