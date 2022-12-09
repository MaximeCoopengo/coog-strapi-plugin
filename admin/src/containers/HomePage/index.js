// This file is part of Coog. The COPYRIGHT file at the top level of
// this repository contains the full copyright notices and license terms.

import React, { memo } from "react";
import { CheckPagePermissions } from "strapi-helper-plugin";
import CoogPlugin from "../../components/CoogPlugin";

import pluginPermissions from "../../permissions";

const HomePage = () => {
  return (
    <CheckPagePermissions permissions={pluginPermissions.settings}>
      <CoogPlugin />
    </CheckPagePermissions>
  );
};

export default memo(HomePage);
