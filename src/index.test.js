const MarsApi = require('./index')
const generators = require('./generators')
const { generateGridSize } = require('./generators')
const { commands } = require('./index')
const exampleInputCommands1 = [
  MarsApi.commands.TURN_RIGHT,
  MarsApi.commands.MOVE_FORWARD,
  MarsApi.commands.TURN_RIGHT,
  MarsApi.commands.MOVE_FORWARD,
  MarsApi.commands.TURN_RIGHT,
  MarsApi.commands.MOVE_FORWARD,
  MarsApi.commands.TURN_RIGHT,
  MarsApi.commands.MOVE_FORWARD,
]

const exampleInputCommands2 = [
  MarsApi.commands.MOVE_FORWARD,
  MarsApi.commands.TURN_RIGHT,
  MarsApi.commands.TURN_RIGHT,
  MarsApi.commands.MOVE_FORWARD,
  MarsApi.commands.TURN_LEFT,
  MarsApi.commands.TURN_LEFT,
  MarsApi.commands.MOVE_FORWARD,
  MarsApi.commands.MOVE_FORWARD,
  MarsApi.commands.TURN_RIGHT,
  MarsApi.commands.TURN_RIGHT,
  MarsApi.commands.MOVE_FORWARD,
  MarsApi.commands.TURN_LEFT,
  MarsApi.commands.TURN_LEFT,
]

const exampleInputCommands3 = [
  MarsApi.commands.TURN_LEFT,
  MarsApi.commands.TURN_LEFT,
  MarsApi.commands.MOVE_FORWARD,
  MarsApi.commands.MOVE_FORWARD,
  MarsApi.commands.MOVE_FORWARD,
  MarsApi.commands.TURN_LEFT,
  MarsApi.commands.MOVE_FORWARD,
  MarsApi.commands.TURN_LEFT,
  MarsApi.commands.MOVE_FORWARD,
  MarsApi.commands.TURN_LEFT,
]

