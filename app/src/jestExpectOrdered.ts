import keyIndex from "key-index"

declare global {
  namespace jest {
    interface Matchers<R, T> {
      toBeOne(...expected: T[]): CustomMatcherResult
      once(got: T extends any[] ? T[number] : T): CustomMatcherResult
      ordered(got: T extends any[] ? T[number] : T): CustomMatcherResult
    }
  }
}

const arrayCopy = keyIndex((ar: any[]) => {return {ar: [...ar], indicesUsed: []}})
const sym = Symbol()

export default {
  toBeOne(got, ...expected) {
    return {
      pass: got.includes(expected),
      message: () => `Expected ${this.utils.printReceived(got)} to be one of ${this.utils.printExpected(expected)}`,
    }
  },
  once(expected, got) {
    const exp = arrayCopy(expected)
    const ar = exp.ar

    let ind = ar.indexOf(got)
    const pass = ind !== -1
    if (pass) {
      exp.indicesUsed.push(ind)
      ar[ind] = sym
    }


    return {
      pass,
      message: () => `Expected ${this.utils.printReceived(got)} to be tested once and out of [${expected.map((e, i) => exp.indicesUsed.includes(i) ? this.utils[expected[i] !== got ? "printExpected" : "printReceived"](e) : JSON.stringify(e)).join(", ")}].\nFaild at the ${exp.indicesUsed.length}. invocation.`,
    }
  },
  ordered(expected, got) {
    const exp = arrayCopy(expected)
    const ar = exp.ar

    let i = ar.indexOf(got)
    const pass = i !== -1
    if (pass) {
      exp.indicesUsed.push(i)
      ar.splice(i, 1)
    }
    return {
      pass,
      message: () => `Expected checks in the following succession [${expected.map((e, i) => i <= exp.indicesUsed.length ? this.utils[i < exp.indicesUsed.length ? "printExpected" : "printReceived"](e) : JSON.stringify(e)).join(", ")}].\nInsetead got ${this.utils.printReceived(got)} at the ${exp.indicesUsed.length+1}. invocation.`,
    }
  },
}

