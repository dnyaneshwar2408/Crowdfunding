import { createCampaign, dashboard, logout, payment, profile, withdraw } from '../assets';

export const navLinks = [
  {
    name: 'Home',
    imgUrl: dashboard,
    link: '/',
    id: 0
  },
  {
    name: 'Start campaign',
    imgUrl: createCampaign,
    link: '/create-campaign',
    id: 1
  },
  {
    name: 'Logout',
    imgUrl: logout,
    link: '/',
    disabled: true,
    id: 5
  },
];
