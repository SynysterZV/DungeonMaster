import { ApplicationCommandOptionType as aType } from "discord.js"

import type { ChatCommand } from '#types/Command'

const dice = {
    force: ["N", "LL", "N", "LL", "N", "LL", "N", "L", "N", "L", "N", "NN"],
    challenge: ["B","TT", "T", "TT", "T", "TF", "F", "FF", "D", "FF"],
    proficiency: ["B", "AA", "A", "AA", "R", "S", "SA", "S", "SA", "SS", "SA", "SS"],
    ability: ["B", "S", "A", "SA", "SS", "A", "S", "AA"],
    difficulty: ["B", "T", "F", "TF", "T", "TT", "FF", "T"],
    boost: ["B", "B", "S", "AA", "SA", "A"],
    setback: ["B", "B", "F", "T", "F", "T"]
}

function random(ar: string[]) {
	return ar[Math.floor(Math.random() * ar.length)]
}

function roll(values: Record<string, number>) {
    let r = ''

    Object.entries(values).filter(([_,v]) => v !== 0).forEach(([k,v]) => {
        for(let i = 0; i < v; i++) {
            // @ts-ignore
            r += random(dice[k])
        }
    })

    return r

}

function parse(cd: string) {
  
  let res = {
  	dark: 0,
    light: 0,
    threats: 0,
    advantages: 0,
    failures: 0,
    successes: 0,
    despair: 0,
    triumph: 0
  };
  
  let arr = ['N', 'L', 'T', 'A', 'F', 'S', 'D', 'R'].map(l => [...cd.matchAll(new RegExp(l, "g"))].length)
  
  const sf = arr[4] - arr[5]
  const ta = arr[2] - arr[3]
  const dt = arr[6] - arr[7]
  
  if(sf < 0) res.successes = Math.abs(sf)
  else res.failures = sf
  
  if(ta < 0) res.advantages = Math.abs(ta)
  else res.threats = ta
  
  if(dt < 0) res.triumph = Math.abs(dt)
  else res.despair = dt
  
  res.dark = arr[0]
  res.light = arr[1]
  
  return res
}

export const command: ChatCommand = {
    data: {
        name: "roll",
        description: "rolls dice",
        options: Object.keys(dice).map(x => ({ name: x, description: `# of ${x} dice`, type: aType.Number }))
    },

    async exec(int) {
        const values = Object.keys(dice).reduce((a,c) => { 
            a[c] = int.options.getNumber(c) || 0
            return a
        }, {} as Record<string,number>)

        const rv = Object.entries(parse(roll(values))).filter(([_,v]) => v !== 0)

        if(!rv.length) return int.reply("You must select dice to roll")

        const last = rv.pop()

        // @ts-ignore
        int.reply({ content: `You rolled ${rv.map(([k,v]) => `${v} ${k}`).join(", ")}${rv.length ? " and" : ""} ${last[1]} ${last[0]}` })
    }
}

/*

Dark: N
Light: L
Threat: T
Advantage: A
Failure: F
Success: S
Despair: D
Triumph: R


White: 1N,2L,1N,2L,1N,2L,1N,1L,1N,1L,1N,2N
Red: 2T,1T,2T,1T,1T1F,1F,1T1F,1F,2F,1DES,2F
Yellow: 2A,1A,2A,1R,1S,1S1A,1S,1S1A,2S,1S1A,2S
Green: 1S,1A,1S1A,2S,1A,1S,2A,B
Purple: 1T,1F,1T1F,1T,B,2T,2F,1T
Blue: 1S,2A,1S1A,B,B,1A
Black: 1F,1T,B,1F,1T,B

*/