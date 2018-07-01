const API_USAGE_LIMIT = [
  {
    api: "/dogs",
    settings: {
      api_access_limit: 10,
      api_access_time_interval: 60, // in seconds
      refresh_cache_interval: 180 // in seconds
    }
  },
  {
    api: "/cats",
    settings: {
      api_access_limit: 5,
      api_access_time_interval: 60, // in seconds
      refresh_cache_interval: 180 // in seconds
    }
  }
];

module.exports = API_USAGE_LIMIT;
