import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

// Constant
import { appPath } from './app-path.const' ;
import { WorkspaceGuard } from './workspace/workspace.guard';

const routes: Routes = [
  {
    path: appPath.home,
    loadChildren: () => import('src/app/home/home.module').then(m => m.HomeModule)
  },
  {
    path: appPath.login,
    loadChildren: () => import('src/app/login/login.module').then(m => m.LoginModule)
  },
  {
    path: appPath.signin,
    loadChildren: () => import('src/app/signin/signin.module').then(m => m.SigninModule)
  },
  {
    path: appPath.workspace,
    // canActivate: [WorkspaceGuard],
    loadChildren: () => import('src/app/workspace/workspace.module').then(m => m.WorkspaceModule)
  },
  {
    path: '**',
    redirectTo: appPath.home,
    pathMatch: 'full'
  }
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