describe("Mars Rovers", () => {
    describe("Process robost commands and input", () => {
      it("We don't receive commands so we expect to stay in the same place", () => {
        const initialPosition = generators.generateInitalPositionAndFacing()

        const lostRobots = new Set()
        const marsRoversPosition = MarsApi.executeCommands(initialPosition, generators.generateGridSize(), [])
        expect(lostRobots.size).toStrictEqual(0)

        expect(marsRoversPosition.position).toStrictEqual(initialPosition)
      })

      it("We receive unknown commands so we expect to stay in the same place", () => {
        const initialPosition = generators.generateInitalPositionAndFacing()

        const lostRobots = new Set()
        const marsRoversPosition = MarsApi.executeCommands(initialPosition, generators.generateGridSize(), ["X", "A", "C"])
        expect(lostRobots.size).toStrictEqual(0)

        expect(marsRoversPosition.position).toStrictEqual(initialPosition)
      })

      it("We receive an array of commands, we expect the robot to be lost", () => {
        const initialPosition = [3, 2, MarsApi.directions.NORTH]
        const comamnds = exampleInputCommands2

        const lostRobots = new Set()
        const marsRoversPosition = MarsApi.executeCommands(initialPosition, [5, 3], comamnds, lostRobots)
        expect(lostRobots.has("3,3,N"))

        expect(marsRoversPosition.position).toStrictEqual([3, 3, MarsApi.directions.NORTH, "LOST"])
      })

      it("We receive an array of commands, we expect the robot to be not lost", () => {
        const initialPosition = [1, 1, MarsApi.directions.EAST]
        const comamnds = exampleInputCommands1

        const lostRobots = new Set()
        const marsRoversPosition = MarsApi.executeCommands(initialPosition, [5, 3], comamnds, lostRobots)
        expect(lostRobots.size).toStrictEqual(0)

        expect(marsRoversPosition.position).toStrictEqual([1, 1, MarsApi.directions.EAST])
      })

      it("We receive an array of commands with a previous robot lost, we expect the robot to be not lost", () => {
        const initialPosition = [0, 3, MarsApi.directions.WEST]
        const comamnds = exampleInputCommands3

        const lostRobots = new Set(["3,3,N"])

        const marsRoversPosition = MarsApi.executeCommands(initialPosition, [5, 3], comamnds, lostRobots)
        expect(lostRobots.size).toStrictEqual(1)
        expect(lostRobots.has("3,3,N"))

        expect(marsRoversPosition.position).toStrictEqual([2, 3, MarsApi.directions.SOUTH])
      })

      it("We receive the full input and we process all robots", () => {
        const lostRobots = new Set()
        const input = {
          gridSize: [5, 3],
          lostRobots,
          robots: [
            {initialPosition: [1, 1, MarsApi.directions.EAST], commands: exampleInputCommands1},
            {initialPosition: [3, 2, MarsApi.directions.NORTH], commands: exampleInputCommands2},
            {initialPosition: [0, 3, MarsApi.directions.WEST], commands: exampleInputCommands3},
          ]
        }

        const [example1, example2, example3] = MarsApi.parseInput(input)
        expect(lostRobots.size).toStrictEqual(1)
        expect(lostRobots.has("3,3,N"))

        expect(example1.position).toStrictEqual([1, 1, MarsApi.directions.EAST])
        expect(example2.position).toStrictEqual([3, 3, MarsApi.directions.NORTH, "LOST"])
        expect(example3.position).toStrictEqual([2, 3, MarsApi.directions.SOUTH])

      })

      it("We receive the full input and we have 0 robots, we expect 0 results", () => {
        const lostRobots = new Set()
        const input = {
          gridSize: [5, 3],
          lostRobots,
          robots: []
        }

        const result = MarsApi.parseInput(input)
        expect(lostRobots.size).toStrictEqual(0)
        expect(result.length).toStrictEqual(0)
      })

      it("We receive a partial input without grid size, we expect an error of no grid size", () => {
        const lostRobots = new Set()
        const input = {
          lostRobots,
          robots: [
            {initialPosition: [1, 1, MarsApi.directions.EAST], commands: exampleInputCommands1},
            {initialPosition: [3, 2, MarsApi.directions.NORTH], commands: exampleInputCommands2},
            {initialPosition: [0, 3, MarsApi.directions.WEST], commands: exampleInputCommands3},
          ]
        }

        expect(MarsApi.parseInput.bind(null, input)).toThrow(
          new Error("No Grid Size provided")
        )
      })

      it("We receive the a partial input without lost robots, we expect an error of no lost robots", () => {
        const input = {
          gridSize: [5, 3],
          robots: [
            {initialPosition: [1, 1, MarsApi.directions.EAST], commands: exampleInputCommands1},
            {initialPosition: [3, 2, MarsApi.directions.NORTH], commands: exampleInputCommands2},
            {initialPosition: [0, 3, MarsApi.directions.WEST], commands: exampleInputCommands3},
          ]
        }

        expect(MarsApi.parseInput.bind(null, input)).toThrow(
          new Error("No Initial lost robots provided")
        )
      })

      it("We receive a partial input without robots, we expect an error of no robots provided", () => {
        const lostRobots = new Set()
        const input = {
          gridSize: [5, 3],
          lostRobots,
        }

        expect(MarsApi.parseInput.bind(null, input)).toThrow(
          new Error("No robots provided")
        )
      })
    })

    describe("Turn and move commands", () => {

      it("We receive the command to turn right while facing to the north so we expect to stay in the same place facing the east", () => {
        const initialCoordinates = generators.generateInitalPosition()
        const initialPosition = generators.generateInitalPositionAndFacing(initialCoordinates, MarsApi.directions.NORTH)

        const lostRobots = new Set()
        const marsRoversPosition = MarsApi.executeCommands(initialPosition, generators.generateGridSize(), [MarsApi.commands.TURN_RIGHT], lostRobots)
        expect(lostRobots.size).toStrictEqual(0)

        expect(marsRoversPosition.position).toStrictEqual([...initialCoordinates, MarsApi.directions.EAST])
      })

      it("We receive the command to turn left while facing to the north so we expect to stay in the same place facing the west", () => {
        const initialCoordinates = generators.generateInitalPosition()
        const initialPosition = generators.generateInitalPositionAndFacing(initialCoordinates, MarsApi.directions.NORTH)

        const lostRobots = new Set()
        const marsRoversPosition = MarsApi.executeCommands(initialPosition, generators.generateGridSize(), [MarsApi.commands.TURN_LEFT], lostRobots)
        expect(lostRobots.size).toStrictEqual(0)

        expect(marsRoversPosition.position).toStrictEqual([...initialCoordinates, MarsApi.directions.WEST])
      })

      it("We receive the command to turn right while facing to the south so we expect to stay in the same place facing the west", () => {
        const initialCoordinates = generators.generateInitalPosition()
        const initialPosition = generators.generateInitalPositionAndFacing(initialCoordinates, MarsApi.directions.SOUTH)

        const lostRobots = new Set()
        const marsRoversPosition = MarsApi.executeCommands(initialPosition, generators.generateGridSize(), [MarsApi.commands.TURN_RIGHT], lostRobots)
        expect(lostRobots.size).toStrictEqual(0)

        expect(marsRoversPosition.position).toStrictEqual([...initialCoordinates, MarsApi.directions.WEST])
      })

      it("We receive the command to turn left while facing to the south so we expect to stay in the same place facing the east", () => {
        const initialCoordinates = generators.generateInitalPosition()
        const initialPosition = generators.generateInitalPositionAndFacing(initialCoordinates, MarsApi.directions.SOUTH)

        const lostRobots = new Set()
        const marsRoversPosition = MarsApi.executeCommands(initialPosition, generators.generateGridSize(), [MarsApi.commands.TURN_LEFT], lostRobots)
        expect(lostRobots.size).toStrictEqual(0)

        expect(marsRoversPosition.position).toStrictEqual([...initialCoordinates, MarsApi.directions.EAST])
      })

      it("We receive the command to turn right while facing to the west so we expect to stay in the same place and face to the north", () => {
        const initialCoordinates = generators.generateInitalPosition()
        const initialPosition = generators.generateInitalPositionAndFacing(initialCoordinates, MarsApi.directions.WEST)

        const lostRobots = new Set()
        const marsRoversPosition = MarsApi.executeCommands(initialPosition, generators.generateGridSize(), [MarsApi.commands.TURN_RIGHT], lostRobots)
        expect(lostRobots.size).toStrictEqual(0)

        expect(marsRoversPosition.position).toStrictEqual([...initialCoordinates, MarsApi.directions.NORTH])
      })

      it("We receive the command to turn left while facing to the west so we expect to stay in the same place facing the south", () => {
        const initialCoordinates = generators.generateInitalPosition()
        const initialPosition = generators.generateInitalPositionAndFacing(initialCoordinates, MarsApi.directions.WEST)

        const lostRobots = new Set()
        const marsRoversPosition = MarsApi.executeCommands(initialPosition, generators.generateGridSize(), [MarsApi.commands.TURN_LEFT], lostRobots)
        expect(lostRobots.size).toStrictEqual(0)

        expect(marsRoversPosition.position).toStrictEqual([...initialCoordinates, MarsApi.directions.SOUTH])
      })

      it("We receive the command to turn right while facing to the east so we expect to stay in the same place and face to the south", () => {
        const initialCoordinates = generators.generateInitalPosition()
        const initialPosition = generators.generateInitalPositionAndFacing(initialCoordinates, MarsApi.directions.EAST)

        const lostRobots = new Set()
        const marsRoversPosition = MarsApi.executeCommands(initialPosition, generators.generateGridSize(), [MarsApi.commands.TURN_RIGHT], lostRobots)
        expect(lostRobots.size).toStrictEqual(0)

        expect(marsRoversPosition.position).toStrictEqual([...initialCoordinates, MarsApi.directions.SOUTH])
      })

      it("We receive the command to turn left while facing to the east so we expect to stay in the same place facing the north", () => {
        const initialCoordinates = generators.generateInitalPosition()
        const initialPosition = generators.generateInitalPositionAndFacing(initialCoordinates, MarsApi.directions.EAST)

        const lostRobots = new Set()
        const marsRoversPosition = MarsApi.executeCommands(initialPosition, generators.generateGridSize(), [MarsApi.commands.TURN_LEFT], lostRobots)
        expect(lostRobots.size).toStrictEqual(0)

        expect(marsRoversPosition.position).toStrictEqual([...initialCoordinates, MarsApi.directions.NORTH])
      })

      it("We receive the command to turn right while face to an unknown direction so we expect to stay in the same place and face to the same direction", () => {
        const initialCoordinates = generators.generateInitalPosition()
        const initialPosition = generators.generateInitalPositionAndFacing(initialCoordinates, "X")

        const lostRobots = new Set()
        const marsRoversPosition = MarsApi.executeCommands(initialPosition, generators.generateGridSize(), [MarsApi.commands.TURN_RIGHT], lostRobots)
        expect(lostRobots.size).toStrictEqual(0)

        expect(marsRoversPosition.position).toStrictEqual([...initialCoordinates, "X"])
      })

      it("We receive the command to turn left while facing to an unknow direction so we expect to stay in the same place facing to the same direction", () => {
        const initialCoordinates = generators.generateInitalPosition()
        const initialPosition = generators.generateInitalPositionAndFacing(initialCoordinates, "X")

        const lostRobots = new Set()
        const marsRoversPosition = MarsApi.executeCommands(initialPosition, generators.generateGridSize(), [MarsApi.commands.TURN_LEFT], lostRobots)
        expect(lostRobots.size).toStrictEqual(0)

        expect(marsRoversPosition.position).toStrictEqual([...initialCoordinates, "X"])
      })
    })

    describe("Move commands", () => {
      it("We receive move forward command and facing the north, so we expect to move forward in the y axis and facing the north", () => {
        const [initialX, initialY] = [1, 1]
        const initialPosition = generators.generateInitalPositionAndFacing([initialX, initialY], MarsApi.directions.NORTH)

        const lostRobots = new Set()
        const finalPosition = MarsApi.executeCommands(initialPosition, generators.generateGridSize({x: 3, y: 3}), [MarsApi.commands.MOVE_FORWARD], lostRobots)
        expect(lostRobots.size).toStrictEqual(0)

        expect(finalPosition.position).toStrictEqual([initialX, 2, MarsApi.directions.NORTH])
      })

      it("We receive move forward command and facing the south, so we expect to move backward in the y axis and facing the south", () => {
        const [initialX, initialY] = [1, 1]
        const initialPosition = generators.generateInitalPositionAndFacing([initialX, initialY], MarsApi.directions.SOUTH)

        const lostRobots = new Set()
        const finalPosition = MarsApi.executeCommands(initialPosition, generators.generateGridSize({x: 3, y: 3}), [MarsApi.commands.MOVE_FORWARD], lostRobots)
        expect(lostRobots.size).toStrictEqual(0)

        expect(finalPosition.position).toStrictEqual([initialX, 0, MarsApi.directions.SOUTH])
      })

      it("We receive move forward command and facing the east, so we expect to move forward in the x axis and facing the east", () => {
        const [initialX, initialY] = [1, 1]
        const initialPosition = generators.generateInitalPositionAndFacing([initialX, initialY], MarsApi.directions.EAST)

        const lostRobots = new Set()
        const finalPosition = MarsApi.executeCommands(initialPosition, generators.generateGridSize({x: 3, y: 3}), [MarsApi.commands.MOVE_FORWARD], lostRobots)
        expect(lostRobots.size).toStrictEqual(0)

        expect(finalPosition.position).toStrictEqual([2, initialY, MarsApi.directions.EAST])
      })

      it("We receive move forward command and facing the west, so we expect to move backward in the x axis and facing the west", () => {
        const [initialX, initialY] = [1, 1]
        const initialPosition = generators.generateInitalPositionAndFacing([initialX, initialY], MarsApi.directions.WEST)

        const lostRobots = new Set()
        const finalPosition = MarsApi.executeCommands(initialPosition, generators.generateGridSize({x: 3, y: 3}), [MarsApi.commands.MOVE_FORWARD], lostRobots)
        expect(lostRobots.size).toStrictEqual(0)

        expect(finalPosition.position).toStrictEqual([0, initialY, MarsApi.directions.WEST])
      })

      it("We receive move forward command and facing an unknown direction, so we expect stay in the same place and facing the unknown direction", () => {
        const [initialX, initialY] = [1, 1]
        const initialPosition = generators.generateInitalPositionAndFacing([initialX, initialY], "X")

        const lostRobots = new Set()
        const finalPosition = MarsApi.executeCommands(initialPosition, generators.generateGridSize({x: 3, y: 3}), [MarsApi.commands.MOVE_FORWARD], lostRobots)
        expect(lostRobots.size).toStrictEqual(0)

        expect(finalPosition.position).toStrictEqual([initialX, initialY, "X"])
      })

    it("Impossible to move forward due we are on the limit of the grid facing the north", () => {
      const grid = generators.generateGridSize({x:1, y:1})
      const initialPosition = generators.generateInitalPositionAndFacing([0, 1], MarsApi.directions.NORTH)

      const lostRobots = new Set()
      const marsRoversPosition = MarsApi.executeCommands(initialPosition, grid, [MarsApi.commands.MOVE_FORWARD], lostRobots)
      expect(lostRobots.has("0,1,N"))

      expect(marsRoversPosition.position).toStrictEqual([...initialPosition, "LOST"])
    })

    it("Impossible to move forward due we are on the limit of the grid facing the south", () => {
      const grid = generators.generateGridSize({x:1, y:1})
      const initialPosition = generators.generateInitalPositionAndFacing([0, 0], MarsApi.directions.SOUTH)

      const lostRobots = new Set()
      const marsRoversPosition = MarsApi.executeCommands(initialPosition, grid, [MarsApi.commands.MOVE_FORWARD], lostRobots)
      expect(lostRobots.has("0,0,S"))

      expect(marsRoversPosition.position).toStrictEqual([...initialPosition, "LOST"])
    })

    it("Impossible to move forward due we are on the limit of the grid facing the east", () => {
      const grid = generators.generateGridSize({x:1, y:1})
      const initialPosition = generators.generateInitalPositionAndFacing([1, 0], MarsApi.directions.EAST)

      const lostRobots = new Set()
      const marsRoversPosition = MarsApi.executeCommands(initialPosition, grid, [MarsApi.commands.MOVE_FORWARD], lostRobots)
      expect(lostRobots.has("1,0,E"))

      expect(marsRoversPosition.position).toStrictEqual([...initialPosition, "LOST"])
    })

    it("Impossible to move forward due we are on the limit of the grid facing the west", () => {
      const grid = generators.generateGridSize({x:1, y:1})
      const initialPosition = generators.generateInitalPositionAndFacing([0, 0], MarsApi.directions.WEST)

      const lostRobots = new Set()
      const marsRoversPosition = MarsApi.executeCommands(initialPosition, grid, [MarsApi.commands.MOVE_FORWARD], lostRobots)
      expect(lostRobots.has("0,0,W"))

      expect(marsRoversPosition.position).toStrictEqual([...initialPosition, "LOST"])
    })
  })
})