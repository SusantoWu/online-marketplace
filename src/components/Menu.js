import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { withRouter, matchPath } from 'react-router';
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
    const { role } = this.state;

    if (account) {
      if (prevProps.account !== this.props.account) {
        getRole(account).then((role) => {
          this.setState({ role })
          this.routeGuard(role);
        });
      }
    } else if (role !== null) {
      this.setState({ role: null });
      this.routeGuard(null);
    }
  }

  routeGuard(role) {
    const { history, location: { pathname } } = this.props;

    const config = routes.find((route) => {
      const match = matchPath(pathname, {
        path: route.path,
        exact: true,
        strict: false
      });
      return match ? match.url === pathname : route.path === pathname;
    });

    if (!config) {
      return;
    }

    const allowed = this.allowed(config.restrict, role);
    if (allowed) {
      return;
    }

    history.push('/');
  }

  allowed(roles, role) {
    return !roles || roles.some((routeRole) => routeRole === role);
  }

  render() {
    return (
      <Nav>
        {routes.map((route, i) => this.allowed(route.restrict, this.state.role) && route.menu ? (
          <NavItem key={i}>
            <NavLink to={route.path}>{route.title}</NavLink>
          </NavItem>
        ) : null)}
      </Nav>
    );
  }
}

export default withRouter(Menu);
