
/* IMPORT */

import {sha1} from 'crypto-sha';
import fs from 'node:fs/promises';
import path from 'node:path';
import escapeRegex from 'string-escape-regex';
import {exec, getConfig} from 'vscode-extras';
import {CACHE_PATH} from './constants';
import type {Bundle, Dependency, Options} from './types';

/* MAIN */

const formatBytes = ( bytes: number ): string => {

  if ( bytes < 1024 ) return `${bytes}B`;

  if ( bytes < 1024 * 1024 ) return `${Number ( ( bytes / 1024 ).toFixed ( 1 ) )}KB`;

  return `${Number ( ( bytes / 1024 / 1024 ).toFixed ( 1 ) )}MB`;

};

const getBundle = async ( name: string, version: string ): Promise<Bundle | undefined> => {

  //TODO: Come up with a smarter caching strategy, with the version of "banal" is taken into account too

  const rootName = await sha1 ( `${name}@${version}` );
  const rootPath = path.join ( CACHE_PATH, rootName );
  const bundlePath = path.join ( rootPath, 'bundle.json' );

  try {

    const content = await fs.readFile ( bundlePath, 'utf8' );
    const bundle: Bundle = JSON.parse ( content );

    return bundle;

  } catch {

    try {

      const result = await exec ( 'banal', [`${name}@${version}`, '--no-open', '--json'] );
      const output = JSON.parse ( result.stdout.toString () );

      const outputSize = output.outputSize;
      const outputPath = path.join ( rootPath, 'output.js' );
      const metafilePath = path.join ( rootPath, 'metafile.json' );
      const analyzerPath = path.join ( rootPath, 'analyzer.html' );
      const bundle: Bundle = { outputPath, outputSize, metafilePath, analyzerPath, bundlePath };

      await fs.mkdir ( rootPath, { recursive: true } );
      await fs.copyFile ( output.outputPath, outputPath );
      await fs.copyFile ( output.metafilePath, metafilePath );
      await fs.copyFile ( output.analyzerPath, analyzerPath );
      await fs.writeFile ( bundlePath, JSON.stringify ( bundle ) );

      return bundle;

    } catch ( error: unknown ) {

      console.error ( error );

    }

  }

};

const getDependenciesInstalled = async ( packagePath: string ): Promise<Dependency[]> => {

  /* LIST */

  const cwd = path.dirname ( packagePath );
  const listResult = await exec ( 'npm', ['list', '--json'], { cwd } );
  const list = JSON.parse ( listResult.stdout.toString () );

  /* RESULT */

  const dependencies: Dependency[] = [];

  for ( const name in list.dependencies ) {

    const value = list.dependencies[name];
    const version = isString ( value.version ) ? value.version : undefined;

    if ( !version ) continue;

    dependencies.push ({ name, version });

  }

  return dependencies;

};

const getDependenciesBundles = async ( deps: Dependency[] ): Promise<Dependency[]> => {

  const bundles = await Promise.all ( deps.map ( ({ name, version }) => getBundle ( name, version ) ) );
  const dependencies = deps.map ( ({ name, version }, index) => ({ name, version, size: bundles[index]?.outputSize }) );

  return dependencies;

};

const getOptions = (): Options => {

  const config = getConfig ( 'banal' );
  const enabled = isBoolean ( config?.enabled ) ? config.enabled : true;

  return { enabled };

};

const isBoolean = ( value: unknown ): value is boolean => {

  return typeof value === 'boolean';

};

const isNumber = ( value: unknown ): value is number => {

  return typeof value === 'number';

};

const isObject = ( value: unknown ): value is Record<string, unknown> => {

  return typeof value === 'object' && value !== null;

};

const isString = ( value: unknown ): value is string => {

  return typeof value === 'string';

};

/* EXPORT */

export {formatBytes, escapeRegex, getBundle, getDependenciesInstalled, getDependenciesBundles, getOptions, isBoolean, isNumber, isObject, isString};
