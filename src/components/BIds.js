import React, { Component } from 'react';
import { Card, Table, Modal, Box, Flex, Button, EthAddress } from 'rimble-ui';
import { weiToEther } from '../helpers/parse';
import { getBids, endAuction } from '../services/auction';

class Bids extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bids: []
    };

    this.handleEnd = this.handleEnd.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  componentDidMount() {
    this.initialise();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.account !== this.props.account) {
      this.initialise();
    }
  }

  initialise() {
    const { account, product } = this.props;

    if (account) {
      getBids(product.id, account).then((bids) => {
        this.setState({ bids })
      });
    }
  }

  handleCancel() {
    this.props.close();
  }

  handleEnd() {
    const { account, product } = this.props;

    endAuction(product.id, account).then(() => {
      this.handleCancel();
    });
  }

  render() {
    return (
      <Modal isOpen={true}>
        <Card p={0} borderRadius={1} maxWidth="600px">
          <Table>
            <thead>
              <tr>
                <th>Bidder</th>
                <th>Bid Price</th>
              </tr>
            </thead>
            <tbody>
              {this.state.bids.map((bid, i) => (
                <tr key={i}>
                  <td><EthAddress address={bid.bidder} /></td>
                  <td>{weiToEther(bid.price)} ETH</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Flex
            px={4}
            py={3}
            borderTop={1}
            borderColor={"#E8E8E8"}
            justifyContent={"flex-end"}
          >
            <Button.Outline onClick={this.handleCancel}>Cancel</Button.Outline>
            <Button ml={3} disabled={!this.props.product.closed} onClick={this.handleEnd}>End Auction</Button>
          </Flex>
        </Card>
      </Modal>
    )
  }
}

export default Bids;