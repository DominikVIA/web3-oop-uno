<template>
  <main class="app">
  <h1>UNO</h1>
  <section v-if="screen === 'setup'" class="panel">
    <h2>Setup game</h2>
    
    <label for="bot-count">Number of bots:</label>
    <select id="bot-count" v-model.number="botCount">
      <option :value="1">1 bot</option>
      <option :value="2">2 bots</option>
      <option :value="3">3 bots</option>
    </select>
    
    <button @click="startGame">Start Game</button>
  </section>
    
  <section v-else-if="screen === 'game' && view">
    <p>
      Turn: <strong>{{ view.currentPlayerName }}</strong>
    </p>
    
    <p>
      Color: <strong>{{ view.currentColor }}</strong>
    </p>
    
    <div class="table">
      <div>
        <h2>Upper card</h2>
        <div class="card top-card"> {{ formatCard(view.topCard) }}</div>
      </div>
    
      <div>
        <h2>Bots hands</h2>
        <p v-for="bot in view.bots" :key="bot.name">
          {{ bot.name }}: {{ bot.cardCount }} cards
        </p>
      </div>
    </div>
    
    <div v-if="isHumanTurn" class="human-turn">
      <h2>Your hand</h2>
      <p v-if="view.myHand.length ===2" class="uno-message">
        You have 2 cards left! Say "UNO" before playing a card when you have two cards left
      </p>
      
      <button
        v-if="view.myHand.length === 2" class="uno-button" @click="sayUno">
        Say UNO!
      </button>
      
      <div class="hand">
        <button
          v-for="(card, index) in view.myHand"
          :key="index"
          :disabled="!round.canPlay(index)"
          @click="selectCard(index)">
          {{ formatCard(card) }}
        </button>
      </div>
      
      <div v-if="pendingWildIndex !== null">
        <p>Select a color for the wild card:</p>
        <button
          v-for="color in colors"
          :key="color"
          @click="playWild(color)">
          {{ color }}
        </button>
      </div>
      
      <button
        :disabled="round.canPlayAny()"
        @click="drawCard">
        Draw Card
      </button>
    </div>
    
    <div v-else class="bot-turn">
      <p>Waiting for bot to play...</p>
    </div>
  </section>
    
  <section v-else-if="screen === 'result'">
    <h2>Round ended</h2>
    <p>
      Winner: <strong>{{ view.winnerName }}</strong>
    </p>
    <button @click="screen = 'setup'">Play Again</button>
  </section>
  </main>
</template>

<script>
import { createRound } from './model/round.ts'

export default {
  name: 'App',
  
  data() {
    return {
      screen: 'setup',
      botCount: 1,
      view: null,
      round: null,
      worker: null,
      pendingWildIndex: null,
      colors: ['BLUE' , 'RED', 'GREEN', 'YELLOW']
    }
  },
  
  computed: {
    isHumanTurn() {
      return this.view && this.view.currentPlayer === 0
    }
  },
  
  mounted() {
    this.worker = new Worker('/bot.worker.js')
    
    this.worker.onmessage = ({ data }) => { this.handleBotMessage(data) }
  },
  
  beforeUnmount() {
    if (this.worker) {
      this.worker.terminate()
    }
  },
  
  methods: {
    startGame() {
      const players = ['You']
      
      for (let i = 1; i <= this.botCount; i++) {
        players.push(`Bot ${i}`)
      }
      
      this.round = createRound(players, players.length - 1)
      this.pendingWildIndex = null
      this.screen = 'game'
      this.refreshView()
      this.runBotTurn()
    },
    
    refreshView() {
      if (!this.round) return
      
      const memento = this.round.toMemento()
      const currentPlayer = this.round.playerInTurn()
      const winner = this.round.winner()
      
      this.view = {
        currentPlayer, 
        currentPlayerName: currentPlayer === undefined 
        ? 'Round ended' : this.round.player(currentPlayer),
        currentColor: memento.currentColor,
        topCard: this.round.discardPile().top(),
        myHand: this.round.playerHand(0).map(card => ({ ...card})),
        bots: memento.players.map((name, index) => ({
          name,
          cardCount: this.round.playerHand(index).length
        })).filter((_, index) => index !== 0),
        winnerName: winner === undefined ? '' : this.round.player(winner)
      }
      
      if (this.round.hasEnded()) {
        this.screen = 'result'
      }
  },
    
    selectCard(index){
      if (!this.isHumanTurn || !this.round.canPlay(index)) return
      
      const card = this.round.playerHand(0)[index]
      
      if (card.type === 'WILD' || card.type === 'WILD DRAW')
      {
        this.pendingWildIndex = index
        return
      }
      
      this.playHumanCard(index)
    },
    
    playWild(color) {
      if (this.pendingWildIndex === null) return
      
      const index= this.pendingWildIndex
      this.pendingWildIndex = null
      this.playHumanCard(index, color)
    },
    
    playHumanCard(index, color){
      try {

        this.round.play(index, color)
        this.refreshView()
        this.runBotTurn()
      }
      catch (error) {
        console.error(error)
        this.refreshView()
      }
    },
    
    sayUno() {
      try {
        this.round.sayUno(0)
      } catch (error) {
        console.error(error)
      }
    },
    
    drawCard() {
      if (!this.isHumanTurn || this.round.canPlayAny()) return
      
      this.round.draw()
      this.refreshView()
      
      // After drawing, if the player can play, they must play the drawn card immediately
      if (!this.isHumanTurn) {
        this.runBotTurn()
      }
    },
    
    runBotTurn() {
      if (this.screen !== 'game' || !this.round) return
      
      const playerIndex = this.round.playerInTurn()
      
      if (playerIndex === undefined || playerIndex === 0) {
        this.refreshView()
        return
      }
      
      const hand = this.round.playerHand(playerIndex)
      const legalIndices = hand.map((_, index) => index).filter(index => this.round.canPlay(index))
      
      if (legalIndices.length === 0) {
        this.round.draw()
        this.refreshView()
        
        // if the bot can play after drawing, it must play after the timeout
        window.setTimeout(() => this.runBotTurn(), 300)
        return
      }
      
      this.worker.postMessage({
        hand: hand.map(card => ({ ...card })),
        legalIndices
      })
    },
    
    handleBotMessage(data) {
      if (this.screen !== 'game' || !this.round) return
      
      const playerIndex = this.round.playerInTurn()
      if (playerIndex === undefined || playerIndex === 0) return
      
      if (data.action === 'draw') {
        this.round.draw()
        this.refreshView()
        window.setTimeout(() => this.runBotTurn(), 300)
        return
      }
      
      try {
        const hand = this.round.playerHand(playerIndex)
        
        // bot says UNO before playing its second-to-last card
        if (hand.length === 2) {
          this.round.sayUno(playerIndex)
      }
        
        this.round.play(data.index, data.color)
        this.refreshView()
        window.setTimeout(() => this.runBotTurn(), 300)
        }
          catch (error) {
            console.error(error)
            this.refreshView()
          }
        },
    
        formatCard(card) {
        if (!card) return 'Sin carta'
        
        if (card.type === 'NUMBERED') {
          return `${card.color} ${card.number}`
        }
        
        if (card.type === 'WILD' || card.type === 'WILD DRAW') {
          return card.type
        }
        
        return `${card.color} ${card.type}`
      } 
    }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
