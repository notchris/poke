import {calcDamage} from './util'

export default class Battle {
    constructor (app, trainerA, trainerB) {
        this.app = app
        this.trainerA = trainerA
        this.trainerB = trainerB
    }

    start () {
        this.app.turn = 1
        this.app.messages.push(`${this.trainerB.name} wants to battle!`)
        this.app.messages.push(`${this.trainerB.name} sent out ${this.trainerB.pokemon[0].name}!`)
        this.app.messages.push(`Go! ${this.trainerA.pokemon[0].name}!`)
        this.app.messages.push(`What will ${this.trainerA.pokemon[0].name} do?`)
    }

    actionAttack (source, target, move) {
        let dmg = calcDamage(source, target, move)
        console.log(dmg)
    }


}