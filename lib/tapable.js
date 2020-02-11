class SyncHook {
  constructor () {
    this.tasks = [];
  }

  tap (name, task) {
    this.tasks.push(task);
  }

  call (...args) {
    this.tasks.forEach((taks) => {
      taks(...args);
    });
  }
}

class SyncBailHook {
  constructor () {
    this.tasks = [];
  }

  tap (name, task) {
    this.tasks.push(task);
  }

  call (...args) {
    let index = 0;
    let res;
    do {
      res = this.tasks[i++](...args);
    } while (res === undefined && index < this.tasks.length);
  }
}


class SyncWaterfallHook {
  constructor () {
    this.tasks = [];
  }

  tap (name, task) {
    this.tasks.push(task);
  }

  call (...args) {
    const [first, ...others] = this.tasks;
    others.reduce((a, b) => {
      return b(a);
    }, first(...args));
  }
}


class SyncLoopHook {
  constructor () {
    this.tasks = [];
  }

  tap (name, task) {
    this.tasks.push(task);
  }

  call (...args) {
    this.tasks.forEach((task) => {
      let res;
      do {
        res = task(...args);
      } while (res === undefined);
    });
  }
}

class AsyncParallelHook {
  constructor () {
    this.tasks = [];
  }

  tap (name, task) {
    this.tasks.push(task);
  }

  call () {
    this.tasks.forEach((taks) => {
      taks(...args);
    });
  }

  tapAsync (name, task) {
    this.tasks.push(task);
  }

  callAsync (...args) {
    const finalCallback = args.pop();
    let index = 0;

    function done () {
      index++;
      if (index === this.tasks.length) {
        finalCallback();
      }
    }

    this.tasks.forEach((taks) => {
      taks(...args, done.call(this));
    });
  }

  tapPromise (name, task) {
    this.tasks.push(task);
  }

  promise (...args) {
    const list = this.tasks.map(task => task(...args));
    return Promise.all(list);
  }

}

class AsyncSeriesHook {
  constructor () {
    this.tasks = [];
  }

  tapAsync (name, task) {
    this.tasks.push(task);
  }

  callAsync (...args) {
    const finalCallback = args.pop();
    let index = 0;
    const next = () => {
      if (index === this.tasks.length) {
        finalCallback();
        return;
      }
      this.tasks[index++](...args, next);
    };
    next();
  }

  tapPromise (name, task) {
    this.tasks.push(task);
  }

  promise (...args) {
    const [first, ...others] = this.tasks;
    return others.reduce((a, b) => {
      return a.then(() => b(...args));
    }, first(...args));
  }
}

class AsyncSeriesWaterfallHook {
  constructor () {
    this.tasks = [];
  }

  tapAsync (name, task) {
    this.tasks.push(task);
  }

  callAsync (...args) {
    const finalCallback = args.pop();
    let index = 0;
    const next = (err, result) => {
      if (err || index === this.tasks.length) {
        finalCallback();
        return;
      }
      this.tasks[index++](result, next);
    };
    next(null, ...args);
  }
}

module.exports = {
  SyncHook,
  SyncBailHook,
  SyncWaterfallHook,
  SyncLoopHook,
  AsyncParallelHook,
  AsyncSeriesHook,
  AsyncSeriesWaterfallHook,
};
