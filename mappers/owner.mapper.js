module.exports = (data) => ({
  id: data.id,
  name: data.name,
  uri: data.uri || '',
  isMain: data.isMain,
});
