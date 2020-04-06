const $canvas = document.createElement('canvas') as HTMLCanvasElement
const ctx = $canvas.getContext('2d') as CanvasRenderingContext2D
const screenWidth = ($canvas.width = 420)
const screenHeight = ($canvas.height = 420)

document.body.appendChild($canvas)

const randomNumber = (min: number, max: number): number => Math.random() * (max - min) + min
const sample = (arr: any[]): any => arr[Math.floor(Math.random() * arr.length)]
const distance = (a: Actor, b: Actor): number => {
  const xDiff = a.x - b.x
  const yDiff = a.y - b.y

  return Math.sqrt(xDiff * xDiff + yDiff * yDiff)
}

class Actor {
  id = Math.random()
  radius = 6
  type = 'civilian'
  vx = randomNumber(-1, 1)
  vy = randomNumber(-1, 1)
  colorKey: { [key: string]: string } = {
    civilian: 'green',
    infected: 'red',
    doctor: 'white',
  }
  get color(): string {
    return this.colorKey[this.type]
  }
  constructor(public x: number = 0, public y: number = 0) {}
}

class ActorFactory {
  static create(ctx: CanvasRenderingContext2D): Actor {
    const actor = new Actor()
    const padding = 50
    actor.x = randomNumber(padding, ctx.canvas.width - padding)
    actor.y = randomNumber(padding, ctx.canvas.height - padding)
    return actor
  }
}

class Stage {
  actors: Actor[] = []

  constructor(public numberOfActors: number = 20) {}

  clearScreen(ctx: CanvasRenderingContext2D) {
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  }

  createActors(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < this.numberOfActors; i++) {
      const actor = ActorFactory.create(ctx)
      this.actors.push(actor)
    }
  }

  renderActors(ctx: CanvasRenderingContext2D) {
    for (const actor of this.actors) {
      const closeActors = this.actors.filter((a) => {
        return a.id !== actor.id && distance(a, actor) < 20
      })

      closeActors.map((a) => {
        if (a.type !== actor.type) {
          if (a.type === 'infected' && actor.type !== 'doctor') {
            actor.type = 'infected'
          }

          if (a.type === 'infected' && actor.type === 'doctor') {
            a.type = 'civilian'
          }
        }
        ctx.strokeStyle = 'yellow'
        ctx.beginPath()
        ctx.moveTo(actor.x, actor.y)
        ctx.lineTo(a.x, a.y)
        ctx.closePath()
        ctx.stroke()
      })

      ctx.save()
      ctx.translate(actor.x, actor.y)
      ctx.beginPath()
      ctx.arc(0, 0, actor.radius, 0, 2 * Math.PI)
      ctx.fillStyle = actor.color
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }
  }

  updateActors(ctx: CanvasRenderingContext2D) {
    for (const actor of this.actors) {
      actor.x += actor.vx
      actor.y += actor.vy

      if (actor.x + actor.radius < actor.radius * 2) actor.vx = -actor.vx
      if (actor.x + actor.radius > ctx.canvas.width) actor.vx = -actor.vx

      if (actor.y + actor.radius < actor.radius * 2) actor.vy = -actor.vy
      if (actor.y + actor.radius > ctx.canvas.height) actor.vy = -actor.vy
    }
  }
}

const stage = new Stage(50)
stage.createActors(ctx)

const setDoctor = (stage: Stage) => {
  let actor: Actor = sample(stage.actors)
  while (actor.type === 'infected') actor = sample(stage.actors)
  actor.type = 'doctor'
}

const setInfected = (stage: Stage) => {
  let actor: Actor = sample(stage.actors)
  while (actor.type === 'doctor') actor = sample(stage.actors)
  actor.type = 'infected'
}

setDoctor(stage)
setInfected(stage)

const renderFrame = (ctx: CanvasRenderingContext2D, stage: Stage) => {
  requestAnimationFrame(renderFrame.bind(null, ctx, stage))
  stage.clearScreen(ctx)
  stage.updateActors(ctx)
  stage.renderActors(ctx)
}

renderFrame(ctx, stage)
