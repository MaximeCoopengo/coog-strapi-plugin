// This file is part of Coog. The COPYRIGHT file at the top level of
// this repository contains the full copyright notices and license terms.

'use strict';

const _ = require('lodash');

module.exports = async () => {
  // Add permissions
  const actions = [
    {
      section: 'settings',
      category: 'coog-plugin',
      displayName: 'Access the CoogConnector Settings page',
      uid: 'settings.read',
      pluginName: 'coog-plugin',
    },
    {
      section: 'settings',
      category: 'coog-plugin',
      displayName: 'Update the CoogConnector Settings',
      uid: 'settings.update',
      pluginName: 'coog-plugin',
    },
    {
      section: 'settings',
      category: 'coog-plugin',
      displayName: 'Create a new Strapi User',
      uid: 'user.create',
      pluginName: 'coog-plugin',
    },
  ];

  await strapi.admin.services.permission.actionProvider.registerMany(actions);
};
