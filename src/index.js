module.exports = (pluginContext) => {
  return (query, env = {}) => {
    return new Promise((resolve, reject) => {
      resolve([
        {
          icon: 'src/clickup.png',
          title: 'Create task: ' + query + '?',
          subtitle: '',
          value: query,
        }
      ])
    })
  }
}