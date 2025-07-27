import Resolve from './Resolve.js';
import ChainedSet from './ChainedSet.js';

export default class extends Resolve {
  constructor(parent) {
    super(parent);
    this.modules = new ChainedSet(this);
    this.moduleExtensions = new ChainedSet(this);
    this.packageMains = new ChainedSet(this);
  }

  toConfig() {
    return this.clean({
      modules: this.modules.values(),
      moduleExtensions: this.moduleExtensions.values(),
      packageMains: this.packageMains.values(),
      ...super.toConfig(),
    });
  }

  merge(obj, omit = []) {
    const omissions = ['modules', 'moduleExtensions', 'packageMains'];

    omissions.forEach((key) => {
      if (!omit.includes(key) && key in obj) {
        this[key].merge(obj[key]);
      }
    });

    return super.merge(obj, [...omit, ...omissions]);
  }
}
