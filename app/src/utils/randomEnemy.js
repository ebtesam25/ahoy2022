import { gameItems } from './gameObjects'
import { generateRandomPoint } from './randomPos'

const RADIUS = 200 // meters

const opponentImages = {
  0: gameItems.items[0].url,
  1: gameItems.items[1].url,
  2: gameItems.items[2].url,
  3: gameItems.items[3].url,
  4: gameItems.items[4].url,
  5: gameItems.items[5].url,
  6: gameItems.items[6].url,
  7: gameItems.items[7].url,
  8: gameItems.items[8].url,
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}


export default function createsprite(count, location) {
  let sprite = []

  for (let i=0; i<count; i++) {
    sprite.push(Object.assign({
      image: opponentImages[getRandomInt(0, 8)]
    },
    generateRandomPoint(location, RADIUS)
    ))
  }

  return sprite
}
