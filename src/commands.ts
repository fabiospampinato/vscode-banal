
/* IMPORT */

import vscode from 'vscode';
import {openInExternal} from 'vscode-extras';
import {getBundle, getOptions} from './utils';

/* MAIN */

const open = async ( name: string, version: string ): Promise<void> => {

  const bundle = await getBundle ( name, version );

  if ( !bundle ) return;

  openInExternal ( bundle.analyzerPath );

};

const toggle = ( force?: boolean ): void => {

  force ??= !getOptions ().enabled;

  vscode.workspace.getConfiguration ( 'banal' ).update ( 'enabled', force, true );

};

const disable = (): void => {

  toggle ( false );

};

const enable = (): void => {

  toggle ( true );

};

/* EXPORT */

export {open, toggle, disable, enable};
