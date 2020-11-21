/* eslint-disable no-undef */
import './assets/css/style.css'
import {randInt} from './classes/util'
import Battle from './classes/Battle'
import Pokemon from './classes/Pokemon'
import Trainer from './classes/Trainer'
import Move from './classes/Move'

let app = new Vue({
    el: '#app',
    data: {
      player: null,
      opponent: null,
      messages: [],
      turn: 1,
      activeAction: null,
      activeMove: null
    },
    computed: {
        moves () {
            let m = this.player.pokemon[this.player.activePokemon].moves
            if (m.length > 4) {
                return m.splice(0, 4)
            } else {
                return m
            }
        }
    }
})

function parseMove (data) {
    return new Move(
        data.id,
        data.name,
        data.type.name,
        data["damage_class"].name,
        data.power,
        data.pp,
        data.accuracy,
        data.priority,
        data["stat_changes"].map((s) => { return {stat: s.stat.name, change: s.change}})
    )
}

function parsePokemon (data) {

    let stats = {}
    data.stats.forEach((stat) => {
        stats[stat.stat.name] = stat.base_stat
    })
    
    let p = new Pokemon(
        data.id,
        data.name,
        10,
        data.weight,
        data.height,
        stats,
        data.types.map((t) => t.type.name),
        data.moves.filter((m) => m["version_group_details"][0]["level_learned_at"] <= 10 &&
                                 m["version_group_details"][0]["move_learn_method"].name === "level-up")
                                 .map((mo) => mo.move)
    )
    return p
}

function newBattle () {

    /**
     * Fetch 6 random pokemon
     */
    let arr = []
    for (let i = 0; i < 6; i += 1) {
        arr.push(
            fetch(`https://pokeapi.co/api/v2/pokemon/${randInt(1,151)}`)
        )
    }
    Promise.all(arr).then((responses) => {
        return Promise.all(responses.map((response) => {
            return response.json()
        }))
    }).then((data) => {

        let pokemonArr = []
        data.forEach((p) => {
            pokemonArr.push(parsePokemon(p))
        })
        
        /**
         * Fetch & Parse move data
         */
        let moveArr = []
        pokemonArr.forEach((p) => {
            p.moves.forEach((m) => moveArr.push(fetch(m.url)))
        })
        Promise.all(moveArr).then((resps) => {
            return Promise.all(resps.map((resp) => {
                return resp.json()
            }))
        }).then((d) => {
            /**
             * Replace move placeholders with real data
             */
            for (let i = 0; i < pokemonArr.length; i += 1) {
                for (let j = 0; j < pokemonArr[i].moves.length; j += 1) {
                    pokemonArr[i].moves[j] = parseMove(d.filter((mov) => mov.name === pokemonArr[i].moves[j].name)[0])
                }
            }
            
            /**
             * Create two trainers with three pokemon each
             */
            const trainerA = new Trainer('Player', pokemonArr.slice(0, 3))
            const trainerB = new Trainer('Opponent', pokemonArr.slice(3, 6))

            app.player = trainerA
            app.opponent = trainerB

            /**
             * Start the battle!
             */
            const battle = new Battle(app, trainerA, trainerB)
            battle.start()

        }).catch((error) => {
            console.error('Unable to load move data for pokemon!', error)
        })

    }).catch((error) => {
        console.error('Unable to load pokemon data!', error)
    })
}

document.querySelector('#battle').addEventListener('click', () => {
    newBattle()
})
