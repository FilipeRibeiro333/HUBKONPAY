// src/utils/roles.js
// Definição das roles e suas permissões

const roles = {
  admin: ['create_user', 'delete_user', 'update_user', 'read_user'],
  user: ['read_user'],
  moderator: ['update_user', 'read_user'],
};

module.exports = roles;
