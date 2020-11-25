import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { routes } from '../routes';
import styled from "styled-components";
import { theme } from 'rimble-ui';
import { getRole } from "../services/user";

const Nav = styled('ul')`
  margin: 0 -${theme.space[3]}px;
  padding: 0;
  list-style: none;
  border-top: 1px solid ${theme.colors.white};
`;

const NavItem = styled('li')``;

const NavLink = styled(Link)`
  display: block;
  color: ${theme.colors.white};
  padding: ${theme.space[3]}px;
  text-decoration: none;

  &:hover {
    color: ${theme.colors.white};
    background-color: ${theme.colors['primary-light']};
  }
`;

class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = { role: null };
  }

  componentDidUpdate(prevProps) {
    const { account } = this.props;

    if (account && prevProps.account !== account) {
      getRole(account).then((role) => this.setState({ role }));
    }
  }

  allowed(roles) {
    const { role } = this.state;
    return !roles || roles.some((routeRole) => routeRole === role);
  }

  render() {
    return (
      <Nav>
        {routes.map((route, i) => this.allowed(route.restrict) && route.menu ? (
          <NavItem key={i}>
            <NavLink to={route.path}>{route.title}</NavLink>
          </NavItem>
        ) : null)}
      </Nav>
    );
  }
}

export default Menu;
