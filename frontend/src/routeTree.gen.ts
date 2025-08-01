/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as All_pokemonIndexRouteImport } from './routes/all_pokemon/index'

const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const All_pokemonIndexRoute = All_pokemonIndexRouteImport.update({
  id: '/all_pokemon/',
  path: '/all_pokemon/',
  getParentRoute: () => rootRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/all_pokemon': typeof All_pokemonIndexRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/all_pokemon': typeof All_pokemonIndexRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/all_pokemon/': typeof All_pokemonIndexRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/all_pokemon'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/all_pokemon'
  id: '__root__' | '/' | '/all_pokemon/'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  All_pokemonIndexRoute: typeof All_pokemonIndexRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/all_pokemon/': {
      id: '/all_pokemon/'
      path: '/all_pokemon'
      fullPath: '/all_pokemon'
      preLoaderRoute: typeof All_pokemonIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  All_pokemonIndexRoute: All_pokemonIndexRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
