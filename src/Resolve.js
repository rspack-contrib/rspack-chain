import ChainedMap from './ChainedMap.js';
import ChainedSet from './ChainedSet.js';

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

export default class extends ChainedMap {
  constructor(parent) {
    super(parent);

    childMaps.forEach((key) => {
      this[key] = new ChainedMap(this);
    });
    childSets.forEach((key) => {
      this[key] = new ChainedSet(this);
    });

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
    const config = Object.assign(this.entries() || {});

    childMaps.forEach((key) => {
      config[key] = this[key].entries();
    });
    childSets.forEach((key) => {
      config[key] = this[key].values();
    });

    return this.clean(config);
  }

  merge(obj, omit = []) {
    const omissions = [...childMaps, ...childSets];

    omissions.forEach((key) => {
      if (!omit.includes(key) && key in obj) {
        this[key].merge(obj[key]);
      }
    });

    return super.merge(obj, [...omit, ...omissions]);
  }
}
