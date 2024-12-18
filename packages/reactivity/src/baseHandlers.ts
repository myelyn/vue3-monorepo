import { ReactiveFlags } from "./constants"
import { track, trigger } from "./reactiveEffect"

export const mutableHandlers: ProxyHandler<any> = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.isReactive) {
      return true
    }
    track(target, key)
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    let oldValue = target[key]
    const result = Reflect.set(target, key, value, receiver)
    if (oldValue !== value) {
      trigger(target, key) 
    }
    return result
  }
}