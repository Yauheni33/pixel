import React from 'react';
import Canvas from './components/Canvas'
import Header from './components/Header'


class App extends React.Component {
  constructor(props) {
    super(props);
  
  }
  
  componentDidMount() {

  }

  shouldComponentUpdate() {

  }

  render() {
    return (
      <div>
        <Header />
        <Canvas />
      </div>
    );
  }
}

export default App;
