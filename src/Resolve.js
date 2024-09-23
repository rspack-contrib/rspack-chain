const ChainedMap = require('./ChainedMap');
const ChainedSet = require('./ChainedSet');
const Plugin = require('./Plugin');

const childMaps = ['alias', 'fallback', 'byDependency', 'extensionAlias'];
const childSets = [
  'aliasFields',
  'conditionNames',
  'descriptionFiles',
  'extensions',
  'mainFields',
  'mainFiles',
  'exportsFields',
  'importsFields',
  'restrictions',
  'roots',
  'modules',
];

module.exports = class extends ChainedMap {
  constructor(parent) {
    super(parent);

    childMaps.forEach((key) => {
      this[key] = new ChainedMap(this);
    });
    childSets.forEach((key) => {
      this[key] = new ChainedSet(this);
    });

    this.plugins = new ChainedMap(this);
    this.extend([
      'cachePredicate',
      'cacheWithContext',
      'enforceExtension',
      'symlinks',
      'unsafeCache',
      'preferRelative',
      'preferAbsolute',
      'tsConfig',
    ]);
  }

  plugin(name) {
    return this.plugins.getOrCompute(
      name,
      () => new Plugin(this, name, 'resolve.plugin'),
    );
  }

  get(key) {
    if (childMaps.includes(key)) {
      return this[key].entries();
    }
    if (childSets.includes(key)) {
      return this[key].values();
    }
    return super.get(key);
  }

  toConfig() {
    const config = Object.assign(this.entries() || {}, {
      plugins: this.plugins.values().map((plugin) => plugin.toConfig()),
    });

    childMaps.forEach((key) => {
      config[key] = this[key].entries();
    });
    childSets.forEach((key) => {
      config[key] = this[key].values();
    });

    return this.clean(config);
  }

  merge(obj, omit = []) {
    if (!omit.includes('plugin') && 'plugin' in obj) {
      Object.keys(obj.plugin).forEach((name) =>
        this.plugin(name).merge(obj.plugin[name]),
      );
    }

    const omissions = [...childMaps, ...childSets];

    omissions.forEach((key) => {
      if (!omit.includes(key) && key in obj) {
        this[key].merge(obj[key]);
      }
    });

    return super.merge(obj, [...omit, ...omissions, 'plugin']);
  }
};
