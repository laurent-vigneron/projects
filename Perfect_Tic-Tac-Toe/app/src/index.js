import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Display extends React.Component {
  constructor(props){
    super();
  }
  render() {
    return (
      <div id='display'>
        <h2 className='text-center'>{this.props.message}</h2>
        <hr />
        <div className='row'>
          <div className='col-sm-6 text-center blue'>
            <h5>Your score</h5>
            <h5>{this.props.pScore}</h5>
          </div>
          <div className='col-sm-6 text-center red'>
            <h5>Computer's score</h5>
            <h5>{this.props.cScore}</h5>
          </div>
        </div>
      </div>
    );
  }
}

class Grid extends React.Component {
  constructor(props) {
    super();
    this.state = {
      grid: ['','','','','','','','','']
    }
  }
  checkWinner(grid) { // return 'X', 'O', '' for tie or null if no winner and no tie 
    // doesn't check the React state directly, as it needs to be able to evaluate potential Minimax positions
    if (grid[0] === grid[1] && grid[1] === grid[2] && grid[2] !== '') { return grid[0]; }
    if (grid[3] === grid[4] && grid[4] === grid[5] && grid[5] !== '') { return grid[3]; }
    if (grid[6] === grid[7] && grid[7] === grid[8] && grid[8] !== '') { return grid[6]; }
    if (grid[0] === grid[3] && grid[3] === grid[6] && grid[6] !== '') { return grid[0]; }
    if (grid[1] === grid[4] && grid[4] === grid[7] && grid[7] !== '') { return grid[1]; }
    if (grid[2] === grid[5] && grid[5] === grid[8] && grid[8] !== '') { return grid[2]; }
    if (grid[6] === grid[4] && grid[4] === grid[2] && grid[2] !== '') { return grid[6]; }
    if (grid[0] === grid[4] && grid[4] === grid[8] && grid[8] !== '') { return grid[0]; }
    
    if (!grid.includes('')) { return ''; }
    
    return null;
  }
  handleWinner(winner) {
    if (winner === 'X') {
      this.props.pWon();
    } else if (winner === 'O') {
      this.props.cWon();
    } else if (winner === '') {
      this.props.tie();
    }
    setTimeout(() => { this.reset(); }, 2000); // Automatically resets the game after 2 seconds
  }
  minimax(position, depth=Infinity, alpha=-Infinity, beta=Infinity, player=true) {
    // Implements the Minimax Algorithm
    // depth is not really used here, as we can reach the end-state every time
    let result = this.checkWinner(position);
    if (depth === 0 || result != null) { 
      if (result === 'X') { return -1; }
      else if (result === 'O') { return 1; }
      else { return 0; }  
    }

    let bestScore;
    if (player) {
      bestScore = Infinity;
      for (let i=0; i<=8; i++) {
        if (position[i] === '') {
          position[i] = 'X'; 
          let score = this.minimax(position, depth - 1, alpha, beta, false);
          position[i] = '';
          bestScore = Math.min(score, bestScore);
          beta = Math.min(beta, score);
          if (beta <= alpha) { break; }
        }
      }
      return bestScore;
    } else {
      bestScore = -Infinity;
      for (let i=0; i<=8; i++) {
        if (position[i] === '') {
          position[i] = 'O'; 
          let score = this.minimax(position, depth - 1, alpha, beta, true);
          position[i] = '';
          bestScore = Math.max(score, bestScore);
          alpha = Math.max(alpha, score);
          if (beta <= alpha) { break; }
        }
      }
      return bestScore;
    }
  }
  runAI() {
    // Runs the AI. Starts and finishes with a winner-check
    const grid = this.state.grid;
    let winner = this.checkWinner(grid);
    if (winner !== null) {
      this.handleWinner(winner);
    } else {  
      // the game is not over after the player's turn, so CPU can play. 
      // Actually the Player can never win because of the Minimax Algorithm, but well...
      let bestScore = -Infinity;
      let bestMove;
      for (let i=0; i<=8; i++) {  
        // The first loop is here, but the deeper 'turns' will be done recursively with this.minimax
        if (grid[i] === '') {
          grid[i] = 'O';
          let score = this.minimax(grid);
          grid[i] = '';
          if (score > bestScore) {
            bestScore = score;
            bestMove = i;
          }
        }
      }
      const cell = document.querySelector('#c'+bestMove);
      cell.innerHTML = 'O';
      cell.classList.add('red');
      grid[bestMove]='O';
      this.props.togglePlayer();
      this.setState({ grid: grid}, () => {  
        // Needs to use a callback here to ensure the state is updated before the check
        winner = this.checkWinner(this.state.grid);
        if (winner!= null) {  // is the game over during the AI's turn?
          this.handleWinner(winner);
        }});
    }
  }
  handleClick = (e) => {
    // Main loop of the game
    if (this.props.message === 'Your turn') {
      const refCell = Number(e.target.id.slice(-1));
      if (this.state.grid[refCell] === '') {
        const newGrid = [...this.state.grid];
        newGrid[refCell] = 'X';
        this.props.togglePlayer();
        this.setState({grid: newGrid}, () => this.runAI());
        e.target.innerHTML = 'X';
        e.target.classList.add('blue');
      }
    }
  }
  reset = () => {
    // Used in order to reset the game (automatically) once a game is over 
    Array.from(document.querySelectorAll('.cell')).map((cell) => {
      cell.innerHTML = '';
      cell.classList.remove('red', 'blue');
    });
    if (Math.random()<=0.5) {   // We want the computer to start the game about 50% of the time
      this.setState({ grid: ['','','','','','','','',''] });
    } else {
      this.setState({ grid: ['','','','','O','','','',''] });
      const cell = document.querySelector('#c4');
      cell.innerHTML = 'O';
      cell.classList.add('red');
      
    }
    this.props.togglePlayer();  // Need to toggle twice in order to go back to the player's turn
    this.props.togglePlayer();
  }
  render() {
    return (
      <div id='grid' className='mx-auto text-center'>
        <div className='row mx-auto'>
          <div id='c0' className='cell' onClick={this.handleClick}></div>
          <div id='c1' className='cell' onClick={this.handleClick}></div>
          <div id='c2' className='cell' onClick={this.handleClick}></div>
        </div>
        <div className='row mx-auto'>
          <div id='c3' className='cell' onClick={this.handleClick}></div>
          <div id='c4' className='cell' onClick={this.handleClick}></div>
          <div id='c5' className='cell' onClick={this.handleClick}></div>
        </div>
        <div className='row mx-auto'>
          <div id='c6' className='cell' onClick={this.handleClick}></div>
          <div id='c7' className='cell' onClick={this.handleClick}></div>
          <div id='c8' className='cell' onClick={this.handleClick}></div>
        </div>
      </div>
    );
  }
}

class TicTacToe extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: 'Your turn',
      playerScore: 0,
      CPUScore: 0
    }
  }
  incPlayerScore = () => {
    this.setState({ 
      playerScore: this.state.playerScore + 1,
      message: 'Well done, you won!'
    });
  }
  incCPUScore = () => {
    this.setState({
      CPUScore: this.state.CPUScore + 1,
      message: 'The AI won!' 
    });
  }
  tie = () => {
    this.setState({message: "It's a tie!"});
  }
  togglePlayer = () => {
    this.setState({message: (this.state.message==='AI is thinking')?'Your turn':'AI is thinking'});
  }
  render() {
    return (
      <div>
        <h1 className='text-center card-header'>Perfect <em className='text-info'>TicTacToe</em></h1>
        <Grid 
          message={this.state.message}
          pWon={this.incPlayerScore} 
          cWon={this.incCPUScore} 
          tie={this.tie}
          togglePlayer={this.togglePlayer}/>
        <Display
          pScore={this.state.playerScore}
          cScore={this.state.CPUScore}
          message={this.state.message} />
      </div>
    );
  }
}

ReactDOM.render(<div className="card border-info"><TicTacToe /></div>, document.getElementById("root"));
