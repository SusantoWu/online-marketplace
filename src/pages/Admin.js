import React, { Component } from 'react';
import { Box, Flex, theme } from 'rimble-ui';
import Accounts from '../components/Accounts';
import role from '../role';
import { getAdmins, addAdmin, deleteAdmin, getSellers, addSeller, deleteSeller } from '../services/user';

class Admin extends Component {
  render() {
    return (
      <React.Fragment>
        <Flex>
          <Box flex={1}>
            <Accounts
              title="Admins"
              role={role.admin}
              account={this.props.account}
              getAccounts={getAdmins}
              addAccount={addAdmin}
              deleteAccount={deleteAdmin}
            />
          </Box>
          <Box width={`${theme.space[3]}px`}></Box>
          <Box flex={1}>
            <Accounts
              title="Sellers"
              role={role.seller}
              account={this.props.account}
              getAccounts={getSellers}
              addAccount={addSeller}
              deleteAccount={deleteSeller}
            />
          </Box>
        </Flex>
      </React.Fragment>
    )
  }
}

export default Admin;