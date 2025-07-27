import ChainedValueMap from './ChainedValueMap.js';

export default class extends ChainedValueMap {
  constructor(parent) {
    super(parent);
    this.extend(['assetFilter', 'hints', 'maxAssetSize', 'maxEntrypointSize']);
  }
}
