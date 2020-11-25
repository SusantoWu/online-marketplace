import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Heading, Input, Card, Text, Button, Flex, Box, theme } from 'rimble-ui';
import styled from 'styled-components';
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
    this.state = { products: [], name: '', quantity: '', price: '', edit: null };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
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
      getStoreProducts(id, account).then((products) => this.setState({ products }));
    }
  }

  reset() {
    this.setState({
      name: '',
      quantity: '',
      price: '',
      edit: null
    })
  }

  handleChange(key, event) {
    this.setState({ [key]: event.target.value });
  }

  handleSubmit() {
    const { account, match: { params: { id } } } = this.props;
    const { edit, name, quantity, price } = this.state;

    if (!name.length || quantity <= 0 || price <= 0) {
      alert("Invalid input!");
      return;
    }

    if (!edit) {
      addProduct(name, quantity, price, id, account).then(() => {
        this.reset();
      });
    } else {
      const product = this.state.products.find((product) => product.id === edit);
      if (price !== product.price) {
        updateProduct(id, edit, price, account).then(() => {
          this.reset();
        });
      } else {
        this.reset();
      }
    }
  }

  handleEdit(product) {
    this.setState({
      edit: product.id,
      name: product.name,
      quantity: product.quantity,
      price: product.price
    });
  }

  handleDelete(productId) {
    const { account, match: { params: { id } } } = this.props;

    deleteProduct(id, productId, account);
  }

  render() {
    return (
      <React.Fragment>
        <Heading>Products</Heading>
        <Container>
          {this.state.products.map((product, i) => (
            <ContainerItem key={i}>
              <Card>
                <Text>{product.name}</Text>
                <Text># {product.quantity}</Text>
                <Text>ETH {product.price}</Text>
                <Box mt={2} textAlign="right">
                  <Button icon="Edit" icononly onClick={() => this.handleEdit(product)} />
                  <Button icon="Delete" icononly ml={3} onClick={() => this.handleDelete(product.id)} />
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
      </React.Fragment>
    )
  }
}

export default withRouter(StoreProducts);