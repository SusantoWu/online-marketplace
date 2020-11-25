import React, { Component } from "react";
import { Switch, Route, Redirect } from 'react-router-dom';
import { MetaMaskButton, EthAddress, Flex, Box, Heading, theme } from 'rimble-ui';
import { routes } from './routes';
import Connect from './components/Connect';
import Menu from './components/Menu';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { account: null, connecting: false };

    this.handleClick = this.handleClick.bind(this);
    this.handleConnected = this.handleConnected.bind(this);
    this.handleFailed = this.handleFailed.bind(this);
  }

  componentDidMount() {
    this.handleClick();
  }

  handleClick() {
    this.setState({ connecting: true });
  }

  handleConnected(web3) {
    this.setState({ connecting: false });
    web3.eth.getAccounts()
      .then((accounts) => this.setState({ account: accounts[0] }));
  }

  handleFailed() {
    this.setState({ connecting: false });
  }

  render() {
    return (
      <Flex height="100%">
        <Box p="3" width="200px" height="100%" boxShadow="0px 0px 2px 0px black" backgroundColor={theme.colors.primary}>
          <Heading textAlign="center" as="h1" fontSize={[2, 3]} color={theme.colors.white}>
            MarketPlace
          </Heading>
          <Menu account={this.state.account}></Menu>
        </Box>
        <Box flex="1" height="100%">
          <Flex flexDirection="column" height="100%">
            <Box p="3" boxShadow="2px 0px 2px black">
              <Flex justifyContent="flex-end">
                {
                  this.state.account ?
                    (<Box maxWidth="500px"><EthAddress address={this.state.account} /></Box>)
                    : (
                      <MetaMaskButton.Outline size="small" onClick={this.handleClick}>
                        Connect with MetaMask
                      </MetaMaskButton.Outline>
                    )
                }
              </Flex>
            </Box>
            <Box flex="1" p="3" overflow="auto">
              <Switch>
                {routes.map((route, i) => (
                  <Route
                    key={i}
                    exact={route.exact}
                    path={route.path}
                    render={props => (
                      route.component ? <route.component {...props} account={this.state.account} /> : <Redirect to={route.redirect} />
                    )}
                  />
                ))}
              </Switch>
            </Box>
          </Flex>
        </Box>
        {
          this.state.connecting && (<Connect connected={this.handleConnected} failed={this.handleFailed}></Connect>)
        }
      </Flex>
    );
  }
}

export default App;
