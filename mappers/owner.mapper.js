module.exports = (data) => ({
  id: data.id,
  name: data.name,
  botName: data.botName || '',
  uri: data.uri || '',
  isMain: data.isMain,
  enabled: data.enabled,
});
