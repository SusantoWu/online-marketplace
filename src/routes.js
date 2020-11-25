import role from './role';
import Products from './pages/Products';
import Admin from './pages/Admin';
import Stores from './pages/Stores';
import StoreProducts from './pages/StoreProducts';

export const routes = [
  {
    path: '/',
    exact: true,
    component: Products,
    title: 'Products',
    menu: true,
  },
  {
    path: '/admin',
    exact: true,
    component: Admin,
    title: 'Admin',
    restrict: [role.admin],
    menu: true,
  },
  {
    path: '/stores',
    exact: true,
    component: Stores,
    title: 'Stores',
    restrict: [role.seller],
    menu: true,
  },
  {
    path: '/stores/:id',
    exact: true,
    component: StoreProducts,
    title: 'StoreProducts',
    restrict: [role.seller]
  },
  {
    path: '',
    redirect: '/',
  },
];