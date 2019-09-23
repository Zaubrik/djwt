function setExpiration(exp: number | Date): number {
  return (exp instanceof Date ? exp : new Date(exp)).getTime()
}

function isExpired(myExp: number) {
  return new Date(myExp) < new Date()
}

const setExp = setExpiration(new Date().getTime() + 20 * 1000)
console.log(setExp)
console.log(isExpired(1569264300486))

console.log(new Date() > new Date(33))

const str = JSON.stringify(null)
console.log(typeof str)
console.log(JSON.parse(str))

const sss = new TextEncoder().encode("")
console.log(sss)
