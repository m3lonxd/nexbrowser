// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

/**
 * Surfer regenerates browser/branding/release/pref/firefox-branding.js from a
 * hardcoded template that points the welcome, "What's new" and release notes
 * pages at zen-browser.app. That file is read after firefox.js (and therefore
 * after our prefs/*.yaml), so the defaults are replaced here instead, before
 * BrowserContentHandler decides which pages to open at startup.
 *
 * "about:blank" hides the release notes links, an empty override URL skips
 * the post-update page.
 */
const kDefaults = {
  "startup.homepage_override_url": "",
  "startup.homepage_welcome_url": "",
  "startup.homepage_welcome_url.additional": "",
  "app.releaseNotesURL": "about:blank",
  "app.releaseNotesURL.aboutDialog": "about:blank",
  "app.releaseNotesURL.prompt": "about:blank",
  "app.update.url.manual": "about:blank",
  "app.update.url.details": "about:blank",
};

export const NexBranding = {
  init() {
    let defaults = Services.prefs.getDefaultBranch("");
    for (let [name, value] of Object.entries(kDefaults)) {
      defaults.setStringPref(name, value);
    }
  },
};
