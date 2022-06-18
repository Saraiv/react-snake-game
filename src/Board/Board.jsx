import React, {useEffect, useState} from 'react';
import { RandomNumber, UseInterval, } from '../utility.js';

import './Board.css';

class LinkedListNode{
  constructor(value){
    this.value = value;
    this.next = null;
  }
}

class LinkedList{
  constructor(value){
    const node = new LinkedListNode(value);
    this.head = node;
    this.tail = node;
  }
}

const Direction ={
  UP: 'UP',
  RIGHT: 'RIGHT',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
};

const Playing ={
    PLAYING: 'PLAYING',
    PAUSE: 'PAUSE'
}

const BOARD_SIZE = 10;

function GetStartingSnakeLLValue(board){
  const startingRow = Math.round(1);
  const startingCol = Math.round(7);
  const startingCell = board[startingRow][startingCol];
  return{
    row: startingRow,
    col: startingCol,
    cell: startingCell,
  };
};

function Board(){
    const gameState = Playing.PAUSE;
    const [score, SetScore] = useState(0);
    const [board, SetBoard] = useState(CreateBoard(BOARD_SIZE));
    const [snake, SetSnake] = useState(new LinkedList(GetStartingSnakeLLValue(board)));
    const [snakeCells, SetSnakeCells] = useState(new Set([snake.head.value.cell]));
    const [foodCell, SetFoodCell] = useState(snake.head.value.cell + 5);
    const [direction, SetDirection] = useState(Direction.RIGHT);

    useEffect(() =>{
        window.addEventListener('keydown', e =>{
            HandleKeydown(e);
        });
    }, []);

    UseInterval(() =>{
        MoveSnake();
    }, 150);

    function HandleKeydown(e){
        const newDirection = GetDirectionFromKey(e.key);
        const isValidDirection = newDirection !== '';
        if(!isValidDirection) return;
        const snakeWillRunIntoItself = GetOppositeDirection(newDirection) === direction && snakeCells.size > 1;
        if(snakeWillRunIntoItself) return;
        SetDirection(newDirection);
    };

    function MoveSnake(){
        const currentHeadCoords ={
            row: snake.head.value.row,
            col: snake.head.value.col,
        };

        const nextHeadCoords = GetCoordsInDirection(currentHeadCoords, direction);
        if(IsOutOfBounds(nextHeadCoords, board)){
            HandleGameOver();
            return;
        }
        const nextHeadCell = board[nextHeadCoords.row][nextHeadCoords.col];
        if(snakeCells.has(nextHeadCell)){
            HandleGameOver();
            return;
        }

        const newHead = new LinkedListNode({
            row: nextHeadCoords.row,
            col: nextHeadCoords.col,
            cell: nextHeadCell,
        });

        const currentHead = snake.head;
        snake.head = newHead;
        currentHead.next = newHead;

        const newSnakeCells = new Set(snakeCells);
        newSnakeCells.delete(snake.tail.value.cell);
        newSnakeCells.add(nextHeadCell);

        snake.tail = snake.tail.next;
        if(snake.tail === null) snake.tail = snake.head;

        const foodConsumed = nextHeadCell === foodCell;
        if(foodConsumed){
            GrowSnake(newSnakeCells);
            HandleFoodConsumption(newSnakeCells);
        }

        SetSnakeCells(newSnakeCells);
    };

    function GrowSnake(newSnakeCells){
        const growthNodeCoords = GetGrowthNodeCoords(snake.tail, direction);
        if(IsOutOfBounds(growthNodeCoords, board))
            return;
        const newTailCell = board[growthNodeCoords.row][growthNodeCoords.col];
        const newTail = new LinkedListNode({row: growthNodeCoords.row, col: growthNodeCoords.col, cell: newTailCell});
        const currentTail = snake.tail;
        snake.tail = newTail;
        snake.tail.next = currentTail;
        newSnakeCells.add(newTailCell);
    };

    function HandleFoodConsumption(newSnakeCells){
        const maxPossibleCellValue = BOARD_SIZE * BOARD_SIZE;
        let nextFoodCell;
        while(true) {
            nextFoodCell = RandomNumber(1, maxPossibleCellValue);
            if(newSnakeCells.has(nextFoodCell) || foodCell === nextFoodCell)
                continue;
            break;
        }

        SetFoodCell(nextFoodCell);
        SetScore(score + 1);
    };

    function HandleGameOver(){
        SetScore(0);
        const snakeLLStartingValue = GetStartingSnakeLLValue(board);
        SetSnake(new LinkedList(snakeLLStartingValue));
        SetFoodCell(snakeLLStartingValue.cell + 5);
        SetSnakeCells(new Set([snakeLLStartingValue.cell]));
        SetDirection(Direction.DOWN);
    };

    return (
        <>
            <button className="buttons">Play</button>
            <button className="buttons">Pause</button>
            <h1>Score: {score}</h1>
            <div className="board">
            {board.map((row, rowIdx) =>(
                <div key={rowIdx} className="row">
                {row.map((cellValue, cellIdx) =>{
                    const className = GetCellClassName(cellValue,foodCell,snakeCells);
                    return <div key={cellIdx} className={className}></div>;
                })}
                </div>
            ))}
            </div>
        </>
    );
};

