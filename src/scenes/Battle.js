/* eslint-disable no-undef */
import Phaser from 'phaser';
import Action from '../classes/Action';
import Dialog from '../classes/Dialog';
import Pokemon from '../classes/Pokemon'
import Trainer from '../classes/Trainer'
export default class Battle extends Phaser.Scene {

    constructor() {
        super({key: "Battle"});
    }

    preload () {
        let c = 0;
        let arr = []
        for (let i = 0; i < 6; i += 1) {
            let r = Phaser.Math.Between(1,151)
            arr.push(
                r
            )
            if (i < 3) {
                this.load.image(r, `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${r}.png`)
            } else {
                this.load.image(r, `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${r}.png`)
            }
        }
        this.load.on('filecomplete', (k) => {
            c += 1
            if (c === 6) {
                this.initBattle(arr)
            }
        }, this)
    }

    init () {
        this.trainerA = null
        this.trainerB = null
    }

    initBattle (rnd) {
        /**
         * Fetch 6 random pokemon
         */
        let arr = []
        for (let i = 0; i < rnd.length; i += 1) {
            arr.push(
                fetch(`https://pokeapi.co/api/v2/pokemon/${rnd[i]}`)
            )
        }
        Promise.all(arr).then((responses) => {
            return Promise.all(responses.map((response) => {
                return response.json()
            }))
        }).then((data) => {

            let pokemonArr = []
            data.forEach((p) => {
                pokemonArr.push(this.parsePokemon(p))
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
                        pokemonArr[i].moves[j] = d.filter((mov) => mov.name === pokemonArr[i].moves[j].name)[0]
                    }
                }

                /**
                 * Create two trainers with three pokemon each
                 */
                const floorA = this.add.image(40, 410, 'floor', 0)
                floorA.setScale(2, 2)
                floorA.setOrigin(0, 1)
                floorA.setDepth(-2)
                this.trainerA = new Trainer(this, floorA.x + 96, floorA.y - 96, 'Player', 'trainerM', pokemonArr.slice(0, 3), true)

                const floorB = this.add.image(600, 200, 'floor', 0)
                floorB.setScale(2, 2)
                floorB.setOrigin(1, 0)
                floorB.setDepth(-2)
                this.trainerB = new Trainer(this, floorB.x - 96, floorB.y - 48, 'Opponent', 'trainerF_front', pokemonArr.slice(3, 6))

                this.loaded()


            }).catch((error) => {
                console.error('Unable to load move data for pokemon!', error)
            })

        }).catch((error) => {
            console.error('Unable to load pokemon data!', error)
        })
    }

    parsePokemon (data) {

        let stats = {}
        data.stats.forEach((stat) => {
            stats[stat.stat.name] = stat.base_stat
        })
        let p = new Pokemon(
            this,
            100,
            100,
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

    loaded () {
        /**
         * Add the scene bg and the dialog bg graphics
         */
        this.bg = this.add.image(0, 0, 'bg', 0)
        this.bg.setOrigin(0, 0)
        this.bg.setDepth(-3)
        this.dialogBg = this.add.image(0, 380, 'container', 0)
        this.dialogBg.setOrigin(0, 0)
        this.dialogBg.setDepth(0)

        /**
         * Init Action menu
         */
        this.action = new Action(this, 384, 380)
        this.action.hideAction()
        

        /**
         * Battle intro sequence
         */
        this.dialog = new Dialog(this, 0, 380, 'Trainer B wants to battle!').on('done', () => {
            this.dialog.removeDialog()
            this.trainerB.sendOutPokemon(0)
            this.dialog = new Dialog(this, 0, 380, `Trainer B sent out ${this.trainerB.pokemon[0].name}`).on('done', () => {
                this.dialog.removeDialog()
                this.trainerA.sendOutPokemon(0)
                this.dialog = new Dialog(this, 0, 380, `Go! ${this.trainerA.pokemon[0].name}`).on('done', () => {
                    this.dialog.removeDialog()
                    this.trainerA.promptAction()
                })
            })
        })
    }

    update () {
    }

}