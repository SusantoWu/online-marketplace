import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Heading, Input, Card, Text, Button, Flex, Box, theme, Modal } from 'rimble-ui';
import styled from 'styled-components';
import Bids from '../components/Bids';
import Timer from '../components/Timer';
import { etherToWei, weiToEther } from '../helpers/parse';
import { startAuction, getAuctions, subscribeEvent as auctionSubscribeEvent } from '../services/auction';
import { getStoreProducts, addProduct, deleteProduct, updateProduct, subscribeEvent } from '../services/store';

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

const InputProduct = styled(Input)`
  width: 100%;
  margin-bottom: ${theme.space[2]}px;
`;

class StoreProducts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      auctions: [],
      name: '',
      quantity: '',
      price: '',
      open: '',
      close: '',
      edit: null,
      auction: null,
      product: null
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleAuction = this.handleAuction.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleBids = this.handleBids.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  componentDidMount() {
    const { match: { params: { id } } } = this.props;

    subscribeEvent('ProductAdded', {
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
    }, { storeId: id });

    auctionSubscribeEvent('AuctionStarted', {
      data: ({ returnValues }) => {
        const { product, openTime, closeTime, startPrice } = returnValues;
        this.setState(({ auctions }) => ({
          auctions: [...auctions, { product, openTime, closeTime, startPrice }],
        }))
      }
    });

    auctionSubscribeEvent('AuctionEnded', {
      data: ({ returnValues }) => {
        const { product, price } = returnValues;
        this.setState(({ auctions }) => ({
          auctions: auctions.filter((auction) => auction.product !== product),
        }))
        alert(`Paid ${weiToEther(price)} ETH to store`);
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
    const { account, match: { params: { id } } } = this.props;
    if (account) {
      getStoreProducts(id, account).then((products) => {
        this.setState({ products });
        getAuctions(products.map((product) => product.id), account)
          .then((auctions) => this.setState({ auctions }));
      });
    }
  }

  reset() {
    this.setState({
      name: '',
      quantity: '',
      price: '',
      open: '',
      close: '',
      edit: null,
      auction: null,
    })
  }

  handleChange(key, event) {
    this.setState({ [key]: event.target.value });
  }

  handleSubmit() {
    const { account, match: { params: { id } } } = this.props;
    const { edit, name, quantity, price } = this.state;
    const actualPrice = etherToWei(price);

    if (!name.length || quantity <= 0 || actualPrice <= 0) {
      alert("Invalid input!");
      return;
    }

    if (!edit) {
      addProduct(name, quantity, actualPrice, id, account).then(() => {
        this.reset();
      });
    } else {
      const product = this.state.products.find((product) => product.id === edit);
      if (actualPrice !== product.price) {
        updateProduct(id, edit, actualPrice, account).then(() => {
          this.reset();
        });
      } else {
        this.reset();
      }
    }
  }

  productAuction({ id }) {
    return this.state.auctions.find(({ product }) => product === id);
  }

  handleAuction() {
    const { account } = this.props;
    const { auction, open, close, price } = this.state;
    const actualPrice = etherToWei(price);

    const openTimestamp = Date.parse(open) / 1000;
    const closeTimestamp = Date.parse(close) / 1000;

    if (closeTimestamp <= openTimestamp || actualPrice <= 0) {
      alert("Invalid input!");
      return;
    }

    startAuction(openTimestamp, closeTimestamp, auction, actualPrice, account).then(() => {
      this.reset();
    });
  }

  handleBids(product) {
    this.setState({ product });
  }

  handleClose() {
    this.setState({ product: null });
  }

  handleOpen({ id, name, price }) {
    this.setState({
      auction: id,
      name,
      price: weiToEther(price),
      open: '',
      close: ''
    });
  }

  handleCancel() {
    this.reset();
  }

  handleEdit(product) {
    this.setState({
      edit: product.id,
      name: product.name,
      quantity: product.quantity,
      price: weiToEther(product.price)
    });
  }

  handleDelete(productId) {
    const { account, match: { params: { id } } } = this.props;

    deleteProduct(id, productId, account);
  }

  render() {
    const productAuctions = this.state.products.map((product) => ({ ...product, ...this.productAuction(product) }));
    return (
      <React.Fragment>
        <Heading>Products</Heading>
        <Container>
          {productAuctions.map((product, i) => (
            <ContainerItem key={i}>
              <Card>
                {!!product.product && (<Timer auction={product} />)}
                <Text>{product.name}</Text>
                <Text># {product.quantity}</Text>
                <Text>{weiToEther(product.price)} ETH {!!product.startPrice && `(Auct. ${weiToEther(product.startPrice)} ETH)`}</Text>
                <Box mt={2} textAlign="right">
                  {!!product.product
                    ? <Button
                      icon="GridOn"
                      icononly
                      onClick={() => this.handleBids(product)}
                    /> :
                    <Button
                      icon="Home"
                      icononly
                      onClick={() => this.handleOpen(product)}
                    />
                  }
                  <Button
                    icon="Edit"
                    icononly
                    ml={2}
                    disabled={!!product.product}
                    onClick={() => this.handleEdit(product)}
                  />
                  <Button
                    icon="Delete"
                    icononly
                    ml={2}
                    disabled={!!product.product}
                    onClick={() => this.handleDelete(product.id)}
                  />
                </Box>
              </Card>
            </ContainerItem>
          ))}
        </Container>
        <Card>
          <InputProduct
            type="text"
            placeholder="Add product name"
            disabled={!!this.state.edit}
            value={this.state.name}
            onChange={(e) => this.handleChange('name', e)}
          />
          <InputProduct
            type="number"
            placeholder="Add product quantity"
            disabled={!!this.state.edit}
            value={this.state.quantity}
            onChange={(e) => this.handleChange('quantity', e)}
          />
          <InputProduct
            type="number"
            placeholder="Add product price"
            value={this.state.price}
            onChange={(e) => this.handleChange('price', e)}
          />
          <Box textAlign="right">
            <Button icon="Done" onClick={this.handleSubmit}>Done</Button>
          </Box>
        </Card>
        <Modal isOpen={!!this.state.auction}>
          <Card width="500px" p={0}>
            <Box p={4} mb={3}>
              <Text>{this.state.name}</Text>
              <InputProduct
                type="number"
                value={this.state.price}
                onChange={(e) => this.handleChange('price', e)}
              />
              <InputProduct
                type="datetime-local"
                value={this.state.open}
                onChange={(e) => this.handleChange('open', e)}
              />
              <InputProduct
                type="datetime-local"
                value={this.state.close}
                onChange={(e) => this.handleChange('close', e)}
              />
            </Box>
            <Flex
              px={4}
              py={3}
              borderTop={1}
              borderColor={"#E8E8E8"}
              justifyContent={"flex-end"}
            >
              <Button.Outline onClick={this.handleCancel}>Cancel</Button.Outline>
              <Button ml={3} onClick={this.handleAuction}>Confirm</Button>
            </Flex>
          </Card>
        </Modal>
        {this.state.product && <Bids account={this.props.account} product={this.state.product} close={this.handleClose} />}
      </React.Fragment>
    )
  }
}

export default withRouter(StoreProducts);