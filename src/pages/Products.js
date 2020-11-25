import React, { Component } from 'react';
import { Card, Text, Button, Flex, Box, theme, Loader, Input } from 'rimble-ui';
import styled from 'styled-components';
import { getProducts, buyProduct, subscribeEvent } from '../services/store';

const Container = styled(Flex)`
  margin-left: -${theme.space[2]}px;
  margin-right: -${theme.space[2]}px;
  flex-wrap: wrap;
`;

const ContainerItem = styled(Box)`
  padding-left: ${theme.space[2]}px;
  padding-right: ${theme.space[2]}px;
  margin-bottom: ${theme.space[3]}px;
  flex: 0 33.333%;
  box-sizing: border-box;
`;

class Products extends Component {
  constructor(props) {
    super(props);
    this.state = { products: [], prev: 0, next: 0, loading: false, stop: false, value: '', hovered: null };

    this.handleBuy = this.handleBuy.bind(this);
    this.handleLoad = this.handleLoad.bind(this);
    this.handleEnter = this.handleEnter.bind(this);
    this.handleLeave = this.handleLeave.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    subscribeEvent('ProductBought', {
      data: (event) => {
        const { id, quantity, paid } = event.returnValues;
        this.setState(({ products }) => ({
          products: products.map((product) => product.id === id ? { ...product, quantity } : product),
        }))
        alert(`ProductBought success! Spent ETH ${paid}.`);
      }
    });

    this.initialise();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.account !== this.props.account) {
      this.initialise();
    }
  }

  initialise() {
    const { account } = this.props;
    const { next } = this.state;

    if (account) {
      this.setState({ loading: true });
      getProducts(next, 6, account)
        .then((result) => {
          this.setState(({ products }) => ({
            products: [...products, ...result.data],
            prev: result.prev,
            next: result.next,
            stop: next === result.next
          }))
        })
        .finally(() => this.setState({ loading: false }));
    }
  }

  handleLoad() {
    this.initialise();
  }

  handleEnter(id) {
    this.setState({ hovered: id, value: '' });
  }

  handleLeave() {
    this.setState({ hovered: null, value: '' });
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  handleBuy({ id, price }) {
    const { account } = this.props;
    const { value } = this.state;

    if (value <= 0) {
      alert('Invalid input!');
      return;
    }

    buyProduct(id, value, price * value, account);
  }

  render() {
    return (
      <React.Fragment>
        <Container>
          {this.state.products.map((product, i) => (
            <ContainerItem key={i}>
              <Card onMouseEnter={() => this.handleEnter(product.id)} onMouseLeave={() => this.handleLeave()}>
                <Text>{product.name}</Text>
                <Text># {product.quantity}</Text>
                <Text>ETH {product.price}</Text>
                <Flex mt={2} height="48px" width="100%">
                  {this.state.hovered === product.id &&
                    (<React.Fragment>
                      <Input flex={1} width="100%" type="number" value={this.state.value} onChange={this.handleChange} />
                      <Button ml={3} icon="ShoppingBasket" icononly onClick={() => this.handleBuy(product)} />
                    </React.Fragment>)
                  }
                </Flex>
              </Card>
            </ContainerItem>
          ))}
          {!this.state.stop &&
            (<Flex width="100%" justifyContent="center" my={3}>
              {
                this.state.loading
                  ? (<Loader size="40px" />)
                  : (<Button onClick={this.handleLoad}>Load More</Button>)
              }
            </Flex>)
          }
        </Container>
      </React.Fragment>
    )
  }
}

export default Products;