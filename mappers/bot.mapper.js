module.exports = (data) => {
  if (Array.isArray(data)) {
    return {
      countBots: data.length,
      stateBots: data.map((state) => _mapper(state)),
    };
  }

  return {
    stateBot: _mapper(data),
  };
};

function _mapper(data) {
  return {
    pid: data.pid,
    name: data.name,
    state: data.state,
    error: data.error,
    processed: data.processed,
    writed: data.writed,
    runTime: data.runTime,
  };
}
