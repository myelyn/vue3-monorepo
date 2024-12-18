import { isObject } from "@vue/shared"
import { ReactiveFlags } from "./constants"
import { mutableHandlers } from "./baseHandlers"

// 代理对象的缓存
const reactiveMap = new WeakMap()
function createReactiveObject(target) {
  // 只能代理对象，不是对象的话原样返回
  if (!isObject(target)) {
    return target
  }
  // 已经被代理过了，传入的是被代理过的对象，原样返回
  if (target[ReactiveFlags.isReactive]) {
    return target
  }
  // 已经被代理过了，传入的是原对象，取缓存
  const existProxy = reactiveMap.get(target)
  if (existProxy) {
    return existProxy
  }
  const proxy = new Proxy(target, mutableHandlers)
  // 缓存代理对象
  reactiveMap.set(target, proxy)
  return proxy
}

export function reactive (target) {
  return createReactiveObject(target)
}