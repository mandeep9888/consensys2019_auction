import React, { Component } from 'react';
import Web3 from 'web3'
import './App.css';
import AuctionFactory from '../abis/AuctionFactory.json'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId()
    const networkData = AuctionFactory.networks[networkId]
    if (networkData) {
      const abi = AuctionFactory.abi
      const address = networkData.address
      const contract = new web3.eth.Contract(abi, address)
      console.log("all methods available >>>>",contract.methods);
      
      this.setState({ contract })
    // const totalSupply = await contract.methods.totalSupply().call()
    //   this.setState({ totalSupply })
      // Load auctionItems
      // for (var i = 1; i <= totalSupply; i++) {
      //   const auctionItem = await contract.methods.auctionItems(i - 1).call()
      //   this.setState({
      //     auctionItems: [...this.state.auctionItems, auctionItem]
      //   })
      // }
    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
  }

  // mint = (auctionItem) => {
  //   this.state.contract.methods.mint(auctionItem).send({ from: this.state.account })
  //     .once('receipt', (receipt) => {
  //       this.setState({
  //         auctionItems: [...this.state.auctionItems, auctionItem]
  //       })
  //     })
  // }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      contract: null,
      totalSupply: 0,
      auctionItems: [],
      value1: '',
      value2: '',
      value3: ''
    }

    this.updateInput1 = this.updateInput1.bind(this);
    this.updateInput2 = this.updateInput2.bind(this);
    this.updateInput3 = this.updateInput3.bind(this);
    this.updateInput4 = this.updateInput4.bind(this);
    this.updateInput5 = this.updateInput5.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  updateInput1(event) {
    this.setState({ value1: event.target.value });
    console.log(this.state.value1);
  }

  updateInput2(event) {
    this.setState({ value2: event.target.value });
    console.log(this.state.value2);
  }

  updateInput3(event) {
    this.setState({ value3: event.target.value });
    console.log(this.state.value3);
  }
  updateInput4(event) {
    this.setState({ value4: event.target.value });
    console.log(this.state.value3);
  }
  updateInput5(event) {
    this.setState({ value5: event.target.value });
    console.log(this.state.value3);
  }

  handleSubmit(event) {
    let values = [this.state.value1, parseInt(this.state.value2), parseInt(this.state.value3), parseInt(this.state.value4),this.state.value5]
    console.log("I'm called" + typeof(values[2]));
    console.log("contract methids >>> ", this.state.contract.methods);
    
    // parseInt(value1)
    // //Invoke the function here
     this.state.contract.methods.createAuction(values[0],values[1],values[2],values[3],values[4])
    .send({from: this.state.account, gas : 5000000})
    .then(console.log
    )
    // .once('receipt', (receipt) => {
      // console.log("createAuction >>>>>>>>>>>>>>>>>>>> ",receipt);
    // })
    this.state.contract.methods.returnAllAuctions().call()
     .then(
      console.log
    );


    //end
    event.preventDefault();
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href=""
            target="_blank"
            rel="noopener noreferrer"
          >
            AuctionItem Tokens
          </a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small className="text-white"><span id="account">{this.state.account}</span></small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1>Issue Token</h1>
                <form onSubmit={this.handleSubmit}>
                  <input
                    type='text1'
                    className='form-control mb-1'
                    placeholder='Field 1'
                    onChange={this.updateInput1}
                  />
                  <input
                    type='text2'
                    className='form-control mb-1'
                    placeholder='Field 2'
                    onChange={this.updateInput2}
                  />
                  <input
                    type='text3'
                    className='form-control mb-1'
                    placeholder='Field 3'
                    onChange={this.updateInput3}
                  />
                  <input
                    type='text4'
                    className='form-control mb-1'
                    placeholder='Field 4'
                    onChange={this.updateInput4}
                  />
                  <input
                    type='text5'
                    className='form-control mb-1'
                    placeholder='Field 5'
                    onChange={this.updateInput5}
                  />
                  <input
                    type='submit'
                    className='btn btn-block btn-primary'
                    value='submit'

                  />
                </form>
              </div>
            </main>
          </div>
          <hr />
        </div>
      </div>
    );
  }
}


export default App;
