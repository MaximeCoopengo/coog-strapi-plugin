// This file is part of Coog. The COPYRIGHT file at the top level of
// this repository contains the full copyright notices and license terms.

const pluginPkg = require("../../package.json");
const pluginId = pluginPkg.name.replace(/^strapi-plugin-/i, "");

module.exports = pluginId;
