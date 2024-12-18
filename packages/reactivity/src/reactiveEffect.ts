import { activeEffect, trackEffect, triggerEffect } from "./effect"

const targetMap = new WeakMap()

export const createDeps = (cleanup, key) => {
  const dep = new Map() as any
  dep.cleanup = cleanup
  dep.key = key
  return dep
}

export function track(target, key) {
  if (!activeEffect) {
    return
  }
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(
      key, 
      (dep = createDeps(() => depsMap.delete(key), key)) // 为deps绑定cleanup方法用于清理不需要的属性
    )
  }
  trackEffect(activeEffect, dep)
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  let dep = depsMap.get(key)
  if (!dep) {
    return
  }
  triggerEffect(dep)
}