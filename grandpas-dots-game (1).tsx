import React, { useState, useEffect, useCallback } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const GrandpasDotsGame = () => {
  const [isSetup, setIsSetup] = useState(true);
  const [gridSize, setGridSize] = useState(3);
  const [selectedSize, setSelectedSize] = useState(3);
  const [players, setPlayers] = useState([1, 2]);
  const [horizontalLines, setHorizontalLines] = useState([]);
  const [verticalLines, setVerticalLines] = useState([]);
  const [squares, setSquares] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [scores, setScores] = useState({1: 0, 2: 0});
  const [gameOver, setGameOver] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const colors = {
    1: 'green-500',
    2: 'orange-500',
    3: 'blue-500',
    4: 'yellow-500',
    5: 'pink-500',
    6: 'black',
    unclaimed: 'gray-300',
  };

  const initializeGame = useCallback(() => {
    const newHorizontalLines = Array(gridSize + 1).fill().map(() => Array(gridSize).fill(null));
    const newVerticalLines = Array(gridSize).fill().map(() => Array(gridSize + 1).fill(null));
    const newSquares = Array(gridSize).fill().map(() => Array(gridSize).fill(null));
    const newScores = players.reduce((acc, player) => ({ ...acc, [player]: 0 }), {});

    setHorizontalLines(newHorizontalLines);
    setVerticalLines(newVerticalLines);
    setSquares(newSquares);
    setCurrentPlayerIndex(0);
    setScores(newScores);
    setGameOver(false);
  }, [gridSize, players]);

  useEffect(() => {
    if (!isSetup) {
      initializeGame();
    }
  }, [initializeGame, isSetup]);

  const handleLineClick = (row, col, isHorizontal) => {
    if (gameOver) return;

    const lines = isHorizontal ? [...horizontalLines] : [...verticalLines];
    if (lines[row][col] !== null) return;

    const currentPlayer = players[currentPlayerIndex];
    lines[row][col] = currentPlayer;
    if (isHorizontal) {
      setHorizontalLines(lines);
    } else {
      setVerticalLines(lines);
    }

    let squareCompleted = checkSquareCompletion(row, col, isHorizontal, currentPlayer);

    if (!squareCompleted) {
      setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
    }

    if (checkGameOver()) {
      setGameOver(true);
    }
  };

  const checkSquareCompletion = (row, col, isHorizontal, player) => {
    let squareCompleted = false;
    const newSquares = [...squares];

    const checkAndUpdateSquare = (r, c) => {
      if (r >= 0 && r < gridSize && c >= 0 && c < gridSize && checkSquare(r, c)) {
        newSquares[r][c] = player;
        setScores(prevScores => ({
          ...prevScores,
          [player]: (prevScores[player] || 0) + 1
        }));
        squareCompleted = true;
      }
    };

    if (isHorizontal) {
      checkAndUpdateSquare(row - 1, col);
      checkAndUpdateSquare(row, col);
    } else {
      checkAndUpdateSquare(row, col - 1);
      checkAndUpdateSquare(row, col);
    }

    if (squareCompleted) {
      setSquares(newSquares);
    }

    return squareCompleted;
  };

  const checkSquare = (row, col) => {
    return (
      horizontalLines[row]?.[col] !== null &&
      horizontalLines[row + 1]?.[col] !== null &&
      verticalLines[row]?.[col] !== null &&
      verticalLines[row]?.[col + 1] !== null
    );
  };

  const checkGameOver = () => {
    return horizontalLines.every(row => row.every(line => line !== null)) &&
           verticalLines.every(row => row.every(line => line !== null));
  };

  const renderGrid = () => {
    if (horizontalLines.length === 0 || verticalLines.length === 0) return null;

    return (
      <div className="inline-block bg-white p-4 rounded-lg shadow-lg">
        {horizontalLines.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex">
            {row.map((line, colIndex) => (
              <React.Fragment key={`h-${rowIndex}-${colIndex}`}>
                <div className="w-2 h-2 bg-gray-500 rounded-full" />
                <div
                  className={`w-14 h-2 cursor-pointer transition-colors duration-200 ${line !== null ? `bg-${colors[line]}` : `bg-${colors.unclaimed} hover:bg-gray-400`}`}
                  onClick={() => handleLineClick(rowIndex, colIndex, true)}
                />
              </React.Fragment>
            ))}
            <div className="w-2 h-2 bg-gray-500 rounded-full" />
          </div>
        )).reduce((acc, row, index) => [
          ...acc,
          row,
          index < gridSize && (
            <div key={`v-${index}`} className="flex">
              {verticalLines[index].map((line, colIndex) => (
                <React.Fragment key={`v-${index}-${colIndex}`}>
                  <div
                    className={`w-2 h-14 cursor-pointer transition-colors duration-200 ${line !== null ? `bg-${colors[line]}` : `bg-${colors.unclaimed} hover:bg-gray-400`}`}
                    onClick={() => handleLineClick(index, colIndex, false)}
                  />
                  {colIndex < gridSize && (
                    <div className={`w-14 h-14 transition-colors duration-200 ${squares[index]?.[colIndex] !== null ? `bg-${colors[squares[index][colIndex]]} opacity-50` : ''}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )
        ], [])}
      </div>
    );
  };

  const handleGridSizeChange = (value) => {
    const newSize = Number(value);
    setSelectedSize(newSize);
  };

  const handlePlayerChange = (action) => {
    if (action === 'add' && players.length < 6) {
      const newPlayer = players.length + 1;
      setPlayers(prevPlayers => [...prevPlayers, newPlayer]);
      setScores(prevScores => ({ ...prevScores, [newPlayer]: 0 }));
    } else if (action === 'remove' && players.length > 2) {
      const removedPlayer = players[players.length - 1];
      setPlayers(prevPlayers => prevPlayers.slice(0, -1));
      setScores(prevScores => {
        const { [removedPlayer]: removed, ...rest } = prevScores;
        return rest;
      });
    }
  };

  const generateNewGame = () => {
    setGridSize(selectedSize);
    setIsSetup(false);
  };

  const getPlayerRankings = () => {
    return Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .map(([player, score], index) => ({ player: Number(player), score, rank: index + 1 }));
  };

  const PlayerRankingItem = ({ player, score, rank, isCurrentPlayer }) => (
    <div className={`flex items-center justify-between mb-2 ${isCurrentPlayer ? 'font-bold' : ''}`}>
      <div className="flex items-center">
        <span className={`w-4 h-4 rounded-full bg-${colors[player]} mr-2`}></span>
        <span>P{player}</span>
      </div>
      <span>Score: {score}</span>
      <span>Rank: {rank}</span>
    </div>
  );

  const RulesDialog = ({ open, onOpenChange }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Grandpa's Dots Game Rules</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <ul className="list-disc pl-5 space-y-2">
            <li>Players take turns drawing a single horizontal or vertical line between two adjacent dots.</li>
            <li>When a player completes the fourth side of a box, they claim that box and get another turn.</li>
            <li>The game ends when all possible lines have been drawn and all boxes are claimed.</li>
            <li>The player with the most claimed boxes at the end of the game wins.</li>
            <li>In case of a tie, the game is considered a draw.</li>
          </ul>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );

  const SetupPage = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-purple-100">
      <Card className="w-96 p-6 bg-white rounded-xl shadow-xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-600">Grandpa's Dots Game Setup</h1>
        <CardContent>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Grid Size</label>
            <Select onValueChange={handleGridSizeChange} value={selectedSize.toString()}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select grid size" />
              </SelectTrigger>
              <SelectContent>
                {[3, 5, 7, 9].map(size => (
                  <SelectItem key={size} value={size.toString()}>{size}x{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Players</label>
            <div className="flex items-center justify-between">
              <Button onClick={() => handlePlayerChange('add')} disabled={players.length >= 6} variant="outline">Add Player</Button>
              <span className="text-lg font-semibold">{players.length}</span>
              <Button onClick={() => handlePlayerChange('remove')} disabled={players.length <= 2} variant="outline">Remove Player</Button>
            </div>
          </div>
          <div className="mb-6 flex justify-center">
            {players.map(player => (
              <div key={player} className={`w-8 h-8 rounded-full mr-2 bg-${colors[player]} border-2 border-white shadow-md`} title={`Player ${player}`}></div>
            ))}
          </div>
          <Button onClick={generateNewGame} className="w-full mb-2">Start Game</Button>
          <Button onClick={() => setShowRules(true)} variant="outline" className="w-full">Rules</Button>
        </CardContent>
      </Card>
      <RulesDialog open={showRules} onOpenChange={setShowRules} />
    </div>
  );

  const GamePage = () => {
    const rankings = getPlayerRankings();
    
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-4">
        <h1 className="text-4xl font-bold mb-4 text-blue-600">Grandpa's Dots Game</h1>
        <div className="flex justify-between w-full max-w-4xl mb-4">
          <Card className="w-80">
            <CardContent>
              <h2 className="text-xl font-semibold mb-2">Player Rankings</h2>
              {rankings.map(({ player, score, rank }) => (
                <PlayerRankingItem 
                  key={player}
                  player={player}
                  score={score}
                  rank={rank}
                  isCurrentPlayer={players[currentPlayerIndex] === player}
                />
              ))}
            </CardContent>
          </Card>
          <div className="flex flex-col items-center">
            <div className="text-xl font-semibold mb-2">
              Current Player: <span className={`text-${colors[players[currentPlayerIndex]]}`}>Player {players[currentPlayerIndex]}</span>
            </div>
            {renderGrid()}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsSetup(true)}>New Game</Button>
          <Button onClick={() => setShowRules(true)} variant="outline">Rules</Button>
        </div>
        
        <AlertDialog open={gameOver}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Game Over!</AlertDialogTitle>
              <AlertDialogDescription>
                {rankings.map(({ player, score, rank }) => (
                  <PlayerRankingItem 
                    key={player}
                    player={player}
                    score={score}
                    rank={rank}
                    isCurrentPlayer={false}
                  />
                ))}
                <br />
                {rankings[0].score === rankings[1].score 
                  ? "It's a tie!" 
                  : `Player ${rankings[0].player} wins!`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setIsSetup(true)}>New Game</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <RulesDialog open={showRules} onOpenChange={setShowRules} />
      </div>
    );
  };

  return isSetup ? <SetupPage /> : <GamePage />;
};

export default GrandpasDotsGame;
