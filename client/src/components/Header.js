import React, { useState } from 'react';
import Modal from "react-modal";
import LoginModal from './loginModal'

class Header extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      isActiveModal: false,
      signUp: false,
    }
  }
  openModal = async (influencerId) => {
    this.setState({ isActiveModal: true });
  };

  closeModal = () => {
    this.setState({ isActiveModal: false });
  };

  render() {
    const customStyles = {
      content: {
        maxWidth: "1075px",
        top: "10%",
        margin: `auto auto`,
        bottom: "7%",
        border: "none",
        paddingLeft: "0px",
        paddingRight: "0px",
        paddingTop: "0px",
        paddingBottom: "0px",
        WebkitOverflowScrolling: "touch",
        background: "#F4F5FD",
      },
      overlay: {
        backgroundColor: "rgba(13, 28, 72, 0.4)",
      },
    };

    return(
      <div>
        <Modal
          shouldCloseOnOverlayClick={true}
          onRequestClose={this.closeModal}
          isOpen={this.state.isActiveModal}
          style={customStyles}
          contentLabel="Influencer"
        >
          <LoginModal signUp={this.state.signUp}/>
        </Modal>
        <nav>
          <div className="nav-wrapper">
            <ul id="nav-mobile" className="right hide-on-med-and-down">
              <li onClick={() => this.setState({
                isActiveModal: true,
                signUp: true,
                })}><a>Sign up</a></li>
              <li onClick={() => this.setState({
                isActiveModal: true,
                signUp: false
                })}><a>Sign in</a></li>
              <li><a></a></li>
              <li><a></a></li>
              <li><a></a></li>
            </ul>
          </div>
        </nav>
      </div>
    )
  }
}

export default Header