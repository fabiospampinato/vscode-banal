
/* IMPORT */

import vscode from 'vscode';
import * as Commands from './commands';
import Lens from './lens';

/* MAIN */

const activate = (): void => {

  vscode.commands.registerCommand ( 'banal.open', Commands.open );
  vscode.commands.registerCommand ( 'banal.toggle', Commands.toggle );
  vscode.commands.registerCommand ( 'banal.disable', Commands.disable );
  vscode.commands.registerCommand ( 'banal.enable', Commands.enable );

  Lens.refresh ();

  vscode.languages.registerCodeLensProvider ( { language: 'json' }, Lens );
  vscode.workspace.onDidChangeConfiguration ( Lens.refresh );

};

/* EXPORT */

export {activate};
