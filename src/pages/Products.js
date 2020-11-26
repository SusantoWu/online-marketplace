import React, { Component } from 'react';
import { Card, Text, Button, Flex, Box, theme, Loader, Input } from 'rimble-ui';
import styled from 'styled-components';
import { getAuctions, bidAuction, getUserBids, subscribeEvent as auctionSubsribeEVent } from '../services/auction';
import { getProducts, buyProduct, subscribeEvent } from '../services/store';
import Timer from '../components/Timer';

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
    this.state = {
      products: [],
      auctions: [],
      prev: 0,
      next: 0,
      loading: false,
      stop: false,
      value: '',
      hovered: null
    };

    this.handleBuy = this.handleBuy.bind(this);
    this.handleBid = this.handleBid.bind(this);
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

    auctionSubsribeEVent('Bidded', {
      data: (event) => {
        const { price } = event.returnValues;
        alert(`Bidded success! Spent ETH ${price}.`);
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
          }));
          getAuctions(result.data.map((product) => product.id), account)
            .then((data) => {
              this.setState(({ auctions }) => ({
                auctions: [...auctions, ...data]
              }));
            });
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

    buyProduct(id, value, price * value, account).then(() => {
      this.setState({ value: '' });
    });
  }

  handleBid({ id, startPrice, bidded }) {
    const { account } = this.props;
    const { value } = this.state;

    if (bidded) {
      alert('Not allow to bid more than once!');
      return;
    }

    if (value <= 0 || value < startPrice) {
      alert('Invalid input!');
      return;
    }

    bidAuction(id, value, account).then(() => {
      this.setState({ value: '' });
    });
  }

  productAuction({ id }) {
    return this.state.auctions.find(({ product }) => product === id);
  }

  render() {
    const productAuctions = this.state.products.map((product) => ({ ...product, ...this.productAuction(product) }));
    return (
      <React.Fragment>
        <Container>
          {productAuctions.map((product, i) => (
            <ContainerItem key={i}>
              <Card onMouseEnter={() => this.handleEnter(product.id)} onMouseLeave={() => this.handleLeave()}>
                {!!product.product && product.opened && (<Timer auction={product} />)}
                <Text>{product.name}</Text>
                <Text># {product.quantity}</Text>
                <Text>
                  {
                    !!product.product && product.opened
                      ? `Auct. ETH ${product.startPrice}`
                      : `ETH ${product.price}`
                  }
                  {
                    !!product.product && product.bidded &&
                    ` (Bidded)`
                  }
                </Text>
                <Flex mt={2} height="48px" width="100%">
                  {this.state.hovered === product.id &&
                    (
                      <React.Fragment>
                        <Input
                          flex={1}
                          width="100%"
                          type="number"
                          value={this.state.value}
                          onChange={this.handleChange}
                        />
                        <Button
                          ml={3}
                          icon="ShoppingBasket"
                          icononly
                          onClick={() => !!product.product && product.opened ? this.handleBid(product) : this.handleBuy(product)}
                        />
                      </React.Fragment>
                    )
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