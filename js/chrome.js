/*
    A wrapper for the Chrome App API's - mapped to Web Platform API's
*/

class Chrome {
  constructor() {
    this._app = new App();
    this._runtime = new Runtime();
    this._contextMenus = new ContextMenus();
    this._notifications = new Notification();
    this._storage = new Storage();
    this._i18n = new i18n();
    this._fileSystem = new ChromeFileSystem();
  }

  get app() {
    return this._app;
  }

  get runtime() {
    return this._runtime;
  }

  get contextMenus() {
    return this._contextMenus;
  }

  get version() {
    return window.navigator.appVersion.match(/Chrome\/(\d+)/)[1] * 1 || 0;
  }

  get notifications() {
    return this._notifications;
  }
  
  get storage() {
    return this._storage;
  }

  get i18n() {
    return this._i18n;
  }

  get fileSystem() {
    return this._fileSystem;
  }
}


class ChromeFileSystem {
  chooseEntry(options, callback) {
    const optionsMap = {
      "openFile": "openFile",
      "saveFile": "saveFile",
      "openDirectory": "openDirectory",
      "openWritableDirector": "openDirectory", // Fix later
      "openWritableFile": "openFile" // Fix later. Have to write later.
    };
    const accepts = {
      mimeTypes: ('accepts' in options) ? options.accepts.mimeTypes : undefined,
      extensions: ('accepts' in options) ? options.accepts.extensions : undefined,
    };
    const newOptions = {
      type: optionsMap[options.type],
      //accepts: accepts,
      multiple: options.acceptsMultiple || false
    };

    window.chooseFileSystemEntries(newOptions).then(entries => {
      callback(new FileEntry(entries[0]))
    });
  }

  getDisplayPath(entry, callback) {
    callback(entry.n)
  }

  isWritableEntry(entry, callback) {
    callback(true)
  }

  retainEntry(entry) {

  }
}

class i18n {
  constructor() {
    const locale = navigator.language.split('-')[0]
    fetch(`/_locales/${locale}/messages.json`).then(async res => {
      this._lang = await res.json();
    })
    .catch();
  }
  
  getMessage(name, substitutions) {
    if (name in this._lang) {
      return this._lang[name].message;
    }
    else {
      return "";
    }
  }
}

class ContextMenus {

  get onClicked() {
    return {
      addListener: () => null
    }
  };

  create() {

  }

}

class App {

  get window() {
    return {
      "current": () => new AppWindow(window)
    }
  }
}

class AppWindow {
  constructor(w) {
    this._window = w;
    this._onfullscreened = [];
    this._onminimized = [];
    this._onmaximized = [];
    this._onrestored = [];
    document.addEventListener("fullscreenchange", () => {
      for(const callback of this._onfullscreened) {
        callback();
      }
    });

    document.addEventListener("visibilitychange", function() {
      if (document.visibilityState === "visible") {
        for(const callback in this._onrestored) {
          callback();
        }
      }
      else if (document.visibilityState === "hidden") {
        for(const callback in this._onminimized) {
          callback();
        }
      }
    });
  }

  focus() {
    this._window.focus();
  }

  isMaximized() {
    return (window.innerWidth == screen.width && window.innerHeight == screen.height);
  }

  isFullscreen() {
    return document.fullscreenEnabled;
  }

  get onMaximized() {
    return {
      addListener: (callback) => { 
        this._onmaximized.push(callback)
      }
    }
  }

  get onMinimized() {
    return {
      addListener: (callback) => { 
        this._onminimized.push(callback)
      }
    }
  }

  get onFullscreened() {
    return {
      addListener: (callback) => { 
        this._onfullscreened.push(callback)
      }
    }
  }

  get onRestored() {
    return {
      addListener: (callback) => { 
        this._onrestored.push(callback)
      }
    }
  }
}

class Notification {
  get onButtonClicked() {
    return {
      addListener: () => null
    }
  }
}

class Storage {
  get sync() {
    return {
      get: (keys, callback) => {
        const results = [];

        if (keys === undefined) {
          keys = Object.keys(localStorage).filter(i => i.startsWith('sync_'))
        }

        if (Array.isArray(keys) === false) {
          keys = [keys]
        }

        keys.forEach(key => { 
          if (typeof(key) !== 'string') {
            key = key.name; 
          }
          results.push(localStorage[`sync_${key}`]);
        });
        
        callback(results)
      },
      set: (keys, callback) => {
        if (Array.isArray(keys) === false) {
          keys = [keys];
        } 

        keys.forEach(key => { 
          localStorage[`sync_${key}`] = key.key
        });
        
        callback()
      }
    }
  }

  get local() {
    return {
      get: (keys, callback) => {
        const results = [];

        if (keys === undefined) {
          keys = Object.keys(localStorage).filter(i => i.startsWith('local_'))
        }

        if (Array.isArray(keys) === false) {
          keys = [keys]
        }

        keys.forEach(key => { 
          if (typeof(key) !== 'string') {
            key = key.name; 
          }
          results.push(localStorage[`local_${key}`]);
        });
        
        callback(results)
      },
      set: (keys, callback) => {
        if (Array.isArray(keys) === false) {
          keys = [keys];
        } 

        keys.forEach(key => { 
          localStorage[`local_${key}`] = key.key
        });
        
        callback()
      }
    }
  }
}

class DirectorEntry {
  constructor(crxDirectoryEntry) {
    this._crxDirectoryEntry = crxDirectoryEntry;
  }

  getFile(name, options) {
    this._crxDirectoryEntry.getFile(name, options).then()
  }
}

class ChromeFileWriter {
  constructor(writer) {
    this._writer = writer;
  }

  truncate(size) {
    this._writer.truncate(size).then(a=> this.onwriteend());
  }

  get onerror() {
    return this._onerror;
  }

  set onerror(err) {
    this._onerror = err;
  }

  get onwriteend() {
    return this._onwriteend;
  }

  set onwriteend(end) {
    this._onwriteend = end;
  }

  write(blob) {
    console.log(blob)
    this._writer.write(0, blob).then(a=> {
      this._writer.close().then(b=>{
        this.onwriteend()
      });
    });
  }
}

class FileEntry {
  constructor(crxFileEntry) {
    this._crxFileEntry = crxFileEntry;
  }

  file(callback) {
    this._crxFileEntry.getFile().then(f => {
      callback(f)
    })
  }

  createWriter(callback) {
    this._crxFileEntry.createWriter().then(writer => {
      callback(new ChromeFileWriter(writer));
    });
  }

  get name() {
    return this._crxFileEntry.name;
  }
}

class Runtime {

  constructor() {
    this._lastError = "";
    this._id = Math.random() * 1000000;
    window.onerror = err => this._lastError = err;
  }

  sendMessage(id, message, options, callback) {
    // Create custome MessageChannels
  }

  reload() {
    window.reload();
  }

  get id() {
    return this._id;
  }

  get lastError() {
    return this._lastError;
  }

  getPackageDirectoryEntry(callback) {
    const opts = { type: 'openDirectory' };
    (async () => {
      const handle = await window.chooseFileSystemEntries(opts);
      return callback(new DirectorEntry(handle));  
    })()
  }

  get onMessageExternal() {
    return {
      addListener: () => null
    }
  }

  getPlatformInfo(callback) {
    callback( {
      "PlatformOS": navigator.platform,
      "PlatformArch": navigator.platform
    }) 
  }

  requestUpdateCheck(callback) {
    callback("no_update");
  }
}

define(function () {
  const chrome_ = new Chrome;
  window.chrome = chrome_;

  return chrome_;
})