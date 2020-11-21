import AttackEffect from '../data/attackEffect.json'

/**
 * POKEMON GEN 1 UTILITIES
 * Author: notchris
 */



/**
 * Fix the atk/def effectiveness calculation
 * Created using the chart here: https://pokemondb.net/type/old
 */
const atkCalc = AttackEffect;
const defCalc = {}
Object.entries(atkCalc).forEach(([k,v]) => {
    Object.entries(v).forEach(([m, w]) => {
        if(!defCalc[m]) defCalc[m] = {}
        defCalc[m][k] = w;
    })
})

/**
 * Get a random integer
 */
function randInt (min, max) {
    if (min < 1) min = 1
    return Math.floor(Math.random() * max) + min  
}

/**
 * Get a random float
 */
function randFloat (min, max) {
    return (Math.random() * (max - min) + min).toFixed(4)
}

/**
 * Based on the attack damage type, calc the effect
 */
function calcTypeEffect(move, target) {
    let effect = 0.0;
    if (move.type === 'physical' || move.type === 'special') {
        effect = atkCalc[move.category][target]
    } else if (move.type === "status") {
        effect = defCalc[move.category][target]
    }
    return effect;
}

/**
 * Based on the types of the target pokemon, calc the effectiveness multiplier
 */
function effectMultiplier (effectA, effectB) {
    let effect = effectA + effectB
    if (effectA === 0.0 || effectB === 0.0) {
        return 0.0
    }
    if (effect === 1.0) {
        return 0.5
    } else if (effect === 2.5) {
        return 1.0
    } else {
        return effect
    }
}

/**
 * Calc the damage of an attack on a pokemon
 */
function calcDamage (source, target, move) {
    // Source attack / target defense
    let ad = source.stats.attack / target.stats.defense
    // Base pokemon damage
    let base = (((((2 * source.level) / 5) + 2) * move.power * ad) / 50) + 2

    // Effectivenss based on type(s)
    let effect = 1.0
    if (target.types.length === 2) {
        let effectA = calcTypeEffect(move, target.types[0])
        let effectB = calcTypeEffect(move, target.types[1])
        effect = effectMultiplier(effectA, effectB)
    } else {
        effect = calcTypeEffect(move, target.types[0])
    }
    
    // Multiplier values
    let targets = 1.0,
        weather = 1.0,
        critical = 1.0,
        random = randFloat(0.85, 1.0),
        stab = 1.0,
        burn = 1.0,
        other = 1.0

    // Modifier (Sum of multipliers)
    let modifier = targets * weather * critical * random * stab * effect * burn * other
    return base * modifier
}

export {randInt, randFloat, calcDamage}