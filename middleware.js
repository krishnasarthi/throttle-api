const RedisService = require("./redis_service");
const api_settings = require("./config");

const apiUsageLog = function(req, res, next) {
  let redis = new RedisService();

  if (req.url === "/dogs" || req.url === "/cats") {
    const settings = getApiSettings(req.url);
    // Date.now() returns the number of milliseconds elapsed since January 1, 1970
    const req_time = Math.floor(Date.now() / 1000); // convert to seconds elapsed
    // const key = req.url.split("/")[1];
    const key = req.url;

    const access_limit = settings ? settings.api_access_limit : -1;
    const access_ts = settings ? settings.api_access_time_interval : -1;
    const cache_ts = settings ? settings.refresh_cache_interval : -1;

    redis.getFromList(key, 0, access_limit, cache_ts).then(prev_requests => {
      // check if request passes threshold limit
      if (prev_requests && prev_requests.length >= access_limit) {
        let last_api_call_ts = parseInt(prev_requests[access_limit - 1]);
        let limit_api_call_ts = req_time - access_ts;

        if (last_api_call_ts - limit_api_call_ts > 0) {
          // allow api call and log in redis
          res.status(429).send("Too many requests");
        } else {
          redis.addToList(key, req_time);
          next();
        }
      } else {
        redis.addToList(key, req_time);
        next();
      }
    });
  } else {
    next();
  }
};

function getApiSettings(api_path) {
  let obj = api_settings.filter(element => element.api === api_path);
  return obj ? obj[0].settings : null;
}

module.exports = apiUsageLog;
