const Resolve = require('../src/Resolve');

class StringifyPlugin {
  constructor(...args) {
    this.values = args;
  }

  apply() {
    return JSON.stringify(this.values);
  }
}

test('is Chainable', () => {
  const parent = { parent: true };
  const resolve = new Resolve(parent);

  expect(resolve.end()).toBe(parent);
});

test('shorthand methods', () => {
  const resolve = new Resolve();
  const obj = {};

  resolve.shorthands.forEach((method) => {
    obj[method] = 'alpha';
    expect(resolve[method]('alpha')).toBe(resolve);
  });

  expect(resolve.entries()).toStrictEqual(obj);
});

test('sets methods', () => {
  const resolve = new Resolve();
  const instance = resolve.modules.add('src').end().extensions.add('.js').end();

  expect(instance).toBe(resolve);
});

test('toConfig empty', () => {
  const resolve = new Resolve();

  expect(resolve.toConfig()).toStrictEqual({});
});

test('toConfig with values', () => {
  const resolve = new Resolve();

  resolve
    .plugin('stringify')
    .use(StringifyPlugin)
    .end()
    .modules.add('src')
    .end()
    .extensions.add('.js')
    .end()
    .alias.set('React', 'src/react');

  expect(resolve.toConfig()).toStrictEqual({
    plugins: [new StringifyPlugin()],
    modules: ['src'],
    extensions: ['.js'],
    alias: { React: 'src/react' },
  });
});

test('merge empty', () => {
  const resolve = new Resolve();
  const obj = {
    modules: ['src'],
    extensions: ['.js'],
    alias: { React: 'src/react' },
  };
  const instance = resolve.merge(obj);

  expect(instance).toBe(resolve);
  expect(resolve.toConfig()).toStrictEqual(obj);
});

test('merge with values', () => {
  const resolve = new Resolve();

  resolve.modules
    .add('src')
    .end()
    .extensions.add('.js')
    .end()
    .alias.set('React', 'src/react');

  resolve.merge({
    modules: ['dist'],
    extensions: ['.jsx'],
    alias: { ReactDOM: 'src/react-dom' },
  });

  expect(resolve.toConfig()).toStrictEqual({
    modules: ['src', 'dist'],
    extensions: ['.js', '.jsx'],
    alias: { React: 'src/react', ReactDOM: 'src/react-dom' },
  });
});

test('merge omissions and omit', () => {
  const resolve = new Resolve();

  resolve.merge(
    {
      // should merge
      alias: { ReactDOM: 'src/react-dom' },
      // should merge
      fallback: {
        child_process: false,
        cluster: false,
      },
      // should not merge
      byDependency: {
        esm: {
          mainFields: ['browser', 'module'],
        },
      },
    },
    ['byDependency'],
  );

  expect(resolve.toConfig()).toStrictEqual({
    alias: { ReactDOM: 'src/react-dom' },
    fallback: {
      child_process: false,
      cluster: false,
    },
  });
});

test('merge with omit', () => {
  const resolve = new Resolve();

  resolve.modules
    .add('src')
    .end()
    .extensions.add('.js')
    .end()
    .alias.set('React', 'src/react');

  resolve.merge(
    {
      modules: ['dist'],
      extensions: ['.jsx'],
      alias: { ReactDOM: 'src/react-dom' },
    },
    ['alias'],
  );

  expect(resolve.toConfig()).toStrictEqual({
    modules: ['src', 'dist'],
    extensions: ['.js', '.jsx'],
    alias: { React: 'src/react' },
  });
});

test('plugin with name', () => {
  const resolve = new Resolve();

  resolve.plugin('alpha');

  expect(resolve.plugins.get('alpha').name).toBe('alpha');
  expect(resolve.plugins.get('alpha').type).toBe('resolve.plugin');
});

test('plugin empty', () => {
  const resolve = new Resolve();
  const instance = resolve.plugin('stringify').use(StringifyPlugin).end();

  expect(instance).toBe(resolve);
  expect(resolve.plugins.has('stringify')).toBe(true);
  expect(resolve.plugins.get('stringify').get('args')).toStrictEqual([]);
});

test('plugin with args', () => {
  const resolve = new Resolve();

  resolve.plugin('stringify').use(StringifyPlugin, ['alpha', 'beta']);

  expect(resolve.plugins.has('stringify')).toBe(true);
  expect(resolve.plugins.get('stringify').get('args')).toStrictEqual([
    'alpha',
    'beta',
  ]);
});

test('tsConfig string', () => {
  const resolve = new Resolve();
  resolve.tsConfig('./tsconfig.json').end();
  expect(resolve.toConfig()).toStrictEqual({
    tsConfig: './tsconfig.json',
  });
});

test('tsConfig object', () => {
  const resolve = new Resolve();
  resolve.tsConfig({
    configFile: './tsconfig.json',
    references: 'auto',
  });
  expect(resolve.toConfig()).toStrictEqual({
    tsConfig: {
      configFile: './tsconfig.json',
      references: 'auto',
    },
  });
});

test('extensionAlias', () => {
  const resolve = new Resolve();
  const instance = resolve.extensionAlias.add('.ts').add('.js').end();

  expect(instance).toBe(resolve);
  expect(resolve.toConfig()).toStrictEqual({
    extensionAlias: ['.ts', '.js'],
  });
});
