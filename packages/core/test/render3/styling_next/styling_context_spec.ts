/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {TStylingContext, TStylingNode} from '@angular/core/src/render3/interfaces/styling';
import {registerBinding as _registerBinding} from '@angular/core/src/render3/styling/bindings';
import {attachStylingDebugObject} from '@angular/core/src/render3/styling/styling_debug';

import {DEFAULT_GUARD_MASK_VALUE, allocTStylingContext} from '../../../src/render3/util/styling_utils';

function registerBinding(
    context: TStylingContext, countId: number, sourceIndex: number, prop: string | null,
    value: any) {
  let tNode: TStylingNode = (context as any).tNode;
  if (!tNode) {
    tNode = (context as any).tNode = {flags: 0};
  }
  _registerBinding(context, tNode, countId, sourceIndex, prop, value, false, false);
}

describe('styling context', () => {
  it('should register a series of entries into the context', () => {
    const debug = makeContextWithDebug(false);
    const context = debug.context;
    expect(debug.entries).toEqual({});

    registerBinding(context, 1, 0, 'width', '100px');
    expect(debug.entries['width']).toEqual({
      prop: 'width',
      valuesCount: 1,
      sanitizationRequired: false,
      templateBitMask: buildGuardMask(),
      hostBindingsBitMask: buildGuardMask(),
      defaultValue: '100px',
      sources: ['100px'],
    });

    registerBinding(context, 2, 0, 'width', 20);
    expect(debug.entries['width']).toEqual({
      prop: 'width',
      sanitizationRequired: false,
      valuesCount: 2,
      templateBitMask: buildGuardMask(2),
      hostBindingsBitMask: buildGuardMask(),
      defaultValue: '100px',
      sources: [20, '100px'],
    });

    registerBinding(context, 3, 0, 'height', 10);
    registerBinding(context, 4, 1, 'height', 15);
    expect(debug.entries['height']).toEqual({
      prop: 'height',
      valuesCount: 3,
      sanitizationRequired: false,
      templateBitMask: buildGuardMask(3),
      hostBindingsBitMask: buildGuardMask(4),
      defaultValue: null,
      sources: [10, 15, null],
    });
  });

  it('should only register the same binding index once per property', () => {
    const debug = makeContextWithDebug(false);
    const context = debug.context;
    expect(debug.entries).toEqual({});

    registerBinding(context, 1, 0, 'width', 123);
    registerBinding(context, 1, 0, 'width', 123);
    expect(debug.entries['width']).toEqual({
      prop: 'width',
      valuesCount: 2,
      sanitizationRequired: false,
      templateBitMask: buildGuardMask(1),
      hostBindingsBitMask: buildGuardMask(),
      defaultValue: null,
      sources: [123, null],
    });
  });

  it('should overwrite a default value for an entry only if it is non-null', () => {
    const debug = makeContextWithDebug(false);
    const context = debug.context;

    registerBinding(context, 1, 0, 'width', null);
    const x = debug.entries['width'];
    expect(debug.entries['width']).toEqual({
      prop: 'width',
      valuesCount: 1,
      sanitizationRequired: false,
      templateBitMask: buildGuardMask(),
      hostBindingsBitMask: buildGuardMask(),
      defaultValue: null,
      sources: [null]
    });

    registerBinding(context, 1, 0, 'width', '100px');
    expect(debug.entries['width']).toEqual({
      prop: 'width',
      valuesCount: 1,
      sanitizationRequired: false,
      templateBitMask: buildGuardMask(),
      hostBindingsBitMask: buildGuardMask(),
      defaultValue: '100px',
      sources: ['100px']
    });

    registerBinding(context, 1, 0, 'width', '200px');
    expect(debug.entries['width']).toEqual({
      prop: 'width',
      valuesCount: 1,
      sanitizationRequired: false,
      templateBitMask: buildGuardMask(),
      hostBindingsBitMask: buildGuardMask(),
      defaultValue: '100px',
      sources: ['100px']
    });
  });
});

function makeContextWithDebug(isClassBased: boolean) {
  const ctx = allocTStylingContext(null, false);
  const tNode: TStylingNode = {flags: 0};
  (ctx as any).tNode = ctx;
  return attachStylingDebugObject(ctx, tNode, isClassBased);
}

function buildGuardMask(...bindingIndices: number[]) {
  let mask = DEFAULT_GUARD_MASK_VALUE;
  for (let i = 0; i < bindingIndices.length; i++) {
    mask |= 1 << bindingIndices[i];
  }
  return mask;
}
