
/* IMPORT */

import path from 'node:path';
import vscode from 'vscode';
import {formatBytes, escapeRegex, getDependenciesInstalled, getDependenciesBundles, getOptions, isNumber} from './utils';

/* MAIN */

//TODO: Detect line numbers properly, from the AST

class CodeLensProvider implements vscode.CodeLensProvider {

  /* VARIABLES */

  private _onDidChangeCodeLenses = new vscode.EventEmitter<void> ();
  readonly onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;

  /* API */

  provideCodeLenses = async ( document: vscode.TextDocument, token: vscode.CancellationToken ): Promise<vscode.CodeLens[]> => {

    const options = getOptions ();

    if ( !options.enabled ) return [];
    if ( document.isUntitled ) return [];

    const filePath = document.uri.fsPath;
    const fileName = path.basename ( filePath );

    if ( fileName !== 'package.json' ) return [];

    const content = document.getText ();

    try {

      const dependenciesInstalled = await getDependenciesInstalled ( filePath );

      if ( !dependenciesInstalled.length ) return [];
      if ( token.isCancellationRequested ) return [];

      const dependenciesBundles = await getDependenciesBundles ( dependenciesInstalled );

      if ( !dependenciesBundles.length ) return [];
      if ( token.isCancellationRequested ) return [];

      const lenses: vscode.CodeLens[] = [];

      for ( const { name, version, size } of dependenciesBundles ) {

        if ( !isNumber ( size ) ) continue;

        const lineRe = new RegExp ( `^\\s*"${escapeRegex ( name )}":\\s*"`, 'm' );
        const lineMatch = lineRe.exec ( content );

        if ( !lineMatch ) continue;

        const line = document.lineAt ( document.positionAt ( lineMatch.index ).line );
        const title = formatBytes ( size );

        const lens = new vscode.CodeLens ( line.range, {
          title,
          command: 'banal.open',
          arguments: [name, version]
        });

        lenses.push ( lens );

      }

      return lenses;

    } catch {

      return [];

    }

  };

  refresh = (): void => {

    vscode.workspace.onDidChangeConfiguration ( () => {
      this._onDidChangeCodeLenses.fire ();
    });

  };

}

/* EXPORT */

export default new CodeLensProvider ();
