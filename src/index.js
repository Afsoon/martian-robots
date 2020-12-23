const NORTH = "N"
const SOUTH = "S"
const EAST = "E"
const WEST = "W"

const directions = {
  "NORTH": NORTH,
  "SOUTH": SOUTH,
  "WEST": WEST,
  "EAST": EAST
}

const COMMAND_TURN_LEFT = "L"
const COMMAND_TURN_RIGHT = "R"
const COMMAND_MOVE_FORWARD = "F"

const commands = {
  "TURN_LEFT": COMMAND_TURN_LEFT,
  "TURN_RIGHT": COMMAND_TURN_RIGHT,
  "MOVE_FORWARD": COMMAND_MOVE_FORWARD
}

const conversionDirectionRight = {
  [NORTH]: EAST,
  [SOUTH]: WEST,
  [WEST]: NORTH,
  [EAST]: SOUTH
}

const conversionDirectionLeft = {
  [NORTH]: WEST,
  [SOUTH]: EAST,
  [WEST]: SOUTH,
  [EAST]: NORTH
}

const conversionDirection = {
  [COMMAND_TURN_LEFT]: conversionDirectionLeft,
  [COMMAND_TURN_RIGHT]: conversionDirectionRight
}

function executeTurn(command, facing) {
  return conversionDirection[command][facing] || facing
}

function isTurnCommand(command) {
  return isTurnRightCommand(command)  || isTurnLeftCommand(command)
}
function isTurnRightCommand(command) {
  return command === COMMAND_TURN_RIGHT
}

function isTurnLeftCommand(command) {
  return command === COMMAND_TURN_LEFT
}

function isMoveCommand(command) {
  return isMoveForwardCommand(command)
}

function isMoveForwardCommand(command) {
  return command === "F"
}

const incrementPosition = (position) => {
  return position + 1
}

const decrementPosition = (position) => {
  return position - 1
}

const forwardFunctions = {
  [NORTH]: ([xAxisPosition, yAxisPosition]) => {
    return [xAxisPosition, incrementPosition(yAxisPosition)]
  },
  [SOUTH]: ([xAxisPosition, yAxisPosition]) => {
    return [xAxisPosition, decrementPosition(yAxisPosition)]
  },
  [WEST]: ([xAxisPosition, yAxisPosition]) => {
    return [decrementPosition(xAxisPosition), yAxisPosition]
  },
  [EAST]: ([xAxisPosition, yAxisPosition]) => {
    return [incrementPosition(xAxisPosition), yAxisPosition]
  }
}

const moveFunctions = {
  [COMMAND_MOVE_FORWARD] : forwardFunctions,
}

const identity = (value) => value

const isCoordianteOutside = (position, limit) => {
  return position < 0 || position > limit
}

const isOutsideOfGrid = (x, y, [rows, columns]) => {
  return isCoordianteOutside(x, rows) || isCoordianteOutside(y, columns)
}

const formatLostPosition = (x, y, facing) => {
  return `${x},${y},${facing}`
}

const checkNewPosition = ({ x: xOld, y: yOld }, { x: xNew, y: yNew }, gridSize, facing, lostRobots) => {
  if (lostRobots.has(formatLostPosition(xOld, yOld, facing))) {
    return { x: xOld, y: yOld, lost: false, facing }
  } else if ( isOutsideOfGrid(xNew, yNew, gridSize) ) {
    lostRobots.add(formatLostPosition(xOld, yOld, facing))
    return { x: xOld, y: yOld, lost: true, facing }
  } else {
    return { x: xNew, y: yNew, lost: false, facing }
  }
}

function executeMove(command, [xAxisPosition, yAxisPosition, facing], gridSize, lostRobots) {
  const [x, y] = (moveFunctions[command][facing] || identity)([xAxisPosition, yAxisPosition])
  return checkNewPosition({x: xAxisPosition, y: yAxisPosition}, {x, y}, gridSize, facing, lostRobots)
}

function executeCommands(initialPosition, gridSize, commands, lostRobots) {
  let [startX, startY, facing] = initialPosition
  let isLost = false
  let finalPosition = commands.reduce(([intermediateX, intermediateY, intermediateFacing], command) => {
    if (isLost) {
      return [intermediateX, intermediateY, intermediateFacing]
    } else if( isTurnCommand(command) ) {
      return [intermediateX, intermediateY, executeTurn(command, intermediateFacing)]
    } else if ( isMoveCommand(command) ) {
      const { x, y, lost, facing } = executeMove(command, [intermediateX, intermediateY, intermediateFacing], gridSize, lostRobots)
      isLost = lost
      return [x, y, facing]
    } else {
      return [intermediateX, intermediateY, intermediateFacing]
    }
  }, [startX, startY, facing])
  if (isLost) {
    return {position: [...finalPosition, "LOST"]}
  } else {
    return {position: [...finalPosition]}
  }
}

function parseInput(input) {
  if (!input.gridSize) {
    throw Error("No Grid Size provided")
  }

  if (!input.robots) {
    throw Error("No robots provided")
  }

  if (!input.lostRobots) {
    throw Error("No Initial lost robots provided")
  }

  return input.robots.map(({ initialPosition, commands }) => {
    return executeCommands(initialPosition, input.gridSize, commands, input.lostRobots)
  })
}

module.exports = {parseInput, executeCommands, directions, commands}