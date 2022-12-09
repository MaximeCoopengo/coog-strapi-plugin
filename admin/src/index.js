// This file is part of Coog. The COPYRIGHT file at the top level of
// this repository contains the full copyright notices and license terms.

import React from "react";
import pluginPkg from "../../package.json";
import pluginId from "./pluginId";
import { CheckPagePermissions } from "strapi-helper-plugin";
import HomePage from "./containers/HomePage";
import pluginPermissions from "./permissions";
import lifecycles from "./lifecycles";
import trads from "./translations";

export default (strapi) => {
  const pluginDescription =
    pluginPkg.strapi.description || pluginPkg.description;
  const icon = pluginPkg.strapi.icon;
  const name = pluginPkg.strapi.name;

  const plugin = {
    blockerComponent: null,
    blockerComponentProps: {},
    description: pluginDescription,
    icon,
    id: pluginId,
    initializer: null,
    injectedComponents: [],
    isReady: true,
    isRequired: pluginPkg.strapi.required || false,
    layout: null,
    lifecycles,
    mainComponent: null,
    name,
    preventComponentRendering: false,
    trads,
    settings: {
      menuSection: {
        id: pluginId,
        title: "CoogConnector",
        links: [
          {
            title: {
              id: `${pluginId}.plugin.name`,
              defaultMessage: name,
            },
            name,
            to: `${strapi.settingsBaseURL}/${pluginId}`,
            Component: () => (
              <CheckPagePermissions permissions={pluginPermissions.settings}>
                <HomePage />
              </CheckPagePermissions>
            ),
            permissions: pluginPermissions.settings,
          },
        ],
      },
    },
  };

  return strapi.registerPlugin(plugin);
};
