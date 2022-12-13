import path = require('path');
import * as vscode from 'vscode';
import { HlfTreeItem } from './HlfTreeItem';

export class OrganizationItem extends HlfTreeItem {
    iconPath: {light: string, dark: string} = {
        light: path.join(__filename, '..', '..','..', '..', 'media', 'organizations-black.png'),
        dark: path.join(__filename, '..', '..','..', '..', 'media', 'organizations-white.png')
    };

    contextValue = 'organization';
}