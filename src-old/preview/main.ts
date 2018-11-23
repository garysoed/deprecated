import { Jsons } from 'external/gs_tools/src/data';
import { Injector } from 'external/gs_tools/src/inject';
import { Persona } from 'external/gs_tools/src/persona';
import { Templates } from 'external/gs_tools/src/webc';

import { PreviewView } from '../preview/preview-view';

// Only used to load the dependency.
[PreviewView].forEach(() => undefined);
window.addEventListener('load', () => {
  Injector.bindProvider(() => document, 'x.dom.document');
  Injector.bindProvider(() => window, 'x.dom.window');
  Persona.registerAll(Injector.newInstance(), Templates.newInstance());
});

Jsons.setValue(window, 'gs.Templates', Templates);
