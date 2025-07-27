import Callable from './Callable.js';
import createMap from './createClass/createMap.js';
import createChainable from './createClass/createChainable.js';
import createValue from './createClass/createValue.js';

export default createValue(createMap(createChainable(Callable)));
