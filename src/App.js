import React, { Component } from "react";
import { Switch, Route, Redirect } from 'react-router-dom';
import { Flex, Box, Heading, theme } from 'rimble-ui';
import { routes } from './routes';
import Connect from './components/Connect';
import Menu from './components/Menu';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { account: null, connect: null };

    this.handleConnect = this.handleConnect.bind(this);
    this.handleConnected = this.handleConnected.bind(this);
  }

  handleConnect(callback) {
    this.setState({ connect: callback });
  }

  handleConnected(account) {
    this.setState({ account, connect: null });
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
                <Connect connected={this.handleConnected} connect={this.state.connect}></Connect>
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
                      route.component
                        ? <route.component {...props} account={this.state.account} connect={this.handleConnect} />
                        : <Redirect to={route.redirect} />
                    )}
                  />
                ))}
              </Switch>
            </Box>
          </Flex>
        </Box>
      </Flex>
    );
  }
}

export default App;
