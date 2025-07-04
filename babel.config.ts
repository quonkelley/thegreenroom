import type { ConfigFunction } from '@babel/core';

const config: ConfigFunction = (api) => {
  api.cache(true);
  
  return {
    presets: ['next/babel'],
  };
};

export default config; 