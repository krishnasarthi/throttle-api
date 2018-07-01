const redis = require("redis");
const bluebird = require("bluebird");
bluebird.promisifyAll(redis);
const api_settings = require("./config");

class RedisService {
  constructor() {
    this.client = redis.createClient();

    this.client.on("error", err => {
      console.log(err);
    });
  }

  setValue(key, value) {
    return this.client.set(key, value);
  }

  async getValue(key) {
    return await this.client.getAsync(key);
  }

  addToList(key, value) {
    let args = [key, value];
    this.client.lpush(...args);
  }

  getFromList(key, start_index, end_index, cache_ts) {
    return new Promise((resolve, reject) => {
      let promise = this.resetList(key, cache_ts);
      promise
        .then(() =>
          this.client
            .lrangeAsync(key, start_index, end_index)
            .then(data => {
              resolve(data);
            })
            .catch(err => {
              reject(err);
            })
        )
        .catch(reason => {
          console.log(reason);
          reject(reason);
        });
    });
  }

  resetList(key, cache_ts) {
    return new Promise((resolve, reject) => {
      try {
        const unix_time_secs = Math.floor(Date.now() / 1000);
        const ns = `${key}:ttl`;
        const key_expire_ts = unix_time_secs + cache_ts;

        this.client
          .lrangeAsync(key, 0, 1)
          .then(value => {
            if (value && value.length === 0) {
              this.client.set(ns, key_expire_ts).then(data => {
                resolve(data);
              });
            } else {
              this.getValue(ns)
                .then(data => {
                  let expire_ts = parseInt(data);
                  // if expiration time has passed, recreate the list by deleting older values and only with recent 20 requests
                  if (expire_ts - unix_time_secs <= 0) {
                    console.log(
                      "Need to reset redis list",
                      expire_ts - unix_time_secs
                    );

                    this.client
                      .lrangeAsync(key, 0, 20)
                      .then(requests => {
                        this.client.del(key);
                        this.addToList(key, requests);
                        this.setValue(ns, key_expire_ts);
                        resolve();
                      })
                      .catch(err => {
                        reject(err);
                      });
                  }
                })
                .catch(err => {
                  reject(err);
                });
            }
          })
          .catch(err => {
            reject(err);
          });
        resolve();
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }
}

module.exports = RedisService;
