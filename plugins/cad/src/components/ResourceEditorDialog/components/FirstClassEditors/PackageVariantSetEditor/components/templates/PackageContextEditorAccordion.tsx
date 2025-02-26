/**
 * Copyright 2023 The Nephio Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { TextField } from '@material-ui/core';
import { clone } from 'lodash';
import React, { Fragment, useRef, useState } from 'react';
import { KubernetesKeyValueObject } from '../../../../../../../types/KubernetesResource';
import { ConfigMapExpr, PackageVariantSetPackageContext } from '../../../../../../../types/PackageVariantSet';
import { KeyValueEditorAccordion } from '../../../Controls';
import { AccordionState, EditorAccordion } from '../../../Controls/EditorAccordion';
import { useEditorStyles } from '../../../styles';
import { ExprEditorAccordion } from './ExprEditorAccordion';

type PackageContextState = {
  data?: KubernetesKeyValueObject;
  removeKeys?: string[];
  dataExprs?: ConfigMapExpr[];
  removeKeyExprs?: string[];
};

type OnUpdate = (newValue: PackageContextState) => void;

type DeploymentDetailsEditorAccordionProps = {
  id: string;
  state: AccordionState;
  value: PackageContextState;
  onUpdate: OnUpdate;
};

export const PackageContextEditorAccordion = ({
  id,
  state,
  value,
  onUpdate,
}: DeploymentDetailsEditorAccordionProps) => {
  const classes = useEditorStyles();

  const [sectionExpanded, setSectionExpanded] = useState<string>();
  const refViewModel = useRef<PackageVariantSetPackageContext>(clone(value));
  const viewModel = refViewModel.current;

  const valueUpdated = (): void => {
    onUpdate(viewModel);
  };

  return (
    <EditorAccordion id={id} title="Package Context" state={state}>
      <Fragment>
        <div className={classes.multiControlRow}>
          <TextField
            label="Remove Keys"
            variant="outlined"
            value={(viewModel.removeKeys ?? []).join(', ')}
            onChange={e => {
              const removeKey = e.target.value;
              viewModel.removeKeys = removeKey ? removeKey.split(',').map(v => v.trim()) : undefined;
              valueUpdated();
            }}
            fullWidth
          />
          <div />
        </div>
        <div>
          <KeyValueEditorAccordion
            id="data"
            title="Data"
            state={[sectionExpanded, setSectionExpanded]}
            keyValueObject={viewModel.data || {}}
            onUpdatedKeyValueObject={data => {
              viewModel.data = data;
              valueUpdated();
            }}
          />
        </div>
        <ExprEditorAccordion
          id="dataExprs"
          state={[sectionExpanded, setSectionExpanded]}
          title="Data Exprs"
          keyValueObject={viewModel.dataExprs || []}
          onUpdatedKeyValueObject={dataExpr => {
            viewModel.dataExprs = dataExpr;
            valueUpdated();
          }}
        />
        <div className={classes.multiControlRow}>
          <TextField
            label="Remove Keys Expr"
            variant="outlined"
            value={(viewModel.removeKeyExprs ?? []).join(', ')}
            onChange={e => {
              const removeKeyExpr = e.target.value;
              viewModel.removeKeyExprs = removeKeyExpr ? removeKeyExpr.split(',').map(v => v.trim()) : undefined;
              valueUpdated();
            }}
            fullWidth
          />
          <div />
        </div>
      </Fragment>
    </EditorAccordion>
  );
};
