// packages/reactivity/src/effect.ts
var activeEffect;
var effect = (fn) => {
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });
  _effect.run();
  return _effect;
};
var preCleanEffect = (effect2) => {
  effect2._depsLength = 0;
  effect2._trackId++;
};
var cleanDepEffect = (dep, effect2) => {
  dep.delete(effect2);
  if (!dep.size) {
    dep.cleanup();
  }
};
var postCleanEffect = (effect2) => {
  if (effect2.deps.length > effect2._depsLength) {
    effect2.deps.length = effect2._depsLength;
  }
};
var ReactiveEffect = class {
  constructor(fn, scheduler) {
    this.fn = fn;
    this.scheduler = scheduler;
    this._trackId = 0;
    // run函数执行的次数
    this.deps = [];
    this._depsLength = 0;
  }
  run() {
    let lastEffect = activeEffect;
    try {
      activeEffect = this;
      preCleanEffect(this);
      return this.fn();
    } finally {
      postCleanEffect(this);
      activeEffect = lastEffect;
    }
  }
};
var trackEffect = (effect2, dep) => {
  if (effect2._trackId !== dep.get(effect2)) {
    dep.set(effect2, effect2._trackId);
    const oldDep = effect2.deps[effect2._depsLength];
    if (oldDep !== dep) {
      oldDep && cleanDepEffect(oldDep, effect2);
      effect2.deps[effect2._depsLength++] = dep;
    } else {
      effect2._depsLength++;
    }
  } else {
    console.log("\u76F8\u540C\u7684\u5C5E\u6027\u4E0D\u5E94\u8BE5\u91CD\u590D\u6536\u96C6");
  }
};
var triggerEffect = (dep) => {
  for (const effect2 of dep.keys()) {
    if (effect2.scheduler) {
      effect2.scheduler();
    }
  }
};

// packages/shared/src/index.ts
function isObject(value) {
  return typeof value === "object" && value !== null;
}

// packages/reactivity/src/reactiveEffect.ts
var targetMap = /* @__PURE__ */ new WeakMap();
var createDeps = (cleanup, key) => {
  const dep = /* @__PURE__ */ new Map();
  dep.cleanup = cleanup;
  dep.key = key;
  return dep;
};
function track(target, key) {
  if (!activeEffect) {
    return;
  }
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(
      key,
      dep = createDeps(() => depsMap.delete(key), key)
      // 为deps绑定cleanup方法用于清理不需要的属性
    );
  }
  trackEffect(activeEffect, dep);
}
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  let dep = depsMap.get(key);
  if (!dep) {
    return;
  }
  triggerEffect(dep);
}

// packages/reactivity/src/baseHandlers.ts
var mutableHandlers = {
  get(target, key, receiver) {
    if (key === "__v_isReactive" /* isReactive */) {
      return true;
    }
    track(target, key);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    let oldValue = target[key];
    const result = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      trigger(target, key);
    }
    return result;
  }
};

// packages/reactivity/src/reactive.ts
var reactiveMap = /* @__PURE__ */ new WeakMap();
function createReactiveObject(target) {
  if (!isObject(target)) {
    return target;
  }
  if (target["__v_isReactive" /* isReactive */]) {
    return target;
  }
  const existProxy = reactiveMap.get(target);
  if (existProxy) {
    return existProxy;
  }
  const proxy = new Proxy(target, mutableHandlers);
  reactiveMap.set(target, proxy);
  return proxy;
}
function reactive(target) {
  return createReactiveObject(target);
}
export {
  activeEffect,
  cleanDepEffect,
  effect,
  postCleanEffect,
  preCleanEffect,
  reactive,
  trackEffect,
  triggerEffect
};
//# sourceMappingURL=reactivity.js.map
