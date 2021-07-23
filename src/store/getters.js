const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  roles: state => state.user.roles,
  role_name: state => state.user.role_name,
  menu: state => state.user.menu,
  last: state => state.user.last,
  permission_routes: state => state.permission.routes
}
export default getters
