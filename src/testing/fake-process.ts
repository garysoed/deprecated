import * as process from 'process';

import { fake, spy } from '@gs-testing';
import { BehaviorSubject } from '@rxjs';

const DEFAULT_CWD = '/';
const cwd$ = new BehaviorSubject<string>(DEFAULT_CWD);

export function setCwd(cwd: string): void {
  cwd$.next(cwd);
}

export function mockProcess(): void {
  cwd$.next(DEFAULT_CWD);
  fake(spy(process, 'cwd')).always().call(() => cwd$.getValue());
}
