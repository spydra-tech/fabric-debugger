import path = require('path');
import { HlfTreeItem } from './HlfTreeItem';

export class OrganizationRoot extends HlfTreeItem {
    iconPath: {light: string, dark: string} = {
        light: path.join(__filename, '..', '..','..', '..', 'media', 'organizations-black.png'),
        dark: path.join(__filename, '..', '..','..', '..', 'media', 'organizations-white.png')
    };

    contextValue = 'organizationRoot';
}