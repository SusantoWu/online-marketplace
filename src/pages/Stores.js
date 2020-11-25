import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Heading, Input, Card, Text, Button, Flex, Box, theme, ToastMessage } from 'rimble-ui';
import styled from 'styled-components';
import { getStores, addStore, subscribeEvent, deleteStore } from '../services/store';
import { getPayments, withdraw, subscribeEvent as paymentSubscribeEvent } from '../services/payment';

const Container = styled(Flex)`
  margin-left: -${theme.space[2]}px;
  margin-right: -${theme.space[2]}px;
  flex-wrap: wrap;
`;

const ContainerItem = styled(Box)`
  padding-left: ${theme.space[2]}px;
  padding-right: ${theme.space[2]}px;
  margin-bottom: ${theme.space[3]}px;
  flex: 0 50%;
  box-sizing: border-box;
`;

const ButtonProducts = (id) => <Link to={`/stores/${id}`}><Button icon="ViewList" icononly /></Link>

class Stores extends Component {
  constructor(props) {
    super(props);
    this.state = { stores: [], payments: 0, value: '', alert: null };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleWithdraw = this.handleWithdraw.bind(this);
  }

  componentDidMount() {
    subscribeEvent('StoreCreated', {
      data: ({ returnValues }) => {
        const { id, name } = returnValues;
        this.setState(({ stores }) => ({
          stores: [...stores, { id, name }],
        }))
      }
    });

    subscribeEvent('StoreRemoved', {
      data: ({ returnValues }) => {
        const { id } = returnValues;
        this.setState(({ stores }) => ({
          stores: stores.filter((store) => store.id !== id),
        }))
      }
    });

    /* paymentSubscribeEvent('Withdrawn', {
      data: ({ returnValues }) => {
        const { payee, payment } = returnValues;
        this.setState({
          payments: 0,
          alert: { header: 'ETH Sent', message: `You have withdrawn ${payment} Ether to ${payee}` }
        });
      }
    }); */

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
      getStores(account).then((stores) => this.setState({ stores }));
      getPayments(account).then((payments) => this.setState({ payments }));
    }
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  handleSubmit() {
    addStore(this.state.value, this.props.account).then(() => {
      this.setState({
        value: ''
      })
    });
  }

  handleDelete(id) {
    deleteStore(id, this.props.account);
  }

  handleWithdraw() {
    const { account } = this.props;
    withdraw(account);
  }

  render() {
    return (
      <React.Fragment>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading>Stores</Heading>
          <Flex alignItems="center">
            <Text mr={3}>Collected funds</Text>
            <Button
              icon="FileDownload"
              iconpos="right"
              onClick={this.handleWithdraw}>
              ETH {this.state.payments}
            </Button>
          </Flex>
        </Flex>
        <Container>
          {this.state.stores.map((store, i) => (
            <ContainerItem key={i}>
              <Card>
                <Flex justifyContent="space-between" alignItems="center">
                  <Text>{store.name}</Text>
                  <Box>
                    {ButtonProducts(store.id)}
                    <Button icon="Delete" icononly ml={3} onClick={() => this.handleDelete(store.id)} />
                  </Box>
                </Flex>
              </Card>
            </ContainerItem>
          ))}
        </Container>
        <Card>
          <Flex justifyContent="space-between">
            <Input flex={1} type="text" placeholder="Add store name" value={this.state.value} onChange={this.handleChange} />
            <Button icon="Done" icononly ml={3} onClick={this.handleSubmit} />
          </Flex>
        </Card>
      </React.Fragment>
    )
  }
}

export default Stores;