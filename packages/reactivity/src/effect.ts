export let activeEffect


export const effect = (fn) => {
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run()
  })
  _effect.run()
  return _effect
}

export const preCleanEffect = (effect) => {
  effect._depsLength = 0
  effect._trackId++
}

export const cleanDepEffect = (dep, effect) => {
  dep.delete(effect)
  if (!dep.size) {
    dep.cleanup()
  }
}

export const postCleanEffect = (effect) => {
  if (effect.deps.length > effect._depsLength) {
    effect.deps.length = effect._depsLength
  }
}

class ReactiveEffect {
  _trackId = 0 // run函数执行的次数
  deps = []
  _depsLength = 0
  constructor(public fn, public scheduler) {}
  run() {
    let lastEffect = activeEffect
    try {
      activeEffect = this
      preCleanEffect(this)
      return this.fn()
    } finally {
      postCleanEffect(this) // 旧属性比新属性多，进行逐个更新之后，还要删除多余的
      activeEffect = lastEffect
    }
  }
}

export const trackEffect = (effect, dep) => {
  // 首先更新映射表。如果_trackId相同，则说明此次effect执行过程中，该属性已经收集过了，跳过本次收集
  if (effect._trackId !== dep.get(effect)) {
    // 如果之前映射表中不存在该effect，或trackId不同，则更新映射表
    dep.set(effect, effect._trackId)
    // 与双向记忆中的deps逐个比较,找出旧的无用的属性，从映射表中清除。相同属性则跳过
    const oldDep = effect.deps[effect._depsLength]
    if (oldDep !== dep) {
      oldDep && cleanDepEffect(oldDep, effect)
      effect.deps[effect._depsLength++] = dep
    } else {
      effect._depsLength++
    }
  } else {
    console.log('相同的属性不应该重复收集')
  }
}

export const triggerEffect = ((dep) => {
  for(const effect of dep.keys()) {
    if (effect.scheduler) {
      effect.scheduler()
    }
  }
})