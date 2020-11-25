import React, { Component } from 'react';
import { Flex, Box, Card, Image, Heading, Text, Loader, Modal } from 'rimble-ui';
import { connectWeb3 } from "../services/web3";

class Connect extends Component {
  componentDidMount() {
    connectWeb3()
      .then(this.props.connected.bind(this))
      .catch(this.props.failed.bind(this));
  }

  render() {
    return (
      <Modal isOpen={true}>
        <Card p={0} borderRadius={1} maxWidth="500px">
          <Flex
            justifyContent="space-between"
            alignItems="center"
            borderBottom={1}
            borderColor="near-white"
            p={[3, 4]}
            pb={3}
          >
            <Image
              src="/MetaMaskIcon.svg"
              aria-label="MetaMask extension icon"
              size="24px"
            />
            <Heading textAlign="center" as="h1" fontSize={[2, 3]} px={[3, 0]}>
              Confirm connection in MetaMask
            </Heading>
            <span></span>
          </Flex>
          <Box p={[3, 4]}>
            <Text textAlign="center">
              Confirm the request that's just appeared. If you can't see a request, open
              your MetaMask extension via your browser.
          </Text>
          </Box>
          <Box px={[3, 4]} pb={[3, 4]}>
            <Flex
              flexDirection={["column", "row"]}
              bg={"primary-2x-light"}
              p={[3, 4]}
              alignItems={["center", "auto"]}
            >
              <Loader size={"3em"} mr={[0, 3]} mb={[2, 0]} />
              <Flex flexDirection="column" alignItems={["center", "flex-start"]}>
                <Text fontWeight={4}>Waiting for connection confirmation...</Text>
                <Text fontWeight={2}>This won’t cost you any Ether</Text>
              </Flex>
            </Flex>
          </Box>
        </Card>
      </Modal>
    )
  }
}

export default Connect;