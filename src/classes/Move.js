export default class Move {
    constructor (id, name, category, type, power, pp, accuracy, priority, statChanges) {
        this.id = id
        this.name = name
        this.category = category
        this.type = type
        this.power = power
        this.pp = pp
        this.accuracy = accuracy
        this.priority = priority
        this.statChanges = statChanges

        return this
    }
}