import React from 'react';
import ReactDOM from 'react-dom';
import randomColor from 'randomcolor';
import { SketchPicker } from 'react-color';
import socketIOClient from 'socket.io-client';
import axios from 'axios';
import Draggable from 'react-draggable';


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false, //become true on component's first mount
      started: false, //true when animation is runnig, false when stopped
      board: null, //2D array of cells
      width: null, //canvas width, divided by a cell size gives the total of rows
      height: 1000, //canvas height, divided by a cell size gives the total of columns
      cellSize: 10, //
      uiSize: 40, //UI on at the bottom of the canvas -not implemented-
      cellShape: "square", //Optional: square or circle depending on user's choice -not implemented-
      color: 'black',
    };
    this.socket = socketIOClient("localhost:4001"),
    this.onBoardClick = this.onBoardClick.bind(this);
    this.responsiveCanvas = this.responsiveCanvas.bind(this);
    this.drawCells = this.drawCells.bind(this);
    this.drawGrid = this.drawGrid.bind(this);
  }
  //when the component mount for the first time,
  //set the width of the canvas to match the width of the app and
  //generate a random 2D array to render 
  init() {
    if(!this.state.loaded) {
      const width = ReactDOM.findDOMNode(this).getBoundingClientRect().width; 
      const board = this.generateRandomArray(
        width,
        this.state.height,
        this.state.cellSize,
        true
      );
      this.setState({board, loaded: true, started: true, width});
    }
  }
  
  drawGrid(width, height, space, ctx) {
    const rows = ~~(height / space);
    const cols = ~~(width / space);

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        ctx.save();
        ctx.strokeStyle = "white";
        ctx.strokeRect(
          j * space,
          i * space,
          space,
          space);
        ctx.restore();
      }
    }
  }

  drawSquare(i, j, size, ctx) {
    ctx.fillRect(
      j * size,
      i * size,
      size,
      size);
  }

  drawCells(width, height, cellSize, ctx, board) {
    const rows = ~~(height / cellSize);
    const cols = ~~(width / cellSize);

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {        
        if (board[i][j] === 1) {
          ctx.fillStyle = randomColor({
            luminosity: 'random',
            hue: 'random'
          });
          this.drawSquare(i, j, cellSize, ctx);
        }
      }
    }
  }
  
  generateRandomArray(width, height, cellSize, random=false) {
    const ROWS = ~~(height / cellSize);
    const COLS = ~~(width / cellSize);
    let arr = [];
    for(let i = 0; i < ROWS; i++) {
      arr[i] = [];
      for(let j = 0; j < COLS; j++) {
        let randomValue = random ? ~~(Math.random() * 2) : 0;
        arr[i][j] = 0;
      }
    }
    return arr;
  }

  cloneArray(arrayToClone, clone) {
    for(let i = 0; i < arrayToClone.length; i++) {
      if(Array.isArray(arrayToClone[i])) {
        clone[i] = [];
        this.cloneArray(arrayToClone[i], clone[i]);
      } else {
        clone[i] = arrayToClone[i];
      }
    }
  }

  sendData = (row, col, color) => {
    this.socket.emit('get board', JSON.stringify({
      row: row,
      col: col,
      color: color ? color : "#ecf0f1"
    }))
  }

  onBoardClick(e) {
    if(e.target.localName === "canvas") {
      let x = e.clientX - e.target.getBoundingClientRect().left,
          y = e.clientY - e.target.getBoundingClientRect().top,
          row = ~~(y / this.state.cellSize),
          col = ~~(x / this.state.cellSize);
      var clone = [];
      this.cloneArray(this.state.board, clone);
      if(
        row >= 0 && row < clone.length &&
        col >= 0 && col < clone[0].length)
        {
          clone[row][col] = 1;
          this.sendData(row, col, this.state.color);
          const surface = ReactDOM.findDOMNode(this).querySelector("canvas");
          this.ctx = surface.getContext("2d");
          this.ctx.fillStyle = this.state.color;
          this.drawSquare(row, col, this.state.cellSize, this.ctx);
        }
        this.setState({board: clone});
    }
    this.setState(prevState => this.state);
  }

  update() {
    let nextArray = [];
    this.cloneArray(this.state.board, nextArray);
    this.setState({board: nextArray});
    
    const surface = ReactDOM.findDOMNode(this).querySelector("canvas");
    surface.width = this.state.width;
    surface.height = this.state.height;
    this.ctx = surface.getContext("2d");
    //render the board state
    this.ctx.clearRect(0, 0, this.state.width, this.state.height);
    this.drawCells(this.state.width, this.state.height, this.state.cellSize, this.ctx, this.state.board);
    this.drawGrid(this.state.width, this.state.height, this.state.cellSize, this.ctx);
  }

  //Resize the canvas
  responsiveCanvas() {
    //Get the current app width
    const width = ReactDOM.findDOMNode(this).getBoundingClientRect().width;
    //If the canvas is wider expand the array,
    //first generate a wider array, then copy the current array values
    if(width > this.state.width) {
      let board = this.generateRandomArray(
        width, this.state.height, this.state.cellSize
      );
      for(let i = 0; i < this.state.board.length; i++) {
        for(let j = 0; j < this.state.board[0].length; j++) {
          board[i][j] = this.state.board[i][j];
        }
      }
      this.setState({board});
    }
    this.setState({width});
  } 

  componentDidMount() {
    this.init();
    this.timerID = setTimeout(() => {
      this.update()
    }, 0);
    window.addEventListener("resize", this.responsiveCanvas);
    window.addEventListener("click", this.onBoardClick);

    axios.post("http://localhost:4002").then((response) => {
      let data;
      for(let i = 0; i < response.data.length; i++) {
        for(let j = 0; j < response.data[i].length; j++){
          data = response.data[i][j];
          if(data.fill !== "0") {
            const surface = ReactDOM.findDOMNode(this).querySelector("canvas");
            this.ctx = surface.getContext("2d");
            this.ctx.fillStyle = data.color;
            this.drawSquare(i, j, this.state.cellSize, this.ctx);
          }
        }
      }
    })
    
    this.socket.on('testing', (response) => {
      const data = JSON.parse(response);
      const surface = ReactDOM.findDOMNode(this).querySelector("canvas");
      this.ctx = surface.getContext("2d");
      this.ctx.fillStyle = data.color;
      this.drawSquare(data.row, data.col, this.state.cellSize, this.ctx);
    })
  }

  shouldComponentUpdate() {
    return true;
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.responsiveCanvas);
    window.removeEventListener("click", this.onBoardClick);
  }

  handleChangeComplete = (color) => {
    this.setState({ color: color.hex });
	};

  render() {
    return (
      <div className="container" style={{maxWidth: "99%"}}>
        <Draggable
          handle=".handle"
          defaultPosition={{x: 0, y: 0}}
          position={null}
          grid={[25, 25]}
          scale={1}
          onStart={this.handleStart}
          onDrag={this.handleDrag}
          onStop={this.handleStop}>
          <div className="handle" style={{width: "200px"}}>
            <SketchPicker
              color={ this.state.background }
              onChangeComplete={ this.handleChangeComplete }
            />
          </div>
        </Draggable>
        <div className="row">
          <canvas style={{"backgroundColor": "#ECF0F1"}} />
        </div>
      </div>
    );
  }
}

export default App;
