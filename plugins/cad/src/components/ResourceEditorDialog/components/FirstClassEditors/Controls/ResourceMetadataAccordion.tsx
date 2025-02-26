/**
 * Copyright 2022 Google LLC
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
import React, { Fragment, useRef, useState } from 'react';
import { KubernetesKeyValueObject } from '../../../../../types/KubernetesResource';
import { AccordionState, EditorAccordion } from './EditorAccordion';
import { KeyValueEditorAccordion } from './KeyValueEditorAccordion';

type OnUpdate = (value: ResourceMetadataView) => void;

type ResourceMetadataView = {
  name: string;
  namespace?: string;
  labels?: KubernetesKeyValueObject;
  annotations?: KubernetesKeyValueObject;
};

type ResourceMetadataAccordionProps = {
  id: string;
  state: AccordionState;
  value: ResourceMetadataView;
  onUpdate: OnUpdate;
  clusterScopedResource?: boolean;
};

export const ResourceMetadataAccordion = ({
  id,
  state,
  value,
  onUpdate,
  clusterScopedResource,
}: ResourceMetadataAccordionProps) => {
  const refViewModel = useRef<ResourceMetadataView>(value);
  const viewModel = refViewModel.current;

  const [expanded, setExpanded] = useState<string>();

  const description = `${viewModel.namespace ? `${viewModel.namespace}/` : ''}${viewModel.name}`;

  const valueUpdated = (): void => {
    onUpdate(viewModel);
  };

  return (
    <EditorAccordion id={id} title="Resource Metadata" description={description} state={state}>
      <Fragment>
        <TextField
          label="Name"
          variant="outlined"
          value={viewModel.name}
          onChange={e => {
            viewModel.name = e.target.value;
            valueUpdated();
          }}
          fullWidth
        />

        {!clusterScopedResource && (
          <TextField
            label="Namespace"
            variant="outlined"
            value={viewModel.namespace ?? ''}
            onChange={e => {
              viewModel.namespace = e.target.value || undefined;
              valueUpdated();
            }}
            fullWidth
          />
        )}

        <div>
          <KeyValueEditorAccordion
            id="labels"
            state={[expanded, setExpanded]}
            title="Labels"
            keyValueObject={viewModel.labels || {}}
            onUpdatedKeyValueObject={labels => {
              viewModel.labels = Object.keys(labels).length > 0 ? labels : undefined;
              valueUpdated();
            }}
          />

          <KeyValueEditorAccordion
            id="annotations"
            state={[expanded, setExpanded]}
            title="Annotations"
            keyValueObject={viewModel.annotations || {}}
            onUpdatedKeyValueObject={annotations => {
              viewModel.annotations = Object.keys(annotations).length > 0 ? annotations : undefined;
              valueUpdated();
            }}
          />
        </div>
      </Fragment>
    </EditorAccordion>
  );
};
