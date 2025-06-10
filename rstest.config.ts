import { defineConfig } from '@rstest/core';

export default defineConfig({
  include: ['./test/**/*.js'],
  globals: true,
});
