import React, { Component } from 'react';
import { Card, Text, Button, Flex, Box, theme } from 'rimble-ui';
import styled from 'styled-components';
import { getProducts } from '../services/store';

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
    this.state = { products: [] };

    this.handleBuy = this.handleBuy.bind(this);
  }

  componentDidMount() {
    /* subscribeEvent('ProductAdded', {
      data: ({ returnValues }) => {
        const { id, name, quantity, price, storeId } = returnValues;
        this.setState(({ products }) => ({
          products: [...products, { id, name, quantity, price, storeId }],
        }))
      }
    }, { storeId: id });

    subscribeEvent('ProductRemoved', {
      data: ({ returnValues }) => {
        const { id } = returnValues;
        this.setState(({ products }) => ({
          products: products.filter((product) => product.id !== id),
        }))
      }
    }, { storeId: id });

    subscribeEvent('ProductUpdated', {
      data: ({ returnValues }) => {
        const { id, price } = returnValues;
        this.setState(({ products }) => ({
          products: products.map((product) => product.id === id ? { ...product, price } : product),
        }))
      }
    }, { storeId: id }); */

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
      getProducts(0, 10).then((products) => this.setState({ products }));
    }
  }

  handleBuy() {

  }

  render() {
    return (
      <React.Fragment>
        <Container>
          {this.state.products.map((product, i) => (
            <ContainerItem key={i}>
              <Card>
                <Text>{product.name}</Text>
                <Text># {product.quantity}</Text>
                <Text>ETH {product.price}</Text>
                <Box mt={2} textAlign="right">
                  <Button icon="ShoppingBasket" icononly onClick={() => this.handleBuy(product.id)} />
                </Box>
              </Card>
            </ContainerItem>
          ))}
        </Container>ƒ
      </React.Fragment>
    )
  }
}

export default Products;