import React, { Component } from 'react';
import { Heading, Input, Card, EthAddress, Button, Flex } from 'rimble-ui';
import { subscribeEvent } from '../services/user';

class Accounts extends Component {
  constructor(props) {
    super(props);
    this.state = { accounts: [], value: '' };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  componentDidMount() {
    subscribeEvent('RoleGranted', {
      data: ({ returnValues }) => {
        this.setState(({ accounts }) => ({
          accounts: [...accounts, returnValues.account],
        }))
      }
    }, this.props.role);
    subscribeEvent('RoleRevoked', {
      data: ({ returnValues }) => {
        this.setState(({ accounts }) => ({
          accounts: accounts.filter(account => account !== returnValues.account)
        }))
      }
    }, this.props.role);

    this.initialise();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.account !== this.props.account) {
      this.initialise();
    }
  }

  initialise() {
    const { account } = this.props;
    if (account) {
      this.props.getAccounts(account).then((accounts) => this.setState({ accounts }));
    }
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  handleSubmit() {
    this.props.addAccount(this.state.value, this.props.account).then(() => {
      this.setState({
        value: ''
      })
    })
  }

  handleDelete(account) {
    this.props.deleteAccount(account, this.props.account);
  }

  render() {
    return (
      <React.Fragment>
        <Heading>{this.props.title}</Heading>
        {this.state.accounts.map((account, i) => (
          <Card key={i} mb={3}>
            <Flex justifyContent="space-between">
              <EthAddress address={account} />
              <Button icon="Delete" icononly ml={3} onClick={() => this.handleDelete(account)} />
            </Flex>
          </Card>
        ))}
        <Card>
          <Flex justifyContent="space-between">
            <Input flex={1} type="text" placeholder="Add admin address" value={this.state.value} onChange={this.handleChange} />
            <Button icon="Done" icononly ml={3} onClick={this.handleSubmit} />
          </Flex>
        </Card>
      </React.Fragment>
    )
  }
}

export default Accounts;