function IsPlaying(IsPlaying){
    if(IsPlaying === Playing.PLAYING)
        return 'PLAYING';
    else if(IsPlaying === Playing.PAUSE)
        return 'PAUSE';
    else return '';
}

function CreateBoard(BOARD_SIZE){
  let counter = 1;
  const board = [];
  for(let row = 0; row < BOARD_SIZE; row++){
    const currentRow = [];
    for(let col = 0; col < BOARD_SIZE; col++)
      currentRow.push(counter++);
    board.push(currentRow);
  }
  return board;
};

function GetCoordsInDirection(coords, direction){
  if(direction === Direction.UP){
    return{
      row: coords.row - 1,
      col: coords.col,
    };
  }
  if(direction === Direction.RIGHT){
    return{
      row: coords.row,
      col: coords.col + 1,
    };
  }
  if(direction === Direction.DOWN){
    return {
      row: coords.row + 1,
      col: coords.col,
    };
  }
  if(direction === Direction.LEFT){
    return{
      row: coords.row,
      col: coords.col - 1,
    };
  }
};

function IsOutOfBounds(coords, board){
  const {row, col} = coords;
  if(row < 0 || col < 0) return true;
  if(row >= board.length || col >= board[0].length) return true;
  return false;
};

function GetDirectionFromKey(key){
  if(key === 'ArrowUp') return Direction.UP;
  if(key === 'ArrowRight') return Direction.RIGHT;
  if(key === 'ArrowDown') return Direction.DOWN;
  if(key === 'ArrowLeft') return Direction.LEFT;
  return '';
};

function GetNextNodeDirection(node, currentDirection){
  if(node.next === null) return currentDirection;
  const {row: currentRow, col: currentCol} = node.value;
  const {row: nextRow, col: nextCol} = node.next.value;
  if(nextRow === currentRow && nextCol === currentCol + 1){
    return Direction.RIGHT;
  }
  if(nextRow === currentRow && nextCol === currentCol - 1){
    return Direction.LEFT;
  }
  if(nextCol === currentCol && nextRow === currentRow + 1){
    return Direction.DOWN;
  }
  if(nextCol === currentCol && nextRow === currentRow - 1){
    return Direction.UP;
  }
  return '';
};

function GetGrowthNodeCoords (snakeTail, currentDirection){
  const tailNextNodeDirection = GetNextNodeDirection(
    snakeTail,
    currentDirection,
  );
  const growthDirection = GetOppositeDirection(tailNextNodeDirection);
  const currentTailCoords ={
    row: snakeTail.value.row,
    col: snakeTail.value.col,
  };
  const growthNodeCoords = GetCoordsInDirection(
    currentTailCoords,
    growthDirection,
  );
  return growthNodeCoords;
};

function GetOppositeDirection(direction){
  if(direction === Direction.UP) return Direction.DOWN;
  if(direction === Direction.RIGHT) return Direction.LEFT;
  if(direction === Direction.DOWN) return Direction.UP;
  if(direction === Direction.LEFT) return Direction.RIGHT;
};

function GetCellClassName(cellValue, foodCell, snakeCells){
  let className = 'cell';
  if(cellValue === foodCell){
      className = 'cell food-cell';
  }
  if(snakeCells.has(cellValue)) className = 'cell snake-cell';

  return className;
};

export default Board;