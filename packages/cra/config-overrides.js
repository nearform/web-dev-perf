module.exports = (config, env) => {
  return {
    ...config,
    resolve: {
      ...config.resolve,
      symlinks: false,
    },
  }
}
