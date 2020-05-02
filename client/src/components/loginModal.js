import React from 'react';

class LoginModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      signUp: this.props.signUp ? true : false
    }
  }

  render() {
    return(
      <div>
        <div className="group-buttons">
          <div className="button" 
            style={this.state.signUp ? {backgroundColor: "#F4F5FD"} : {backgroundColor: "white"}}
            onClick={() => {this.setState({signUp: true})}}>
              Sign up</div>
          <div className="button"
            style={this.state.signUp ? {backgroundColor: "white"} : {backgroundColor: "#F4F5FD"}}
            onClick={() => {this.setState({signUp: false})}}>
              Sign in</div>
        </div>
        <div>
          <span>Register new account</span>
        </div>
      </div>
    )
  }
}

export default LoginModal;