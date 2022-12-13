import path = require('path');
import * as vscode from 'vscode';
import { HlfTreeItem } from './HlfTreeItem';

export class NetworkItem extends HlfTreeItem {
    iconPath: {light: string, dark: string} = {
        light: path.join(__filename, '..', '..','..', '..', 'media', 'network-black.png'),
        dark: path.join(__filename, '..', '..','..', '..', 'media', 'network-white.png')
    };

    contextValue = 'network';
}